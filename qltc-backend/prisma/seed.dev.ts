import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Families (baseline from backfill, aligned with production seed)
  await prisma.family.upsert({
    where: { id: 'big-family-1' },
    update: { name: 'Nhà chung' },
    create: { id: 'big-family-1', name: 'Nhà chung' },
  });
  await prisma.family.upsert({
    where: { id: 'small-family-1' },
    update: { name: '2vc', parentId: 'big-family-1' },
    create: { id: 'small-family-1', name: '2vc', parentId: 'big-family-1' },
  });

  // Users (baseline from backfill)
  await prisma.user.upsert({
    where: { id: 'd848cfca-b85c-41cb-b9c7-d8321ff7346f' },
    update: {
      familyId: 'small-family-1',
    },
    create: {
      id: 'd848cfca-b85c-41cb-b9c7-d8321ff7346f',
      email: 'dev-user@example.com',
      password: 'hashedpassword', // Replace with a real hash if needed
      familyId: 'small-family-1',
    },
  });

  // Persons (baseline from backfill)
  // Small family (2vc)
  await prisma.person.upsert({
    where: { id: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57' },
    update: { name: 'Dev User' },
    create: {
      id: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      name: 'Dev User',
    },
  });
  await prisma.person.upsert({
    where: { id: '8b89ccb7-cc3e-40b5-9fba-3f680772c2c4' },
    update: { name: 'Member 2' },
    create: {
      id: '8b89ccb7-cc3e-40b5-9fba-3f680772c2c4',
      name: 'Member 2',
    },
  });
  // Big family (4 people)
  await prisma.person.upsert({
    where: { id: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5' },
    update: { name: 'Person A' },
    create: {
      id: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5',
      name: 'Person A',
    },
  });
  await prisma.person.upsert({
    where: { id: '910b287d-d365-4daa-83d5-11c096b07068' },
    update: { name: 'Person B' },
    create: {
      id: '910b287d-d365-4daa-83d5-11c096b07068',
      name: 'Person B',
    },
  });
  await prisma.person.upsert({
    where: { id: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44' },
    update: { name: 'Person C' },
    create: {
      id: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44',
      name: 'Person C',
    },
  });
  await prisma.person.upsert({
    where: { id: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6' },
    update: { name: 'Person D' },
    create: {
      id: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6',
      name: 'Person D',
    },
  });

  // Memberships (baseline from backfill, IDs and data preserved)
  // Small family memberships (2vc)
  await prisma.householdMembership.upsert({
    where: { id: '6e90d131-e1cc-4355-9030-505ee6ca7e96' },
    update: {
      personId: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      familyId: 'small-family-1',
      isActive: true,
      order: 0,
    },
    create: {
      id: '6e90d131-e1cc-4355-9030-505ee6ca7e96',
      personId: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      familyId: 'small-family-1',
      isActive: true,
      order: 0,
    },
  });
  await prisma.householdMembership.upsert({
    where: { id: '061731f1-7857-4055-aa8d-f0f4bdc1fff1' },
    update: {
      personId: '8b89ccb7-cc3e-40b5-9fba-3f680772c2c4',
      familyId: 'small-family-1',
      isActive: true,
      order: 1,
    },
    create: {
      id: '061731f1-7857-4055-aa8d-f0f4bdc1fff1',
      personId: '8b89ccb7-cc3e-40b5-9fba-3f680772c2c4',
      familyId: 'small-family-1',
      isActive: true,
      order: 1,
    },
  });
  // Big family memberships (4 people)
  await prisma.householdMembership.upsert({
    where: { id: 'b1a1b1c1-d1e1-41f1-81a1-111111111111' },
    update: {
      personId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5',
      familyId: 'big-family-1',
      isActive: true,
      order: 0,
    },
    create: {
      id: 'b1a1b1c1-d1e1-41f1-81a1-111111111111',
      personId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5',
      familyId: 'big-family-1',
      isActive: true,
      order: 0,
    },
  });
  await prisma.householdMembership.upsert({
    where: { id: 'b2a2b2c2-d2e2-42f2-82a2-222222222222' },
    update: {
      personId: '910b287d-d365-4daa-83d5-11c096b07068',
      familyId: 'big-family-1',
      isActive: true,
      order: 1,
    },
    create: {
      id: 'b2a2b2c2-d2e2-42f2-82a2-222222222222',
      personId: '910b287d-d365-4daa-83d5-11c096b07068',
      familyId: 'big-family-1',
      isActive: true,
      order: 1,
    },
  });
  await prisma.householdMembership.upsert({
    where: { id: 'b3a3b3c3-d3e3-43f3-83a3-333333333333' },
    update: {
      personId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44',
      familyId: 'big-family-1',
      isActive: true,
      order: 2,
    },
    create: {
      id: 'b3a3b3c3-d3e3-43f3-83a3-333333333333',
      personId: '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44',
      familyId: 'big-family-1',
      isActive: true,
      order: 2,
    },
  });
  await prisma.householdMembership.upsert({
    where: { id: 'b4a4b4c4-d4e4-44f4-84a4-444444444444' },
    update: {
      personId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6',
      familyId: 'big-family-1',
      isActive: true,
      order: 3,
    },
    create: {
      id: 'b4a4b4c4-d4e4-44f4-84a4-444444444444',
      personId: '94e6e8bf-3a8a-4234-a07c-28c54c1a06e6',
      familyId: 'big-family-1',
      isActive: true,
      order: 3,
    },
  });
  // All other members to big-family-1 (example, add more as needed)
  // await prisma.householdMember.upsert({ ... });

  // Categories (baseline from production dump)
  const baselineCategories = [
    { id: '76528a8a-a82a-4ef0-87aa-256ac621b43b', name: 'Ăn uống', familyId: 'big-family-1', defaultSplitRatio: { id: '2a1b71b6-7f26-4bfa-b7b2-9fecccee9030' } },
    { id: '5ae9865d-4041-4612-a757-8730161071c7', name: 'Đi lại', familyId: 'small-family-1', defaultSplitRatio: { id: 'b3396d63-7620-40fa-999a-5a6323069d24' } },
    { id: '87ae0b88-d46d-42fe-965c-6813268e44d1', name: 'Mua sắm', familyId: 'small-family-1' },
    { id: '182fe1c6-5b87-4468-93ba-159e01146b3d', name: 'Giải trí', familyId: 'small-family-1' },
    { id: '270c1489-c0a3-457d-b778-59e222880073', name: 'Học tập', familyId: 'small-family-1', defaultSplitRatio: { id: 'b3396d63-7620-40fa-999a-5a6323069d24' } },
    { id: '5d271e51-1c6b-4919-b76e-d7a59e719b22', name: 'Sức khỏe', familyId: 'small-family-1' },
    { id: 'f35b2279-c7d3-4ff6-b867-b79955b5227e', name: 'Nhà cửa', familyId: 'big-family-1', defaultSplitRatio: { id: '2a1b71b6-7f26-4bfa-b7b2-9fecccee9030' } },
    { id: '714920cc-22c9-4e14-a8cd-88d488ffeb58', name: 'Khác', familyId: 'small-family-1' },
  ];
  for (const cat of baselineCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        familyId: cat.familyId,
        ...(cat.defaultSplitRatio ? { defaultSplitRatio: cat.defaultSplitRatio } : {}),
      },
      create: {
        id: cat.id,
        name: cat.name,
        familyId: cat.familyId,
        ...(cat.defaultSplitRatio ? { defaultSplitRatio: cat.defaultSplitRatio } : {}),
      },
    });
  }
  // All other categories to big-family-1 (add as needed)

  // PredefinedSplitRatio (baseline from backfill, aligned with production seed)
  await prisma.predefinedSplitRatio.upsert({
    where: { id: 'b3396d63-7620-40fa-999a-5a6323069d24' },
    update: {
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: 'small-family-1',
    },
    create: {
      id: 'b3396d63-7620-40fa-999a-5a6323069d24',
      name: 'Đức Điệp (2vc)',
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: 'small-family-1',
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
      familyId: 'small-family-1',
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
      familyId: 'small-family-1',
    },
  });
  // All other ratios to big-family-1 (add as needed)

  // Transactions (baseline from backfill, 10 diverse cases)
  const transactions = [
    // 5 in July 2025
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      amount: 500000,
      date: new Date('2025-07-01T12:00:00Z'),
      note: 'Ăn uống cuối tuần',
      type: 'expense',
      payer: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      isShared: true,
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: 'small-family-1',
      categoryId: '76528a8a-a82a-4ef0-87aa-256ac621b43b',
    },
    {
      id: 'b2c3d4e5-f6a7-8901-bcda-ef2345678901',
      amount: 200000,
      date: new Date('2025-07-02T09:00:00Z'),
      note: 'Mua sắm cá nhân',
      type: 'expense',
      payer: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      isShared: false,
      splitRatio: [],
      familyId: 'small-family-1',
      categoryId: '87ae0b88-d46d-42fe-965c-6813268e44d1',
    },
    {
      id: 'c3d4e5f6-a789-0123-cdab-ef3456789012',
      amount: 300000,
      date: new Date('2025-07-03T18:00:00Z'),
      note: 'Đi lại cho thành viên 2',
      type: 'expense',
      payer: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      isShared: true,
      splitRatio: [
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 100 },
      ],
      familyId: 'small-family-1',
      categoryId: '5ae9865d-4041-4612-a757-8730161071c7',
    },
    {
      id: 'd4e5f6a7-8901-2345-dabc-ef4567890123',
      amount: 150000,
      date: new Date('2025-07-04T08:30:00Z'),
      note: 'Giải trí cá nhân',
      type: 'expense',
      payer: '910b287d-d365-4daa-83d5-11c096b07068',
      isShared: false,
      splitRatio: [],
      familyId: 'small-family-1',
      categoryId: '182fe1c6-5b87-4468-93ba-159e01146b3d',
    },
    {
      id: 'e5f6a789-0123-4567-abcd-ef5678901234',
      amount: 400000,
      date: new Date('2025-07-05T14:00:00Z'),
      note: 'Học tập (70/30)',
      type: 'expense',
      payer: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      isShared: true,
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 70 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 30 },
      ],
      familyId: 'small-family-1',
      categoryId: '270c1489-c0a3-457d-b778-59e222880073',
    },
    // 5 in June 2025
    {
      id: 'f6a78901-2345-6789-bcda-ef6789012345',
      amount: 600000,
      date: new Date('2025-06-06T19:00:00Z'),
      note: 'Sức khỏe chung',
      type: 'expense',
      payer: '910b287d-d365-4daa-83d5-11c096b07068',
      isShared: true,
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: 'small-family-1',
      categoryId: '5d271e51-1c6b-4919-b76e-d7a59e719b22',
    },
    {
      id: 'a7890123-4567-89ab-cdef-678901234567',
      amount: 120000,
      date: new Date('2025-06-07T10:00:00Z'),
      note: 'Nhà cửa cá nhân',
      type: 'expense',
      payer: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      isShared: false,
      splitRatio: [],
      familyId: 'small-family-1',
      categoryId: 'f35b2279-c7d3-4ff6-b867-b79955b5227e',
    },
    {
      id: 'b8901234-5678-9abc-def0-789012345678',
      amount: 250000,
      date: new Date('2025-06-08T15:00:00Z'),
      note: 'Khác (100% Dev User)',
      type: 'expense',
      payer: '910b287d-d365-4daa-83d5-11c096b07068',
      isShared: true,
      splitRatio: [
        { memberId: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57', percentage: 100 },
      ],
      familyId: 'small-family-1',
      categoryId: '714920cc-22c9-4e14-a8cd-88d488ffeb58',
    },
    {
      id: 'c9012345-6789-abcd-ef01-890123456789',
      amount: 800000,
      date: new Date('2025-06-09T20:00:00Z'),
      note: 'Ăn uống giữa tuần',
      type: 'expense',
      payer: 'dbb1ac1e-246e-4288-be7e-8eaf4a966f57',
      isShared: true,
      splitRatio: [
        { memberId: '577ee6f9-283e-46c7-bbb3-9910bc70e2d5', percentage: 50 },
        { memberId: '910b287d-d365-4daa-83d5-11c096b07068', percentage: 50 },
      ],
      familyId: 'small-family-1',
      categoryId: '76528a8a-a82a-4ef0-87aa-256ac621b43b',
    },
    {
      id: 'd0123456-789a-bcde-f012-90123456789a',
      amount: 180000,
      date: new Date('2025-06-10T11:00:00Z'),
      note: 'Đi lại cá nhân',
      type: 'expense',
      payer: '910b287d-d365-4daa-83d5-11c096b07068',
      isShared: false,
      splitRatio: [],
      familyId: 'small-family-1',
      categoryId: '5ae9865d-4041-4612-a757-8730161071c7',
    },
  ];
  for (const tx of transactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: tx,
      create: tx,
    });
  }

  console.log('Dev seed baseline (matching backfill) complete.');
}

main()
  .catch((e) => {
    console.error('Error during dev seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
