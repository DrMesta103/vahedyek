CREATE TYPE "EmployeeContractStatus" AS ENUM ('draft', 'active', 'ended', 'canceled');

CREATE TABLE "EmployeeContract" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "employeeId" TEXT NOT NULL,
  "status" "EmployeeContractStatus" NOT NULL DEFAULT 'draft',
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "startDate" TEXT,
  "endDate" TEXT,
  "contractNumber" TEXT,
  "templateId" TEXT,
  "data" JSONB NOT NULL DEFAULT '{}',
  "finalizedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeContract_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmployeeContract"
  ADD CONSTRAINT "EmployeeContract_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeContract"
  ADD CONSTRAINT "EmployeeContract_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "EmployeeContract_tenantId_employeeId_idx" ON "EmployeeContract"("tenantId", "employeeId");
CREATE INDEX "EmployeeContract_tenantId_employeeId_isCurrent_idx" ON "EmployeeContract"("tenantId", "employeeId", "isCurrent");
CREATE INDEX "EmployeeContract_employeeId_status_idx" ON "EmployeeContract"("employeeId", "status");
CREATE UNIQUE INDEX "EmployeeContract_employee_current_unique" ON "EmployeeContract"("employeeId") WHERE "isCurrent" = true;
