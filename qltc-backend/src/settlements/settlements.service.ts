import { Injectable, NotImplementedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { Prisma } from '@generated/prisma'; // Import Prisma
import { DetailedMemberBalanceDto } from './dto/member-balance.dto'; // Import directly
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementDto, SettlementMemberDto } from './dto/settlement.dto'; // Import SettlementDto
import { GetSettlementsQueryDto } from './dto/get-settlements-query.dto';
import { PaginatedSettlementsResponseDto, PaginationMetaDto } from './dto/paginated-settlements-response.dto';
// Remove unused Prisma types if not directly used as function param/return types
// import { Transaction, HouseholdMember } from '@generated/prisma';

interface SplitRatioItem {
  memberId: string;
  percentage: number;
}

@Injectable() // Added missing @Injectable() decorator
export class SettlementsService {
    constructor(private readonly prisma: PrismaService) {}

  async calculateBalances(
    userId: string,
    query: GetBalancesQueryDto,
  ): Promise<BalancesResponseDto> {
    console.log('Calculating balances for user:', userId, 'with query:', query);

    // 1. Fetch all active household members for the user.
    const activeMembers = await this.prisma.householdMember.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true },
    });

    if (activeMembers.length < 2) {
      return { balances: [] }; // Not enough members to have balances
    }

    // 2. Fetch all shared transactions for the user.
    // For now, we consider all shared transactions. Date filtering can be added later.
    const sharedTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        isShared: true,
        splitRatio: { not: Prisma.DbNull }, // Ensure splitRatio exists (is not SQL NULL)
        // type: 'expense', // Typically, only shared expenses create debts. Shared income might be distributed differently.
                           // For now, let's assume shared transactions imply expenses that create debts.
                           // If shared income needs to be handled, the logic below will need adjustment.
      },
      select: {
        amount: true,
        payer: true, // Payer's HouseholdMember ID
        splitRatio: true, // JSON field
      },
    });

    // 3. Initialize a data structure to hold raw owed amounts.
    // `rawOwedAmounts[debtorId][creditorId] = totalAmountDebtorOwesCreditor`
    const rawOwedAmounts: Record<string, Record<string, number>> = {};
    activeMembers.forEach(m1 => {
      rawOwedAmounts[m1.id] = {};
      activeMembers.forEach(m2 => {
        if (m1.id !== m2.id) {
          rawOwedAmounts[m1.id][m2.id] = 0;
        }
      });
    });

    // 4. Process each shared transaction to populate rawOwedAmounts.
    for (const tx of sharedTransactions) {
      if (!tx.payer || !tx.splitRatio) continue; // Skip if payer or splitRatio is missing

      const payerId = tx.payer;
      const totalAmount = tx.amount;
      const splitRatioItems = tx.splitRatio as unknown as SplitRatioItem[];

      if (!Array.isArray(splitRatioItems)) continue; // Invalid splitRatio format

      for (const item of splitRatioItems) {
        if (item.memberId === payerId) continue; // Payer doesn't owe themselves for their own share.

        // Ensure both memberId and payerId are active members
        if (!activeMembers.find(m => m.id === item.memberId) || !activeMembers.find(m => m.id === payerId)) {
            continue; // Skip if either member involved in this split part is not active
        }

        const amountOwedByThisMember = totalAmount * (item.percentage / 100);
        // `item.memberId` (debtor) owes `payerId` (creditor) this amount.
        rawOwedAmounts[item.memberId][payerId] = (rawOwedAmounts[item.memberId][payerId] || 0) + amountOwedByThisMember;
      }
    }

    // 4.5. Fetch all settlements for the user to adjust raw owed amounts.
    const settlements = await this.prisma.settlement.findMany({
      where: { userId },
      select: {
        payerId: true,
        payeeId: true,
        amount: true,
      },
    });

    for (const settlement of settlements) {
      // If settlement.payerId paid settlement.payeeId an amount, this reduces settlement.payerId's debt to settlement.payeeId.
      rawOwedAmounts[settlement.payerId][settlement.payeeId] = (rawOwedAmounts[settlement.payerId][settlement.payeeId] || 0) - settlement.amount;
    }

    // 5. Calculate net balances and format the response.
    const finalBalances: DetailedMemberBalanceDto[] = [];
    const memberMap = new Map(activeMembers.map(m => [m.id, m.name]));

    for (let i = 0; i < activeMembers.length; i++) {
      for (let j = i + 1; j < activeMembers.length; j++) {
        const memberOne = activeMembers[i];
        const memberTwo = activeMembers[j];

        const amountM1OwesM2 = rawOwedAmounts[memberOne.id]?.[memberTwo.id] || 0;
        const amountM2OwesM1 = rawOwedAmounts[memberTwo.id]?.[memberOne.id] || 0;

        const netAmountM1OwesM2 = amountM1OwesM2 - amountM2OwesM1;

        if (netAmountM1OwesM2 !== 0) { // Only include if there's a non-zero balance
          finalBalances.push({
            memberOneId: memberOne.id,
            memberOneName: memberMap.get(memberOne.id)!,
            memberTwoId: memberTwo.id,
            memberTwoName: memberMap.get(memberTwo.id)!,
            netAmountMemberOneOwesMemberTwo: parseFloat(netAmountM1OwesM2.toFixed(2)), // Round to 2 decimal places
          });
        }
      }
    }

    return { balances: finalBalances };
  }

  async createSettlement(userId: string, createSettlementDto: CreateSettlementDto): Promise<SettlementDto> {
    console.log('Recording settlement for user:', userId, 'with data:', createSettlementDto);

    // Basic validation: Payer and Payee must be different
    if (createSettlementDto.payerId === createSettlementDto.payeeId) {
        throw new BadRequestException('Payer and Payee cannot be the same member.');
    }

    // Optional: Validate if payerId and payeeId belong to the user's active household members
    const members = await this.prisma.householdMember.findMany({
        where: {
            userId,
            id: { in: [createSettlementDto.payerId, createSettlementDto.payeeId] },
            isActive: true, // Ensure they are active members
        },
        select: { id: true },
    });

    if (members.length !== 2) {
        throw new BadRequestException('Invalid Payer or Payee member ID(s) or members are not active.');
    }

    console.log('DTO received:', JSON.stringify(createSettlementDto, null, 2));
    // Explicitly construct the data object for Prisma
    const dataForPrisma = {
      payerId: createSettlementDto.payerId,
      payeeId: createSettlementDto.payeeId,
      amount: createSettlementDto.amount,
      date: new Date(createSettlementDto.date),
      note: createSettlementDto.note === undefined ? null : createSettlementDto.note,
      userId,
    };

    console.log('Data for Prisma create:', JSON.stringify(dataForPrisma, null, 2));
    const settlement = await this.prisma.settlement.create({
      data: dataForPrisma
      // Temporarily remove include to isolate the issue.
      // If this works, we'll need to fetch payer/payee details separately for the response.
    });
    // Map Prisma Settlement object to SettlementDto
    const mappedSettlement: SettlementDto = {
      id: settlement.id,
      amount: settlement.amount,
      date: settlement.date.toISOString(),
      note: settlement.note,
      payerId: settlement.payerId,
      // Payer and Payee details will be missing if include is removed.
      // We'd need to fetch them separately if this temporary fix works.
      payer: { id: settlement.payerId, name: 'N/A' }, // Placeholder
      payeeId: settlement.payeeId,
      payee: { id: settlement.payeeId, name: 'N/A' }, // Placeholder
      userId: settlement.userId,
      createdAt: settlement.createdAt.toISOString(),
      updatedAt: settlement.updatedAt.toISOString(),
    };

    // If the create operation succeeds without `include`,
    // fetch payer and payee details separately to populate the DTO fully.
    // This part is conditional on the above `create` call succeeding.
    try {
      const payerDetails = await this.prisma.householdMember.findUnique({
        where: { id: settlement.payerId },
        select: { name: true },
      });
      const payeeDetails = await this.prisma.householdMember.findUnique({
        where: { id: settlement.payeeId },
        select: { name: true },
      });
      mappedSettlement.payer.name = payerDetails?.name || 'Không rõ';
      mappedSettlement.payee.name = payeeDetails?.name || 'Không rõ';
    } catch (fetchError) {
      console.error('Failed to fetch payer/payee details after settlement creation:', fetchError);
      // Keep placeholder names if fetching details fails.
    }
    return mappedSettlement;
  }

  async getSettlements(
    userId: string,
    query: GetSettlementsQueryDto,
  ): Promise<PaginatedSettlementsResponseDto> {
    console.log('Fetching settlements for user:', userId, 'with query:', query);

    const { page = 1, limit = 10, payerId, payeeId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SettlementWhereInput = {
      userId,
    };

    if (payerId) {
      whereClause.payerId = payerId;
    }
    if (payeeId) {
      whereClause.payeeId = payeeId;
    }
    if (startDate) {
      if (typeof whereClause.date !== 'object' || whereClause.date === null) {
        whereClause.date = {};
      }
      (whereClause.date as Prisma.DateTimeFilter).gte = new Date(startDate);
    }
    if (endDate) {
      if (typeof whereClause.date !== 'object' || whereClause.date === null) {
        whereClause.date = {};
      }
      (whereClause.date as Prisma.DateTimeFilter).lte = new Date(endDate);
    }

    const [settlements, totalItems] = await this.prisma.$transaction([
      this.prisma.settlement.findMany({
        where: whereClause,
        include: {
          payer: { select: { id: true, name: true } },
          payee: { select: { id: true, name: true } },
        },
        orderBy: {
          date: 'desc', // Default sort by date descending
        },
        skip,
        take: limit,
      }),
      this.prisma.settlement.count({ where: whereClause }),
    ]);

    const items: SettlementDto[] = settlements.map(s => ({
      id: s.id,
      amount: s.amount,
      date: s.date.toISOString(),
      note: s.note,
      payerId: s.payerId,
      payer: s.payer as SettlementMemberDto,
      payeeId: s.payeeId,
      payee: s.payee as SettlementMemberDto,
      userId: s.userId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    const meta: PaginationMetaDto = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / query.limit!),
      currentPage: page,
    };

    return { items, meta };
  }
}
