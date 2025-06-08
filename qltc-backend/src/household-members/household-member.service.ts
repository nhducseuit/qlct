import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdMemberDto } from './dto/create-household-member.dto';
import { UpdateHouseholdMemberDto } from './dto/update-household-member.dto';
import { HouseholdMember, Prisma } from '@generated/prisma';

@Injectable()
export class HouseholdMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createHouseholdMemberDto: CreateHouseholdMemberDto,
    userId: string,
  ): Promise<HouseholdMember> {
    return this.prisma.householdMember.create({
      data: {
        ...createHouseholdMemberDto,
        userId,
      },
    });
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
    await this.findOne(id, userId);

    const dataToUpdate: Prisma.HouseholdMemberUpdateInput = {};
    if (updateHouseholdMemberDto.name !== undefined) dataToUpdate.name = updateHouseholdMemberDto.name;
    if (updateHouseholdMemberDto.isActive !== undefined) dataToUpdate.isActive = updateHouseholdMemberDto.isActive;
    if (updateHouseholdMemberDto.order !== undefined) dataToUpdate.order = updateHouseholdMemberDto.order;

    return this.prisma.householdMember.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string, userId: string): Promise<HouseholdMember> {
    // First, ensure the member exists and belongs to the user
    await this.findOne(id, userId);

    // TODO: Add check if member is used in any defaultSplitRatio or transaction splitRatio before deleting
    // For now, direct delete.
    return this.prisma.householdMember.delete({
      where: { id },
    });
  }
}