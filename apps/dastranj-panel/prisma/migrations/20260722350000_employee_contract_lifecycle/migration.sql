ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'TERMINATED';
ALTER TYPE "EmployeeContractStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

CREATE TYPE "EmployeeContractOperationType" AS ENUM ('CREATE_CONTRACT', 'RENEW_CONTRACT', 'AMEND_CONTRACT', 'TERMINATE_CONTRACT');
CREATE TYPE "EmployeeContractApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "EmployeeContract"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "parentContractId" TEXT,
  ADD COLUMN "operationType" "EmployeeContractOperationType" NOT NULL DEFAULT 'CREATE_CONTRACT',
  ADD COLUMN "effectiveDate" TEXT,
  ADD COLUMN "reason" TEXT,
  ADD COLUMN "attachmentUrl" TEXT,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "approvedById" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "appliedAt" TIMESTAMP(3);

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "tenantId", "employeeId" ORDER BY "createdAt", id) AS version
  FROM "EmployeeContract"
)
UPDATE "EmployeeContract" c SET version = ranked.version FROM ranked WHERE c.id = ranked.id;

CREATE UNIQUE INDEX "EmployeeContract_tenantId_employeeId_version_key" ON "EmployeeContract"("tenantId", "employeeId", "version");
CREATE INDEX "EmployeeContract_tenantId_employeeId_effectiveDate_idx" ON "EmployeeContract"("tenantId", "employeeId", "effectiveDate");

CREATE TABLE "EmployeeContractApproval" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "requesterId" TEXT,
  "approverId" TEXT,
  "status" "EmployeeContractApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT NOT NULL,
  "reviewNote" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "EmployeeContractApproval_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmployeeContractApproval_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmployeeContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "EmployeeContractApproval_tenantId_contractId_requestedAt_idx" ON "EmployeeContractApproval"("tenantId", "contractId", "requestedAt");
CREATE INDEX "EmployeeContractApproval_tenantId_status_idx" ON "EmployeeContractApproval"("tenantId", "status");

CREATE TABLE "EmployeeContractAuditLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "operationType" TEXT NOT NULL,
  "oldValue" JSONB,
  "newValue" JSONB,
  "actorUserId" TEXT,
  "actorRole" TEXT,
  "reason" TEXT NOT NULL,
  "approvalStatus" TEXT,
  "effectiveDate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeContractAuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmployeeContractAuditLog_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmployeeContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "EmployeeContractAuditLog_tenantId_contractId_createdAt_idx" ON "EmployeeContractAuditLog"("tenantId", "contractId", "createdAt");
CREATE INDEX "EmployeeContractAuditLog_tenantId_employeeId_createdAt_idx" ON "EmployeeContractAuditLog"("tenantId", "employeeId", "createdAt");
