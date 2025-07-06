import { PrismaClient, Family, Person } from '@prisma/client';

interface FamilyMap {
  [key: string]: Family;
}

interface PersonMap {
  [key: string]: Person;
}

export async function seedMemberships(
  prisma: PrismaClient,
  families: FamilyMap,
  persons: PersonMap,
) {
  console.log('Seeding memberships...');

  const ducInMyFamily = await prisma.householdMembership.upsert({
    where: { id: 'membership-duc-my-family' },
    update: { personId: persons.duc.id, familyId: families.myFamily.id },
    create: {
      id: 'membership-duc-my-family',
      personId: persons.duc.id,
      familyId: families.myFamily.id,
      isActive: true,
      order: 0,
    },
  });
  const diepInMyFamily = await prisma.householdMembership.upsert({
    where: { id: 'membership-diep-my-family' },
    update: { personId: persons.diep.id, familyId: families.myFamily.id },
    create: {
      id: 'membership-diep-my-family',
      personId: persons.diep.id,
      familyId: families.myFamily.id,
      isActive: true,
      order: 1,
    },
  });

  // "Nhà anh chị" memberships
  const anhInBrothersFamily = await prisma.householdMembership.upsert({
    where: { id: 'membership-anh-brothers-family' },
    update: { personId: persons.anh.id, familyId: families.brothersFamily.id },
    create: {
      id: 'membership-anh-brothers-family',
      personId: persons.anh.id,
      familyId: families.brothersFamily.id,
      isActive: true,
      order: 0,
    },
  });
  const thuongInBrothersFamily = await prisma.householdMembership.upsert({
    where: { id: 'membership-thuong-brothers-family' },
    update: { personId: persons.thuong.id, familyId: families.brothersFamily.id },
    create: {
      id: 'membership-thuong-brothers-family',
      personId: persons.thuong.id,
      familyId: families.brothersFamily.id,
      isActive: true,
      order: 1,
    },
  });

  // "Nhà chung" memberships (all 5 people)
  const ducInNhaChung = await prisma.householdMembership.upsert({
    where: { id: 'membership-duc-nha-chung' },
    update: { personId: persons.duc.id, familyId: families.nhaChung.id },
    create: {
      id: 'membership-duc-nha-chung',
      personId: persons.duc.id,
      familyId: families.nhaChung.id,
      isActive: true,
      order: 0,
    },
  });
  const diepInNhaChung = await prisma.householdMembership.upsert({
    where: { id: 'membership-diep-nha-chung' },
    update: { personId: persons.diep.id, familyId: families.nhaChung.id },
    create: {
      id: 'membership-diep-nha-chung',
      personId: persons.diep.id,
      familyId: families.nhaChung.id,
      isActive: true,
      order: 1,
    },
  });
  const anhInNhaChung = await prisma.householdMembership.upsert({
    where: { id: 'membership-anh-nha-chung' },
    update: { personId: persons.anh.id, familyId: families.nhaChung.id },
    create: {
      id: 'membership-anh-nha-chung',
      personId: persons.anh.id,
      familyId: families.nhaChung.id,
      isActive: true,
      order: 2,
    },
  });
  const thuongInNhaChung = await prisma.householdMembership.upsert({
    where: { id: 'membership-thuong-nha-chung' },
    update: { personId: persons.thuong.id, familyId: families.nhaChung.id },
    create: {
      id: 'membership-thuong-nha-chung',
      personId: persons.thuong.id,
      familyId: families.nhaChung.id,
      isActive: true,
      order: 3,
    },
  });
  const thaoInNhaChung = await prisma.householdMembership.upsert({
    where: { id: 'membership-thao-nha-chung' },
    update: { personId: persons.thao.id, familyId: families.nhaChung.id },
    create: {
      id: 'membership-thao-nha-chung',
      personId: persons.thao.id,
      familyId: families.nhaChung.id,
      isActive: true,
      order: 4,
    },
  });

  console.log('Memberships seeded.');

  return {
    ducInMyFamily,
    diepInMyFamily,
    anhInBrothersFamily,
    thuongInBrothersFamily,
    ducInNhaChung,
    diepInNhaChung,
    anhInNhaChung,
    thuongInNhaChung,
    thaoInNhaChung,
  };
}
