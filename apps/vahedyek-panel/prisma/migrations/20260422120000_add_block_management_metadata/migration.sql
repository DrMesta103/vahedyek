ALTER TABLE "Block"
ADD COLUMN IF NOT EXISTS "mainPlate" TEXT,
ADD COLUMN IF NOT EXISTS "subPlate" TEXT,
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'incomplete',
ADD COLUMN IF NOT EXISTS "usageCounts" JSONB NOT NULL DEFAULT '{"residential":0,"commercial":0,"office":0,"parking":0,"storage":0,"amenity":0}'::jsonb;

UPDATE "Block"
SET
  "status" = COALESCE("status", 'incomplete'),
  "usageCounts" = COALESCE("usageCounts", '{"residential":0,"commercial":0,"office":0,"parking":0,"storage":0,"amenity":0}'::jsonb);
