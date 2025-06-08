import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CategoryService } from '../categories/category.service'; // To get defaultSplitRatio
import { HouseholdMemberService } from '../household-members/household-member.service'; // Import HouseholdMemberService
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Transaction, Prisma } from '@generated/prisma';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly householdMemberService: HouseholdMemberService, // Inject HouseholdMemberService
    private readonly notificationsGateway: NotificationsGateway,
  ) {}


  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    // Validate if categoryId belongs to the user
    const category = await this.categoryService.findOne(createTransactionDto.categoryId, userId);
    if (!category) {
      // This check is already in categoryService.findOne, but good to be aware
      throw new NotFoundException(`Category with ID "${createTransactionDto.categoryId}" not found for this user.`);
    }


    // Validate payer if provided (ensure it's a valid HouseholdMember ID for the user)
    if (createTransactionDto.payer) {
      const householdMember = await this.householdMemberService.findOne(createTransactionDto.payer, userId);
      if (!householdMember) {
        throw new NotFoundException(`Payer (HouseholdMember) with ID "${createTransactionDto.payer}" not found or does not belong to the user.`);
      }
    }

    let finalSplitRatio: Prisma.InputJsonValue | undefined =
      createTransactionDto.splitRatio as unknown as Prisma.InputJsonValue;

    if (createTransactionDto.isShared && !createTransactionDto.splitRatio && category.defaultSplitRatio) {
      finalSplitRatio = category.defaultSplitRatio; // Use category's default as a snapshot
    }

    const newTransaction = await this.prisma.transaction.create({
      data: {
      ...createTransactionDto,
        userId,
        date: new Date(createTransactionDto.date), // Convert date string to Date object
        splitRatio: finalSplitRatio,
      },
    });

    // Phát sự kiện sau khi tạo thành công
    this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
      message: `Giao dịch mới "${newTransaction.note || newTransaction.id}" đã được tạo.`,
      operation: 'create',
      item: newTransaction,
    });
    return newTransaction;
  }

  async findAll(userId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    if (transaction.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this transaction');
    }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, userId); // Ensures transaction exists and user has permission
    
    const dataToUpdate: Prisma.TransactionUpdateInput = {};
    
    if (updateTransactionDto.amount !== undefined) dataToUpdate.amount = updateTransactionDto.amount;
    if (updateTransactionDto.date !== undefined) dataToUpdate.date = new Date(updateTransactionDto.date);
    if (updateTransactionDto.note !== undefined) dataToUpdate.note = updateTransactionDto.note;
    if (updateTransactionDto.type !== undefined) dataToUpdate.type = updateTransactionDto.type;
    if (updateTransactionDto.payer !== undefined) {
      if (updateTransactionDto.payer === null) { // Allowing to clear the payer
        dataToUpdate.payer = null;
      } else {
        await this.householdMemberService.findOne(updateTransactionDto.payer, userId); // Validate payer
        dataToUpdate.payer = updateTransactionDto.payer;
      }
    }
    if (updateTransactionDto.isShared !== undefined) dataToUpdate.isShared = updateTransactionDto.isShared;
    
    if (updateTransactionDto.categoryId !== undefined) {
      await this.categoryService.findOne(updateTransactionDto.categoryId, userId); // Validate new category
      dataToUpdate.category = { connect: { id: updateTransactionDto.categoryId } };
    }
    if (updateTransactionDto.splitRatio !== undefined) {
      dataToUpdate.splitRatio = updateTransactionDto.splitRatio as unknown as Prisma.InputJsonValue;
    } else if (updateTransactionDto.isShared === true && transaction.isShared === false) {
      // If isShared becomes true and no custom splitRatio is provided, try to apply category default
      const categoryIdToUse = updateTransactionDto.categoryId || transaction.categoryId;
      const category = await this.categoryService.findOne(categoryIdToUse, userId);
      if (category.defaultSplitRatio) {
        dataToUpdate.splitRatio = category.defaultSplitRatio;
      }
    } else if (updateTransactionDto.isShared === false) {
      dataToUpdate.splitRatio = Prisma.DbNull; // Or an empty array if your logic prefers that for non-shared
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
    });
    // Phát sự kiện sau khi cập nhật thành công
    this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
      message: `Giao dịch "${updatedTransaction.note || updatedTransaction.id}" đã được cập nhật.`,
      operation: 'update',
      item: updatedTransaction, // Send the actual updated transaction
    });

    return updatedTransaction;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const transaction = await this.findOne(id, userId); // Ensures transaction exists and user has permission
    await this.prisma.transaction.delete({
      where: { id },
    });
    
    // Phát sự kiện sau khi xóa thành công
    this.notificationsGateway.sendToUser(userId, 'transactions_updated', {
      message: `Giao dịch "${transaction.note || transaction.id}" đã được xóa.`,
      operation: 'delete',
      itemId: id, // Gửi ID của item đã xóa
    });
    return { message: `Transaction with ID "${id}" deleted successfully` };
  }
}