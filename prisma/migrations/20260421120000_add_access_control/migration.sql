-- AlterEnum
ALTER TYPE "DirectoryRole" ADD VALUE IF NOT EXISTS 'shareholder';

-- CreateEnum
CREATE TYPE "RepresentativePrincipalType" AS ENUM ('partner', 'legal_shareholder');

-- CreateTable
CREATE TABLE "TenantRole" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTenantMembershipRole" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTenantMembershipRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantRoleMenuPermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantRoleMenuPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryRepresentative" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "userId" TEXT,
    "principalType" "RepresentativePrincipalType" NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "hasSigningAuthority" BOOLEAN NOT NULL DEFAULT false,
    "panelAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryRepresentative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantRole_tenantId_idx" ON "TenantRole"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRole_tenantId_key_key" ON "TenantRole"("tenantId", "key");

-- CreateIndex
CREATE INDEX "UserTenantMembershipRole_membershipId_idx" ON "UserTenantMembershipRole"("membershipId");

-- CreateIndex
CREATE INDEX "UserTenantMembershipRole_roleId_idx" ON "UserTenantMembershipRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenantMembershipRole_membershipId_roleId_key" ON "UserTenantMembershipRole"("membershipId", "roleId");

-- CreateIndex
CREATE INDEX "TenantRoleMenuPermission_roleId_idx" ON "TenantRoleMenuPermission"("roleId");

-- CreateIndex
CREATE INDEX "TenantRoleMenuPermission_menuItemId_idx" ON "TenantRoleMenuPermission"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRoleMenuPermission_roleId_menuItemId_key" ON "TenantRoleMenuPermission"("roleId", "menuItemId");

-- CreateIndex
CREATE INDEX "DirectoryRepresentative_tenantId_principalType_idx" ON "DirectoryRepresentative"("tenantId", "principalType");

-- CreateIndex
CREATE INDEX "DirectoryRepresentative_principalId_idx" ON "DirectoryRepresentative"("principalId");

-- CreateIndex
CREATE INDEX "DirectoryRepresentative_userId_idx" ON "DirectoryRepresentative"("userId");

-- AddForeignKey
ALTER TABLE "TenantRole" ADD CONSTRAINT "TenantRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantMembershipRole" ADD CONSTRAINT "UserTenantMembershipRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "UserTenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantMembershipRole" ADD CONSTRAINT "UserTenantMembershipRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRoleMenuPermission" ADD CONSTRAINT "TenantRoleMenuPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryRepresentative" ADD CONSTRAINT "DirectoryRepresentative_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryRepresentative" ADD CONSTRAINT "DirectoryRepresentative_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "DirectoryPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryRepresentative" ADD CONSTRAINT "DirectoryRepresentative_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
