ALTER TABLE "Tenant"
ADD COLUMN IF NOT EXISTS "projectUnitTypes" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS "projectReportData" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "projectTechnicalSpecs" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "projectAddressData" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "projectPhysicalProgressSchedules" JSONB NOT NULL DEFAULT '[]'::jsonb;
