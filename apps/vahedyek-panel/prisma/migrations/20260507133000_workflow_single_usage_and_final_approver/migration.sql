-- Add final approver support + snapshot on instances
ALTER TABLE "ApprovalWorkflow"
ADD COLUMN IF NOT EXISTS "finalApproverUserId" TEXT;

ALTER TABLE "ContractApprovalInstance"
ADD COLUMN IF NOT EXISTS "finalApproverUserId" TEXT;

-- Optional indexes for lookups (lightweight)
CREATE INDEX IF NOT EXISTS "ApprovalWorkflow_tenantId_usageTypes_idx"
ON "ApprovalWorkflow" ("tenantId");

