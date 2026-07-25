ALTER TYPE "TaaviaKnowledgeBaseBuildStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "TaaviaKnowledgeBaseBuildStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "TaaviaKnowledgeBaseBuildStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE "TaaviaKnowledgeBaseBuildStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "TaaviaKnowledgeBase"
  ADD COLUMN "activatedAt" TIMESTAMP(3),
  ADD COLUMN "activatedByUserId" TEXT,
  ADD COLUMN "createdByUserId" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "versionLabel" TEXT NOT NULL DEFAULT '';
UPDATE "TaaviaKnowledgeBase" SET "versionLabel" = 'v' || "versionNumber" WHERE "versionLabel" = '';

ALTER TABLE "TaaviaKnowledgeBaseBuild"
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "createdByUserId" TEXT,
  ADD COLUMN "failedAt" TIMESTAMP(3),
  ADD COLUMN "failureCode" TEXT,
  ADD COLUMN "failureMessage" TEXT;
-- Keep the existing committed enum default during this compatibility migration.
ALTER TABLE "TaaviaKnowledgeBaseBuild" ALTER COLUMN "status" SET DEFAULT 'SUCCEEDED';

ALTER TABLE "TaaviaKnowledgeCategorySourceReference"
  ADD COLUMN "brandId" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "knowledgeBaseId" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT '';
UPDATE "TaaviaKnowledgeCategorySourceReference" ref
SET "tenantId" = category."tenantId", "brandId" = category."brandId", "knowledgeBaseId" = category."knowledgeBaseId"
FROM "TaaviaKnowledgeCategory" category WHERE category.id = ref."categoryId";

ALTER TABLE "TaaviaKnowledgeSourceSnapshot"
  DROP COLUMN "fileSize",
  ADD COLUMN "buildId" TEXT,
  ADD COLUMN "contentHash" TEXT,
  ADD COLUMN "fileName" TEXT,
  ADD COLUMN "fileSizeBytes" INTEGER,
  ADD COLUMN "mediaAssetId" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "originalSourceId" TEXT,
  ADD COLUMN "snapshotCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "sourceGroup" TEXT NOT NULL DEFAULT 'brand_info';
UPDATE "TaaviaKnowledgeSourceSnapshot" SET "snapshotCreatedAt" = "createdAt";

DROP INDEX "TaaviaKnowledgeSourceSnapshot_tenantId_brandId_originalBran_idx";
CREATE INDEX "TaaviaKnowledgeSourceSnapshot_tenantId_brandId_originalSour_idx" ON "TaaviaKnowledgeSourceSnapshot"("tenantId", "brandId", "originalSourceId");
CREATE UNIQUE INDEX "TaaviaKnowledgeBase_one_active_per_brand" ON "TaaviaKnowledgeBase"("tenantId", "brandId") WHERE "isActive";
ALTER TABLE "TaaviaKnowledgeCategory" ADD CONSTRAINT "TaaviaKnowledgeCategory_level_check" CHECK ("level" IN (1, 2));
