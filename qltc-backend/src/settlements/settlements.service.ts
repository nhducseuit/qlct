import { Injectable, NotImplementedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { Prisma } from '@prisma/client';
import { DetailedMemberBalanceDto } from './dto/member-balance.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementDto } from './dto/settlement.dto';
import { GetSettlementsQueryDto } from './dto/get-settlements-query.dto';
import { PaginatedSettlementsResponseDto, PaginationMetaDto } from './dto/paginated-settlements-response.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FamilyService } from '../families/family.service';

interface SplitRatioItem {
  memberId: string;
  percentage: number;
}

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly familyService: FamilyService,
  ) {}

  /**
   * Calculate the balance between two persons for a given year/month.
   * Returns a single-item balances array, or empty if no balance exists.
   */
  async calculatePairBalance(familyId: string | undefined, query: GetBalancesQueryDto): Promise<BalancesResponseDto> {
    // Final debug log for pairwise sum and net
    const { personOneId, personTwoId, year, month } = query;
    // Validate input
    if (!personOneId || !personTwoId) {
      throw new BadRequestException('Both personOneId and personTwoId are required.');
    }
    if (personOneId === personTwoId) {
      throw new BadRequestException('personOneId and personTwoId must be different.');
    }
    // Always calculate global/cross-family balance, aggregating only over families where both persons have active memberships
    // 1. Get all families the current user (personOneId) has access to
    const accessibleFamilyIds = await this.familyService.getAllFamilyIds(personOneId) || [];
    // 2. Get all memberships for both persons in those families
    const memberships = await this.prisma.householdMembership.findMany({
      where: {
        personId: { in: [personOneId, personTwoId] },
        familyId: { in: accessibleFamilyIds },
        isActive: true,
      },
      include: { person: true },
    });
    // 3. Find all families where both persons are members
    const familiesWithBoth = Array.isArray(accessibleFamilyIds) ? accessibleFamilyIds.filter(fid =>
      memberships.some(m => m.personId === personOneId && m.familyId === fid) &&
      memberships.some(m => m.personId === personTwoId && m.familyId === fid)
    ) : [];
    // ...
    // 4. Map personId to name
    const personMap = new Map<string, { id: string, name: string }>();
    memberships.forEach((m: any) => {
      if (m.person && !personMap.has(m.personId)) {
        personMap.set(m.personId, { id: m.personId, name: m.person.name });
      }
    });
    // If either person is not a member of any accessible family, throw ForbiddenException
    const personOneHasMembership = memberships.some(m => m.personId === personOneId);
    const personTwoHasMembership = memberships.some(m => m.personId === personTwoId);
    if (!personOneHasMembership || !personTwoHasMembership) {
      throw new ForbiddenException('One or both persons have no active memberships in this family.');
    }
    // If no shared families, return zero balance
    if (familiesWithBoth.length === 0) {
      return {
        balances: [],
      };
    }
    // Filter transactions by year/month if provided
    let dateFilter: any = {};
    if (year && month) {
      // Cumulative until end of selected month/year
      const to = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { date: { lte: to } };
    } else if (year) {
      // Cumulative until end of year
      const to = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { date: { lte: to } };
    } else if (month) {
      // Cumulative until end of selected month in current year
      const now = new Date();
      const y = now.getFullYear();
      const to = new Date(y, month, 0, 23, 59, 59, 999);
      dateFilter = { date: { lte: to } };
    }
    // Only consider transactions in families where both persons are members
    const allSharedTransactions = await this.prisma.transaction.findMany({
      where: {
        familyId: { in: familiesWithBoth },
        isShared: true,
        splitRatio: { not: Prisma.DbNull },
        ...dateFilter,
      },
      select: {
        id: true,
        amount: true,
        payer: true,
        splitRatio: true,
        familyId: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });
    // Defensive: filter transactions to only those in familiesWithBoth (in case mocks or DB return more)
    let sharedTransactions = allSharedTransactions.filter(tx => familiesWithBoth.includes(tx.familyId));
    // Extra: filter by date <= end of selected month/year (in case Prisma mock does not filter)
    let dateLimit: Date | null = null;
    if (year && month) {
      dateLimit = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (year) {
      dateLimit = new Date(year, 11, 31, 23, 59, 59, 999);
    } else if (month) {
      const now = new Date();
      const y = now.getFullYear();
      dateLimit = new Date(y, month, 0, 23, 59, 59, 999);
    }
    if (dateLimit) {
      sharedTransactions = sharedTransactions.filter(tx => {
        if (tx.date) return new Date(tx.date) <= dateLimit;
        return true;
      });
      // ...
    }
    // ...
    // Find the relevant membership for each person in the transaction's family
    const getMembershipForPersonInFamily = (personId: string, familyId: string) =>
      memberships.find((m: any) => m.personId === personId && m.familyId === familyId);
    // ...
    // No per-family membership checks, only aggregate over families where both are members
    // ...existing code...
    let amountOneOwesTwo = 0;
    for (const tx of sharedTransactions) {
      if (!tx.payer || !tx.splitRatio) continue;
      let splitRatioItems: any[];
      if (typeof tx.splitRatio === 'string') {
        try { splitRatioItems = JSON.parse(tx.splitRatio); } catch { continue; }
      } else {
        splitRatioItems = tx.splitRatio as any[];
      }
      if (!Array.isArray(splitRatioItems) || splitRatioItems.length === 0) continue;
      const payerId = tx.payer;
      const totalAmount = tx.amount;
      let totalPercent = 0;
      splitRatioItems.forEach(item => { totalPercent += item.percentage; });
      const membershipOne = getMembershipForPersonInFamily(personOneId, tx.familyId);
      const membershipTwo = getMembershipForPersonInFamily(personTwoId, tx.familyId);
      if (!membershipOne || !membershipTwo) {
        continue;
      }
      const itemOne = splitRatioItems.find(item => item.memberId === membershipOne.id);
      const itemTwo = splitRatioItems.find(item => item.memberId === membershipTwo.id);
      if (itemOne && itemTwo) {
        // Always from personOne's perspective:
        // - If personOne paid: personTwo owes personOne their share (subtract personTwo's share)
        // - If personTwo paid: personOne owes personTwo their share (add personOne's share)
        // - If neither paid, or both are the same, skip
        let pairwise = 0;
        if (payerId === membershipOne.id && membershipTwo.id !== membershipOne.id) {
          pairwise = -totalAmount * (itemTwo.percentage / totalPercent);
        } else if (payerId === membershipTwo.id && membershipOne.id !== membershipTwo.id) {
          pairwise = totalAmount * (itemOne.percentage / totalPercent);
        }
        console.log(`DEBUG: Transaction ${tx.id} pairwise amount for ${personOneId} owes ${personTwoId}: ${pairwise}`);
        amountOneOwesTwo += pairwise;
      }
    }
    // Settlements between the two persons
    let settlements = await this.prisma.settlement.findMany({
      where: {
        OR: [
          { payerId: personOneId, payeeId: personTwoId },
          { payerId: personTwoId, payeeId: personOneId },
        ],
        ...dateFilter,
      },
      select: { payerId: true, payeeId: true, amount: true, date: true },
    });
    if (dateLimit) {
      settlements = settlements.filter(s => !s.date || s.date <= dateLimit);
    }
    // ...
    let settlementsPaid = 0; // personOne paid personTwo
    let settlementsReceived = 0; // personTwo paid personOne
    for (const s of settlements) {
      const amount = typeof s.amount === 'object' && typeof s.amount.toNumber === 'function' ? s.amount.toNumber() : Number(s.amount);
      if (s.payerId === personOneId && s.payeeId === personTwoId) {
        console.log(`DEBUG: Settlement paid by ${personOneId} to ${personTwoId}: ${amount}`);
        settlementsPaid += amount;
      } else if (s.payerId === personTwoId && s.payeeId === personOneId) {
        console.log(`DEBUG: Settlement received by ${personOneId} from ${personTwoId}: ${amount}`);
        settlementsReceived += amount;
      }
    }
    // Net: what personOne owes personTwo (positive means personOne owes personTwo, negative means personTwo owes personOne)
    // Fix: Reverse the sign so that if personOne paid more, the result is negative (personTwo owes personOne)
    console.log(`DEBUG: Settlements paid by ${personOneId} to ${personTwoId}: ${settlementsPaid}`);
    console.log(`DEBUG: Settlements received by ${personOneId} from ${personTwoId}: ${settlementsReceived}`);
    console.log(`DEBUG: Amount ${personOneId} owes ${personTwoId} from transactions: ${amountOneOwesTwo}`);
    const net = amountOneOwesTwo - settlementsPaid + settlementsReceived;
    // ...
    return {
      balances: [
        {
          personOneId,
          memberOneName: personMap.get(personOneId)?.name || '',
          personTwoId,
          memberTwoName: personMap.get(personTwoId)?.name || '',
          netAmountPersonOneOwesPersonTwo: parseFloat(net.toFixed(2)),
        },
      ],
    };
}

  async createSettlement(
    familyId: string,
    userId: string,
    createSettlementDto: CreateSettlementDto,
  ): Promise<SettlementDto> {
    if (createSettlementDto.payerId === createSettlementDto.payeeId) {
      throw new BadRequestException('Payer and Payee cannot be the same person.');
    }

    // Optionally, check if payerId and payeeId are valid persons in the family
    const persons = await this.prisma.person.findMany({
      where: {
        id: { in: [createSettlementDto.payerId, createSettlementDto.payeeId] },
      },
    });
    if (persons.length !== 2) {
      throw new BadRequestException('Invalid Payer or Payee person ID(s).');
    }

    const settlement = await this.prisma.settlement.create({
      data: {
        payerId: createSettlementDto.payerId,
        payeeId: createSettlementDto.payeeId,
        amount: createSettlementDto.amount,
        note: createSettlementDto.note,
        createdBy: userId,
        date: createSettlementDto.date ? new Date(createSettlementDto.date) : undefined,
      },
    });

    const mappedSettlement: SettlementDto = {
      id: settlement.id,
      payerId: settlement.payerId,
      payeeId: settlement.payeeId,
      amount: typeof settlement.amount === 'object' && typeof settlement.amount.toNumber === 'function' ? settlement.amount.toNumber() : Number(settlement.amount),
      note: settlement.note ?? undefined,
      createdAt: settlement.createdAt.toISOString(),
      createdBy: settlement.createdBy,
      date: settlement.date ? settlement.date.toISOString() : settlement.createdAt.toISOString(),
    };

    this.notificationsGateway.sendToUser(userId, 'settlements_updated', {
      message: `Thanh toán đã được ghi nhận.`,
      operation: 'create',
      item: mappedSettlement,
    });

    return mappedSettlement;
  }

  async getSettlementsAccessible(
    query: GetSettlementsQueryDto,
    accessiblePersonIds: string[],
  ): Promise<PaginatedSettlementsResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    console.log('DEBUG accessiblePersonIds in service:', accessiblePersonIds);
    // Only return settlements where payer or payee is accessible
    const whereClause: Prisma.SettlementWhereInput = {
      OR: [
        { payerId: { in: accessiblePersonIds } },
        { payeeId: { in: accessiblePersonIds } },
      ],
    };
    console.log('DEBUG settlements whereClause:', whereClause);
    const [settlements, totalItems] = await this.prisma.$transaction([
      this.prisma.settlement.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.settlement.count({ where: whereClause }),
    ]);
    console.log('DEBUG settlements result:', settlements);
    const items: SettlementDto[] = settlements.map((s) => ({
      id: s.id,
      payerId: s.payerId,
      payeeId: s.payeeId,
      amount: typeof s.amount === 'object' && typeof s.amount.toNumber === 'function' ? s.amount.toNumber() : Number(s.amount),
      note: s.note ?? undefined,
      createdAt: s.createdAt.toISOString(),
      createdBy: s.createdBy,
      date: s.date ? s.date.toISOString() : s.createdAt.toISOString(),
    }));
    const meta: PaginationMetaDto = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
    return { items, meta };
  }
}
