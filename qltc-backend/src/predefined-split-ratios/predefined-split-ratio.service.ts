import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredefinedSplitRatioDto } from './dto/create-predefined-split-ratio.dto';
import { UpdatePredefinedSplitRatioDto } from './dto/update-predefined-split-ratio.dto';
import { PredefinedSplitRatio, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FamilyService } from '../families/family.service';

@Injectable()
export class PredefinedSplitRatioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(forwardRef(() => FamilyService)) private readonly familyService: FamilyService,
  ) {}

  async create(
    createPredefinedSplitRatioDto: CreatePredefinedSplitRatioDto,
    familyId: string,
    userId: string,
  ): Promise<PredefinedSplitRatio> {
    const newPredefinedRatio = await this.prisma.predefinedSplitRatio.create({
      data: {
        name: createPredefinedSplitRatioDto.name,
        splitRatio: createPredefinedSplitRatioDto.splitRatio as unknown as Prisma.InputJsonValue,
        familyId: familyId,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'predefined_split_ratios_updated', {
      message: `Predefined split ratio "${newPredefinedRatio.name}" has been created.`,
      operation: 'create',
      item: newPredefinedRatio,
    });
    return newPredefinedRatio;
  }

  async findAll(familyId: string): Promise<PredefinedSplitRatio[]> {
    // Get both the user's family and its parent
    const familyIds = await this.familyService.getFamilyTreeIds(familyId);
    // Only include the user's family and its parent (not all ancestors)
    const limitedFamilyIds = familyIds.slice(0, 2);
    return this.prisma.predefinedSplitRatio.findMany({
      where: { familyId: { in: limitedFamilyIds } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, familyId: string): Promise<PredefinedSplitRatio> {
    const predefinedRatio = await this.prisma.predefinedSplitRatio.findUnique({
      where: { id },
    });

    if (!predefinedRatio) {
      throw new NotFoundException(`Predefined split ratio with ID "${id}" not found.`);
    }
    if (predefinedRatio.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to view this predefined split ratio.');
    }
    return predefinedRatio;
  }

  async update(
    id: string,
    updatePredefinedSplitRatioDto: UpdatePredefinedSplitRatioDto,
    familyId: string,
    userId: string,
  ): Promise<PredefinedSplitRatio> {
    const existingRatio = await this.prisma.predefinedSplitRatio.findUnique({ where: { id } });
    if (!existingRatio) {
      throw new NotFoundException(`Predefined split ratio with ID "${id}" not found.`);
    }
    if (existingRatio.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to update this predefined split ratio');
    }

    const dataToUpdate: Prisma.PredefinedSplitRatioUpdateInput = {};

    if (updatePredefinedSplitRatioDto.name !== undefined) {
      dataToUpdate.name = updatePredefinedSplitRatioDto.name;
    }
    if (updatePredefinedSplitRatioDto.splitRatio !== undefined) {
      dataToUpdate.splitRatio = updatePredefinedSplitRatioDto.splitRatio as unknown as Prisma.InputJsonValue;
    }

    const updatedPredefinedRatio = await this.prisma.predefinedSplitRatio.update({
      where: { id },
      data: dataToUpdate,
    });

    this.notificationsGateway.sendToUser(userId, 'predefined_split_ratios_updated', {
      message: `Predefined split ratio "${updatedPredefinedRatio.name}" has been updated.`,
      operation: 'update',
      item: updatedPredefinedRatio,
    });
    return updatedPredefinedRatio;
  }

  async remove(id: string, familyId: string, userId: string): Promise<PredefinedSplitRatio> {
    const ratioToDelete = await this.prisma.predefinedSplitRatio.findUnique({
      where: { id },
    });
    if (!ratioToDelete) {
      throw new NotFoundException(`Predefined split ratio with ID "${id}" not found.`);
    }
    if (ratioToDelete.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to delete this predefined split ratio.');
    }

    const deletedPredefinedRatio = await this.prisma.predefinedSplitRatio.delete({
      where: { id },
    });

    this.notificationsGateway.sendToUser(userId, 'predefined_split_ratios_updated', {
      message: `Predefined split ratio "${ratioToDelete.name}" has been deleted.`,
      operation: 'delete',
      itemId: id,
    });
    return deletedPredefinedRatio;
  }
}
