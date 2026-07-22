-- Add the optional Employee -> UserTenantMembership relation without changing existing employees.
ALTER TABLE "Employee"
ADD COLUMN "userTenantMembershipId" TEXT;

CREATE UNIQUE INDEX "Employee_userTenantMembershipId_key"
ON "Employee"("userTenantMembershipId");

CREATE UNIQUE INDEX "Employee_tenantId_personnelCode_key"
ON "Employee"("tenantId", "personnelCode");

ALTER TABLE "Employee"
ADD CONSTRAINT "Employee_userTenantMembershipId_fkey"
FOREIGN KEY ("userTenantMembershipId") REFERENCES "UserTenantMembership"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
