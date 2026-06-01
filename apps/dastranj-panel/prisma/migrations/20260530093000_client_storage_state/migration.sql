-- CreateTable
CREATE TABLE "ClientStorageState" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "tenantId" TEXT,
    "storageKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientStorageState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientStorageState_scope_storageKey_key" ON "ClientStorageState"("scope", "storageKey");

-- CreateIndex
CREATE INDEX "ClientStorageState_tenantId_idx" ON "ClientStorageState"("tenantId");

-- CreateIndex
CREATE INDEX "ClientStorageState_scope_idx" ON "ClientStorageState"("scope");

-- AddForeignKey
ALTER TABLE "ClientStorageState" ADD CONSTRAINT "ClientStorageState_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
