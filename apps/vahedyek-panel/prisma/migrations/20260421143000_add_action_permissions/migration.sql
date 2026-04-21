-- Add action-based tenant role permissions without dropping the legacy menu table.
CREATE TABLE IF NOT EXISTS "TenantRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantRolePermission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TenantRolePermission_roleId_idx" ON "TenantRolePermission"("roleId");
CREATE INDEX IF NOT EXISTS "TenantRolePermission_permissionKey_idx" ON "TenantRolePermission"("permissionKey");
CREATE UNIQUE INDEX IF NOT EXISTS "TenantRolePermission_roleId_permissionKey_key" ON "TenantRolePermission"("roleId", "permissionKey");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'TenantRolePermission_roleId_fkey'
  ) THEN
    ALTER TABLE "TenantRolePermission"
    ADD CONSTRAINT "TenantRolePermission_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Best-effort migration from legacy menu grants to action permission keys.
INSERT INTO "TenantRolePermission" ("id", "roleId", "permissionKey", "createdAt")
SELECT
  concat('trp_', md5(random()::text || clock_timestamp()::text || legacy."roleId" || legacy."menuItemId")),
  legacy."roleId",
  CASE legacy."menuItemId"
    WHEN 'business' THEN 'business.profile.view'
    WHEN 'complex' THEN 'complex.view'
    WHEN 'contracts' THEN 'contracts.view'
    WHEN 'settings' THEN 'platform.settings.view'
    WHEN 'employees' THEN 'platform.users.view'
    WHEN 'reports' THEN 'platform.reports.view'
    ELSE concat('legacy.menu.', legacy."menuItemId")
  END,
  CURRENT_TIMESTAMP
FROM "TenantRoleMenuPermission" legacy
WHERE EXISTS (
  SELECT 1 FROM "TenantRole" role WHERE role."id" = legacy."roleId"
)
ON CONFLICT ("roleId", "permissionKey") DO NOTHING;
