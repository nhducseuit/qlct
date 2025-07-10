-- -- Migration: Add person-centric Settlement model

-- -- Drop all relevant foreign key constraints
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "Settlement_payerMembershipId_fkey";
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "Settlement_payeeMembershipId_fkey";
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "Settlement_payerId_fkey";
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "Settlement_payeeId_fkey";
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "Settlement_userId_fkey";
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "fk_payer";
-- ALTER TABLE "Settlement" DROP CONSTRAINT IF EXISTS "fk_payee";
-- ALTER TABLE "HouseholdMembership" DROP CONSTRAINT IF EXISTS "HouseholdMembership_personId_fkey";

-- -- Ensure Person.id is UUID before adding foreign keys
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_name='Person' AND column_name='id' AND data_type='text'
--   ) THEN
--     EXECUTE 'ALTER TABLE "Person" ALTER COLUMN "id" TYPE UUID USING ("id"::uuid);';
--   END IF;
-- END$$;

-- -- Alter referencing columns to UUID
-- ALTER TABLE "HouseholdMembership" ALTER COLUMN "personId" TYPE UUID USING "personId"::uuid;

-- -- Rename old columns if needed (from family-centric to person-centric model)
-- -- ALTER TABLE "Settlement" RENAME COLUMN "payerMembershipId" TO "payerId";
-- -- ALTER TABLE "Settlement" RENAME COLUMN "payeeMembershipId" TO "payeeId";

-- -- Rename userId to createdBy only if it exists
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_name='Settlement' AND column_name='userId'
--   ) THEN
--     EXECUTE 'ALTER TABLE "Settlement" RENAME COLUMN "userId" TO "createdBy";';
--   END IF;
-- END$$;

-- -- If old columns are not UUID, you may need to cast or migrate data
-- ALTER TABLE "Settlement" ALTER COLUMN "payerId" TYPE UUID USING "payerId"::uuid;
-- ALTER TABLE "Settlement" ALTER COLUMN "payeeId" TYPE UUID USING "payeeId"::uuid;
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_name='Settlement' AND column_name='createdBy'
--   ) THEN
--     EXECUTE 'ALTER TABLE "Settlement" ALTER COLUMN "createdBy" TYPE UUID USING ("createdBy"::uuid);';
--   END IF;
-- END $$ LANGUAGE plpgsql;

-- -- Add new columns if missing
-- DO $$ BEGIN
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Settlement' AND column_name='amount') THEN
--     ALTER TABLE "Settlement" ADD COLUMN "amount" NUMERIC(18,2);
--   END IF;
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Settlement' AND column_name='createdAt') THEN
--     ALTER TABLE "Settlement" ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now();
--   END IF;
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Settlement' AND column_name='note') THEN
--     ALTER TABLE "Settlement" ADD COLUMN "note" TEXT;
--   END IF;
-- END$$;

-- -- Re-add foreign keys
-- ALTER TABLE "HouseholdMembership" ADD CONSTRAINT "HouseholdMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id");
-- ALTER TABLE "Settlement" ADD CONSTRAINT "fk_payer" FOREIGN KEY ("payerId") REFERENCES "Person"("id");
-- ALTER TABLE "Settlement" ADD CONSTRAINT "fk_payee" FOREIGN KEY ("payeeId") REFERENCES "Person"("id");

-- -- Indexes for efficient queries
-- CREATE INDEX IF NOT EXISTS "idx_settlement_payer" ON "Settlement" ("payerId");
-- CREATE INDEX IF NOT EXISTS "idx_settlement_payee" ON "Settlement" ("payeeId");
-- CREATE INDEX IF NOT EXISTS "idx_settlement_createdBy" ON "Settlement" ("createdBy");