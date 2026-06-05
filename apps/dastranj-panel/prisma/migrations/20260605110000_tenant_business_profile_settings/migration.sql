CREATE TABLE IF NOT EXISTS "TenantBusinessProfileSettings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "profilePayload" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TenantBusinessProfileSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TenantBusinessProfileSettings_tenantId_key" ON "TenantBusinessProfileSettings"("tenantId");
CREATE INDEX IF NOT EXISTS "TenantBusinessProfileSettings_tenantId_idx" ON "TenantBusinessProfileSettings"("tenantId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'TenantBusinessProfileSettings_tenantId_fkey'
  ) THEN
    ALTER TABLE "TenantBusinessProfileSettings"
    ADD CONSTRAINT "TenantBusinessProfileSettings_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
