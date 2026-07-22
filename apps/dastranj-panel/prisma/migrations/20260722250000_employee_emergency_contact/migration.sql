CREATE TABLE "EmployeeEmergencyContact" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "relation" TEXT NOT NULL,
  "mobile" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeEmergencyContact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmployeeEmergencyContact_tenantId_employeeId_idx"
ON "EmployeeEmergencyContact"("tenantId", "employeeId");

ALTER TABLE "EmployeeEmergencyContact"
ADD CONSTRAINT "EmployeeEmergencyContact_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeEmergencyContact"
ADD CONSTRAINT "EmployeeEmergencyContact_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
