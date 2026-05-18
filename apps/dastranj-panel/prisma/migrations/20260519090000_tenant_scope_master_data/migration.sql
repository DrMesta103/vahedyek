ALTER TABLE "OrganizationUnit" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "RequestReason" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ShiftTemplate" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "DraftTemplate" ADD COLUMN "tenantId" TEXT;

CREATE INDEX "OrganizationUnit_tenantId_idx" ON "OrganizationUnit"("tenantId");
CREATE INDEX "RequestReason_tenantId_idx" ON "RequestReason"("tenantId");
CREATE INDEX "ShiftTemplate_tenantId_idx" ON "ShiftTemplate"("tenantId");
CREATE INDEX "DraftTemplate_tenantId_idx" ON "DraftTemplate"("tenantId");

ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequestReason" ADD CONSTRAINT "RequestReason_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftTemplate" ADD CONSTRAINT "ShiftTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DraftTemplate" ADD CONSTRAINT "DraftTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
