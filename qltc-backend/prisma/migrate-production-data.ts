/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script is a direct translation of the `backfill-families.sql` migration.
 * It is designed to migrate specific, known production data to the new family-centric model.
 * It should be run AFTER the `..._add_family_model_optional` migration and BEFORE the
 * `..._finalize_family_model` migration.
 *
 * This script is idempotent, using `upsert` and targeted updates to be safe to run multiple times.
 */
async function main() {
  console.log('Starting migration of specific production data to the family model...');

  await prisma.$transaction(async (tx) => {
    console.log('Step 1: Ensuring the two core families exist...');
    // SQL: INSERT INTO public."Family" ... VALUES('big-family-1', ...)
    await tx.family.upsert({
      where: { id: 'big-family-1' },
      update: {},
      create: {
        id: 'big-family-1',
        name: 'Nhà chung',
      },
    });

    // SQL: INSERT INTO public."Family" ... VALUES('small-family-1', ...)
    await tx.family.upsert({
      where: { id: 'small-family-1' },
      update: {},
      create: {
        id: 'small-family-1',
        name: '2vc',
      },
    });
    console.log(' -> Core families ensured.');

    console.log('Step 2: Migrating Categories...');
    // SQL: UPDATE "Category" SET "familyId" = 'small-family-1' WHERE "id" IN (...)
    const smallFamilyCategoryIds = [
      '76528a8a-a82a-4ef0-87aa-256ac621b43b',
      '5ae9865d-4041-4612-a757-8730161071c7',
      '87ae0b88-d46c-42fe-965c-6813268e44d1',
      '182fe1c6-5b87-4468-93ba-159e01146b3d',
      '270c1489-c0a3-457d-b778-59e222880073',
      '5d271e51-1c6b-4919-b76e-d7a59e719b22',
      'f35b2279-c7d3-4ff6-b867-b79955b5227e',
      '714920cc-22c9-4e14-a8cd-88d488ffeb58',
    ];
    await tx.category.updateMany({
      where: { id: { in: smallFamilyCategoryIds } },
      data: { familyId: 'small-family-1' },
    });

    // SQL: UPDATE "Category" SET "familyId" = 'big-family-1' WHERE "familyId" IS NULL;
    await tx.category.updateMany({
      // @ts-ignore - This is valid in the intermediate migration state
      where: { familyId: null },
      data: { familyId: 'big-family-1' },
    });
    console.log(' -> Categories migrated.');

    console.log('Step 3: Migrating Users and Household Members...');
    // SQL: INSERT INTO public."User" ... VALUES ('2e5841b9-518c-4eb6-89fa-7bbf117b546d', ...)
    // This user is created without a name, as per the original schema state.
    await tx.user.upsert({
        where: { id: '2e5841b9-518c-4eb6-89fa-7bbf117b546d' },
        update: { familyId: 'small-family-1' },
        create: {
            id: '2e5841b9-518c-4eb6-89fa-7bbf117b546d',
            email: 'user@example.com',
            password: 'hashedpassword', // This should be replaced with a real, secure hash
            familyId: 'small-family-1',
        }
    });

    // SQL: UPDATE public."HouseholdMember" SET "familyId"='big-family-1';
    await tx.householdMembership.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { familyId: null },
        data: { familyId: 'big-family-1' }
    });

    // SQL: INSERT INTO public."HouseholdMember" ... VALUES('6e90d131-e1cc-4355-9030-505ee6ca7e96', ...)
    await tx.householdMembership.upsert({
        where: { id: '6e90d131-e1cc-4355-9030-505ee6ca7e96' },
        update: { familyId: 'small-family-1' },
        create: {
            id: '6e90d131-e1cc-4355-9030-505ee6ca7e96',
            name: 'Vợ',
            isActive: true,
            order: 0,
            // @ts-ignore - This is valid in the intermediate migration state
            userId: '2e5841b9-518c-4eb6-89fa-7bbf117b546d',
            familyId: 'small-family-1'
        }
    });

    // SQL: INSERT INTO public."HouseholdMember" ... VALUES('061731f1-7857-4055-aa8d-f0f4bdc1fff1', ...)
    await tx.householdMembership.upsert({
        where: { id: '061731f1-7857-4055-aa8d-f0f4bdc1fff1' },
        update: { familyId: 'small-family-1' },
        create: {
            id: '061731f1-7857-4055-aa8d-f0f4bdc1fff1',
            name: 'Chồng',
            isActive: true,
            order: 0,
            // @ts-ignore - This is valid in the intermediate migration state
            userId: '2e5841b9-518c-4eb6-89fa-7bbf117b546d',
            familyId: 'small-family-1'
        }
    });

    // SQL: update public."User" set "familyId"='small-family-1' where id='d848cfca-b85c-41cb-b9c7-d8321ff7346f';
    await tx.user.updateMany({
        where: { id: 'd848cfca-b85c-41cb-b9c7-d8321ff7346f' },
        data: { familyId: 'small-family-1' }
    });

    // SQL: update public."User" set "familyId"='big-family-1' where "familyId" is null;
    await tx.user.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { familyId: null },
        data: { familyId: 'big-family-1' }
    });
    console.log(' -> Users and Members migrated.');

    console.log('Step 4: Migrating PredefinedSplitRatios...');
    // SQL: UPDATE public."PredefinedSplitRatio" SET "familyId"='small-family-1' WHERE id='b3396d63-7620-40fa-999a-5a6323069d24';
    await tx.predefinedSplitRatio.updateMany({
        where: { id: 'b3396d63-7620-40fa-999a-5a6323069d24' },
        data: { familyId: 'small-family-1' }
    });
    // SQL: UPDATE public."PredefinedSplitRatio" SET "familyId"='big-family-1' WHERE "familyId" is null;
    await tx.predefinedSplitRatio.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { familyId: null },
        data: { familyId: 'big-family-1' }
    });
    console.log(' -> Split Ratios migrated.');

    console.log('Step 5: Migrating Transactions... (This may take a moment)');
    // This section is complex and requires raw SQL to safely replicate the original logic
    // of querying inside a JSONB field, which is not directly supported by Prisma `updateMany`.

    // SQL: update public."Transaction" set "familyId"='big-family-1' where "splitRatio" = '[...]';
    await tx.$executeRaw`UPDATE "Transaction" SET "familyId" = 'big-family-1' WHERE "splitRatio"::text = '[{\"memberId\": \"16e9f4a9-2cc9-4c42-b0df-445a3a48ad44\", \"percentage\": 50}, {\"memberId\": \"910b287d-d365-4daa-83d5-11c096b07068\", \"percentage\": 25}, {\"memberId\": \"94e6e8bf-3a8a-4234-a07c-28c54c1a06e6\", \"percentage\": 25}]'`;

    // SQL: update public."Transaction" set "familyId"='small-family-1' where "categoryId" in (...);
    await tx.transaction.updateMany({
        where: { categoryId: { in: smallFamilyCategoryIds } },
        data: { familyId: 'small-family-1' }
    });

    // SQL: update public."Transaction" set "familyId"='big-family-1' where exists(...)
    await tx.$executeRaw`UPDATE "Transaction" SET "familyId" = 'big-family-1' WHERE "familyId" IS NULL AND EXISTS (SELECT 1 FROM jsonb_array_elements("splitRatio") elem WHERE elem->>'memberId' IN ('94e6e8bf-3a8a-4234-a07c-28c54c1a06e6', '16e9f4a9-2cc9-4c42-b0df-445a3a48ad44'))`;

    // SQL: update public."Transaction" set "familyId"='small-family-1' where "familyId" is null;
    await tx.transaction.updateMany({
        // @ts-ignore - This is valid in the intermediate migration state
        where: { familyId: null },
        data: { familyId: 'small-family-1' }
    });
    console.log(' -> Transactions migrated.');

  });

  console.log('✅ Production data migration script completed successfully.');
}

main()
  .catch((e) => {
    console.error('An error occurred during the production data migration:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
