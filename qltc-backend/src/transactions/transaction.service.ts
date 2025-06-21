import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CategoryService } from '../categories/category.service';
import { HouseholdMemberService } from '../household-members/household-member.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Transaction, Prisma } from '@generated/prisma';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import dayjs from 'dayjs';

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
    transactions: Transaction[], // Prisma's Transaction type
    selectedMemberIds: string[], // Must be provided if isStrictMode is true
  ): Transaction[] {
    const filteredAndAdjusted: Transaction[] = [];
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
    transactions: Transaction[], // Prisma's Transaction type
    selectedMemberIds: string[],
  ): Transaction[] {
    return transactions.filter(transaction => {
      if (transaction.isShared) {
        const splitRatioArray = this.parseSplitRatio(transaction.splitRatio);
        return splitRatioArray?.some(srItem => selectedMemberIds.includes(srItem.memberId)) || false;
      } else { // Non-shared transaction
        return transaction.payer ? selectedMemberIds.includes(transaction.payer) : false;
      }
    });
  }

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    const category = await this.categoryService.findOne(createTransactionDto.categoryId, userId);
    // category validation is implicitly handled by findOne throwing if not found/not user's

    if (createTransactionDto.payer) {
      await this.householdMemberService.findOne(createTransactionDto.payer, userId);
      // payer validation is implicitly handled by findOne throwing if not found/not user's
    }

    let finalSplitRatio: Prisma.InputJsonValue | undefined =
      createTransactionDto.splitRatio as unknown as Prisma.InputJsonValue;

    if (createTransactionDto.isShared && !createTransactionDto.splitRatio && category.defaultSplitRatio) {
      finalSplitRatio = category.defaultSplitRatio;
    }

    const newTransaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
        date: new Date(createTransactionDto.date), // Convert date string to Date object
        splitRatio: finalSplitRatio,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
      message: `Giao dịch mới "${newTransaction.note || newTransaction.id}" đã được tạo.`,
      operation: 'create',
      item: newTransaction,
    });
    return newTransaction;
  }

  async findFiltered(userId: string, query: GetTransactionsQueryDto): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = { }; // No userId filter here, as per global access

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
    
    let transactions = await this.prisma.transaction.findMany({
      where,
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

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    // Per user request, any authenticated user can access any transaction.
    // The ownership check is removed.
    // if (transaction.userId !== userId) {
    //   throw new ForbiddenException('You do not have permission to access this transaction');
    // }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    const dataToUpdate: Prisma.TransactionUpdateInput = {};

    if (updateTransactionDto.amount !== undefined) dataToUpdate.amount = updateTransactionDto.amount;
    if (updateTransactionDto.date !== undefined) dataToUpdate.date = new Date(updateTransactionDto.date);
    if (updateTransactionDto.note !== undefined) dataToUpdate.note = updateTransactionDto.note;
    if (updateTransactionDto.type !== undefined) dataToUpdate.type = updateTransactionDto.type;
    if (updateTransactionDto.payer !== undefined) {
      if (updateTransactionDto.payer === null) {
        dataToUpdate.payer = null;
      } else {
        await this.householdMemberService.findOne(updateTransactionDto.payer, userId);
        dataToUpdate.payer = updateTransactionDto.payer;
      }
    }
    if (updateTransactionDto.isShared !== undefined) dataToUpdate.isShared = updateTransactionDto.isShared;

    if (updateTransactionDto.categoryId !== undefined) {
      await this.categoryService.findOne(updateTransactionDto.categoryId, userId);
      dataToUpdate.category = { connect: { id: updateTransactionDto.categoryId } };
    }
    if (updateTransactionDto.splitRatio !== undefined) {
      dataToUpdate.splitRatio = updateTransactionDto.splitRatio as unknown as Prisma.InputJsonValue;
    } else if (updateTransactionDto.isShared === true && transaction.isShared === false) {
      const categoryIdToUse = updateTransactionDto.categoryId || transaction.categoryId;
      const category = await this.categoryService.findOne(categoryIdToUse, userId);
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

    this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
      message: `Giao dịch "${updatedTransaction.note || updatedTransaction.id}" đã được cập nhật.`,
      operation: 'update',
      item: updatedTransaction,
    });

    return updatedTransaction;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const transaction = await this.findOne(id, userId);
    await this.prisma.transaction.delete({
      where: { id },
    });

    this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
      message: `Giao dịch "${transaction.note || transaction.id}" đã được xóa.`,
      operation: 'delete',
      itemId: id,
    });
    return { message: `Transaction with ID "${id}" deleted successfully` };
  }
}
