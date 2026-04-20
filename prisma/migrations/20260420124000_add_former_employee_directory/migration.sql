-- CreateTable
CREATE TABLE "FormerEmployee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormerEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormerEmployee_tenantId_normalizedName_key" ON "FormerEmployee"("tenantId", "normalizedName");

-- CreateIndex
CREATE INDEX "FormerEmployee_tenantId_fullName_idx" ON "FormerEmployee"("tenantId", "fullName");

-- AddForeignKey
ALTER TABLE "FormerEmployee" ADD CONSTRAINT "FormerEmployee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
