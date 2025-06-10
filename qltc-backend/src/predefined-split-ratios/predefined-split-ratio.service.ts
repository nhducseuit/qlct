import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredefinedSplitRatioDto } from './dto/create-predefined-split-ratio.dto';
import { UpdatePredefinedSplitRatioDto } from './dto/update-predefined-split-ratio.dto'; // Corrected import path
import { PredefinedSplitRatio, Prisma } from '@generated/prisma';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PredefinedSplitRatioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createPredefinedSplitRatioDto: CreatePredefinedSplitRatioDto,
    userId: string,
  ): Promise<PredefinedSplitRatio> {
    // TODO: Add validation to ensure sum of percentages is 100 if needed,
    // or handle this validation on the frontend/DTO level.
    // The DTO validation already ensures percentages are between 0 and 100.

    // Optional: Check if memberIds in splitRatio exist and belong to the user
    // This could be complex if members can be inactive. For now, skip this check.

    const newPredefinedRatio = await this.prisma.predefinedSplitRatio.create({
      data: {
        name: createPredefinedSplitRatioDto.name,
        // Cast to Prisma.InputJsonValue for JSON fields
        splitRatio: createPredefinedSplitRatioDto.splitRatio as unknown as Prisma.InputJsonValue,
        userId,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'predefined_split_ratios_updated', {
      message: `Predefined split ratio "${newPredefinedRatio.name}" has been created.`,
      operation: 'create',
      item: newPredefinedRatio,
    });
    return newPredefinedRatio;
  }

  async findAll(userId: string): Promise<PredefinedSplitRatio[]> {
    return this.prisma.predefinedSplitRatio.findMany({
      where: { userId },
      orderBy: { name: 'asc' }, // Order alphabetically by name
    });
  }

  async findOne(id: string, userId: string): Promise<PredefinedSplitRatio> {
    const predefinedRatio = await this.prisma.predefinedSplitRatio.findUnique({
      where: { id },
    });

    if (!predefinedRatio) {
      throw new NotFoundException(`Predefined split ratio with ID "${id}" not found.`);
    }
    if (predefinedRatio.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this predefined split ratio.');
    }
    return predefinedRatio;
  }

  async update(
    id: string,
    updatePredefinedSplitRatioDto: UpdatePredefinedSplitRatioDto,
    userId: string,
  ): Promise<PredefinedSplitRatio> {
    // First, ensure the ratio exists and belongs to the user
    const existingRatio = await this.findOne(id, userId); // Keep for potential use in message

    const dataToUpdate: Prisma.PredefinedSplitRatioUpdateInput = {};

    if (updatePredefinedSplitRatioDto.name !== undefined) dataToUpdate.name = updatePredefinedSplitRatioDto.name;
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

  async remove(id: string, userId: string): Promise<PredefinedSplitRatio> {
    // First, ensure the ratio exists and belongs to the user
    const ratioToDelete = await this.findOne(id, userId); // Get details before deleting for the message

    // TODO: Add check if this predefined ratio is currently linked to any categories or transactions
    // (if you implement that linking later). For now, direct delete.

    const deletedPredefinedRatio = await this.prisma.predefinedSplitRatio.delete({
      where: { id },
    });

    this.notificationsGateway.sendToUser(userId, 'predefined_split_ratios_updated', {
      message: `Predefined split ratio "${ratioToDelete.name}" has been deleted.`, // Use original name for message
      operation: 'delete',
      itemId: id, // Send ID of the deleted item
    });
    return deletedPredefinedRatio; // Return the object that was deleted
  }
}