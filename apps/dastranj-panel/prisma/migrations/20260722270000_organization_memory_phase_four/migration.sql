-- Additive organizational-memory foundation. Existing business records are not
-- backfilled because synthetic history is explicitly forbidden.
CREATE TABLE "OrganizationEvent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "organizationUnitId" TEXT,
  "positionId" TEXT,
  "entityType" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "effectiveAt" TIMESTAMP(3),
  "previousValue" JSONB,
  "newValue" JSONB,
  "actorUserId" TEXT,
  "actorRole" TEXT,
  "reason" TEXT,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "documentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrganizationEvent_tenantId_organizationUnitId_occurredAt_idx" ON "OrganizationEvent"("tenantId", "organizationUnitId", "occurredAt");
CREATE INDEX "OrganizationEvent_tenantId_positionId_occurredAt_idx" ON "OrganizationEvent"("tenantId", "positionId", "occurredAt");
CREATE INDEX "OrganizationEvent_tenantId_eventType_occurredAt_idx" ON "OrganizationEvent"("tenantId", "eventType", "occurredAt");
CREATE INDEX "OrganizationEvent_tenantId_actorUserId_occurredAt_idx" ON "OrganizationEvent"("tenantId", "actorUserId", "occurredAt");
ALTER TABLE "OrganizationEvent" ADD CONSTRAINT "OrganizationEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationEvent" ADD CONSTRAINT "OrganizationEvent_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationEvent" ADD CONSTRAINT "OrganizationEvent_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
