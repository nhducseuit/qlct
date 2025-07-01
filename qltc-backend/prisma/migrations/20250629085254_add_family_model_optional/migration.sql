-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "familyId" TEXT;

-- AlterTable
ALTER TABLE "HouseholdMember" ADD COLUMN     "familyId" TEXT;

-- AlterTable
ALTER TABLE "PredefinedSplitRatio" ADD COLUMN     "familyId" TEXT;

-- AlterTable
ALTER TABLE "Settlement" ADD COLUMN     "familyId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "familyId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "familyId" TEXT;

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Family"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredefinedSplitRatio" ADD CONSTRAINT "PredefinedSplitRatio_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;
