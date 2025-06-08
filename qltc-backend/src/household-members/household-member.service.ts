import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdMemberDto } from './dto/create-household-member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household-member.dto';
import { HouseholdMember, Prisma } from '@generated/prisma';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class HouseholdMemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createHouseholdMemberDto: CreateHouseholdMemberDto,
    userId: string,
  ): Promise<HouseholdMember> {
    const newMember = await this.prisma.householdMember.create({
      data: {
        ...createHouseholdMemberDto,
        userId,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
      message: `Household member "${newMember.name}" has been created.`,
      operation: 'create',
      item: newMember,
    });
    return newMember;
  }

  async findAll(userId: string): Promise<HouseholdMember[]> {
    return this.prisma.householdMember.findMany({
      where: { userId },
      orderBy: { order: 'asc' }, // Optional: default ordering by 'order' then 'name'
    });
  }

  async findOne(id: string, userId: string): Promise<HouseholdMember> {
    const member = await this.prisma.householdMember.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }
    if (member.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this household member.');
    }
    return member;
  }

  async update(
    id: string,
    updateHouseholdMemberDto: UpdateHouseholdMemberDto,
    userId: string,
  ): Promise<HouseholdMember> {
    // First, ensure the member exists and belongs to the user
    const existingMember = await this.findOne(id, userId); // Keep for potential use in message

    const dataToUpdate: Prisma.HouseholdMemberUpdateInput = {};
    if (updateHouseholdMemberDto.name !== undefined) dataToUpdate.name = updateHouseholdMemberDto.name;
    if (updateHouseholdMemberDto.isActive !== undefined) dataToUpdate.isActive = updateHouseholdMemberDto.isActive;
    if (updateHouseholdMemberDto.order !== undefined) dataToUpdate.order = updateHouseholdMemberDto.order;

    const updatedMember = await this.prisma.householdMember.update({
      where: { id },
      data: dataToUpdate,
    });

    this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
      message: `Household member "${updatedMember.name}" has been updated.`,
      operation: 'update',
      item: updatedMember,
    });
    return updatedMember;
  }

  async remove(id: string, userId: string): Promise<HouseholdMember> {
    // First, ensure the member exists and belongs to the user
    const memberToDelete = await this.findOne(id, userId);

    // TODO: Add check if member is used in any defaultSplitRatio or transaction splitRatio before deleting
    // For now, direct delete.
    const deletedMember = await this.prisma.householdMember.delete({
      where: { id },
    });

    this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
      message: `Household member "${memberToDelete.name}" has been deleted.`, // Use original name for message
      operation: 'delete',
      itemId: id,
    });
    return deletedMember;
  }
}
