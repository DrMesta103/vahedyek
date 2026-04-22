CREATE TABLE IF NOT EXISTS "BlockFloor" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "blockId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlockFloor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProjectPlate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "mainPlate" TEXT NOT NULL,
  "subPlates" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectPlate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BlockFloor_tenantId_blockId_idx" ON "BlockFloor"("tenantId", "blockId");
CREATE UNIQUE INDEX IF NOT EXISTS "BlockFloor_tenantId_blockId_name_key" ON "BlockFloor"("tenantId", "blockId", "name");
CREATE INDEX IF NOT EXISTS "ProjectPlate_tenantId_idx" ON "ProjectPlate"("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectPlate_tenantId_mainPlate_key" ON "ProjectPlate"("tenantId", "mainPlate");

ALTER TABLE "BlockFloor"
ADD CONSTRAINT "BlockFloor_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlockFloor"
ADD CONSTRAINT "BlockFloor_blockId_fkey"
FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectPlate"
ADD CONSTRAINT "ProjectPlate_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
