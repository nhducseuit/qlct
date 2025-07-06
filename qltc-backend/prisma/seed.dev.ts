import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Step 1: Define Family Structure
  const bigFamily = await prisma.family.upsert({
    where: { id: 'big-family-1' },
    update: { name: 'Nhà chung' },
    create: { id: 'big-family-1', name: 'Nhà chung' },
  });

  const ducDiepFamily = await prisma.family.upsert({
    where: { id: 'small-family-1' },
    update: { name: 'Nhà Đức Điệp', parentId: bigFamily.id },
    create: {
      id: 'small-family-1',
      name: 'Nhà Đức Điệp',
      parentId: bigFamily.id,
    },
  });

  const anhThuongFamily = await prisma.family.upsert({
    where: { id: 'small-family-2' },
    update: { name: 'Nhà Anh Thương', parentId: bigFamily.id },
    create: {
      id: 'small-family-2',
      name: 'Nhà Anh Thương',
      parentId: bigFamily.id,
    },
  });

  // Step 2: Define Persons
  const duc = await prisma.person.upsert({
    where: { id: 'person-duc' },
    update: { name: 'Duc' },
    create: { id: 'person-duc', name: 'Duc' },
  });
  const diep = await prisma.person.upsert({
    where: { id: 'person-diep' },
    update: { name: 'Diep' },
    create: { id: 'person-diep', name: 'Diep' },
  });
  const anh = await prisma.person.upsert({
    where: { id: 'person-anh' },
    update: { name: 'Anh' },
    create: { id: 'person-anh', name: 'Anh' },
  });
  const thuong = await prisma.person.upsert({
    where: { id: 'person-thuong' },
    update: { name: 'Thuong' },
    create: { id: 'person-thuong', name: 'Thuong' },
  });
  const thao = await prisma.person.upsert({
    where: { id: 'person-thao' },
    update: { name: 'Thao' },
    create: { id: 'person-thao', name: 'Thao' },
  });

  // Step 3: Create Household Memberships
  // Everyone is in the big family
  const ducBigMember = await prisma.householdMembership.upsert({
    where: { id: 'member-duc-big' },
    update: {},
    create: { id: 'member-duc-big', personId: duc.id, familyId: bigFamily.id },
  });
  const diepBigMember = await prisma.householdMembership.upsert({
    where: { id: 'member-diep-big' },
    update: {},
    create: { id: 'member-diep-big', personId: diep.id, familyId: bigFamily.id },
  });
  const anhBigMember = await prisma.householdMembership.upsert({
    where: { id: 'member-anh-big' },
    update: {},
    create: { id: 'member-anh-big', personId: anh.id, familyId: bigFamily.id },
  });
  const thuongBigMember = await prisma.householdMembership.upsert({
    where: { id: 'member-thuong-big' },
    update: {},
    create: { id: 'member-thuong-big', personId: thuong.id, familyId: bigFamily.id },
  });
  const thaoBigMember = await prisma.householdMembership.upsert({
    where: { id: 'member-thao-big' },
    update: {},
    create: { id: 'member-thao-big', personId: thao.id, familyId: bigFamily.id },
  });

  // Nested family memberships
  const ducSmallMember = await prisma.householdMembership.upsert({
    where: { id: 'member-duc-small' },
    update: {},
    create: { id: 'member-duc-small', personId: duc.id, familyId: ducDiepFamily.id },
  });
  const diepSmallMember = await prisma.householdMembership.upsert({
    where: { id: 'member-diep-small' },
    update: {},
    create: { id: 'member-diep-small', personId: diep.id, familyId: ducDiepFamily.id },
  });
  const anhSmallMember = await prisma.householdMembership.upsert({
    where: { id: 'member-anh-small' },
    update: {},
    create: { id: 'member-anh-small', personId: anh.id, familyId: anhThuongFamily.id },
  });
  const thuongSmallMember = await prisma.householdMembership.upsert({
    where: { id: 'member-thuong-small' },
    update: {},
    create: { id: 'member-thuong-small', personId: thuong.id, familyId: anhThuongFamily.id },
  });

  // Step 4: Create Categories
  const catAnUong = await prisma.category.upsert({
    where: { id: 'cat-an-uong' },
    update: {},
    create: { id: 'cat-an-uong', name: 'Ăn uống', familyId: bigFamily.id },
  });
  const catNhaCua = await prisma.category.upsert({
    where: { id: 'cat-nha-cua' },
    update: {},
    create: { id: 'cat-nha-cua', name: 'Nhà cửa', familyId: bigFamily.id },
  });
  const catDuLich = await prisma.category.upsert({
    where: { id: 'cat-du-lich' },
    update: {},
    create: { id: 'cat-du-lich', name: 'Du lịch', familyId: anhThuongFamily.id },
  });
  const catMuaSam = await prisma.category.upsert({
    where: { id: 'cat-mua-sam' },
    update: {},
    create: { id: 'cat-mua-sam', name: 'Mua sắm', familyId: ducDiepFamily.id },
  });
  const catCaNhan = await prisma.category.upsert({
    where: { id: 'cat-ca-nhan' },
    update: {},
    create: { id: 'cat-ca-nhan', name: 'Cá nhân', familyId: bigFamily.id },
  });


  // Step 5: Create Transactions
  const transactions = [
    // Case 1: Shared expense in "Nhà chung" (Duc pays for food for everyone)
    {
      id: 'txn-1',
      amount: 1000000,
      date: new Date('2025-07-01T12:00:00Z'),
      note: 'Tiệc nhà chung',
      type: 'expense',
      payer: ducBigMember.id,
      isShared: true,
      splitRatio: [
        { memberId: ducBigMember.id, percentage: 20 },
        { memberId: diepBigMember.id, percentage: 20 },
        { memberId: anhBigMember.id, percentage: 20 },
        { memberId: thuongBigMember.id, percentage: 20 },
        { memberId: thaoBigMember.id, percentage: 20 },
      ],
      familyId: bigFamily.id,
      categoryId: catAnUong.id,
    },
    // Case 2: Expense for a nested family (Diep pays for shopping for her family)
    {
      id: 'txn-2',
      amount: 500000,
      date: new Date('2025-07-02T09:00:00Z'),
      note: 'Mua sắm cho nhà Đức Điệp',
      type: 'expense',
      payer: diepSmallMember.id,
      isShared: true,
      splitRatio: [
        { memberId: ducSmallMember.id, percentage: 50 },
        { memberId: diepSmallMember.id, percentage: 50 },
      ],
      familyId: ducDiepFamily.id,
      categoryId: catMuaSam.id,
    },
    // Case 3: Personal expense (Thao buys something for herself)
    {
      id: 'txn-3',
      amount: 250000,
      date: new Date('2025-07-03T18:00:00Z'),
      note: 'Mua đồ cá nhân',
      type: 'expense',
      payer: thaoBigMember.id,
      isShared: false,
      splitRatio: [],
      familyId: bigFamily.id, // Personal expenses can still be logged under a family context
      categoryId: catCaNhan.id,
    },
    // Case 4: Paying for someone else (Anh pays for a trip for Thao)
    {
      id: 'txn-4',
      amount: 700000,
      date: new Date('2025-07-04T08:30:00Z'),
      note: 'Anh trả tiền du lịch cho Thảo',
      type: 'expense',
      payer: anhBigMember.id,
      isShared: true,
      splitRatio: [
        { memberId: thaoBigMember.id, percentage: 100 },
      ],
      familyId: bigFamily.id,
      categoryId: catDuLich.id, // Note: Category is from Anh's family, but tx is in big family
    },
     // Case 5: Shared expense in nested family (Anh pays for travel for his family)
    {
      id: 'txn-5',
      amount: 1500000,
      date: new Date('2025-06-20T10:00:00Z'),
      note: 'Du lịch hè nhà Anh Thương',
      type: 'expense',
      payer: anhSmallMember.id,
      isShared: true,
      splitRatio: [
        { memberId: anhSmallMember.id, percentage: 50 },
        { memberId: thuongSmallMember.id, percentage: 50 },
      ],
      familyId: anhThuongFamily.id,
      categoryId: catDuLich.id,
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: tx,
      create: tx,
    });
  }

  console.log('DEV SEED: Successfully seeded data based on user feedback.');
  console.log('- 3 families (1 parent, 2 nested)');
  console.log('- 5 members with correct family relations');
  console.log('- Diverse categories and transactions');
}

main()
  .catch((e) => {
    console.error('Error during dev seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
