-- CreateEnum
CREATE TYPE "ContractApprovalInstanceStatus" AS ENUM ('IN_REVIEW', 'REVISION_REQUESTED', 'REJECTED_TO_DRAFT', 'APPROVED');

-- CreateEnum
CREATE TYPE "ContractApprovalDecisionType" AS ENUM ('APPROVE', 'REQUEST_REVISION', 'REJECT_TO_DRAFT');

-- CreateTable
CREATE TABLE "ApprovalWorkflow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "usageTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "steps" JSONB NOT NULL DEFAULT '[]',
    "buyerShouldApprove" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractApprovalInstance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "ContractApprovalInstanceStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "stepsSnapshot" JSONB NOT NULL,
    "revisionResumeStepIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractApprovalInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractApprovalDecision" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "approverUserId" TEXT NOT NULL,
    "decision" "ContractApprovalDecisionType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractApprovalDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_tenantId_idx" ON "ApprovalWorkflow"("tenantId");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_tenantId_active_idx" ON "ApprovalWorkflow"("tenantId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ContractApprovalInstance_draftId_key" ON "ContractApprovalInstance"("draftId");

-- CreateIndex
CREATE INDEX "ContractApprovalInstance_tenantId_idx" ON "ContractApprovalInstance"("tenantId");

-- CreateIndex
CREATE INDEX "ContractApprovalInstance_tenantId_status_idx" ON "ContractApprovalInstance"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ContractApprovalDecision_instanceId_stepId_idx" ON "ContractApprovalDecision"("instanceId", "stepId");

-- CreateIndex
CREATE INDEX "ContractApprovalDecision_approverUserId_idx" ON "ContractApprovalDecision"("approverUserId");

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractApprovalInstance" ADD CONSTRAINT "ContractApprovalInstance_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractApprovalInstance" ADD CONSTRAINT "ContractApprovalInstance_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ApprovalWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractApprovalDecision" ADD CONSTRAINT "ContractApprovalDecision_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ContractApprovalInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
