CREATE TABLE "EmployeeTerminationIntent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "initiatedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "reason" TEXT,
  "source" TEXT NOT NULL DEFAULT 'employee_detail',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeTerminationIntent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeTerminationIntent_tenantId_employeeId_status_idx" ON "EmployeeTerminationIntent"("tenantId", "employeeId", "status");
CREATE INDEX "EmployeeTerminationIntent_employeeId_createdAt_idx" ON "EmployeeTerminationIntent"("employeeId", "createdAt");
ALTER TABLE "EmployeeTerminationIntent" ADD CONSTRAINT "EmployeeTerminationIntent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeTerminationIntent" ADD CONSTRAINT "EmployeeTerminationIntent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
