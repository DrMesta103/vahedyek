CREATE TYPE "OrganizationTemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

CREATE TABLE "OrganizationStructureTemplate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "OrganizationTemplateStatus" NOT NULL DEFAULT 'INACTIVE',
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationStructureTemplate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrganizationStructureTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "OrganizationStructureTemplateUnit" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "parentTemplateUnitId" TEXT,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'DEPARTMENT',
  "description" TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "OrganizationUnitStatus" NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "OrganizationStructureTemplateUnit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrganizationStructureTemplateUnit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OrganizationStructureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrganizationStructureTemplateUnit_parentTemplateUnitId_fkey" FOREIGN KEY ("parentTemplateUnitId") REFERENCES "OrganizationStructureTemplateUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "OrganizationStructureTemplatePosition" (
  "id" TEXT NOT NULL,
  "templateUnitId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "code" TEXT,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "OrganizationStructureTemplatePosition_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrganizationStructureTemplatePosition_capacity_check" CHECK ("capacity" >= 0),
  CONSTRAINT "OrganizationStructureTemplatePosition_templateUnitId_fkey" FOREIGN KEY ("templateUnitId") REFERENCES "OrganizationStructureTemplateUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OrganizationStructureTemplate_tenantId_name_key" ON "OrganizationStructureTemplate"("tenantId", "name");
CREATE INDEX "OrganizationStructureTemplate_tenantId_status_idx" ON "OrganizationStructureTemplate"("tenantId", "status");
CREATE INDEX "OrganizationStructureTemplateUnit_templateId_displayOrder_idx" ON "OrganizationStructureTemplateUnit"("templateId", "displayOrder");
CREATE INDEX "OrganizationStructureTemplateUnit_parentTemplateUnitId_idx" ON "OrganizationStructureTemplateUnit"("parentTemplateUnitId");
CREATE UNIQUE INDEX "OrganizationStructureTemplatePosition_templateUnitId_code_key" ON "OrganizationStructureTemplatePosition"("templateUnitId", "code");
CREATE INDEX "OrganizationStructureTemplatePosition_templateUnitId_displayOrder_idx" ON "OrganizationStructureTemplatePosition"("templateUnitId", "displayOrder");
