CREATE TYPE "OrganizationUnitStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "PositionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "OrganizationAssignmentStatus" AS ENUM ('ACTIVE', 'ENDED', 'FUTURE');

ALTER TABLE "OrganizationUnit"
  ADD COLUMN "code" TEXT,
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'DEPARTMENT',
  ADD COLUMN "status" "OrganizationUnitStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "parentId" TEXT,
  ADD COLUMN "managerId" TEXT;

CREATE TABLE "Position" (
  "id" TEXT NOT NULL,
  "organizationUnitId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "code" TEXT,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmployeeOrganizationUnit"
  ADD COLUMN "positionId" TEXT,
  ADD COLUMN "startDate" TEXT,
  ADD COLUMN "endDate" TEXT,
  ADD COLUMN "status" "OrganizationAssignmentStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE UNIQUE INDEX "OrganizationUnit_tenantId_code_key" ON "OrganizationUnit"("tenantId", "code");
CREATE INDEX "OrganizationUnit_tenantId_status_idx" ON "OrganizationUnit"("tenantId", "status");
CREATE INDEX "OrganizationUnit_parentId_idx" ON "OrganizationUnit"("parentId");
CREATE INDEX "OrganizationUnit_managerId_idx" ON "OrganizationUnit"("managerId");
CREATE INDEX "Position_organizationUnitId_status_idx" ON "Position"("organizationUnitId", "status");
CREATE UNIQUE INDEX "Position_organizationUnitId_code_key" ON "Position"("organizationUnitId", "code");
CREATE INDEX "EmployeeOrganizationUnit_organizationUnitId_status_idx" ON "EmployeeOrganizationUnit"("organizationUnitId", "status");
CREATE INDEX "EmployeeOrganizationUnit_positionId_status_idx" ON "EmployeeOrganizationUnit"("positionId", "status");

ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeOrganizationUnit" ADD CONSTRAINT "EmployeeOrganizationUnit_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
