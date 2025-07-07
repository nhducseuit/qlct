import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CategoryService } from '../categories/category.service';
import { HouseholdMemberService } from '../household-members/household-member.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Transaction, Prisma } from '@prisma/client';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import dayjs from 'dayjs';
import { FamilyService } from '../families/family.service';

// This type enhances Prisma's Transaction with the relations we expect to include.
type TransactionWithDetails = Transaction & {
  payerMembership?: { person: { name: string } } | null;
  category?: any; // Keeping category flexible for now
};

interface SplitRatioItem {
  memberId: string;
  percentage: number;
}

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly householdMemberService: HouseholdMemberService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly familyService: FamilyService,
  ) {}

  private parseSplitRatio(splitRatioJson: Prisma.JsonValue | null): Array<{ memberId: string; percentage: number }> | null {
    if (splitRatioJson === null || splitRatioJson === undefined) {
      return null;
    }
    try {
      const parsed = typeof splitRatioJson === 'string' ? JSON.parse(splitRatioJson) : splitRatioJson;
      if (Array.isArray(parsed) && parsed.every(item =>
        typeof item === 'object' && item !== null &&
        typeof item.memberId === 'string' &&
        typeof item.percentage === 'number'
      )) {
        return parsed as Array<{ memberId: string; percentage: number }>;
      }
      console.warn('Invalid splitRatio format:', parsed);
      return null;
    } catch (e) {
      console.error('Failed to parse splitRatio JSON:', splitRatioJson, e);
      return null;
    }
  }

  /**
   * Applies strict mode filtering and amount adjustment to a list of transactions.
   * In strict mode, only shared expense transactions where ALL selected members
   * are in the splitRatio are included. The amount is adjusted to be the sum
   * of the shares of the selected members based on their original percentages.
   * Non-shared expenses and incomes are excluded.
   */
  private applyStrictMode(
    transactions: TransactionWithDetails[],
    selectedMemberIds: string[],
  ): TransactionWithDetails[] {
    const filteredAndAdjusted: TransactionWithDetails[] = [];
    for (const transaction of transactions) {
      if (transaction.type === 'expense' && transaction.isShared) {
        const splitRatioArray = this.parseSplitRatio(transaction.splitRatio);
        if (splitRatioArray && splitRatioArray.length > 0) {
          const allSelectedMembersPresent = selectedMemberIds.every(smId =>
            splitRatioArray.some(srItem => srItem.memberId === smId)
          );
          if (allSelectedMembersPresent) {
            const selectedMembersTotalPercentage = splitRatioArray
              .filter(srItem => selectedMemberIds.includes(srItem.memberId))
              .reduce((sum, srItem) => sum + (srItem.percentage || 0), 0);

            if (selectedMembersTotalPercentage > 0) {
                 const adjustedAmount = transaction.amount * (selectedMembersTotalPercentage / 100);
                 filteredAndAdjusted.push({ ...transaction, amount: adjustedAmount });
            } else {
                 console.log(`[DEBUG] StrictMode - Transaction ${transaction.id} excluded: selected members present but total share is 0%.`);
            }
          }
        }
      }
      // Non-shared expenses and incomes are excluded in strict mode.
    }
    return filteredAndAdjusted;
  }

  private applyNonStrictModeMemberFilter(
    transactions: TransactionWithDetails[],
    selectedMemberIds: string[],
  ): TransactionWithDetails[] {
    return transactions.filter((transaction) => {
      if (transaction.isShared) {
        const splitRatioArray = this.parseSplitRatio(transaction.splitRatio);
        return splitRatioArray?.some((srItem) => selectedMemberIds.includes(srItem.memberId)) || false;
      } else {
        // Non-shared transaction
        return transaction.payer ? selectedMemberIds.includes(transaction.payer) : false;
      }
    });
  }

  async create(createTransactionDto: CreateTransactionDto, familyId: string): Promise<Transaction> {
    const category = await this.categoryService.findOne(createTransactionDto.categoryId, familyId);

    if (createTransactionDto.payer) {
      await this.householdMemberService.findOne(createTransactionDto.payer, familyId);
    }

    let finalSplitRatio: Prisma.InputJsonValue | undefined =
      createTransactionDto.splitRatio as unknown as Prisma.InputJsonValue;

    if (createTransactionDto.isShared && !createTransactionDto.splitRatio && category.defaultSplitRatio) {
      finalSplitRatio = category.defaultSplitRatio;
    }

    const newTransaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        familyId,
        date: new Date(createTransactionDto.date),
        splitRatio: finalSplitRatio,
      },
    });

    // Emit to all userId rooms for this family
    const memberships = await this.prisma.householdMembership.findMany({
      where: { familyId, isActive: true },
      include: { person: true },
    });
    // Map person.email to userId using email matching
    const emails = memberships.map(m => m.person.email).filter((e): e is string => !!e);
    const users = await this.prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: { id: true, email: true },
    });
    const emailToUserId = Object.fromEntries(users.map(u => [u.email, u.id]));
    console.log('[TransactionService][create] Emitting transactions_updated to userIds:', emails.map(email => emailToUserId[email]));
    for (const m of memberships) {
      const email = m.person.email;
      if (email && emailToUserId[email]) {
        const userId = emailToUserId[email];
        console.log(`[TransactionService][create] Emitting to userId: ${userId}`);
        this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
          message: `Giao dịch mới "${newTransaction.note || newTransaction.id}" đã được tạo.`,
          operation: 'create',
          item: newTransaction,
        });
      }
    }
    return newTransaction;
  }

  async findFiltered(familyId: string, query: GetTransactionsQueryDto): Promise<TransactionWithDetails[]> {
    if (!familyId) {
      throw new Error('familyId must be provided to findFiltered');
    }
    const familyIds = await this.familyService.getFamilyTreeIds(familyId);

    const where: Prisma.TransactionWhereInput = { familyId: { in: familyIds } };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.periodType && query.year) {
      const year = query.year;
      switch (query.periodType) {
        case 'monthly':
          const month = query.month ? query.month - 1 : dayjs().month();
          startDate = dayjs().year(year).month(month).startOf('month').toDate();
          endDate = dayjs().year(year).month(month).endOf('month').toDate();
          break;
        case 'quarterly':
          const quarter = query.quarter || dayjs().quarter();
          startDate = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
          endDate = dayjs().year(year).quarter(quarter).endOf('quarter').toDate();
          break;
        case 'yearly':
          startDate = dayjs().year(year).startOf('year').toDate();
          endDate = dayjs().year(year).endOf('year').toDate();
          break;
      }
    } else if (query.startDate || query.endDate) {
      if (query.startDate) {
        startDate = dayjs(query.startDate).startOf('day').toDate();
      }
      if (query.endDate) {
        endDate = dayjs(query.endDate).endOf('day').toDate();
      }
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    let transactions: TransactionWithDetails[] = await this.prisma.transaction.findMany({
      where,
      include: {
        payerMembership: { include: { person: true } },
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    const isStrictModeEnabled = query.isStrictMode === 'true'; // Convert string to boolean
    const memberIds = query.memberIds;

    if (memberIds && memberIds.length > 0) {
        console.log(`[DEBUG] TransactionService.findFiltered - Applying member filters. isStrictModeEnabled: ${isStrictModeEnabled}`);
        if (isStrictModeEnabled) {
            transactions = this.applyStrictMode(transactions, memberIds);
        } else {
            transactions = this.applyNonStrictModeMemberFilter(transactions, memberIds);
        }
    } else if (isStrictModeEnabled) {
        // Strict mode ON but no members selected.
        console.log('[DEBUG] TransactionService.findFiltered - Strict mode is ON, but no memberIds are selected. Filtering to empty list.');
        transactions = [];
    } else {
        console.log('[DEBUG] TransactionService.findFiltered - No memberId filter AND strict mode is OFF. Using all transactions.');
    }

    // Apply transaction type filter (income/expense)
    if (query.transactionType === 'expense') {
      transactions = transactions.filter(tx => tx.type === 'expense');
    } else if (query.transactionType === 'income') {
      transactions = transactions.filter(tx => tx.type === 'income');
    }

    return transactions;
  }

  async findOne(id: string, familyId: string): Promise<TransactionWithDetails> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        payerMembership: { include: { person: true } },
        category: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }

    const familyTreeIds = await this.familyService.getFamilyTreeIds(familyId);
    if (!familyTreeIds.includes(transaction.familyId)) {
      throw new ForbiddenException('You do not have permission to view this transaction.');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, familyId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException(`Transaction with ID \"${id}\" not found`);

    const familyTreeIds = await this.familyService.getFamilyTreeIds(familyId);
    if (!familyTreeIds.includes(transaction.familyId)) {
      throw new ForbiddenException('You do not have permission to update this transaction.');
    }

    const { splitRatio, ...restOfDto } = updateTransactionDto;
    const dataToUpdate: Prisma.TransactionUpdateInput = { ...restOfDto };

    if (updateTransactionDto.date) {
      dataToUpdate.date = new Date(updateTransactionDto.date);
    }

    if (updateTransactionDto.payer) {
      await this.householdMemberService.findOne(updateTransactionDto.payer, familyId);
    }

    if (updateTransactionDto.categoryId) {
      await this.categoryService.findOne(updateTransactionDto.categoryId, familyId);
    }

    if (splitRatio !== undefined) {
      dataToUpdate.splitRatio = splitRatio as unknown as Prisma.InputJsonValue;
    } else if (updateTransactionDto.isShared === true && transaction.isShared === false) {
      const categoryIdToUse = updateTransactionDto.categoryId || transaction.categoryId;
      const category = await this.categoryService.findOne(categoryIdToUse, familyId);
      if (category.defaultSplitRatio) {
        dataToUpdate.splitRatio = category.defaultSplitRatio;
      }
    } else if (updateTransactionDto.isShared === false) {
      dataToUpdate.splitRatio = Prisma.DbNull;
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
    });

    // Emit to all userId rooms for this family
    const memberships = await this.prisma.householdMembership.findMany({
      where: { familyId, isActive: true },
      include: { person: true },
    });
    // Map person.email to userId using email matching
    const emails = memberships.map(m => m.person.email).filter((e): e is string => !!e);
    const users = await this.prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: { id: true, email: true },
    });
    const emailToUserId = Object.fromEntries(users.map(u => [u.email, u.id]));
    console.log('[TransactionService][update] Emitting transactions_updated to userIds:', emails.map(email => emailToUserId[email]));
    for (const m of memberships) {
      const email = m.person.email;
      if (email && emailToUserId[email]) {
        const userId = emailToUserId[email];
        console.log(`[TransactionService][update] Emitting to userId: ${userId}`);
        this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
          message: `Giao dịch "${updatedTransaction.note || updatedTransaction.id}" đã được cập nhật.`,
          operation: 'update',
          item: updatedTransaction,
        });
      }
    }

    return updatedTransaction;
  }

  async remove(id: string, familyId: string): Promise<{ message: string }> {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException(`Transaction with ID "${id}" not found`);
    if (transaction.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to delete this transaction.');
    }
    await this.prisma.transaction.delete({
      where: { id },
    });

    // Emit to all userId rooms for this family
    const memberships = await this.prisma.householdMembership.findMany({
      where: { familyId, isActive: true },
      include: { person: true },
    });
    // Map person.email to userId using email matching
    const emails = memberships.map(m => m.person.email).filter((e): e is string => !!e);
    const users = await this.prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: { id: true, email: true },
    });
    const emailToUserId = Object.fromEntries(users.map(u => [u.email, u.id]));
    console.log('[TransactionService][remove] Emitting transactions_updated to userIds:', emails.map(email => emailToUserId[email]));
    for (const m of memberships) {
      const email = m.person.email;
      if (email && emailToUserId[email]) {
        const userId = emailToUserId[email];
        console.log(`[TransactionService][remove] Emitting to userId: ${userId}`);
        this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
          message: `Giao dịch "${transaction.note || transaction.id}" đã được xóa.`,
          operation: 'delete',
          itemId: id,
        });
      }
    }
    return { message: `Transaction with ID "${id}" deleted successfully` };
  }
}
