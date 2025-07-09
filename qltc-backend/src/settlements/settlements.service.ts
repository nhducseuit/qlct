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
    const activeMembers = await this.prisma.householdMembership.findMany({
      where: { familyId: { in: familyTreeIds }, isActive: true },
      include: { person: true },
    });
    if (activeMembers.length < 2) {
      return { balances: [] };
    }
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
      const payerId = tx.payer;
      const totalAmount = tx.amount;
      const splitRatioItems = tx.splitRatio as unknown as SplitRatioItem[];
      if (!Array.isArray(splitRatioItems)) continue;
      for (const item of splitRatioItems) {
        if (item.memberId === payerId) continue;
        if (!activeMembers.find((m: any) => m.id === item.memberId) || !activeMembers.find((m: any) => m.id === payerId)) {
          continue;
        }
        const amountOwedByThisMember = totalAmount * (item.percentage / 100);
        rawOwedAmounts[item.memberId][payerId] = (rawOwedAmounts[item.memberId][payerId] || 0) + amountOwedByThisMember;
      }
    }
    const settlements = await this.prisma.settlement.findMany({
      where: {
        payerId: { in: activeMembers.map((m: any) => m.personId) },
        payeeId: { in: activeMembers.map((m: any) => m.personId) },
      },
      select: {
        payerId: true,
        payeeId: true,
        amount: true,
      },
    });
    for (const settlement of settlements) {
      if (rawOwedAmounts[settlement.payeeId] && rawOwedAmounts[settlement.payeeId][settlement.payerId] !== undefined) {
        rawOwedAmounts[settlement.payeeId][settlement.payerId] =
          (rawOwedAmounts[settlement.payeeId][settlement.payerId] || 0) - (typeof settlement.amount === 'object' && typeof settlement.amount.toNumber === 'function' ? settlement.amount.toNumber() : Number(settlement.amount));
      }
    }
    const finalBalances: DetailedMemberBalanceDto[] = [];
    const memberMap = new Map(activeMembers.map((m: any) => [m.id, m.person.name]));
    if (personId) {
      // Only calculate balances for the selected person
      const selectedMember = activeMembers.find((m: any) => m.personId === personId);
      if (!selectedMember) return { balances: [] };
      for (const other of activeMembers) {
        if (other.personId === personId) continue;
        const amountOwesOther = rawOwedAmounts[selectedMember.id]?.[other.id] || 0;
        const amountOtherOwes = rawOwedAmounts[other.id]?.[selectedMember.id] || 0;
        const net = amountOwesOther - amountOtherOwes;
        if (net !== 0) {
          finalBalances.push({
            personOneId: selectedMember.personId,
            memberOneName: memberMap.get(selectedMember.id)!,
            personTwoId: other.personId,
            memberTwoName: memberMap.get(other.id)!,
            netAmountPersonOneOwesPersonTwo: parseFloat(net.toFixed(2)),
          });
        }
      }
    } else {
      // Default: all pairs (legacy, admin, or for future use)
      for (let i = 0; i < activeMembers.length; i++) {
        for (let j = i + 1; j < activeMembers.length; j++) {
          const memberOne = activeMembers[i];
          const memberTwo = activeMembers[j];
          const amountM1OwesM2 = rawOwedAmounts[memberOne.id]?.[memberTwo.id] || 0;
          const amountM2OwesM1 = rawOwedAmounts[memberTwo.id]?.[memberOne.id] || 0;
          const netAmountM1OwesM2 = amountM1OwesM2 - amountM2OwesM1;
          if (netAmountM1OwesM2 !== 0) {
            finalBalances.push({
              personOneId: memberOne.personId,
              memberOneName: memberMap.get(memberOne.id)!,
              personTwoId: memberTwo.personId,
              memberTwoName: memberMap.get(memberTwo.id)!,
              netAmountPersonOneOwesPersonTwo: parseFloat(netAmountM1OwesM2.toFixed(2)),
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
