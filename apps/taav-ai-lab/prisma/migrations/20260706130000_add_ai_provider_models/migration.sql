-- CreateTable
CREATE TABLE "AiProviderModel" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "providerModelName" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "pricingUnit" TEXT NOT NULL,
    "inputTokenPriceUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "outputTokenPriceUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "requestPriceUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "pagePriceUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "imagePriceUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "minutePriceUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "supportsPersian" BOOLEAN NOT NULL DEFAULT false,
    "supportsEnglish" BOOLEAN NOT NULL DEFAULT false,
    "supportsVision" BOOLEAN NOT NULL DEFAULT false,
    "supportsPdf" BOOLEAN NOT NULL DEFAULT false,
    "supportsImage" BOOLEAN NOT NULL DEFAULT false,
    "supportsStructuredExtraction" BOOLEAN NOT NULL DEFAULT false,
    "supportsEmbedding" BOOLEAN NOT NULL DEFAULT false,
    "supportsFunctionCalling" BOOLEAN NOT NULL DEFAULT false,
    "maxInputTokens" INTEGER,
    "maxOutputTokens" INTEGER,
    "isDefaultForChat" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultForOcr" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultForEmbedding" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultForVision" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiProviderModel_accountId_idx" ON "AiProviderModel"("accountId");

-- CreateIndex
CREATE INDEX "AiProviderModel_accountId_isActive_idx" ON "AiProviderModel"("accountId", "isActive");

-- CreateIndex
CREATE INDEX "AiProviderModel_updatedAt_idx" ON "AiProviderModel"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModel_accountId_providerModelName_key" ON "AiProviderModel"("accountId", "providerModelName");

-- AddForeignKey
ALTER TABLE "AiProviderModel" ADD CONSTRAINT "AiProviderModel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "AiProviderAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
