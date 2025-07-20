import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { Category, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FamilyService } from '../families/family.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly familyService: FamilyService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const requestedFamilyId = createCategoryDto.familyId;
    if (!requestedFamilyId) {
      throw new ForbiddenException('No familyId provided for category creation.');
    }
    // Validate that the requested familyId is in the user's accessible families
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(requestedFamilyId);
    if (!allowedFamilyIds.includes(requestedFamilyId)) {
      throw new ForbiddenException('You do not have permission to create a category in this family.');
    }
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID "${createCategoryDto.parentId}" not found.`);
      }
      if (parentCategory.familyId !== requestedFamilyId) {
        throw new ForbiddenException('Parent category does not belong to the target family.');
      }
    }
    const newCategory = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        defaultSplitRatio: (createCategoryDto.defaultSplitRatio as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${newCategory.name}" has been created.`,
      operation: 'create',
      item: newCategory,
    });
    return newCategory;
  }


  async findAllLimitedToFamilyAndParent(familyId: string): Promise<Category[]> {
    // Only return categories for the user's family and its parent
    const familyIds = await this.familyService.getFamilyTreeIds(familyId);
    const limitedFamilyIds = familyIds.slice(0, 2);
    return this.prisma.category.findMany({
      where: { familyId: { in: limitedFamilyIds } },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, familyId: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    // Debug log for category and familyId check
    // eslint-disable-next-line no-console
    console.log('[DEBUG] findOne category', {
      id,
      familyId,
      categoryFound: !!category,
      categoryFamilyId: category?.familyId,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    // Allow access if the category's familyId is in the user's family tree (self or ancestor)
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(familyId);
    if (!allowedFamilyIds.includes(category.familyId)) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG] Forbidden: category.familyId not in allowedFamilyIds', {
        categoryFamilyId: category.familyId,
        allowedFamilyIds,
        requestFamilyId: familyId,
      });
      throw new ForbiddenException('You do not have permission to view this category.');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {

    const existingCategory = await this.prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    // Determine the target familyId (allow moving to another family)
    const targetFamilyId = updateCategoryDto.familyId || existingCategory.familyId;
    if (!targetFamilyId) {
      throw new ForbiddenException('No familyId provided for category update.');
    }
    // Validate that the user can act on the target family
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(targetFamilyId);
    if (!allowedFamilyIds.includes(targetFamilyId)) {
      throw new ForbiddenException('You do not have permission to move this category to the target family.');
    }
    // Only allow update if the user can also access the original family
    const allowedOriginalFamilyIds = await this.familyService.getFamilyTreeIds(existingCategory.familyId);
    if (!allowedOriginalFamilyIds.includes(existingCategory.familyId)) {
      throw new ForbiddenException('You do not have permission to update this category.');
    }
    if (updateCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({ where: { id: updateCategoryDto.parentId } });
      if (!parentCategory || parentCategory.familyId !== targetFamilyId) {
        throw new ForbiddenException('New parent category does not exist or does not belong to the target family.');
      }
    }
    // Prevent moving to a family where a category with the same name already exists (optional, if business rule)
    if (targetFamilyId !== existingCategory.familyId) {
      const exists = await this.prisma.category.findFirst({
        where: { name: existingCategory.name, familyId: targetFamilyId },
      });
      if (exists) {
        throw new ForbiddenException('A category with the same name already exists in the target family.');
      }
    }
    // Only set familyId if actually moving
    const updateData: Prisma.CategoryUpdateInput = {
      ...updateCategoryDto,
      defaultSplitRatio:
        updateCategoryDto.defaultSplitRatio !== undefined
          ? ((updateCategoryDto.defaultSplitRatio as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull)
          : undefined,
    };
    if (targetFamilyId !== existingCategory.familyId) {
      updateData.family = { connect: { id: targetFamilyId } };
    }
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });
    this.notificationsGateway.sendToUser(userId, 'categories_updated', {
      message: `Category "${updatedCategory.name}" has been updated.`,
      operation: 'update',
      item: updatedCategory,
    });
    return updatedCategory;
  }

  async remove(id: string, familyId: string, userId: string): Promise<Category> {
    const categoryToDelete = await this.prisma.category.findUnique({ where: { id } });
    if (!categoryToDelete) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    // Validate that the user can act on the category's family
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(categoryToDelete.familyId);
    if (!allowedFamilyIds.includes(categoryToDelete.familyId)) {
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
    const deletedCategory = await this.prisma.category.delete({ where: { id } });
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
