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

  async calculateBalances(familyId: string, query: GetBalancesQueryDto): Promise<BalancesResponseDto> {
    // If personId is provided, only calculate balances for that person
    const { personId } = query;
    const familyTreeIds = await this.familyService.getFamilyTreeIds(familyId);
    // Get all unique persons in the family tree (across all memberships)
    const memberships = await this.prisma.householdMembership.findMany({
      where: { familyId: { in: familyTreeIds }, isActive: true },
      include: { person: true },
    });
    // Map personId to all their memberships (across families)
    const personMap = new Map<string, { id: string, name: string }>();
    memberships.forEach(m => {
      if (m.person && !personMap.has(m.personId)) {
        personMap.set(m.personId, { id: m.personId, name: m.person.name });
      }
    });
    const allPersonIds = Array.from(personMap.keys());
    if (allPersonIds.length < 2) {
      return { balances: [] };
    }
    // For balance calculation, use membershipId for transaction split, but personId for reporting
    const activeMembers = memberships;
    const sharedTransactions = await this.prisma.transaction.findMany({
      where: {
        familyId: { in: familyTreeIds },
        isShared: true,
        splitRatio: { not: Prisma.DbNull },
      },
      select: {
        amount: true,
        payer: true,
        splitRatio: true,
      },
    });
    // Initialize owed matrix: rawOwedAmounts[memberA][memberB] = how much A owes B
    // rawOwedAmounts[membershipId][membershipId] = amount
    const rawOwedAmounts: Record<string, Record<string, number>> = {};
    activeMembers.forEach((m1: any) => {
      rawOwedAmounts[m1.id] = {};
      activeMembers.forEach((m2: any) => {
        if (m1.id !== m2.id) {
          rawOwedAmounts[m1.id][m2.id] = 0;
        }
      });
    });
    for (const tx of sharedTransactions) {
      if (!tx.payer || !tx.splitRatio) continue;
      // Parse splitRatio if it's a string
      let splitRatioItems: SplitRatioItem[];
      if (typeof tx.splitRatio === 'string') {
        try {
          splitRatioItems = JSON.parse(tx.splitRatio);
        } catch {
          continue;
        }
      } else {
        splitRatioItems = tx.splitRatio as unknown as SplitRatioItem[];
      }
      if (!Array.isArray(splitRatioItems) || splitRatioItems.length === 0) continue;
      const payerId = tx.payer;
      const totalAmount = tx.amount;
      // Only process if payer and all split members are active
      if (!activeMembers.find((m: any) => m.id === payerId)) continue;
      let totalPercent = 0;
      splitRatioItems.forEach(item => { totalPercent += item.percentage; });
      for (const item of splitRatioItems) {
        if (!activeMembers.find((m: any) => m.id === item.memberId)) continue;
        const memberShare = totalAmount * (item.percentage / totalPercent);
        if (item.memberId !== payerId) {
          // Member owes payer
          rawOwedAmounts[item.memberId][payerId] = (rawOwedAmounts[item.memberId][payerId] || 0) + memberShare;
        }
        // Payer's own share is ignored for balances
      }
    }
    // Settlements: sum all settlements between each person pair (in both directions)
    const settlements = await this.prisma.settlement.findMany({
      where: {
        payerId: { in: allPersonIds },
        payeeId: { in: allPersonIds },
      },
      select: {
        payerId: true,
        payeeId: true,
        amount: true,
      },
    });
    // Build a settlement matrix: settlementsSum[personA][personB] = total A paid B
    const settlementsSum: Record<string, Record<string, number>> = {};
    for (const a of allPersonIds) {
      settlementsSum[a] = {};
      for (const b of allPersonIds) {
        if (a !== b) settlementsSum[a][b] = 0;
      }
    }
    for (const s of settlements) {
      const amount = typeof s.amount === 'object' && typeof s.amount.toNumber === 'function' ? s.amount.toNumber() : Number(s.amount);
      // payerId paid payeeId
      if (settlementsSum[s.payerId] && settlementsSum[s.payerId][s.payeeId] !== undefined) {
        settlementsSum[s.payerId][s.payeeId] += Math.round(amount);
      }
    }
    // Calculate balances by personId pairs (not just membership)
    const finalBalances: DetailedMemberBalanceDto[] = [];
    if (personId) {
      for (const otherPersonId of allPersonIds) {
        if (otherPersonId === personId) continue;
        // Sum all owed amounts from any of selected person's memberships to any of other's memberships
        let amountPersonOwesOther = 0;
        let amountOtherOwesPerson = 0;
        for (const m1 of activeMembers.filter(m => m.personId === personId)) {
          for (const m2 of activeMembers.filter(m => m.personId === otherPersonId)) {
            amountPersonOwesOther += Math.round(rawOwedAmounts[m1.id]?.[m2.id] || 0);
            amountOtherOwesPerson += Math.round(rawOwedAmounts[m2.id]?.[m1.id] || 0);
          }
        }
        // Apply settlements: what personId has paid to otherPersonId, and vice versa
        const settlementsPaid = Math.round(settlementsSum[personId]?.[otherPersonId] || 0);
        const settlementsReceived = Math.round(settlementsSum[otherPersonId]?.[personId] || 0);
        // Net: what other owes person - what person owes other + settlements paid - settlements received
        const net = amountOtherOwesPerson - amountPersonOwesOther + settlementsPaid - settlementsReceived;
        if (net !== 0) {
          // Always return a positive value if personId owes other, negative if other owes personId
          finalBalances.push({
            personOneId: personId,
            memberOneName: personMap.get(personId)?.name || '',
            personTwoId: otherPersonId,
            memberTwoName: personMap.get(otherPersonId)?.name || '',
            netAmountPersonOneOwesPersonTwo: -net,
          });
        }
      }
    } else {
      // All pairs
      for (let i = 0; i < allPersonIds.length; i++) {
        for (let j = i + 1; j < allPersonIds.length; j++) {
          const personA = allPersonIds[i];
          const personB = allPersonIds[j];
          let amountAOwesB = 0;
          let amountBOwesA = 0;
          for (const mA of activeMembers.filter(m => m.personId === personA)) {
            for (const mB of activeMembers.filter(m => m.personId === personB)) {
              amountAOwesB += rawOwedAmounts[mA.id]?.[mB.id] || 0;
              amountBOwesA += rawOwedAmounts[mB.id]?.[mA.id] || 0;
            }
          }
          const netAmountAOwesB = amountAOwesB - amountBOwesA;
          if (netAmountAOwesB !== 0) {
            finalBalances.push({
              personOneId: personA,
              memberOneName: personMap.get(personA)?.name || '',
              personTwoId: personB,
              memberTwoName: personMap.get(personB)?.name || '',
              netAmountPersonOneOwesPersonTwo: parseFloat(netAmountAOwesB.toFixed(2)),
            });
          }
        }
      }
    }
    return { balances: finalBalances };
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
