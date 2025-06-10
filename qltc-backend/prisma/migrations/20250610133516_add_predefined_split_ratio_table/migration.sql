-- CreateTable
CREATE TABLE "PredefinedSplitRatio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "splitRatio" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredefinedSplitRatio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PredefinedSplitRatio_userId_idx" ON "PredefinedSplitRatio"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PredefinedSplitRatio_userId_name_key" ON "PredefinedSplitRatio"("userId", "name");

-- AddForeignKey
ALTER TABLE "PredefinedSplitRatio" ADD CONSTRAINT "PredefinedSplitRatio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
