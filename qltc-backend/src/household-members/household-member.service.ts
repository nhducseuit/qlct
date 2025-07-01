import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdMemberDto } from './dto/create-household-member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household-member.dto';
import { HouseholdMember, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class HouseholdMemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createHouseholdMemberDto: CreateHouseholdMemberDto,
    familyId: string,
    userId: string, // For notifications
  ): Promise<HouseholdMember> {
    const newMember = await this.prisma.householdMember.create({
      data: {
        ...createHouseholdMemberDto,
        familyId,
      },
    });

    this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
      message: `Household member "${newMember.name}" has been created.`,
      operation: 'create',
      item: newMember,
    });
    return newMember;
  }

  async findAll(familyId: string): Promise<HouseholdMember[]> {
    return this.prisma.householdMember.findMany({
      where: { familyId },
      orderBy: { order: 'asc' }, // Optional: default ordering by 'order' then 'name'
    });
  }

  async findOne(id: string, familyId: string): Promise<HouseholdMember> {
    const member = await this.prisma.householdMember.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }
    if (member.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to view this household member.');
    }

    return member;
  }

  async update(
    id: string,
    updateHouseholdMemberDto: UpdateHouseholdMemberDto,
    familyId: string,
    userId: string, // For notifications
  ): Promise<HouseholdMember> {
    // For write operations, we must check for ownership directly.
    const memberToUpdate = await this.prisma.householdMember.findUnique({
      where: { id },
    });
    if (!memberToUpdate) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }
    if (memberToUpdate.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to update this household member.');
    }

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

  async remove(id: string, familyId: string, userId: string): Promise<HouseholdMember> {
    // For write operations, we must check for ownership directly.
    const memberToDelete = await this.prisma.householdMember.findUnique({
      where: { id },
    });
    if (!memberToDelete) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }
    if (memberToDelete.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to delete this household member.');
    }

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
