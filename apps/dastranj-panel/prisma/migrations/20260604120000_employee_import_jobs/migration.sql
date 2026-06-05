CREATE TYPE "EmployeeImportJobType" AS ENUM ('excel_add', 'excel_add_and_invite');

CREATE TYPE "EmployeeImportJobStatus" AS ENUM (
  'queued',
  'processing',
  'completed',
  'completed_with_errors',
  'failed'
);

CREATE TYPE "EmployeeImportJobRowStatus" AS ENUM (
  'created',
  'existing_employee',
  'duplicate_in_file',
  'invalid',
  'failed',
  'mock_invited',
  'mock_invite_failed'
);

CREATE TYPE "EmployeeImportJobMockInvitationStatus" AS ENUM (
  'none',
  'mock_sent',
  'mock_failed',
  'not_required'
);

CREATE TYPE "EmployeeImportJobInvitationChannel" AS ENUM ('sms', 'email');

CREATE TABLE "EmployeeImportJob" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "type" "EmployeeImportJobType" NOT NULL,
  "fileName" TEXT NOT NULL,
  "status" "EmployeeImportJobStatus" NOT NULL DEFAULT 'queued',
  "totalCount" INTEGER NOT NULL DEFAULT 0,
  "processedCount" INTEGER NOT NULL DEFAULT 0,
  "createdCount" INTEGER NOT NULL DEFAULT 0,
  "existingCount" INTEGER NOT NULL DEFAULT 0,
  "duplicateCount" INTEGER NOT NULL DEFAULT 0,
  "invalidCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "mockInvitedCount" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeImportJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeImportJobRow" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "rowNumber" INTEGER NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "mobile" TEXT,
  "employeeId" TEXT,
  "status" "EmployeeImportJobRowStatus" NOT NULL,
  "message" TEXT,
  "mockInvitationStatus" "EmployeeImportJobMockInvitationStatus" NOT NULL DEFAULT 'none',
  "invitationChannel" "EmployeeImportJobInvitationChannel",
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeImportJobRow_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmployeeImportJob"
  ADD CONSTRAINT "EmployeeImportJob_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeImportJobRow"
  ADD CONSTRAINT "EmployeeImportJobRow_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "EmployeeImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "EmployeeImportJob_tenantId_createdAt_idx" ON "EmployeeImportJob"("tenantId", "createdAt");
CREATE INDEX "EmployeeImportJob_tenantId_status_idx" ON "EmployeeImportJob"("tenantId", "status");
CREATE INDEX "EmployeeImportJobRow_jobId_rowNumber_idx" ON "EmployeeImportJobRow"("jobId", "rowNumber");
