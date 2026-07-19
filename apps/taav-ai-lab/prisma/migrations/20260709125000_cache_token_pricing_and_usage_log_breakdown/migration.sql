-- Add cache token pricing to AiProviderModel.
ALTER TABLE "AiProviderModel"
ADD COLUMN "cacheReadTokenPriceUsd" DECIMAL(12, 6) NOT NULL DEFAULT 0;

ALTER TABLE "AiProviderModel"
ADD COLUMN "cacheWriteTokenPriceUsd" DECIMAL(12, 6) NOT NULL DEFAULT 0;

-- Add cache breakdown fields to AiUsageLog.
ALTER TABLE "AiUsageLog"
ADD COLUMN "cachedInputTokens" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "AiUsageLog"
ADD COLUMN "cacheWriteTokens" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "AiUsageLog"
ADD COLUMN "cacheReadCostUsd" DECIMAL(18, 8) NOT NULL DEFAULT 0;

ALTER TABLE "AiUsageLog"
ADD COLUMN "cacheWriteCostUsd" DECIMAL(18, 8) NOT NULL DEFAULT 0;

