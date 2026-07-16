CREATE TYPE "TaaviaBrandStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "TaaviaBrandSetupMode" AS ENUM ('NOT_SELECTED', 'MANUAL', 'AI_ASSISTED');
CREATE TYPE "TaaviaBrandAiModelPurpose" AS ENUM ('NONE', 'ADMIN_AGENT_CHAT', 'CUSTOMER_CHAT', 'KNOWLEDGE_BASE_CONTENT_GENERATION', 'OCR', 'EMBEDDING', 'RERANKING', 'SPEECH_TO_TEXT', 'TEXT_TO_SPEECH', 'VISION_ANALYSIS');
CREATE TYPE "TaaviaBrandAiModelUsageStatus" AS ENUM ('NONE', 'SUCCEEDED', 'FAILED', 'CANCELED');
CREATE TYPE "TaaviaAiUsageMetricType" AS ENUM ('NONE', 'INPUT_TOKEN', 'CACHED_INPUT_TOKEN', 'OUTPUT_TOKEN', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT_PAGE', 'REQUEST', 'CHARACTER');
CREATE TYPE "TaaviaAiUsageUnitType" AS ENUM ('NONE', 'TOKEN', 'ITEM', 'SECOND', 'MINUTE', 'PAGE', 'REQUEST', 'CHARACTER');

ALTER TABLE "TaaviaBrand" ADD COLUMN "description" TEXT;
ALTER TABLE "TaaviaBrand" ADD COLUMN "mediaAssetId" TEXT;
ALTER TABLE "TaaviaBrand" ADD COLUMN "status" "TaaviaBrandStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "TaaviaBrand" ADD COLUMN "setupMode" "TaaviaBrandSetupMode" NOT NULL DEFAULT 'NOT_SELECTED';
UPDATE "TaaviaBrand" SET "status" = CASE WHEN "isActive" = true THEN 'ACTIVE'::"TaaviaBrandStatus" ELSE 'ARCHIVED'::"TaaviaBrandStatus" END;
ALTER TABLE "TaaviaBrand" DROP COLUMN "isActive";

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "extension" TEXT,
    "sizeBytes" INTEGER,
    "previewData" TEXT,
    "storageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaaviaBrandAiModelAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "aiProviderAccountId" TEXT NOT NULL,
    "aiProviderModelId" TEXT NOT NULL,
    "purpose" "TaaviaBrandAiModelPurpose" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "assignedBy" TEXT NOT NULL,
    "endedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaaviaBrandAiModelAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiProviderModelAssignment" (
    "id" TEXT NOT NULL,
    "externalAssignmentId" TEXT NOT NULL,
    "consumerCode" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "aiProviderAccountId" TEXT NOT NULL,
    "aiProviderModelId" TEXT NOT NULL,
    "purposeCode" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "assignedBy" TEXT NOT NULL,
    "endedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiProviderModelAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationOutbox" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntegrationOutbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaaviaBrandAiModelUsage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "taaviaBrandAiModelAssignmentId" TEXT NOT NULL,
    "aiProviderAccountId" TEXT NOT NULL,
    "aiProviderModelId" TEXT NOT NULL,
    "purpose" "TaaviaBrandAiModelPurpose" NOT NULL,
    "usageReferenceId" TEXT NOT NULL,
    "operationCode" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "status" "TaaviaBrandAiModelUsageStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "durationMilliseconds" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaaviaBrandAiModelUsage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaaviaBrandAiModelUsageItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taaviaBrandAiModelUsageId" TEXT NOT NULL,
    "usageMetricType" "TaaviaAiUsageMetricType" NOT NULL,
    "usageUnitType" "TaaviaAiUsageUnitType" NOT NULL,
    "usageQuantity" DECIMAL(28,12) NOT NULL,
    CONSTRAINT "TaaviaBrandAiModelUsageItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TaaviaBrandAiModelAssignment_open_key" ON "TaaviaBrandAiModelAssignment" ("tenantId", "brandId", "purpose") WHERE "effectiveTo" IS NULL;
CREATE INDEX "TaaviaBrandAiModelAssignment_tenant_brand_purpose_idx" ON "TaaviaBrandAiModelAssignment" ("tenantId", "brandId", "purpose", "effectiveTo");
CREATE INDEX "TaaviaBrandAiModelAssignment_brand_effective_idx" ON "TaaviaBrandAiModelAssignment" ("brandId", "effectiveFrom");
CREATE INDEX "AiProviderModelAssignment_resource_idx" ON "AiProviderModelAssignment" ("consumerCode", "resourceType", "resourceId", "purposeCode", "effectiveTo");
CREATE UNIQUE INDEX "AiProviderModelAssignment_externalAssignmentId_key" ON "AiProviderModelAssignment" ("externalAssignmentId");
CREATE INDEX "IntegrationOutbox_processing_idx" ON "IntegrationOutbox" ("processedAt", "createdAt");
CREATE UNIQUE INDEX "TaaviaBrandAiModelUsage_usageReferenceId_key" ON "TaaviaBrandAiModelUsage" ("usageReferenceId");
CREATE UNIQUE INDEX "TaaviaBrandAiModelUsageItem_usage_key" ON "TaaviaBrandAiModelUsageItem" ("taaviaBrandAiModelUsageId", "usageMetricType");
CREATE INDEX "TaaviaBrandAiModelUsage_tenant_started_idx" ON "TaaviaBrandAiModelUsage" ("tenantId", "startedAt");
CREATE INDEX "TaaviaBrandAiModelUsage_brand_started_idx" ON "TaaviaBrandAiModelUsage" ("brandId", "startedAt");

ALTER TABLE "TaaviaBrand" ADD CONSTRAINT "TaaviaBrand_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelAssignment" ADD CONSTRAINT "TaaviaBrandAiModelAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelAssignment" ADD CONSTRAINT "TaaviaBrandAiModelAssignment_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelAssignment" ADD CONSTRAINT "TaaviaBrandAiModelAssignment_account_fkey" FOREIGN KEY ("aiProviderAccountId") REFERENCES "AiProviderAccountV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelAssignment" ADD CONSTRAINT "TaaviaBrandAiModelAssignment_model_fkey" FOREIGN KEY ("aiProviderModelId") REFERENCES "AiProviderModelV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiProviderModelAssignment" ADD CONSTRAINT "AiProviderModelAssignment_external_fkey" FOREIGN KEY ("externalAssignmentId") REFERENCES "TaaviaBrandAiModelAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelUsage" ADD CONSTRAINT "TaaviaBrandAiModelUsage_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelUsage" ADD CONSTRAINT "TaaviaBrandAiModelUsage_brand_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelUsage" ADD CONSTRAINT "TaaviaBrandAiModelUsage_assignment_fkey" FOREIGN KEY ("taaviaBrandAiModelAssignmentId") REFERENCES "TaaviaBrandAiModelAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelUsageItem" ADD CONSTRAINT "TaaviaBrandAiModelUsageItem_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandAiModelUsageItem" ADD CONSTRAINT "TaaviaBrandAiModelUsageItem_usage_fkey" FOREIGN KEY ("taaviaBrandAiModelUsageId") REFERENCES "TaaviaBrandAiModelUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
