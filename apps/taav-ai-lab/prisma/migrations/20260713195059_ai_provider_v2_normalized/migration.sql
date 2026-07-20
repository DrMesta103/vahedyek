-- CreateEnum
CREATE TYPE "AiProviderTypeV2" AS ENUM ('OpenAi', 'AzureOpenAi', 'GoogleGemini', 'DeepSeek', 'Grok', 'OpenRouter');

-- CreateEnum
CREATE TYPE "AiProviderAccountTransactionTypeV2" AS ENUM ('Purchase', 'ManualAdjustment');

-- CreateEnum
CREATE TYPE "AiProviderModelTypeV2" AS ENUM ('TextGeneration', 'Embedding', 'Reranking', 'SpeechToText', 'TextToSpeech', 'ImageGeneration', 'DocumentExtraction', 'Moderation');

-- CreateEnum
CREATE TYPE "AiProviderModelCapabilityTypeV2" AS ENUM ('TextInput', 'ImageInput', 'AudioInput', 'VideoInput', 'FileInput', 'TextOutput', 'ImageOutput', 'AudioOutput', 'Streaming', 'ToolCalling', 'StructuredOutput');

-- CreateEnum
CREATE TYPE "AiProviderUsageMetricTypeV2" AS ENUM ('InputToken', 'CachedInputToken', 'OutputToken', 'Image', 'Audio', 'Video', 'DocumentPage', 'Request', 'Character');

-- CreateEnum
CREATE TYPE "AiProviderUsageUnitTypeV2" AS ENUM ('Token', 'Item', 'Second', 'Minute', 'Page', 'Request', 'Character');

-- CreateEnum
CREATE TYPE "AiProviderModelUsageStatusV2" AS ENUM ('Succeeded', 'Failed', 'Canceled');

-- CreateTable
CREATE TABLE "AiProviderAccountV2" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" "AiProviderTypeV2" NOT NULL,
    "encryptedApiKey" TEXT NOT NULL,
    "apiKeyMasked" TEXT NOT NULL,
    "endpoint" TEXT,
    "apiVersion" TEXT,
    "billingEmail" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "apiKeyUpdatedAt" TIMESTAMP(3) NOT NULL,
    "apiKeyUpdatedBy" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderAccountV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderAccountTransactionV2" (
    "id" TEXT NOT NULL,
    "aiProviderAccountId" TEXT NOT NULL,
    "transactionType" "AiProviderAccountTransactionTypeV2" NOT NULL,
    "amountUsd" DECIMAL(28,12) NOT NULL,
    "amountToman" BIGINT NOT NULL,
    "transactionAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderAccountTransactionV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderModelV2" (
    "id" TEXT NOT NULL,
    "aiProviderAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerModelId" TEXT NOT NULL,
    "modelType" "AiProviderModelTypeV2" NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderModelV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderModelCapabilityV2" (
    "id" TEXT NOT NULL,
    "aiProviderModelId" TEXT NOT NULL,
    "capabilityType" "AiProviderModelCapabilityTypeV2" NOT NULL,

    CONSTRAINT "AiProviderModelCapabilityV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderModelPricingV2" (
    "id" TEXT NOT NULL,
    "aiProviderModelId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "endedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderModelPricingV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderModelPriceItemV2" (
    "id" TEXT NOT NULL,
    "aiProviderModelPricingId" TEXT NOT NULL,
    "usageMetricType" "AiProviderUsageMetricTypeV2" NOT NULL,
    "usageUnitType" "AiProviderUsageUnitTypeV2" NOT NULL,
    "unitQuantity" DECIMAL(28,12) NOT NULL,
    "priceUsd" DECIMAL(28,12) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AiProviderModelPriceItemV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderModelUsageV2" (
    "id" TEXT NOT NULL,
    "aiProviderModelId" TEXT NOT NULL,
    "usageReferenceId" TEXT NOT NULL,
    "consumerCode" TEXT NOT NULL,
    "operationCode" TEXT NOT NULL,
    "tenantId" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "status" "AiProviderModelUsageStatusV2" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "durationMilliseconds" BIGINT NOT NULL,
    "aiProviderModelPricingId" TEXT,
    "totalCostUsd" DECIMAL(28,12) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderModelUsageV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderModelUsageItemV2" (
    "id" TEXT NOT NULL,
    "aiProviderModelUsageId" TEXT NOT NULL,
    "aiProviderModelPriceItemId" TEXT NOT NULL,
    "usageMetricType" "AiProviderUsageMetricTypeV2" NOT NULL,
    "usageUnitType" "AiProviderUsageUnitTypeV2" NOT NULL,
    "usageQuantity" DECIMAL(28,12) NOT NULL,
    "appliedUnitQuantity" DECIMAL(28,12) NOT NULL,
    "appliedPriceUsd" DECIMAL(28,12) NOT NULL,
    "calculatedCostUsd" DECIMAL(28,12) NOT NULL,

    CONSTRAINT "AiProviderModelUsageItemV2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderAccountV2_providerType_key" ON "AiProviderAccountV2"("providerType");

-- CreateIndex
CREATE INDEX "AiProviderAccountV2_providerType_idx" ON "AiProviderAccountV2"("providerType");

-- CreateIndex
CREATE INDEX "AiProviderAccountV2_isActive_idx" ON "AiProviderAccountV2"("isActive");

-- CreateIndex
CREATE INDEX "AiProviderAccountV2_isSystem_idx" ON "AiProviderAccountV2"("isSystem");

-- CreateIndex
CREATE INDEX "AiProviderAccountV2_updatedAt_idx" ON "AiProviderAccountV2"("updatedAt");

-- CreateIndex
CREATE INDEX "AiProviderAccountTransactionV2_aiProviderAccountId_transact_idx" ON "AiProviderAccountTransactionV2"("aiProviderAccountId", "transactionAt");

-- CreateIndex
CREATE INDEX "AiProviderAccountTransactionV2_aiProviderAccountId_isDelete_idx" ON "AiProviderAccountTransactionV2"("aiProviderAccountId", "isDeleted");

-- CreateIndex
CREATE INDEX "AiProviderModelV2_aiProviderAccountId_isActive_idx" ON "AiProviderModelV2"("aiProviderAccountId", "isActive");

-- CreateIndex
CREATE INDEX "AiProviderModelV2_updatedAt_idx" ON "AiProviderModelV2"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModelV2_aiProviderAccountId_providerModelId_key" ON "AiProviderModelV2"("aiProviderAccountId", "providerModelId");

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModelCapabilityV2_aiProviderModelId_capabilityTyp_key" ON "AiProviderModelCapabilityV2"("aiProviderModelId", "capabilityType");

-- CreateIndex
CREATE INDEX "AiProviderModelPricingV2_aiProviderModelId_effectiveFrom_ef_idx" ON "AiProviderModelPricingV2"("aiProviderModelId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "AiProviderModelPriceItemV2_aiProviderModelPricingId_idx" ON "AiProviderModelPriceItemV2"("aiProviderModelPricingId");

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModelPriceItemV2_aiProviderModelPricingId_usageMe_key" ON "AiProviderModelPriceItemV2"("aiProviderModelPricingId", "usageMetricType", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModelUsageV2_usageReferenceId_key" ON "AiProviderModelUsageV2"("usageReferenceId");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageV2_aiProviderModelId_startedAt_idx" ON "AiProviderModelUsageV2"("aiProviderModelId", "startedAt");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageV2_consumerCode_startedAt_idx" ON "AiProviderModelUsageV2"("consumerCode", "startedAt");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageV2_operationCode_startedAt_idx" ON "AiProviderModelUsageV2"("operationCode", "startedAt");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageV2_tenantId_startedAt_idx" ON "AiProviderModelUsageV2"("tenantId", "startedAt");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageV2_resourceType_resourceId_idx" ON "AiProviderModelUsageV2"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageV2_status_startedAt_idx" ON "AiProviderModelUsageV2"("status", "startedAt");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageItemV2_aiProviderModelUsageId_idx" ON "AiProviderModelUsageItemV2"("aiProviderModelUsageId");

-- CreateIndex
CREATE INDEX "AiProviderModelUsageItemV2_usageMetricType_idx" ON "AiProviderModelUsageItemV2"("usageMetricType");

-- AddForeignKey
ALTER TABLE "AiProviderAccountTransactionV2" ADD CONSTRAINT "AiProviderAccountTransactionV2_aiProviderAccountId_fkey" FOREIGN KEY ("aiProviderAccountId") REFERENCES "AiProviderAccountV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelV2" ADD CONSTRAINT "AiProviderModelV2_aiProviderAccountId_fkey" FOREIGN KEY ("aiProviderAccountId") REFERENCES "AiProviderAccountV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelCapabilityV2" ADD CONSTRAINT "AiProviderModelCapabilityV2_aiProviderModelId_fkey" FOREIGN KEY ("aiProviderModelId") REFERENCES "AiProviderModelV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelPricingV2" ADD CONSTRAINT "AiProviderModelPricingV2_aiProviderModelId_fkey" FOREIGN KEY ("aiProviderModelId") REFERENCES "AiProviderModelV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelPriceItemV2" ADD CONSTRAINT "AiProviderModelPriceItemV2_aiProviderModelPricingId_fkey" FOREIGN KEY ("aiProviderModelPricingId") REFERENCES "AiProviderModelPricingV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelUsageV2" ADD CONSTRAINT "AiProviderModelUsageV2_aiProviderModelId_fkey" FOREIGN KEY ("aiProviderModelId") REFERENCES "AiProviderModelV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelUsageV2" ADD CONSTRAINT "AiProviderModelUsageV2_aiProviderModelPricingId_fkey" FOREIGN KEY ("aiProviderModelPricingId") REFERENCES "AiProviderModelPricingV2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelUsageItemV2" ADD CONSTRAINT "AiProviderModelUsageItemV2_aiProviderModelUsageId_fkey" FOREIGN KEY ("aiProviderModelUsageId") REFERENCES "AiProviderModelUsageV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderModelUsageItemV2" ADD CONSTRAINT "AiProviderModelUsageItemV2_aiProviderModelPriceItemId_fkey" FOREIGN KEY ("aiProviderModelPriceItemId") REFERENCES "AiProviderModelPriceItemV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
