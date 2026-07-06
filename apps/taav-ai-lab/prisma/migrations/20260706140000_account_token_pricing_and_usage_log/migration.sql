-- AlterTable
ALTER TABLE "AiProviderAccount"
ADD COLUMN "inputTokenPriceUsd" DECIMAL(18,12) NOT NULL DEFAULT 0,
ADD COLUMN "outputTokenPriceUsd" DECIMAL(18,12) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AiUsageLog" (
    "id" TEXT NOT NULL,
    "aiAccountId" TEXT NOT NULL,
    "tenantId" TEXT,
    "businessId" TEXT,
    "serviceName" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "requestId" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "inputCostUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "outputCostUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalCostUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsageLog_aiAccountId_createdAt_idx" ON "AiUsageLog"("aiAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageLog_tenantId_idx" ON "AiUsageLog"("tenantId");

-- CreateIndex
CREATE INDEX "AiUsageLog_businessId_idx" ON "AiUsageLog"("businessId");

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_aiAccountId_fkey" FOREIGN KEY ("aiAccountId") REFERENCES "AiProviderAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
