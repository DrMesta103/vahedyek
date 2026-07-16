-- AlterTable
ALTER TABLE "AiProviderModel" ADD COLUMN "brandTag" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModel_modelType_brandTag_active_key"
ON "AiProviderModel" ("modelType", "brandTag")
WHERE "brandTag" IS NOT NULL AND "isActive" = true;
