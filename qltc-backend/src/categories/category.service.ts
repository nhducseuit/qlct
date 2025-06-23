import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    // For creation, userId is still used to stamp ownership.
    // ParentId validation: Ensure parent exists, but not necessarily owned by the current user
    // (as categories are now global for read, but creation is still tied to the user's context).
    // This will be refined with the multi-family model.
    // For now, if a parentId is provided, just check if it exists.
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      if (!parentCategory) { // Keep this check to ensure parent exists
        throw new NotFoundException(`Parent category with ID "${createCategoryDto.parentId}" not found.`);
      }
    }

    // The DTO validation (including IsSplitRatioSum100Constraint) happens in the controller layer
    // or via global pipes. Prisma expects the defaultSplitRatio to be a valid JSON structure
    // if provided, or null/undefined.

    const newCategory = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        parentId: createCategoryDto.parentId,
        icon: createCategoryDto.icon,
        color: createCategoryDto.color,
        isPinned: createCategoryDto.isPinned,
        order: createCategoryDto.order,
        isHidden: createCategoryDto.isHidden,
        budgetLimit: createCategoryDto.budgetLimit,
        // Cast to Prisma.InputJsonValue for JSON fields
        defaultSplitRatio: createCategoryDto.defaultSplitRatio as unknown as Prisma.InputJsonValue,
        userId,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${newCategory.name}" has been created.`,
      operation: 'create',
      item: newCategory,
    });
    return newCategory;
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { }, // Per user request, data is not siloed by user for read operations
      orderBy: { order: 'asc' }, // Optional: default ordering
    });
  }

  async findOne(id: string): Promise<Category> { // userId removed from signature
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    // Per user request, any authenticated user can access any category.
    // The ownership check is removed for read operations.
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    // First, ensure the category exists and belongs to the user
    // For update/delete, we still need to check ownership.
    // This will be refined with the multi-family model. For now, keep userId check.
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    if (existingCategory.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this category.');
    }

    const dataToUpdate: Prisma.CategoryUpdateInput = {};

    // Explicitly map fields from DTO to Prisma UpdateInput
    if (updateCategoryDto.name !== undefined) dataToUpdate.name = updateCategoryDto.name;
    if (updateCategoryDto.icon !== undefined) dataToUpdate.icon = updateCategoryDto.icon;
    if (updateCategoryDto.color !== undefined) dataToUpdate.color = updateCategoryDto.color;
    if (updateCategoryDto.isPinned !== undefined) dataToUpdate.isPinned = updateCategoryDto.isPinned;
    if (updateCategoryDto.order !== undefined) dataToUpdate.order = updateCategoryDto.order;
    if (updateCategoryDto.isHidden !== undefined) dataToUpdate.isHidden = updateCategoryDto.isHidden;
    if (updateCategoryDto.budgetLimit !== undefined) dataToUpdate.budgetLimit = updateCategoryDto.budgetLimit;

    if (updateCategoryDto.defaultSplitRatio !== undefined) {
      dataToUpdate.defaultSplitRatio = updateCategoryDto.defaultSplitRatio as unknown as Prisma.InputJsonValue;
    }

    // Handle parentId update using Prisma's relational update syntax
    if (updateCategoryDto.hasOwnProperty('parentId')) {
      if (updateCategoryDto.parentId === null) {
        // Disconnect the parent if parentId is explicitly null
        dataToUpdate.parent = {
          disconnect: true,
        };
      } else if (updateCategoryDto.parentId) {
        // Connect to a new parent if parentId is a string
        const parentCategory = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });
        if (!parentCategory) { // Keep this check to ensure parent exists
          throw new NotFoundException(
            `New parent category with ID "${updateCategoryDto.parentId}" not found or does not belong to the user.`,
          );
        }
        dataToUpdate.parent = {
          connect: { id: updateCategoryDto.parentId },
        };
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${updatedCategory.name}" has been updated.`,
      operation: 'update',
      item: updatedCategory,
    });
    return updatedCategory;
  }

  async remove(id: string, userId: string): Promise<Category> {
    // First, ensure the category exists and belongs to the user for deletion.
    // This will be refined with the multi-family model. For now, keep userId check.
    const categoryToDelete = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!categoryToDelete) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    if (categoryToDelete.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this category.');
    }

    // Check for subcategories - Prisma's onDelete: NoAction for parentId relation
    // means we need to handle this manually or change the schema.
    // For now, let's assume we disallow deleting categories with subcategories or transactions.
    const subCategoriesCount = await this.prisma.category.count({ where: { parentId: id } });
    if (subCategoriesCount > 0) {
      throw new ForbiddenException('Cannot delete category with subcategories. Please delete subcategories first.');
    }
    const transactionsCount = await this.prisma.transaction.count({ where: { categoryId: id } });
    if (transactionsCount > 0) {
      throw new ForbiddenException('Cannot delete category with associated transactions. Please reassign or delete transactions first.');
    }

    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${deletedCategory.name}" has been deleted.`, // Use original name for message
      operation: 'delete',
      itemId: id, // Send ID of the deleted item
    });
    return deletedCategory; // Return the object that was deleted
  }
}
