import { Injectable, NotImplementedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetBalancesQueryDto } from './dto/get-balances-query.dto';
import { BalancesResponseDto } from './dto/balances-response.dto';
import { Prisma } from '@prisma/client';
import { DetailedMemberBalanceDto } from './dto/member-balance.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementDto, SettlementMemberDto } from './dto/settlement.dto';
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
    console.log('Calculating balances for family:', familyId, 'with query:', query);
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
      where: { familyId: { in: familyTreeIds } },
      select: {
        payerMembershipId: true,
        payeeMembershipId: true,
        amount: true,
      },
    });

    for (const settlement of settlements) {
      rawOwedAmounts[settlement.payerMembershipId][settlement.payeeMembershipId] =
        (rawOwedAmounts[settlement.payerMembershipId][settlement.payeeMembershipId] || 0) - settlement.amount;
    }

    const finalBalances: DetailedMemberBalanceDto[] = [];
    const memberMap = new Map(activeMembers.map((m: any) => [m.id, m.person.name]));

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

    return { balances: finalBalances };
  }

  async createSettlement(
    familyId: string,
    userId: string,
    createSettlementDto: CreateSettlementDto,
  ): Promise<SettlementDto> {
    if (createSettlementDto.payerMembershipId === createSettlementDto.payeeMembershipId) {
      throw new BadRequestException('Payer and Payee cannot be the same member.');
    }

    const members = await this.prisma.householdMembership.findMany({
      where: {
        familyId,
        id: { in: [createSettlementDto.payerMembershipId, createSettlementDto.payeeMembershipId] },
        isActive: true,
      },
      include: { person: true },
    });

    if (members.length !== 2) {
      throw new BadRequestException('Invalid Payer or Payee member ID(s), they are not active, or they do not belong to your family.');
    }

    const settlement = await this.prisma.settlement.create({
      data: {
        date: new Date(createSettlementDto.date),
        familyId: familyId,
        amount: createSettlementDto.amount,
        note: createSettlementDto.note,
        payerMembershipId: createSettlementDto.payerMembershipId,
        payeeMembershipId: createSettlementDto.payeeMembershipId,
      },
      include: {
        payer: { include: { person: true } },
        payee: { include: { person: true } },
      },
    });

    const mappedSettlement: SettlementDto = {
      id: settlement.id,
      amount: settlement.amount,
      date: settlement.date.toISOString(),
      note: settlement.note,
      payerMembershipId: settlement.payerMembershipId,
      payer: { id: settlement.payer.id, person: { id: settlement.payer.person.id, name: settlement.payer.person.name } },
      payeeMembershipId: settlement.payeeMembershipId,
      payee: { id: settlement.payee.id, person: { id: settlement.payee.person.id, name: settlement.payee.person.name } },
      familyId: settlement.familyId,
      createdAt: settlement.createdAt.toISOString(),
      updatedAt: settlement.updatedAt.toISOString(),
    };

    this.notificationsGateway.sendToUser(userId, 'settlements_updated', {
      message: `Thanh toán từ ${mappedSettlement.payer.person.name} đến ${mappedSettlement.payee.person.name} đã được ghi nhận.`,
      operation: 'create',
      item: mappedSettlement,
    });

    return mappedSettlement;
  }

  async getSettlements(
    familyId: string,
    query: GetSettlementsQueryDto,
  ): Promise<PaginatedSettlementsResponseDto> {
    const { page = 1, limit = 10, payerMembershipId, payeeMembershipId, startDate, endDate } = query;
    const skip = (page - 1) * limit;
    const familyTreeIds = await this.familyService.getFamilyTreeIds(familyId);

    const whereClause: Prisma.SettlementWhereInput = { familyId: { in: familyTreeIds } };

    if (payerMembershipId) whereClause.payerMembershipId = payerMembershipId;
    if (payeeMembershipId) whereClause.payeeMembershipId = payeeMembershipId;
    if (startDate) {
      if (typeof whereClause.date !== 'object' || whereClause.date === null) whereClause.date = {};
      (whereClause.date as Prisma.DateTimeFilter).gte = new Date(startDate);
    }
    if (endDate) {
      if (typeof whereClause.date !== 'object' || whereClause.date === null) whereClause.date = {};
      (whereClause.date as Prisma.DateTimeFilter).lte = new Date(endDate);
    }

    const [settlements, totalItems] = await this.prisma.$transaction([
      this.prisma.settlement.findMany({
        where: whereClause,
        include: {
          payer: { include: { person: true } },
          payee: { include: { person: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.settlement.count({ where: whereClause }),
    ]);

    const items: SettlementDto[] = settlements.map((s) => ({
      id: s.id,
      amount: s.amount,
      date: s.date.toISOString(),
      note: s.note,
      payerMembershipId: s.payerMembershipId,
      payer: { id: s.payer.id, person: { id: s.payer.person.id, name: s.payer.person.name } },
      payeeMembershipId: s.payeeMembershipId,
      payee: { id: s.payee.id, person: { id: s.payee.person.id, name: s.payee.person.name } },
      familyId: s.familyId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
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
