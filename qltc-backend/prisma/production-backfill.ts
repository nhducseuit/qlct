/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script is designed to be run on a production database AFTER the
 * `..._add_family_model_optional` migration has been applied, and BEFORE
 * the `..._finalize_family_model` migration.
 *
 * It performs the following actions for a safe data migration:
 * 1. Finds all users that existed before the concept of "Families".
 * 2. For each of these original users, it creates a new, dedicated "Family".
 * 3. It then finds all the data that was originally associated with that user.
 * 4. It updates all this associated data to link it to the newly created Family.
 * 5. This script is idempotent, meaning it can be run multiple times without causing issues.
 */
async function main() {
  console.log('Starting production backfill for family migration...');

  // This script assumes it is being run in an environment where the old `userId` columns
  // still exist on the tables. If they have been dropped, this script will need to be adjusted.
  // Based on your migrations, the `...finalize_family_model` is what drops them.

  // Find all users who don't have a family yet. These are the users from the pre-family era.
  const usersToMigrate = await prisma.user.findMany({
    where: {
      // @ts-ignore - This is valid in the intermediate migration state
      familyId: null,
    },
    // We need the user's name to create a sensible family name.
    // The `add_user_name` migration added this field.
    select: {
      id: true,
      email: true,
      name: true,
    }
  });

  if (usersToMigrate.length === 0) {
    console.log('✅ No users to migrate. All users already have a family.');
    return;
  }

  console.log(`Found ${usersToMigrate.length} user(s) to migrate to the new family model.`);

  for (const user of usersToMigrate) {
    console.log(`
Processing user: ${user.email} (ID: ${user.id})`);

    // Use a transaction to ensure that all updates for a single user succeed or fail together.
    await prisma.$transaction(async (tx) => {
      // 1. Create a new Family for the user.
      const familyName = user.name ? `${user.name}'s Family` : `Family for ${user.email}`;
      const newFamily = await tx.family.create({
        data: {
          name: familyName,
        },
      });
      console.log(` -> Created Family "${newFamily.name}" (ID: ${newFamily.id})`);

      // 2. Update the user to link them to their new family.
      await tx.user.update({
        where: { id: user.id },
        data: { familyId: newFamily.id },
      });
      console.log(` -> Linked User to new Family.`);

      // 3. Find and update all related data that belonged to the old user.
      // Note: This relies on the old `userId` columns still existing.
      
      const categoryCount = await tx.category.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { userId: user.id },
        data: { familyId: newFamily.id },
      });
      console.log(` -> Migrated ${categoryCount.count} categories.`);

      const transactionCount = await tx.transaction.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { userId: user.id },
        data: { familyId: newFamily.id },
      });
      console.log(` -> Migrated ${transactionCount.count} transactions.`);
      
      const memberCount = await tx.householdMembership.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { userId: user.id },
        data: { familyId: newFamily.id },
      });
      console.log(` -> Migrated ${memberCount.count} household members.`);

      const settlementCount = await tx.settlement.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { userId: user.id },
        data: { familyId: newFamily.id },
      });
      console.log(` -> Migrated ${settlementCount.count} settlements.`);

      const splitRatioCount = await tx.predefinedSplitRatio.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { userId: user.id },
        data: { familyId: newFamily.id },
      });
      console.log(` -> Migrated ${splitRatioCount.count} split ratios.`);
    });
    console.log(`✅ Successfully migrated user ${user.email}.`);
  }
}

main()
  .catch((e) => {
    console.error('An error occurred during the backfill process:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
