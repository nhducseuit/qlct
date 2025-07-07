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

  // Fetch only the user's direct families and their parent(s)
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

    // 2. For each direct family, get its parent (if any)
    const parentIds = memberFamilies
      .map(f => f.parentId)
      .filter((id): id is string => !!id);

    // 3. Fetch parent families
    let parentFamilies: any[] = [];
    if (parentIds.length > 0) {
      parentFamilies = await this.prisma.family.findMany({
        where: { id: { in: parentIds } },
      });
    }

    // 4. Combine direct families and their parents, dedupe by id
    const allFamilies = [...memberFamilies, ...parentFamilies];
    const uniqueFamilies = allFamilies.filter((f, idx, arr) => arr.findIndex(ff => ff.id === f.id) === idx);

    // 5. Optionally include memberships if needed by the client
    // If you want to always include memberships:
    const familyIds = uniqueFamilies.map(f => f.id);
    return this.prisma.family.findMany({
      where: { id: { in: familyIds } },
      include: { memberships: true },
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
