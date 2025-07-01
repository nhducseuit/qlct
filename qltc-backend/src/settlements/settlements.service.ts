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

interface SplitRatioItem {
  memberId: string;
  percentage: number;
}

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async calculateBalances(familyId: string, query: GetBalancesQueryDto): Promise<BalancesResponseDto> {
    console.log('Calculating balances for family:', familyId, 'with query:', query);

    const activeMembers = await this.prisma.householdMember.findMany({
      where: { familyId, isActive: true },
      select: { id: true, name: true },
    });

    if (activeMembers.length < 2) {
      return { balances: [] };
    }

    const sharedTransactions = await this.prisma.transaction.findMany({
      where: {
        familyId,
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
    activeMembers.forEach((m1) => {
      rawOwedAmounts[m1.id] = {};
      activeMembers.forEach((m2) => {
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

        if (!activeMembers.find((m) => m.id === item.memberId) || !activeMembers.find((m) => m.id === payerId)) {
          continue;
        }

        const amountOwedByThisMember = totalAmount * (item.percentage / 100);
        rawOwedAmounts[item.memberId][payerId] = (rawOwedAmounts[item.memberId][payerId] || 0) + amountOwedByThisMember;
      }
    }

    const settlements = await this.prisma.settlement.findMany({
      where: { familyId },
      select: {
        payerId: true,
        payeeId: true,
        amount: true,
      },
    });

    for (const settlement of settlements) {
      rawOwedAmounts[settlement.payerId][settlement.payeeId] =
        (rawOwedAmounts[settlement.payerId][settlement.payeeId] || 0) - settlement.amount;
    }

    const finalBalances: DetailedMemberBalanceDto[] = [];
    const memberMap = new Map(activeMembers.map((m) => [m.id, m.name]));

    for (let i = 0; i < activeMembers.length; i++) {
      for (let j = i + 1; j < activeMembers.length; j++) {
        const memberOne = activeMembers[i];
        const memberTwo = activeMembers[j];

        const amountM1OwesM2 = rawOwedAmounts[memberOne.id]?.[memberTwo.id] || 0;
        const amountM2OwesM1 = rawOwedAmounts[memberTwo.id]?.[memberOne.id] || 0;

        const netAmountM1OwesM2 = amountM1OwesM2 - amountM2OwesM1;

        if (netAmountM1OwesM2 !== 0) {
          finalBalances.push({
            memberOneId: memberOne.id,
            memberOneName: memberMap.get(memberOne.id)!,
            memberTwoId: memberTwo.id,
            memberTwoName: memberMap.get(memberTwo.id)!,
            netAmountMemberOneOwesMemberTwo: parseFloat(netAmountM1OwesM2.toFixed(2)),
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
    if (createSettlementDto.payerId === createSettlementDto.payeeId) {
      throw new BadRequestException('Payer and Payee cannot be the same member.');
    }

    const members = await this.prisma.householdMember.findMany({
      where: {
        familyId,
        id: { in: [createSettlementDto.payerId, createSettlementDto.payeeId] },
        isActive: true,
      },
    });

    if (members.length !== 2) {
      throw new BadRequestException('Invalid Payer or Payee member ID(s), they are not active, or they do not belong to your family.');
    }

    const settlement = await this.prisma.settlement.create({
      data: {
        ...createSettlementDto,
        date: new Date(createSettlementDto.date),
        familyId: familyId,
      },
      include: {
        payer: { select: { id: true, name: true } },
        payee: { select: { id: true, name: true } },
      },
    });

    const mappedSettlement: SettlementDto = {
      id: settlement.id,
      amount: settlement.amount,
      date: settlement.date.toISOString(),
      note: settlement.note,
      payerId: settlement.payerId,
      payer: settlement.payer as SettlementMemberDto,
      payeeId: settlement.payeeId,
      payee: settlement.payee as SettlementMemberDto,
      familyId: settlement.familyId,
      createdAt: settlement.createdAt.toISOString(),
      updatedAt: settlement.updatedAt.toISOString(),
    };

    this.notificationsGateway.sendToUser(userId, 'settlements_updated', {
      message: `Thanh toán từ ${mappedSettlement.payer.name} đến ${mappedSettlement.payee.name} đã được ghi nhận.`,
      operation: 'create',
      item: mappedSettlement,
    });

    return mappedSettlement;
  }

  async getSettlements(
    familyId: string,
    query: GetSettlementsQueryDto,
  ): Promise<PaginatedSettlementsResponseDto> {
    const { page = 1, limit = 10, payerId, payeeId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SettlementWhereInput = { familyId };

    if (payerId) whereClause.payerId = payerId;
    if (payeeId) whereClause.payeeId = payeeId;
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
          payer: { select: { id: true, name: true } },
          payee: { select: { id: true, name: true } },
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
      payerId: s.payerId,
      payer: s.payer as SettlementMemberDto,
      payeeId: s.payeeId,
      payee: s.payee as SettlementMemberDto,
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
