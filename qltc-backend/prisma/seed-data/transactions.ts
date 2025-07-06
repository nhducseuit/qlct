import {
  PrismaClient,
  Category,
  HouseholdMembership,
} from '@prisma/client';

interface CategoryMap {
  [key: string]: Category;
}
interface HouseholdMembershipMap {
  [key: string]: HouseholdMembership;
}

export async function seedTransactions(
  prisma: PrismaClient,
  memberships: HouseholdMembershipMap,
  categories: CategoryMap,
) {
  // Defensive: check all required memberships exist before proceeding
  const requiredMembershipKeys = [
    'ducInMyFamily',
    'diepInMyFamily',
    'anhInBrothersFamily',
    'thuongInBrothersFamily',
    'ducInNhaChung',
    'diepInNhaChung',
    'anhInNhaChung',
    'thuongInNhaChung',
    'thaoInNhaChung',
  ];
  for (const key of requiredMembershipKeys) {
    if (!memberships[key]) {
      console.error(`[DIAG] Membership key '${key}' missing in memberships map.`);
      console.error('[DIAG] memberships map keys:', Object.keys(memberships));
      throw new Error(`Membership '${key}' missing in memberships map`);
    }
  }
  console.log('Seeding transactions...');

  // Defensive: check all required categories exist before proceeding
  const requiredKeys = [
    'anUong',
    'muaSamDucDiep',
    'giaiTri',
    'hocTap',
    'dichVuChung',
    'nhaCua',
  ];
  for (const key of requiredKeys) {
    if (!categories[key]) {
      console.error(`[DIAG] Category key '${key}' missing in categories map at start of seedTransactions.`);
      console.error('[DIAG] categories map keys:', Object.keys(categories));
      throw new Error(`Category '${key}' missing in categories map`);
    }
  }


  // Transaction definitions with category keys as strings
  const txDefs = [
    {
      id: 'tx-my-family-1',
      amount: 500000,
      date: new Date('2025-07-01T12:00:00Z'),
      note: 'Ăn tối cuối tuần',
      type: 'expense',
      payer: memberships.ducInMyFamily.id,
      isShared: true,
      familyId: memberships.ducInMyFamily.familyId,
      categoryKey: 'anUong',
      splitRatio: {
        create: [
          { memberId: memberships.ducInMyFamily.id, percentage: 50 },
          { memberId: memberships.diepInMyFamily.id, percentage: 50 },
        ],
      },
    },
    {
      id: 'tx-my-family-2',
      amount: 200000,
      date: new Date('2025-07-02T09:00:00Z'),
      note: 'Điệp mua sắm cá nhân',
      type: 'expense',
      payer: memberships.diepInMyFamily.id,
      isShared: false,
      familyId: memberships.diepInMyFamily.familyId,
      categoryKey: 'muaSamDucDiep',
    },
    {
      id: 'tx-brothers-family-1',
      amount: 450000,
      date: new Date('2025-07-05T20:00:00Z'),
      note: 'Xem phim cuối tuần',
      type: 'expense',
      payer: memberships.anhInBrothersFamily.id,
      isShared: true,
      familyId: memberships.anhInBrothersFamily.familyId,
      categoryKey: 'giaiTri',
      splitRatio: {
        create: [
          { memberId: memberships.anhInBrothersFamily.id, percentage: 50 },
          { memberId: memberships.thuongInBrothersFamily.id, percentage: 50 },
        ],
      },
    },
    {
      id: 'tx-brothers-family-2',
      amount: 1200000,
      date: new Date('2025-07-08T10:00:00Z'),
      note: 'Sách vở cho con',
      type: 'expense',
      payer: memberships.thuongInBrothersFamily.id,
      isShared: false,
      familyId: memberships.thuongInBrothersFamily.familyId,
      categoryKey: 'hocTap',
    },
    {
      id: 'tx-nha-chung-1',
      amount: 2500000,
      date: new Date('2025-07-10T08:00:00Z'),
      note: 'Tiền điện nước tháng 7',
      type: 'expense',
      payer: memberships.anhInNhaChung.id,
      isShared: true,
      familyId: memberships.anhInNhaChung.familyId,
      categoryKey: 'dichVuChung',
      splitRatio: {
        create: [
          { memberId: memberships.ducInNhaChung.id, percentage: 25 },
          { memberId: memberships.diepInNhaChung.id, percentage: 25 },
          { memberId: memberships.anhInNhaChung.id, percentage: 25 },
          { memberId: memberships.thuongInNhaChung.id, percentage: 25 },
        ],
      },
    },
    {
      id: 'tx-nha-chung-2',
      amount: 1000000,
      date: new Date('2025-07-15T17:00:00Z'),
      note: 'Sửa chữa đồ chung',
      type: 'expense',
      payer: memberships.ducInNhaChung.id,
      isShared: true,
      familyId: memberships.ducInNhaChung.familyId,
      categoryKey: 'nhaCua',
      splitRatio: {
        create: [
          { memberId: memberships.ducInNhaChung.id, percentage: 20 },
          { memberId: memberships.diepInNhaChung.id, percentage: 20 },
          { memberId: memberships.anhInNhaChung.id, percentage: 20 },
          { memberId: memberships.thuongInNhaChung.id, percentage: 20 },
          { memberId: memberships.thaoInNhaChung.id, percentage: 20 },
        ],
      },
    },
  ];

  // Print the full categories object and the first txDef's categoryKey for deep inspection
  console.log("[DIAG] FULL categories object:", categories);
  if (txDefs.length > 0) {
    console.log("[DIAG] First txDef.categoryKey:", txDefs[0].categoryKey);
  }
  // Print the mapping of categoryKey to category.id for the categories object
  console.log("[DIAG] categories mapping (key => id):");
  for (const k of Object.keys(categories)) {
    console.log(`    ${k} =>`, categories[k] && categories[k].id);
  }
  // Print the txDefs array for inspection
  console.log("[DIAG] txDefs:", txDefs.map(tx => ({id: tx.id, categoryKey: tx.categoryKey})));
  console.log("[DIAG] Entering transaction loop, txDefs.length:", txDefs.length);
  for (const txDef of txDefs) {
    const catObj = categories[txDef.categoryKey];
    console.log(`[DIAG] txDef.id: ${txDef.id}, txDef.categoryKey: ${txDef.categoryKey}, catObj:`, catObj);
    if (!catObj) {
      console.error(`[DIAG] Transaction '${txDef.id}' references missing or undefined category key '${txDef.categoryKey}'.`);
      console.error('[DIAG] categories[txDef.categoryKey]:', catObj);
      console.error('[DIAG] All available category keys:', Object.keys(categories));
      console.error('[DIAG] Full categories object:', categories);
      throw new Error(`Transaction '${txDef.id}' references missing or undefined category key '${txDef.categoryKey}'. Available keys: [${Object.keys(categories).join(', ')}]`);
    }
    const tx = {
      ...txDef,
      categoryId: catObj.id,
    };
    delete (tx as any).categoryKey;
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: tx,
      create: tx,
    });
    console.log("[DIAG] Successfully processed txDef.id:", txDef.id);
  }


  console.log('Transactions seeded.');
}

// Export transaction definitions for external inspection
export function getTransactionDefs(memberships: HouseholdMembershipMap) {
  return [
    {
      id: 'tx-my-family-1',
      amount: 500000,
      date: new Date('2025-07-01T12:00:00Z'),
      note: 'Ăn tối cuối tuần',
      type: 'expense',
      payer: memberships.ducInMyFamily.id,
      isShared: true,
      familyId: memberships.ducInMyFamily.familyId,
      categoryKey: 'anUong',
      splitRatio: {
        create: [
          { memberId: memberships.ducInMyFamily.id, percentage: 50 },
          { memberId: memberships.diepInMyFamily.id, percentage: 50 },
        ],
      },
    },
    {
      id: 'tx-my-family-2',
      amount: 200000,
      date: new Date('2025-07-02T09:00:00Z'),
      note: 'Điệp mua sắm cá nhân',
      type: 'expense',
      payer: memberships.diepInMyFamily.id,
      isShared: false,
      familyId: memberships.diepInMyFamily.familyId,
      categoryKey: 'muaSamDucDiep',
    },
    {
      id: 'tx-brothers-family-1',
      amount: 450000,
      date: new Date('2025-07-05T20:00:00Z'),
      note: 'Xem phim cuối tuần',
      type: 'expense',
      payer: memberships.anhInBrothersFamily.id,
      isShared: true,
      familyId: memberships.anhInBrothersFamily.familyId,
      categoryKey: 'giaiTri',
      splitRatio: {
        create: [
          { memberId: memberships.anhInBrothersFamily.id, percentage: 50 },
          { memberId: memberships.thuongInBrothersFamily.id, percentage: 50 },
        ],
      },
    },
    {
      id: 'tx-brothers-family-2',
      amount: 1200000,
      date: new Date('2025-07-08T10:00:00Z'),
      note: 'Sách vở cho con',
      type: 'expense',
      payer: memberships.thuongInBrothersFamily.id,
      isShared: false,
      familyId: memberships.thuongInBrothersFamily.familyId,
      categoryKey: 'hocTap',
    },
    {
      id: 'tx-nha-chung-1',
      amount: 2500000,
      date: new Date('2025-07-10T08:00:00Z'),
      note: 'Tiền điện nước tháng 7',
      type: 'expense',
      payer: memberships.anhInNhaChung.id,
      isShared: true,
      familyId: memberships.anhInNhaChung.familyId,
      categoryKey: 'dichVuChung',
      splitRatio: {
        create: [
          { memberId: memberships.ducInNhaChung.id, percentage: 25 },
          { memberId: memberships.diepInNhaChung.id, percentage: 25 },
          { memberId: memberships.anhInNhaChung.id, percentage: 25 },
          { memberId: memberships.thuongInNhaChung.id, percentage: 25 },
        ],
      },
    },
    {
      id: 'tx-nha-chung-2',
      amount: 1000000,
      date: new Date('2025-07-15T17:00:00Z'),
      note: 'Sửa chữa đồ chung',
      type: 'expense',
      payer: memberships.ducInNhaChung.id,
      isShared: true,
      familyId: memberships.ducInNhaChung.familyId,
      categoryKey: 'nhaCua',
      splitRatio: {
        create: [
          { memberId: memberships.ducInNhaChung.id, percentage: 20 },
          { memberId: memberships.diepInNhaChung.id, percentage: 20 },
          { memberId: memberships.anhInNhaChung.id, percentage: 20 },
          { memberId: memberships.thuongInNhaChung.id, percentage: 20 },
          { memberId: memberships.thaoInNhaChung.id, percentage: 20 },
        ],
      },
    },
  ];
}
