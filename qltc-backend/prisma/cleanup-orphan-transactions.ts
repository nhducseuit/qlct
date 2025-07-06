
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup of orphan transactions...');

  // 1. Get all unique household member IDs
  const memberIds = (await prisma.householdMembership.findMany({
    select: { id: true },
  })).map(m => m.id);
  const validMemberIds = new Set(memberIds);

  console.log(`Found ${validMemberIds.size} valid household members.`);

  // 2. Find all transactions with a payer ID that is not in the valid set
  const orphanTransactions = await prisma.transaction.findMany({
    where: {
      payer: {
        not: null,
        notIn: Array.from(validMemberIds),
      },
    },
  });

  if (orphanTransactions.length === 0) {
    console.log('No orphan transactions found. Your data is clean!');
    return;
  }

  console.log(`Found ${orphanTransactions.length} orphan transactions to fix.`);
  
  // 3. For each orphan transaction, set the payer to null
  const updatePromises = orphanTransactions.map(tx => {
    console.log(`Updating transaction ${tx.id}, setting invalid payer ${tx.payer} to null.`);
    return prisma.transaction.update({
      where: { id: tx.id },
      data: { payer: null },
    });
  });

  await Promise.all(updatePromises);

  console.log('Successfully cleaned up all orphan transactions.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
