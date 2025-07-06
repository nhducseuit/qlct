import { Injectable } from '@nestjs/common';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  private async getAllDescendantIds(familyIds: string[]): Promise<string[]> {
    if (familyIds.length === 0) {
      return [];
    }

    const directChildren = await this.prisma.family.findMany({
      where: {
        parentId: {
          in: familyIds,
        },
      },
      select: { id: true },
    });

    const childIds = directChildren.map(child => child.id);

    if (childIds.length === 0) {
      return [];
    }

    const nestedDescendants = await this.getAllDescendantIds(childIds);
    return [...childIds, ...nestedDescendants];
  }

  private async getAllAncestorIds(familyIds: string[]): Promise<string[]> {
    if (familyIds.length === 0) {
      return [];
    }

    const families = await this.prisma.family.findMany({
      where: { id: { in: familyIds } },
      select: { parentId: true },
    });

    const parentIds = families.map(f => f.parentId).filter((id): id is string => id !== null);

    if (parentIds.length === 0) {
      return [];
    }

    const nestedAncestors = await this.getAllAncestorIds(parentIds);
    return [...parentIds, ...nestedAncestors];
  }

  // Fetch all families for a user (via memberships) and all their descendants/ancestors
  async findAllForUser(personId: string) {
    // 1. Find all families the person is directly a member of.
    const memberFamilies = await this.prisma.family.findMany({
      where: {
        memberships: {
          some: {
            personId: personId,
          },
        },
      },
    });

    if (memberFamilies.length === 0) {
      return [];
    }

    const memberFamilyIds = memberFamilies.map(f => f.id);

    // 2. Find all descendants and ancestors of those families.
    const descendantIds = await this.getAllDescendantIds(memberFamilyIds);
    const ancestorIds = await this.getAllAncestorIds(memberFamilyIds);

    // 3. Combine and get unique IDs.
    const allFamilyIds = [...new Set([...memberFamilyIds, ...descendantIds, ...ancestorIds])];

    // 4. Fetch all family data for the final list of IDs.
    return this.prisma.family.findMany({
      where: {
        id: {
          in: allFamilyIds,
        },
      },
      include: {
        memberships: true, // Include memberships if needed by the client
      },
    });
  }

  // Create a new family and assign the first membership (personId must be provided)
  async create(createFamilyDto: CreateFamilyDto, personId: string) {
    // Create the family and membership
    return this.prisma.family.create({
      data: {
        name: createFamilyDto.name,
        memberships: {
          create: {
            personId: personId,
            // role: 'ADMIN', // Uncomment if you add roles
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  }

  // Fetch a single family by id, only if person is a member
  async findOne(id: string, personId: string) {
    return this.prisma.family.findFirst({
      where: {
        id: id,
        memberships: {
          some: {
            personId: personId,
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  }

  // Update a family (only if person is a member)
  async update(id: string, updateFamilyDto: UpdateFamilyDto, personId: string) {
    const family = await this.findOne(id, personId);
    if (!family) throw new Error('Family not found or access denied');
    return this.prisma.family.update({
      where: { id: id },
      data: updateFamilyDto,
    });
  }

  // Remove a family (only if person is a member)
  async remove(id: string, personId: string) {
    const family = await this.findOne(id, personId);
    if (!family) throw new Error('Family not found or access denied');
    return this.prisma.family.delete({ where: { id: id } });
  }

  async getFamilyTreeIds(familyId: string): Promise<string[]> {
    const familyIds: string[] = [];
    let currentFamilyId: string | null = familyId;

    while (currentFamilyId) {
      familyIds.push(currentFamilyId);
      const family: { parentId: string | null } | null = await this.prisma.family.findUnique({
        where: { id: currentFamilyId },
        select: { parentId: true },
      });
      currentFamilyId = family?.parentId ?? null;
    }

    return familyIds;
  }
}
