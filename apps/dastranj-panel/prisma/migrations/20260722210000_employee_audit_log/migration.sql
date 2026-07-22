-- Minimal, employee-scoped audit history. Employee records are protected from normal hard-delete flows.
CREATE TABLE "EmployeeAuditLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "fieldKey" TEXT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "actorUserId" TEXT,
  "actorRole" TEXT,
  "source" TEXT NOT NULL DEFAULT 'panel',
  "otpVerified" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmployeeAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeAuditLog_tenantId_employeeId_createdAt_idx"
ON "EmployeeAuditLog"("tenantId", "employeeId", "createdAt");

CREATE INDEX "EmployeeAuditLog_employeeId_createdAt_idx"
ON "EmployeeAuditLog"("employeeId", "createdAt");

ALTER TABLE "EmployeeAuditLog"
ADD CONSTRAINT "EmployeeAuditLog_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeAuditLog"
ADD CONSTRAINT "EmployeeAuditLog_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
