CREATE TYPE "EmployeeProfileApprovalStatus" AS ENUM ('NOT_STARTED', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

CREATE TABLE "EmployeeProfileApproval" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "categoryKey" TEXT NOT NULL,
  "status" "EmployeeProfileApprovalStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "submittedBy" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeProfileApproval_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeProfileApproval_tenantId_employeeId_categoryKey_key"
ON "EmployeeProfileApproval"("tenantId", "employeeId", "categoryKey");
CREATE INDEX "EmployeeProfileApproval_tenantId_employeeId_status_idx"
ON "EmployeeProfileApproval"("tenantId", "employeeId", "status");

ALTER TABLE "EmployeeProfileApproval"
ADD CONSTRAINT "EmployeeProfileApproval_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeProfileApproval"
ADD CONSTRAINT "EmployeeProfileApproval_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
