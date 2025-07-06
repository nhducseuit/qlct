import { PrismaClient, Family, HouseholdMembership } from '@prisma/client';

interface FamilyMap {
  [key: string]: Family;
}

interface MembershipMap {
  [key: string]: HouseholdMembership;
}

export async function seedPredefinedSplitRatios(
  prisma: PrismaClient,
  families: FamilyMap,
  memberships: MembershipMap,
) {
  console.log('Seeding predefined split ratios...');

  // Ratio for "My family" (Duc & Diep)
  const myFamilyRatio = await prisma.predefinedSplitRatio.upsert({
    where: { id: 'ratio-my-family-50-50' },
    update: {
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: memberships.ducInMyFamily.id, percentage: 50 },
        { memberId: memberships.diepInMyFamily.id, percentage: 50 },
      ],
      familyId: families.myFamily.id,
    },
    create: {
      id: 'ratio-my-family-50-50',
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: memberships.ducInMyFamily.id, percentage: 50 },
        { memberId: memberships.diepInMyFamily.id, percentage: 50 },
      ],
      familyId: families.myFamily.id,
    },
  });

  // Ratio for "Nhà anh chị" (Anh & Thuong)
  const brothersFamilyRatio = await prisma.predefinedSplitRatio.upsert({
    where: { id: 'ratio-brothers-family-50-50' },
    update: {
      name: 'Anh Thường (2vc)',
      splitRatio: [
        { memberId: memberships.anhInBrothersFamily.id, percentage: 50 },
        { memberId: memberships.thuongInBrothersFamily.id, percentage: 50 },
      ],
      familyId: families.brothersFamily.id,
    },
    create: {
      id: 'ratio-brothers-family-50-50',
      name: 'Anh Thường (2vc)',
      splitRatio: [
        { memberId: memberships.anhInBrothersFamily.id, percentage: 50 },
        { memberId: memberships.thuongInBrothersFamily.id, percentage: 50 },
      ],
      familyId: families.brothersFamily.id,
    },
  });

  // Ratio for "Nhà chung" (all 5 members)
  const nhaChungRatio = await prisma.predefinedSplitRatio.upsert({
    where: { id: 'ratio-nha-chung-all-5' },
    update: {
      name: 'Nhà chung (5 người)',
      splitRatio: [
        { memberId: memberships.ducInNhaChung.id, percentage: 20 },
        { memberId: memberships.diepInNhaChung.id, percentage: 20 },
        { memberId: memberships.anhInNhaChung.id, percentage: 20 },
        { memberId: memberships.thuongInNhaChung.id, percentage: 20 },
        { memberId: memberships.thaoInNhaChung.id, percentage: 20 },
      ],
      familyId: families.nhaChung.id,
    },
    create: {
      id: 'ratio-nha-chung-all-5',
      name: 'Nhà chung (5 người)',
      splitRatio: [
        { memberId: memberships.ducInNhaChung.id, percentage: 20 },
        { memberId: memberships.diepInNhaChung.id, percentage: 20 },
        { memberId: memberships.anhInNhaChung.id, percentage: 20 },
        { memberId: memberships.thuongInNhaChung.id, percentage: 20 },
        { memberId: memberships.thaoInNhaChung.id, percentage: 20 },
      ],
      familyId: families.nhaChung.id,
    },
  });

  console.log('Predefined split ratios seeded.');
  return { myFamilyRatio, brothersFamilyRatio, nhaChungRatio };
}
