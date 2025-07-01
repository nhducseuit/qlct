import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Families (minimal, production-safe, aligned with dev seed)
  const bigFamily = await prisma.family.upsert({
    where: { id: 'big-family-1' },
    update: { name: 'Nhà chung' },
    create: { id: 'big-family-1', name: 'Nhà chung' },
  });
  const smallFamily = await prisma.family.upsert({
    where: { id: 'small-family-1' },
    update: { name: '2vc', parentId: bigFamily.id },
    create: { id: 'small-family-1', name: '2vc', parentId: bigFamily.id },
  });

  // Predefined Split Ratios only (no users, members, categories, or transactions, aligned with dev seed)
  await prisma.predefinedSplitRatio.upsert({
    where: { id: 'b3396d63-7620-40fa-999a-5a6323069d24' },
    update: {
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: smallFamily.id,
    },
    create: {
      id: 'b3396d63-7620-40fa-999a-5a6323069d24',
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: smallFamily.id,
    },
  });
  await prisma.predefinedSplitRatio.upsert({
    where: { id: '2a1b71b6-7f26-4bfa-b7b2-9fecccee9030' },
    update: {
      name: 'Nhà chung (4 người)',
      splitRatio: [
        { memberId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44', percentage: 25 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 25 },
        { memberId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', percentage: 25 },
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 25 },
      ],
      familyId: smallFamily.id,
    },
    create: {
      id: '2a1b71b6-7f26-4bfa-b7b2-9fecccee9030',
      name: 'Nhà chung (4 người)',
      splitRatio: [
        { memberId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44', percentage: 25 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 25 },
        { memberId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', percentage: 25 },
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 25 },
      ],
      familyId: smallFamily.id,
    },
  });

  console.log('Production seeding complete (families and predefined split ratios only).');
}

main()
  .catch((e) => {
    console.error('Error during production seeding:', e);
    // If you see 'Cannot find name process', run: npm i --save-dev @types/node
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
