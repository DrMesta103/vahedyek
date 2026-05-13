-- CreateEnum
CREATE TYPE "ContractAppendixStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED');

-- AlterTable
ALTER TABLE "ContractAppendix"
ADD COLUMN     "approvalLastRejectedAt" TIMESTAMP(3),
ADD COLUMN     "approvalLastRejectionReason" TEXT,
ADD COLUMN     "approvalReturnedPending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previousAppendixId" TEXT,
ADD COLUMN     "releasedFromApprovedForEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceKind" TEXT NOT NULL DEFAULT 'contract',
ADD COLUMN     "status" "ContractAppendixStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ContractAppendixApprovalInstance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appendixId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "ContractApprovalInstanceStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "finalApproverUserId" TEXT,
    "stepsSnapshot" JSONB NOT NULL,
    "revisionResumeStepIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractAppendixApprovalInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAppendixApprovalDecision" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "approverUserId" TEXT NOT NULL,
    "decision" "ContractApprovalDecisionType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractAppendixApprovalDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractAppendix_tenantId_status_createdAt_idx" ON "ContractAppendix"("tenantId", "status", "createdAt");
CREATE INDEX "ContractAppendix_previousAppendixId_idx" ON "ContractAppendix"("previousAppendixId");
CREATE UNIQUE INDEX "ContractAppendixApprovalInstance_appendixId_key" ON "ContractAppendixApprovalInstance"("appendixId");
CREATE INDEX "ContractAppendixApprovalInstance_tenantId_idx" ON "ContractAppendixApprovalInstance"("tenantId");
CREATE INDEX "ContractAppendixApprovalInstance_tenantId_status_idx" ON "ContractAppendixApprovalInstance"("tenantId", "status");
CREATE INDEX "ContractAppendixApprovalDecision_instanceId_stepId_idx" ON "ContractAppendixApprovalDecision"("instanceId", "stepId");
CREATE INDEX "ContractAppendixApprovalDecision_approverUserId_idx" ON "ContractAppendixApprovalDecision"("approverUserId");

-- AddForeignKey
ALTER TABLE "ContractAppendix" ADD CONSTRAINT "ContractAppendix_previousAppendixId_fkey" FOREIGN KEY ("previousAppendixId") REFERENCES "ContractAppendix"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContractAppendixApprovalInstance" ADD CONSTRAINT "ContractAppendixApprovalInstance_appendixId_fkey" FOREIGN KEY ("appendixId") REFERENCES "ContractAppendix"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractAppendixApprovalInstance" ADD CONSTRAINT "ContractAppendixApprovalInstance_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ApprovalWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractAppendixApprovalDecision" ADD CONSTRAINT "ContractAppendixApprovalDecision_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ContractAppendixApprovalInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
