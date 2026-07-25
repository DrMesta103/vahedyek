-- CreateEnum
CREATE TYPE "TaaviaKnowledgeBaseBuildType" AS ENUM ('INITIAL', 'UPDATE', 'FULL_REBUILD');

-- CreateEnum
CREATE TYPE "TaaviaKnowledgeBaseBuildStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'RUNNING');

-- CreateEnum
CREATE TYPE "TaaviaKnowledgeSnapshotType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'LINK', 'PRODUCT', 'FAQ');

-- AlterTable
ALTER TABLE "TaaviaBrand" ALTER COLUMN "createdByUserId" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TaaviaBrandInfo" ALTER COLUMN "contentHash" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "TaaviaKnowledgeBase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "buildType" "TaaviaKnowledgeBaseBuildType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaaviaKnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaaviaKnowledgeBaseBuild" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "status" "TaaviaKnowledgeBaseBuildStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "buildType" "TaaviaKnowledgeBaseBuildType" NOT NULL,
    "description" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TaaviaKnowledgeBaseBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaaviaKnowledgeSourceSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "originalBrandInfoId" TEXT,
    "sourceType" "TaaviaKnowledgeSnapshotType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "previewUrl" TEXT,
    "extractedText" TEXT,
    "extractedWordCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaaviaKnowledgeSourceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaaviaKnowledgeCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "parentCategoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaaviaKnowledgeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaaviaKnowledgeCategorySourceReference" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaaviaKnowledgeCategorySourceReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaaviaKnowledgeBase_tenantId_brandId_isActive_idx" ON "TaaviaKnowledgeBase"("tenantId", "brandId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TaaviaKnowledgeBase_brandId_versionNumber_key" ON "TaaviaKnowledgeBase"("brandId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TaaviaKnowledgeBaseBuild_knowledgeBaseId_key" ON "TaaviaKnowledgeBaseBuild"("knowledgeBaseId");

-- CreateIndex
CREATE INDEX "TaaviaKnowledgeBaseBuild_tenantId_brandId_startedAt_idx" ON "TaaviaKnowledgeBaseBuild"("tenantId", "brandId", "startedAt");

-- CreateIndex
CREATE INDEX "TaaviaKnowledgeSourceSnapshot_tenantId_brandId_knowledgeBas_idx" ON "TaaviaKnowledgeSourceSnapshot"("tenantId", "brandId", "knowledgeBaseId");

-- CreateIndex
CREATE INDEX "TaaviaKnowledgeSourceSnapshot_tenantId_brandId_originalBran_idx" ON "TaaviaKnowledgeSourceSnapshot"("tenantId", "brandId", "originalBrandInfoId");

-- CreateIndex
CREATE INDEX "TaaviaKnowledgeCategory_tenantId_brandId_knowledgeBaseId_le_idx" ON "TaaviaKnowledgeCategory"("tenantId", "brandId", "knowledgeBaseId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "TaaviaKnowledgeCategory_knowledgeBaseId_slug_key" ON "TaaviaKnowledgeCategory"("knowledgeBaseId", "slug");

-- CreateIndex
CREATE INDEX "TaaviaKnowledgeCategorySourceReference_snapshotId_idx" ON "TaaviaKnowledgeCategorySourceReference"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "TaaviaKnowledgeCategorySourceReference_categoryId_snapshotI_key" ON "TaaviaKnowledgeCategorySourceReference"("categoryId", "snapshotId");

-- CreateIndex
CREATE INDEX "AiProviderModelAssignment_tenantId_resourceId_idx" ON "AiProviderModelAssignment"("tenantId", "resourceId");

-- CreateIndex
CREATE INDEX "IntegrationOutbox_eventType_aggregateId_idx" ON "IntegrationOutbox"("eventType", "aggregateId");

-- CreateIndex
CREATE INDEX "TaaviaBrand_tenantId_status_idx" ON "TaaviaBrand"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TaaviaBrandAiModelAssignment_aiProviderAccountId_idx" ON "TaaviaBrandAiModelAssignment"("aiProviderAccountId");

-- CreateIndex
CREATE INDEX "TaaviaBrandAiModelAssignment_aiProviderModelId_idx" ON "TaaviaBrandAiModelAssignment"("aiProviderModelId");

-- CreateIndex
CREATE INDEX "TaaviaBrandAiModelUsage_purpose_startedAt_idx" ON "TaaviaBrandAiModelUsage"("purpose", "startedAt");

-- CreateIndex
CREATE INDEX "TaaviaBrandAiModelUsageItem_tenantId_usageMetricType_idx" ON "TaaviaBrandAiModelUsageItem"("tenantId", "usageMetricType");

-- RenameForeignKey
ALTER TABLE "AiProviderModelAssignment" RENAME CONSTRAINT "AiProviderModelAssignment_external_fkey" TO "AiProviderModelAssignment_externalAssignmentId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelAssignment" RENAME CONSTRAINT "TaaviaBrandAiModelAssignment_account_fkey" TO "TaaviaBrandAiModelAssignment_aiProviderAccountId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelAssignment" RENAME CONSTRAINT "TaaviaBrandAiModelAssignment_model_fkey" TO "TaaviaBrandAiModelAssignment_aiProviderModelId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelUsage" RENAME CONSTRAINT "TaaviaBrandAiModelUsage_assignment_fkey" TO "TaaviaBrandAiModelUsage_taaviaBrandAiModelAssignmentId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelUsage" RENAME CONSTRAINT "TaaviaBrandAiModelUsage_brand_fkey" TO "TaaviaBrandAiModelUsage_brandId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelUsage" RENAME CONSTRAINT "TaaviaBrandAiModelUsage_tenant_fkey" TO "TaaviaBrandAiModelUsage_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelUsageItem" RENAME CONSTRAINT "TaaviaBrandAiModelUsageItem_tenant_fkey" TO "TaaviaBrandAiModelUsageItem_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "TaaviaBrandAiModelUsageItem" RENAME CONSTRAINT "TaaviaBrandAiModelUsageItem_usage_fkey" TO "TaaviaBrandAiModelUsageItem_taaviaBrandAiModelUsageId_fkey";

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeBase" ADD CONSTRAINT "TaaviaKnowledgeBase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeBase" ADD CONSTRAINT "TaaviaKnowledgeBase_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeBaseBuild" ADD CONSTRAINT "TaaviaKnowledgeBaseBuild_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeBaseBuild" ADD CONSTRAINT "TaaviaKnowledgeBaseBuild_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeBaseBuild" ADD CONSTRAINT "TaaviaKnowledgeBaseBuild_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "TaaviaKnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeSourceSnapshot" ADD CONSTRAINT "TaaviaKnowledgeSourceSnapshot_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "TaaviaKnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeCategory" ADD CONSTRAINT "TaaviaKnowledgeCategory_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "TaaviaKnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeCategory" ADD CONSTRAINT "TaaviaKnowledgeCategory_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "TaaviaKnowledgeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeCategorySourceReference" ADD CONSTRAINT "TaaviaKnowledgeCategorySourceReference_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TaaviaKnowledgeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaaviaKnowledgeCategorySourceReference" ADD CONSTRAINT "TaaviaKnowledgeCategorySourceReference_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "TaaviaKnowledgeSourceSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "AiProviderModelAssignment_resource_idx" RENAME TO "AiProviderModelAssignment_consumerCode_resourceType_resourc_idx";

-- RenameIndex
ALTER INDEX "IntegrationOutbox_processing_idx" RENAME TO "IntegrationOutbox_processedAt_createdAt_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandAiModelAssignment_brand_effective_idx" RENAME TO "TaaviaBrandAiModelAssignment_brandId_effectiveFrom_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandAiModelAssignment_tenant_brand_purpose_idx" RENAME TO "TaaviaBrandAiModelAssignment_tenantId_brandId_purpose_effec_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandAiModelUsage_brand_started_idx" RENAME TO "TaaviaBrandAiModelUsage_brandId_startedAt_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandAiModelUsage_tenant_started_idx" RENAME TO "TaaviaBrandAiModelUsage_tenantId_startedAt_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandAiModelUsageItem_usage_key" RENAME TO "TaaviaBrandAiModelUsageItem_taaviaBrandAiModelUsageId_usage_key";

-- RenameIndex
ALTER INDEX "TaaviaBrandInfo_tenant_brand_hash_idx" RENAME TO "TaaviaBrandInfo_tenantId_brandId_contentHash_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandInfo_tenant_brand_status_order_idx" RENAME TO "TaaviaBrandInfo_tenantId_brandId_status_displayOrder_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandInfo_tenant_brand_type_status_idx" RENAME TO "TaaviaBrandInfo_tenantId_brandId_type_status_idx";

-- RenameIndex
ALTER INDEX "TaaviaBrandInfo_tenant_id_revision_idx" RENAME TO "TaaviaBrandInfo_tenantId_id_revision_idx";
