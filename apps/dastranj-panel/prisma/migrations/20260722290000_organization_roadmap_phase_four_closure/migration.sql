CREATE TYPE "OrganizationRoadmapStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TABLE "OrganizationRoadmap" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "organizationUnitId" TEXT,
  "title" TEXT NOT NULL, "description" TEXT, "targetDate" TIMESTAMP(3) NOT NULL,
  "status" "OrganizationRoadmapStatus" NOT NULL DEFAULT 'PLANNED', "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationRoadmap_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrganizationRoadmap_tenantId_targetDate_idx" ON "OrganizationRoadmap"("tenantId", "targetDate");
CREATE INDEX "OrganizationRoadmap_tenantId_organizationUnitId_status_idx" ON "OrganizationRoadmap"("tenantId", "organizationUnitId", "status");
ALTER TABLE "OrganizationRoadmap" ADD CONSTRAINT "OrganizationRoadmap_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationRoadmap" ADD CONSTRAINT "OrganizationRoadmap_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
