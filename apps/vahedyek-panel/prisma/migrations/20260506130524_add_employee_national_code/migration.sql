ALTER TABLE "Employee" ADD COLUMN "nationalCode" TEXT;

CREATE UNIQUE INDEX "Employee_tenantId_nationalCode_key" ON "Employee"("tenantId", "nationalCode");
