-- CreateTable
CREATE TABLE "ContractAppendix" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "appendixNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "effectiveDate" TEXT NOT NULL,
    "issuerType" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractAppendix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAppendixItem" (
    "id" TEXT NOT NULL,
    "appendixId" TEXT NOT NULL,
    "tagKey" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractAppendixItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractAppendix_draftId_appendixNumber_key" ON "ContractAppendix"("draftId", "appendixNumber");

-- CreateIndex
CREATE INDEX "ContractAppendix_tenantId_draftId_createdAt_idx" ON "ContractAppendix"("tenantId", "draftId", "createdAt");

-- CreateIndex
CREATE INDEX "ContractAppendixItem_appendixId_groupKey_idx" ON "ContractAppendixItem"("appendixId", "groupKey");

-- CreateIndex
CREATE INDEX "ContractAppendixItem_appendixId_tagKey_idx" ON "ContractAppendixItem"("appendixId", "tagKey");

-- AddForeignKey
ALTER TABLE "ContractAppendix" ADD CONSTRAINT "ContractAppendix_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAppendix" ADD CONSTRAINT "ContractAppendix_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAppendix" ADD CONSTRAINT "ContractAppendix_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAppendixItem" ADD CONSTRAINT "ContractAppendixItem_appendixId_fkey" FOREIGN KEY ("appendixId") REFERENCES "ContractAppendix"("id") ON DELETE CASCADE ON UPDATE CASCADE;
