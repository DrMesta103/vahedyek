-- AlterTable
ALTER TABLE "ContractDraft"
ADD COLUMN "approvalReturnedPending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "approvalLastRejectionReason" TEXT,
ADD COLUMN "approvalLastRejectedAt" TIMESTAMP(3);
