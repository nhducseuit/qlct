/*
  Warnings:

  - A unique constraint covering the columns `[socialId]` on the table `Person` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "socialId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Person_socialId_key" ON "Person"("socialId");
