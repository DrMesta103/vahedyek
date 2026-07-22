ALTER TABLE "OrganizationUnit"
  ADD COLUMN "mission" TEXT,
  ADD COLUMN "mainResponsibilities" JSONB NOT NULL DEFAULT '[]';

CREATE TABLE "JobProfile" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "code" TEXT,
  "purpose" TEXT,
  "summary" TEXT,
  "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
  "revision" INTEGER NOT NULL DEFAULT 1,
  "mainTasks" JSONB NOT NULL DEFAULT '[]',
  "periodicTasks" JSONB NOT NULL DEFAULT '[]',
  "reportingResponsibilities" JSONB NOT NULL DEFAULT '[]',
  "expectedOutputs" JSONB NOT NULL DEFAULT '[]',
  "internalRelations" JSONB NOT NULL DEFAULT '[]',
  "externalRelations" JSONB NOT NULL DEFAULT '[]',
  "suggestedKpis" JSONB NOT NULL DEFAULT '[]',
  "suggestedWorkLocation" TEXT,
  "workEnvironment" TEXT,
  "considerations" TEXT,
  "minimumEducation" TEXT,
  "relatedFields" JSONB NOT NULL DEFAULT '[]',
  "minimumExperienceMonths" INTEGER,
  "experienceLevel" TEXT,
  "technicalSkills" JSONB NOT NULL DEFAULT '[]',
  "softSkills" JSONB NOT NULL DEFAULT '[]',
  "certifications" JSONB NOT NULL DEFAULT '[]',
  "requiredSoftware" JSONB NOT NULL DEFAULT '[]',
  "languages" JSONB NOT NULL DEFAULT '[]',
  "travelRequired" BOOLEAN,
  "workplaceConditions" TEXT,
  "specialRequirements" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobProfile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Position"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "jobProfileId" TEXT,
  ADD COLUMN "reportsToPositionId" TEXT;

-- Refuse normalized title uniqueness when legacy conflicts exist; never rewrite data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Position"
    GROUP BY "organizationUnitId", lower(btrim("title"))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505',
      MESSAGE = 'Normalized position title conflicts must be resolved before this migration can run.';
  END IF;
END $$;

CREATE UNIQUE INDEX "Position_unit_title_normalized_key"
  ON "Position" ("organizationUnitId", lower(btrim("title")));
CREATE UNIQUE INDEX "JobProfile_tenantId_code_key" ON "JobProfile"("tenantId", "code");
CREATE INDEX "JobProfile_tenantId_status_idx" ON "JobProfile"("tenantId", "status");
CREATE INDEX "Position_jobProfileId_idx" ON "Position"("jobProfileId");
CREATE INDEX "Position_reportsToPositionId_idx" ON "Position"("reportsToPositionId");

ALTER TABLE "JobProfile" ADD CONSTRAINT "JobProfile_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_jobProfileId_fkey"
  FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_reportsToPositionId_fkey"
  FOREIGN KEY ("reportsToPositionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
