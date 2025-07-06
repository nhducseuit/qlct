/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payer_fkey" FOREIGN KEY ("payer") REFERENCES "HouseholdMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
