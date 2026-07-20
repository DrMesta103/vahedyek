CREATE TYPE "TaaviaBrandInfoType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO');
CREATE TYPE "TaaviaBrandInfoStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

ALTER TABLE "MediaAsset"
  ADD COLUMN "tenantId" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "storageKey" TEXT,
  ADD COLUMN "originalName" TEXT;

CREATE TABLE "TaaviaBrandInfo" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  "type" "TaaviaBrandInfoType" NOT NULL,
  "title" VARCHAR(300),
  "textContent" TEXT,
  "mediaAssetId" TEXT,
  "status" "TaaviaBrandInfoStatus" NOT NULL,
  "displayOrder" INTEGER NOT NULL,
  "revision" BIGINT NOT NULL,
  "contentHash" VARCHAR(64) NOT NULL,
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT NOT NULL,
  "archivedAt" TIMESTAMP(3),
  "archivedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TaaviaBrandInfo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TaaviaBrandInfo_tenant_brand_status_order_idx" ON "TaaviaBrandInfo" ("tenantId", "brandId", "status", "displayOrder");
CREATE INDEX "TaaviaBrandInfo_tenant_brand_type_status_idx" ON "TaaviaBrandInfo" ("tenantId", "brandId", "type", "status");
CREATE INDEX "TaaviaBrandInfo_tenant_id_revision_idx" ON "TaaviaBrandInfo" ("tenantId", "id", "revision");
CREATE INDEX "TaaviaBrandInfo_tenant_brand_hash_idx" ON "TaaviaBrandInfo" ("tenantId", "brandId", "contentHash");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandInfo" ADD CONSTRAINT "TaaviaBrandInfo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandInfo" ADD CONSTRAINT "TaaviaBrandInfo_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "TaaviaBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaaviaBrandInfo" ADD CONSTRAINT "TaaviaBrandInfo_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
