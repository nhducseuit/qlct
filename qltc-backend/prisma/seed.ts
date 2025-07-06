import { PrismaClient } from '@prisma/client';
import { seedFamilies } from './seed-data/families';
import { seedPersons } from './seed-data/persons';
import { seedUsers } from './seed-data/users';
import { seedMemberships } from './seed-data/memberships';
import { seedPredefinedSplitRatios } from './seed-data/predefinedSplitRatios';
import { seedCategories } from './seed-data/categories';
import { seedTransactions } from './seed-data/transactions';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting modular seed process...');

  // The order is critical to ensure relational data is available when needed.
  const families = await seedFamilies(prisma);
  const persons = await seedPersons(prisma);
  
  // Pass persons and families to create memberships, and get the created memberships back.
  const memberships = await seedMemberships(prisma, families, persons);
  
  // These seeders depend on the core data being in place.
  await seedUsers(prisma, families, persons);
  const predefinedSplitRatios = await seedPredefinedSplitRatios(prisma, families, memberships);
  const categoryMapFromSeed = await seedCategories(prisma, families, predefinedSplitRatios);


  // Build categoryMap by key from DB
  const cleanCategoriesFromDb = await prisma.category.findMany();
  const categoryMap: Record<string, any> = {};
  for (const category of cleanCategoriesFromDb) {
    if (category.key) categoryMap[category.key] = category;
  }

  // DIAGNOSTIC: Print both categoryMapFromSeed and final categoryMap for key/id mapping
  console.log('[DIAG] categoryMapFromSeed (key => id):');
  for (const k of Object.keys(categoryMapFromSeed)) {
    console.log(`    ${k} =>`, categoryMapFromSeed[k] && categoryMapFromSeed[k].id);
  }
  console.log('[DIAG] categoryMap (from DB, key => id):');
  for (const k of Object.keys(categoryMap)) {
    console.log(`    ${k} =>`, categoryMap[k] && categoryMap[k].id);
  }
  // Print the full objects for 'anUong' key if present
  console.log('[DIAG] categoryMapFromSeed["anUong"]:', categoryMapFromSeed['anUong']);
  console.log('[DIAG] categoryMap["anUong"]:', categoryMap['anUong']);


  // Log all available category keys and all transaction category keys
  const txModule = await import('./seed-data/transactions');
  const txDefs = txModule.getTransactionDefs ? txModule.getTransactionDefs(memberships) : [];
  const txKeys = txDefs.map((tx: any) => tx.categoryKey);
  console.log('Available category keys:', Object.keys(categoryMap));
  console.log('Transaction category keys:', txKeys);

  console.log('Passing clean category map to transactions seeder.');
  await seedTransactions(prisma, memberships, categoryMap);

  console.log('Modular seed process completed successfully.');
}

main()
  .catch((e) => {
    console.error('An error occurred during the seed process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
