import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Big Family
  const bigFamily = await prisma.family.upsert({
    where: { id: 'big-family-1' },
    update: {},
    create: {
      id: 'big-family-1',
      name: 'Nhà chung (DEV)',
    },
  });

  // 2. Create Small Families
  const smallFamily1 = await prisma.family.upsert({
    where: { id: 'small-family-1' },
    update: {},
    create: {
      id: 'small-family-1',
      name: 'Nhà Đức Điệp (DEV)',
      parentId: bigFamily.id,
    },
  });
  const smallFamily2 = await prisma.family.upsert({
    where: { id: 'small-family-2' },
    update: {},
    create: {
      id: 'small-family-2',
      name: 'Nhà Anh Thương (DEV)',
      parentId: bigFamily.id,
    },
  });

  // 3. Add 5 members to Big Family
  for (let i = 1; i <= 5; i++) {
    await prisma.householdMember.upsert({
      where: { id: `big-member-${i}` },
      update: {},
      create: {
        id: `big-member-${i}`,
        name: `BigMember${i} (DEV)`,
        familyId: bigFamily.id,
      },
    });
  }

  // 4. Add 2 members to each Small Family (no overlap)
  for (let i = 1; i <= 2; i++) {
    await prisma.householdMember.upsert({
      where: { id: `small1-member-${i}` },
      update: {},
      create: {
        id: `small1-member-${i}`,
        name: `Small1Member${i} (DEV)`,
        familyId: smallFamily1.id,
      },
    });
    await prisma.householdMember.upsert({
      where: { id: `small2-member-${i}` },
      update: {},
      create: {
        id: `small2-member-${i}`,
        name: `Small2Member${i} (DEV)`,
        familyId: smallFamily2.id,
      },
    });
  }

  // Optionally, add test categories, transactions, etc. here for dev

  console.log('DEV: Seeded 1 big family, 2 small families, and all members.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
