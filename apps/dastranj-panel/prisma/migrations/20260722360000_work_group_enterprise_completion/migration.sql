CREATE TYPE "WorkGroupLifecycleStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "WorkGroupMembershipStatus" AS ENUM ('ACTIVE', 'ENDED', 'FUTURE');
CREATE TYPE "WorkGroupContextType" AS ENUM ('POLICY', 'LOCATION');

ALTER TABLE "WorkGroup"
ADD COLUMN "normalizedTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN "status" "WorkGroupLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "disabledAt" TIMESTAMP(3),
ADD COLUMN "disabledReason" TEXT;

UPDATE "WorkGroup" SET "normalizedTitle" = lower(trim("title"));
WITH duplicates AS (
  SELECT "id", row_number() OVER (PARTITION BY "tenantId", "normalizedTitle" ORDER BY "createdAt", "id") AS occurrence
  FROM "WorkGroup"
)
UPDATE "WorkGroup" AS group_row
SET "normalizedTitle" = group_row."normalizedTitle" || '-' || group_row."id"
FROM duplicates
WHERE duplicates."id" = group_row."id" AND duplicates.occurrence > 1;

ALTER TABLE "WorkGroupMember"
ADD COLUMN "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "status" "WorkGroupMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "reason" TEXT,
ADD COLUMN "createdBy" TEXT;

UPDATE "WorkGroupMember"
SET "effectiveDate" = "joinedAt",
    "status" = CASE WHEN "isCurrent" THEN 'ACTIVE'::"WorkGroupMembershipStatus" ELSE 'ENDED'::"WorkGroupMembershipStatus" END;

ALTER TABLE "WorkGroupMember" DROP CONSTRAINT "WorkGroupMember_workGroupId_fkey";
ALTER TABLE "WorkGroupMember" ADD CONSTRAINT "WorkGroupMember_workGroupId_fkey"
FOREIGN KEY ("workGroupId") REFERENCES "WorkGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "WorkGroup_tenantId_normalizedTitle_key" ON "WorkGroup"("tenantId", "normalizedTitle");
CREATE INDEX "WorkGroup_tenantId_status_idx" ON "WorkGroup"("tenantId", "status");
CREATE INDEX "WorkGroupMember_employeeId_effectiveDate_idx" ON "WorkGroupMember"("employeeId", "effectiveDate");
CREATE UNIQUE INDEX "WorkGroupMember_employeeId_current_key" ON "WorkGroupMember"("employeeId") WHERE "isCurrent" = true;
ALTER TABLE "WorkGroupMember" ADD CONSTRAINT "WorkGroupMember_dates_check" CHECK ("leftAt" IS NULL OR "leftAt" >= "joinedAt");

CREATE TABLE "WorkGroupContextHistory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "workGroupId" TEXT NOT NULL,
  "type" "WorkGroupContextType" NOT NULL,
  "previousId" TEXT,
  "nextId" TEXT,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkGroupContextHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkGroupAuditLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "workGroupId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL DEFAULT 'WorkGroup',
  "entityId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "reason" TEXT,
  "effectiveDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkGroupAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkGroupContextHistory_tenantId_workGroupId_type_effectiveDate_idx" ON "WorkGroupContextHistory"("tenantId", "workGroupId", "type", "effectiveDate");
CREATE INDEX "WorkGroupAuditLog_tenantId_workGroupId_createdAt_idx" ON "WorkGroupAuditLog"("tenantId", "workGroupId", "createdAt");
CREATE INDEX "WorkGroupAuditLog_entity_entityId_idx" ON "WorkGroupAuditLog"("entity", "entityId");

ALTER TABLE "WorkGroupContextHistory" ADD CONSTRAINT "WorkGroupContextHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkGroupContextHistory" ADD CONSTRAINT "WorkGroupContextHistory_workGroupId_fkey" FOREIGN KEY ("workGroupId") REFERENCES "WorkGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkGroupAuditLog" ADD CONSTRAINT "WorkGroupAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkGroupAuditLog" ADD CONSTRAINT "WorkGroupAuditLog_workGroupId_fkey" FOREIGN KEY ("workGroupId") REFERENCES "WorkGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Bootstrap without role-name checks: mirror established organization permissions.
INSERT INTO "TenantRolePermission" ("id", "roleId", "permissionKey", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text), source."roleId", mapping.target, CURRENT_TIMESTAMP
FROM "TenantRolePermission" source
JOIN (VALUES
  ('organization_units.view', 'work_groups.view'),
  ('organization_units.create', 'work_groups.create'),
  ('organization_units.update', 'work_groups.edit'),
  ('organization_units.update', 'work_groups.members.manage'),
  ('organization_units.update', 'work_groups.policy.change'),
  ('organization_units.update', 'work_groups.location.change'),
  ('organization_units.delete', 'work_groups.disable')
) AS mapping(source, target) ON mapping.source = source."permissionKey"
ON CONFLICT ("roleId", "permissionKey") DO NOTHING;
