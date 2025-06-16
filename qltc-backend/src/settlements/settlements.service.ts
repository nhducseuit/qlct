import { Injectable, NotImplementedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { Prisma } from '@generated/prisma'; // Import Prisma
import { DetailedMemberBalanceDto } from './dto/member-balance.dto'; // Import directly
import { CreateSettlementDto } from './dto/create-settlement.dto';
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

  async createSettlement(userId: string, createSettlementDto: CreateSettlementDto): Promise<any> { // Return type will be SettlementDto
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

    const settlement = await this.prisma.settlement.create({
      data: {
        ...createSettlementDto,
        userId,
        date: new Date(createSettlementDto.date), // Convert ISO string to Date object
      },
      include: { // Include related data for the response DTO
        payer: { select: { id: true, name: true } },
        payee: { select: { id: true, name: true } },
      },
    });
    // TODO: Map Prisma Settlement object to SettlementDto
    return settlement; // For now, return the Prisma object directly
  }
}
