/*
  Warnings:

  - You are about to drop the column `userId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `HouseholdMember` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PredefinedSplitRatio` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Settlement` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[familyId,name]` on the table `PredefinedSplitRatio` will be added. If there are existing duplicate values, this will fail.
  - Made the column `familyId` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `familyId` on table `HouseholdMember` required. This step will fail if there are existing NULL values in that column.
  - Made the column `familyId` on table `PredefinedSplitRatio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `familyId` on table `Settlement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `familyId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `familyId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "HouseholdMember" DROP CONSTRAINT "HouseholdMember_familyId_fkey";

-- DropForeignKey
ALTER TABLE "HouseholdMember" DROP CONSTRAINT "HouseholdMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "PredefinedSplitRatio" DROP CONSTRAINT "PredefinedSplitRatio_familyId_fkey";

-- DropForeignKey
ALTER TABLE "PredefinedSplitRatio" DROP CONSTRAINT "PredefinedSplitRatio_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_familyId_fkey";

-- DropIndex
DROP INDEX "PredefinedSplitRatio_userId_idx";

-- DropIndex
DROP INDEX "PredefinedSplitRatio_userId_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "userId",
ALTER COLUMN "familyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "HouseholdMember" DROP COLUMN "userId",
ALTER COLUMN "familyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PredefinedSplitRatio" DROP COLUMN "userId",
ALTER COLUMN "familyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "userId",
ALTER COLUMN "familyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "familyId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PredefinedSplitRatio_familyId_idx" ON "PredefinedSplitRatio"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "PredefinedSplitRatio_familyId_name_key" ON "PredefinedSplitRatio"("familyId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredefinedSplitRatio" ADD CONSTRAINT "PredefinedSplitRatio_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
