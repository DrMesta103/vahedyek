-- AlterTable: add isSystem, remove account-level token pricing
ALTER TABLE "AiProviderAccount" ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AiProviderAccount" DROP COLUMN "inputTokenPriceUsd";
ALTER TABLE "AiProviderAccount" DROP COLUMN "outputTokenPriceUsd";

-- AlterTable: add isSystem to models
ALTER TABLE "AiProviderModel" ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- Mark existing seed accounts as system
UPDATE "AiProviderAccount"
SET "isSystem" = true
WHERE "id" IN ('seed-openai', 'seed-deepseek', 'seed-gemini', 'seed-grok');

-- Index for system provider lookups
CREATE INDEX "AiProviderAccount_isSystem_idx" ON "AiProviderAccount"("isSystem");
