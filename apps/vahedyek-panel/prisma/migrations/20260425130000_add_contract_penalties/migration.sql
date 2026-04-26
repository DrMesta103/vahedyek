-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ContractPenalties" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,

    CONSTRAINT "ContractPenalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPenaltyType" (
    "id" TEXT NOT NULL,
    "penaltiesId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContractPenaltyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPenaltyRule" (
    "id" TEXT NOT NULL,
    "penaltiesId" TEXT NOT NULL,
    "penaltyTypeId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "fixedAmount" DECIMAL(18,2),
    "penaltyPercent" DECIMAL(18,2),
    "bankInterestPercent" DECIMAL(18,2),
    "graceDays" INTEGER,
    "roundRule" TEXT,
    "extraFeeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "extraFeeType" TEXT,
    "extraFeeAmount" DECIMAL(18,2),
    "extraFeeRoundRule" TEXT,
    "progressiveRows" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractPenaltyRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractPenalties_draftId_key" ON "ContractPenalties"("draftId");

-- CreateIndex
CREATE INDEX "ContractPenaltyType_penaltiesId_idx" ON "ContractPenaltyType"("penaltiesId");

-- CreateIndex
CREATE INDEX "ContractPenaltyRule_penaltiesId_penaltyTypeId_idx" ON "ContractPenaltyRule"("penaltiesId", "penaltyTypeId");

-- AddForeignKey
ALTER TABLE "ContractPenalties" ADD CONSTRAINT "ContractPenalties_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPenaltyType" ADD CONSTRAINT "ContractPenaltyType_penaltiesId_fkey" FOREIGN KEY ("penaltiesId") REFERENCES "ContractPenalties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPenaltyRule" ADD CONSTRAINT "ContractPenaltyRule_penaltiesId_fkey" FOREIGN KEY ("penaltiesId") REFERENCES "ContractPenalties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPenaltyRule" ADD CONSTRAINT "ContractPenaltyRule_penaltyTypeId_fkey" FOREIGN KEY ("penaltyTypeId") REFERENCES "ContractPenaltyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
