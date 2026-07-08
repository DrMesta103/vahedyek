-- CreateTable
CREATE TABLE "AiProviderAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKeyCipherText" TEXT NOT NULL,
    "apiKeyMasked" TEXT NOT NULL,
    "baseUrl" TEXT,
    "organizationId" TEXT,
    "purchasedCreditUsd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "usedCreditUsd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiProviderAccount_provider_idx" ON "AiProviderAccount"("provider");

-- CreateIndex
CREATE INDEX "AiProviderAccount_isActive_idx" ON "AiProviderAccount"("isActive");

-- CreateIndex
CREATE INDEX "AiProviderAccount_updatedAt_idx" ON "AiProviderAccount"("updatedAt");
