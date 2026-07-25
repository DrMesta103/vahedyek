CREATE TYPE "TaaviaBrandSourceStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE "TaaviaBrandKnowledge" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "brandId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "content" TEXT NOT NULL, "status" "TaaviaBrandSourceStatus" NOT NULL DEFAULT 'ACTIVE', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "revision" BIGINT NOT NULL DEFAULT 1, "contentHash" TEXT NOT NULL, "createdBy" TEXT NOT NULL, "updatedBy" TEXT NOT NULL,
  "archivedAt" TIMESTAMP(3), "archivedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "TaaviaBrandKnowledge_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TaaviaBrandProduct" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "brandId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "shortDescription" TEXT, "fullDescription" TEXT NOT NULL, "status" "TaaviaBrandSourceStatus" NOT NULL DEFAULT 'ACTIVE',
  "revision" BIGINT NOT NULL DEFAULT 1, "contentHash" TEXT NOT NULL, "createdBy" TEXT NOT NULL, "updatedBy" TEXT NOT NULL,
  "archivedAt" TIMESTAMP(3), "archivedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "TaaviaBrandProduct_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TaaviaBrandFaq" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "brandId" TEXT NOT NULL, "question" TEXT NOT NULL, "answer" TEXT NOT NULL,
  "status" "TaaviaBrandSourceStatus" NOT NULL DEFAULT 'ACTIVE', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "revision" BIGINT NOT NULL DEFAULT 1, "contentHash" TEXT NOT NULL, "createdBy" TEXT NOT NULL, "updatedBy" TEXT NOT NULL,
  "archivedAt" TIMESTAMP(3), "archivedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "TaaviaBrandFaq_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TaaviaBrandKnowledge" ADD CONSTRAINT "TaaviaBrandKnowledge_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandProduct" ADD CONSTRAINT "TaaviaBrandProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandFaq" ADD CONSTRAINT "TaaviaBrandFaq_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "TaaviaBrandKnowledge_tenantId_brandId_status_sortOrder_idx" ON "TaaviaBrandKnowledge"("tenantId", "brandId", "status", "sortOrder");
CREATE INDEX "TaaviaBrandKnowledge_tenantId_brandId_contentHash_idx" ON "TaaviaBrandKnowledge"("tenantId", "brandId", "contentHash");
CREATE INDEX "TaaviaBrandProduct_tenantId_brandId_status_idx" ON "TaaviaBrandProduct"("tenantId", "brandId", "status");
CREATE INDEX "TaaviaBrandProduct_tenantId_brandId_contentHash_idx" ON "TaaviaBrandProduct"("tenantId", "brandId", "contentHash");
CREATE INDEX "TaaviaBrandFaq_tenantId_brandId_status_sortOrder_idx" ON "TaaviaBrandFaq"("tenantId", "brandId", "status", "sortOrder");
CREATE INDEX "TaaviaBrandFaq_tenantId_brandId_contentHash_idx" ON "TaaviaBrandFaq"("tenantId", "brandId", "contentHash");
