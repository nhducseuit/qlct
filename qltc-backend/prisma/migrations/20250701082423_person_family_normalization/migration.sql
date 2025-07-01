/*
  Warnings:

  - You are about to drop the column `payeeId` on the `Settlement` table. All the data in the column will be lost.
  - You are about to drop the column `payerId` on the `Settlement` table. All the data in the column will be lost.
  - You are about to drop the `HouseholdMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `payeeMembershipId` to the `Settlement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payerMembershipId` to the `Settlement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HouseholdMember" DROP CONSTRAINT "HouseholdMember_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Settlement" DROP CONSTRAINT "Settlement_payeeId_fkey";

-- DropForeignKey
ALTER TABLE "Settlement" DROP CONSTRAINT "Settlement_payerId_fkey";

-- DropIndex
DROP INDEX "Settlement_payeeId_idx";

-- DropIndex
DROP INDEX "Settlement_payerId_idx";

-- AlterTable
ALTER TABLE "Settlement" DROP COLUMN "payeeId",
DROP COLUMN "payerId",
ADD COLUMN     "payeeMembershipId" TEXT NOT NULL,
ADD COLUMN     "payerMembershipId" TEXT NOT NULL;

-- DropTable
DROP TABLE "HouseholdMember";

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMembership" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HouseholdMembership_familyId_idx" ON "HouseholdMembership"("familyId");

-- CreateIndex
CREATE INDEX "HouseholdMembership_personId_idx" ON "HouseholdMembership"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMembership_personId_familyId_key" ON "HouseholdMembership"("personId", "familyId");

-- CreateIndex
CREATE INDEX "Settlement_payerMembershipId_idx" ON "Settlement"("payerMembershipId");

-- CreateIndex
CREATE INDEX "Settlement_payeeMembershipId_idx" ON "Settlement"("payeeMembershipId");

-- AddForeignKey
ALTER TABLE "HouseholdMembership" ADD CONSTRAINT "HouseholdMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMembership" ADD CONSTRAINT "HouseholdMembership_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_payerMembershipId_fkey" FOREIGN KEY ("payerMembershipId") REFERENCES "HouseholdMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_payeeMembershipId_fkey" FOREIGN KEY ("payeeMembershipId") REFERENCES "HouseholdMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
