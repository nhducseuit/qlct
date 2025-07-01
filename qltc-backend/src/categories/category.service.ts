import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { Category, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, familyId: string, userId: string): Promise<Category> {
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID "${createCategoryDto.parentId}" not found.`);
      }
      if (parentCategory.familyId !== familyId) {
        throw new ForbiddenException('Parent category does not belong to your family.');
      }
    }

    const newCategory = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        defaultSplitRatio: (createCategoryDto.defaultSplitRatio as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        familyId: familyId,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${newCategory.name}" has been created.`,
      operation: 'create',
      item: newCategory,
    });
    return newCategory;
  }

  async findAll(familyId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { familyId: familyId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, familyId: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    if (category.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to view this category.');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, familyId: string, userId: string): Promise<Category> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    if (existingCategory.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to update this category.');
    }

    if (updateCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });
      if (!parentCategory || parentCategory.familyId !== familyId) {
        throw new ForbiddenException('New parent category does not exist or does not belong to your family.');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        defaultSplitRatio:
          updateCategoryDto.defaultSplitRatio !== undefined
            ? ((updateCategoryDto.defaultSplitRatio as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull)
            : undefined,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${updatedCategory.name}" has been updated.`,
      operation: 'update',
      item: updatedCategory,
    });
    return updatedCategory;
  }

  async remove(id: string, familyId: string, userId: string): Promise<Category> {
    const categoryToDelete = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!categoryToDelete) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    if (categoryToDelete.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to delete this category.');
    }

    const transactionsCount = await this.prisma.transaction.count({ where: { categoryId: id } });
    if (transactionsCount > 0) {
      throw new ForbiddenException(
        'Cannot delete category with associated transactions. Please reassign or delete transactions first.',
      );
    }
    
    // Note: Prisma's onDelete: NoAction on the self-relation requires manual handling of subcategories.
    // For simplicity, we'll let the database throw an error if subcategories exist.
    // A more robust solution would be to check for subcategories here first.

    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${deletedCategory.name}" has been deleted.`,
      operation: 'delete',
      itemId: id,
    });
    return deletedCategory;
  }

  async reorder(familyId: string, userId: string, reorderDto: ReorderCategoriesDto): Promise<void> {
    // Use a transaction to ensure all updates succeed or none do.
    await this.prisma.$transaction(async (tx) => {
      for (const item of reorderDto.operations) {
        // Verify each category belongs to the user's family before updating
        const category = await tx.category.findFirst({
          where: {
            id: item.categoryId,
            familyId: familyId,
          },
        });

        if (!category) {
          throw new ForbiddenException(`Category with ID ${item.categoryId} not found or not in your family.`);
        }

        await tx.category.update({
          where: { id: item.categoryId },
          data: { order: item.order },
        });
      }
    });

    // Send a generic update notification as multiple items have changed
    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: 'Category order has been updated.',
      operation: 'reorder', // A custom operation type for the client to handle
    });
  }
}
