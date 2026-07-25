CREATE TYPE "EmployeeChangeRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'APPLIED', 'CANCELLED');

CREATE TABLE "EmployeeChangeRequest" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "fieldKey" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "operationType" TEXT NOT NULL,
  "status" "EmployeeChangeRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "oldValue" JSONB,
  "newValue" JSONB NOT NULL,
  "reasonCode" TEXT NOT NULL,
  "reasonText" TEXT,
  "attachmentUrl" TEXT,
  "effectiveDate" TEXT,
  "payrollImpact" BOOLEAN NOT NULL DEFAULT false,
  "contractImpact" BOOLEAN NOT NULL DEFAULT false,
  "requestedBy" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNote" TEXT,
  "appliedBy" TEXT,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeChangeRequest_tenantId_employeeId_status_idx" ON "EmployeeChangeRequest"("tenantId", "employeeId", "status");
CREATE INDEX "EmployeeChangeRequest_tenantId_fieldKey_status_idx" ON "EmployeeChangeRequest"("tenantId", "fieldKey", "status");
ALTER TABLE "EmployeeChangeRequest" ADD CONSTRAINT "EmployeeChangeRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeChangeRequest" ADD CONSTRAINT "EmployeeChangeRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
