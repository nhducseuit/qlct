import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdMemberDto } from './dto/create-household-member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household-member.dto';
import { HouseholdMembership, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FamilyService } from '../families/family.service';

@Injectable()
export class HouseholdMemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly familyService: FamilyService,
  ) {}

  async create(
    createHouseholdMemberDto: CreateHouseholdMemberDto,
    familyId: string,
    userId: string, // For notifications
  ): Promise<HouseholdMembership> {
    try {
      const newMember = await this.prisma.householdMembership.create({
        data: {
          ...createHouseholdMemberDto,
          familyId,
        },
        include: { person: true },
      });

      this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
        message: `Household member "${newMember.person.name}" has been created.`,
        operation: 'create',
        item: newMember,
      });
      return newMember;
    } catch (error: any) {
      // Prisma unique constraint violation (duplicate personId+familyId)
      if (error.code === 'P2002' && error.meta?.target?.includes('personId') && error.meta?.target?.includes('familyId')) {
        // Use BadRequestException for user-friendly error
        const { BadRequestException } = await import('@nestjs/common');
        throw new BadRequestException('Người này đã là thành viên của gia đình này.');
      }
      throw error;
    }
  }

  async findAll(familyId: string): Promise<HouseholdMembership[]> {
    const familyTreeIds = await this.familyService.getFamilyTreeIds(familyId);
    return this.prisma.householdMembership.findMany({
      where: { familyId: { in: familyTreeIds } },
      orderBy: { order: 'asc' },
      include: { person: true },
    });
  }

  async findOne(id: string, familyId: string): Promise<HouseholdMembership> {
    const member = await this.prisma.householdMembership.findUnique({
      where: { id },
      include: { person: true },
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
  ): Promise<HouseholdMembership> {

    // For write operations, allow if the user's familyId is in the same family tree as the member's familyId
    const memberToUpdate = await this.prisma.householdMembership.findUnique({
      where: { id },
      include: { person: true, family: true },
    });
    if (!memberToUpdate) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }
    // Get all ancestor familyIds for the user's current family context
    const userFamilyTreeIds = await this.familyService.getFamilyTreeIds(familyId);
    // Allow update if the member's familyId is in the user's family tree (same big family or subfamily)
    if (!userFamilyTreeIds.includes(memberToUpdate.familyId)) {
      throw new ForbiddenException('You do not have permission to update this household member.');
    }

    const dataToUpdate: Prisma.HouseholdMembershipUpdateInput = {};
    if (updateHouseholdMemberDto.isActive !== undefined) dataToUpdate.isActive = updateHouseholdMemberDto.isActive;
    if (updateHouseholdMemberDto.order !== undefined) dataToUpdate.order = updateHouseholdMemberDto.order;
    if (updateHouseholdMemberDto.personId !== undefined) dataToUpdate.person = { connect: { id: updateHouseholdMemberDto.personId } };

    const updatedMember = await this.prisma.householdMembership.update({
      where: { id },
      data: dataToUpdate,
      include: { person: true },
    });

    this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
      message: `Household member "${updatedMember.person.name}" has been updated.`,
      operation: 'update',
      item: updatedMember,
    });
    return updatedMember;
  }

  async remove(id: string, familyId: string, userId: string): Promise<HouseholdMembership> {
    // For write operations, we must check for ownership directly.
    const memberToDelete = await this.prisma.householdMembership.findUnique({
      where: { id },
      include: { person: true },
    });
    if (!memberToDelete) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }
    if (memberToDelete.familyId !== familyId) {
      throw new ForbiddenException('You do not have permission to delete this household member.');
    }

    // TODO: Add check if member is used in any defaultSplitRatio or transaction splitRatio before deleting
    // For now, direct delete.
    const deletedMember = await this.prisma.householdMembership.delete({
      where: { id },
      include: { person: true },
    });

    this.notificationsGateway.sendToUser(userId, 'household_members_updated', {
      message: `Household member "${memberToDelete.person.name}" has been deleted.`, // Use original name for message
      operation: 'delete',
      itemId: id,
    });
    return deletedMember;
  }

  /**
   * Returns all household memberships for the current person, grouped by family (hierarchical).
   * Each family includes its members (with person details).
   */
  async getMyMembersGroupedByFamily(personId: string) {
    // Find all memberships for this person
    const memberships = await this.prisma.householdMembership.findMany({
      where: { personId },
      include: { person: true, family: true },
    });

    // Get all unique familyIds
    const familyIds = [...new Set(memberships.map(m => m.familyId))];
    if (familyIds.length === 0) return [];

    // Fetch all families (with parentId for hierarchy)
    const families = await this.prisma.family.findMany({
      where: { id: { in: familyIds } },
      include: { memberships: { include: { person: true } } },
    });

    // Map to hierarchical structure (flat for now, can be nested if needed)
    return families.map(fam => ({
      id: fam.id,
      name: fam.name,
      parentId: fam.parentId,
      members: fam.memberships,
    }));
  }

  /**
   * Returns all household memberships for the current user (by email), grouped by family (hierarchical).
   * Each family includes its members (with person details).
   */
  async getMyMembersGroupedByFamilyByEmail(email: string) {
    // Find the personId for this email
    const person = await this.prisma.person.findUnique({ where: { email } });
    if (!person) return [];
    return this.getMyMembersGroupedByFamily(person.id);
  }
}
