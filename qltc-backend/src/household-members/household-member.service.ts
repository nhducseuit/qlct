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
    userId: string, // For notifications
  ): Promise<HouseholdMembership> {
    const requestedFamilyId = createHouseholdMemberDto.familyId;
    if (!requestedFamilyId) {
      throw new ForbiddenException('No familyId provided for household member creation.');
    }
    // Get all families the user can act on (e.g., their family tree)
    // Validate that the requested familyId is in the user's accessible families
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(requestedFamilyId);
    if (!allowedFamilyIds.includes(requestedFamilyId)) {
      throw new ForbiddenException('You do not have permission to create a member in this family.');
    }
    try {
      const newMember = await this.prisma.householdMembership.create({
        data: {
          ...createHouseholdMemberDto,
          familyId: requestedFamilyId,
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
    // Allow access if the member's familyId is in the user's family tree (self or ancestor)
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(familyId);
    if (!allowedFamilyIds.includes(member.familyId)) {
      throw new ForbiddenException('You do not have permission to view this household member.');
    }

    return member;
  }

  async update(
    id: string,
    updateHouseholdMemberDto: UpdateHouseholdMemberDto,
    userId: string, // For notifications
  ): Promise<HouseholdMembership> {
    // Fetch the current member
    const memberToUpdate = await this.prisma.householdMembership.findUnique({
      where: { id },
      include: { person: true, family: true },
    });
    if (!memberToUpdate) {
      throw new NotFoundException(`Household member with ID "${id}" not found.`);
    }

    // Determine the target familyId (allow moving to another family)
    const targetFamilyId = updateHouseholdMemberDto.familyId || memberToUpdate.familyId;
    if (!targetFamilyId) {
      throw new ForbiddenException('No familyId provided for household member update.');
    }

    // Validate that the user can act on the target family
    const allowedFamilyIds = await this.familyService.getFamilyTreeIds(targetFamilyId);
    if (!allowedFamilyIds.includes(targetFamilyId)) {
      // Audit log: unauthorized attempt
      console.warn(`[AUDIT] User ${userId} tried to update member ${id} to inaccessible familyId ${targetFamilyId}`);
      throw new ForbiddenException('You do not have permission to move this member to the target family.');
    }

    // Prevent moving to a family where this person is already a member
    if (targetFamilyId !== memberToUpdate.familyId) {
      const exists = await this.prisma.householdMembership.findFirst({
        where: { personId: memberToUpdate.personId, familyId: targetFamilyId },
      });
      if (exists) {
        throw new ForbiddenException('This person is already a member of the target family.');
      }
    }

    const dataToUpdate: Prisma.HouseholdMembershipUpdateInput = {};
    if (updateHouseholdMemberDto.isActive !== undefined) dataToUpdate.isActive = updateHouseholdMemberDto.isActive;
    if (updateHouseholdMemberDto.order !== undefined) dataToUpdate.order = updateHouseholdMemberDto.order;
    if (updateHouseholdMemberDto.personId !== undefined) dataToUpdate.person = { connect: { id: updateHouseholdMemberDto.personId } };
    if (targetFamilyId !== memberToUpdate.familyId) dataToUpdate.family = { connect: { id: targetFamilyId } };

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
