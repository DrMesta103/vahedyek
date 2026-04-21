-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('sale', 'pre_sale');

-- CreateEnum
CREATE TYPE "ContractorType" AS ENUM ('self', 'employee', 'former_employee');

-- CreateEnum
CREATE TYPE "ShareMode" AS ENUM ('percent', 'dang');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('natural', 'legal');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('fixed', 'metered');

-- CreateEnum
CREATE TYPE "PartySide" AS ENUM ('party_one', 'party_two');

-- CreateEnum
CREATE TYPE "DirectoryRole" AS ENUM ('partner', 'buyer');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('pending', 'won', 'lost');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandCode" TEXT NOT NULL DEFAULT 'VN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTenantMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractDraft" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractSubject" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "contractorType" "ContractorType" NOT NULL,
    "contractorEmployeeId" TEXT,
    "contractorFormerName" TEXT,
    "contractType" "ContractType" NOT NULL,
    "contractDate" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "deliveryDate" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "ContractSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractParties" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "partyOneMode" "ShareMode" NOT NULL DEFAULT 'dang',
    "partyTwoMode" "ShareMode" NOT NULL DEFAULT 'dang',

    CONSTRAINT "ContractParties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPartyMember" (
    "id" TEXT NOT NULL,
    "partiesId" TEXT NOT NULL,
    "side" "PartySide" NOT NULL,
    "personId" TEXT NOT NULL,
    "directoryId" TEXT,
    "personType" "PersonType" NOT NULL,
    "name" TEXT NOT NULL,
    "shareValue" DECIMAL(18,2) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractPartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractFinancial" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "pricingType" "PricingType" NOT NULL DEFAULT 'fixed',
    "totalArea" DECIMAL(18,2),
    "pricePerMeter" DECIMAL(18,2),
    "fixedTotalAmount" DECIMAL(18,2),
    "activeTab" TEXT,

    CONSTRAINT "ContractFinancial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" TEXT NOT NULL,
    "financialId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capAmount" DECIMAL(18,2) NOT NULL,
    "dueAmount" DECIMAL(18,2) NOT NULL,
    "noDueAmount" DECIMAL(18,2) NOT NULL,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "requiresDue" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialDueItem" (
    "id" TEXT NOT NULL,
    "financialId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "dueDate" TEXT NOT NULL,

    CONSTRAINT "FinancialDueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "floorName" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryPerson" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "DirectoryRole" NOT NULL,
    "personType" "PersonType" NOT NULL,

    CONSTRAINT "DirectoryPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "contractId" TEXT,
    "customerName" TEXT NOT NULL,
    "phone" TEXT,
    "projectName" TEXT,
    "blockName" TEXT,
    "unitName" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "UserTenantMembership_userId_idx" ON "UserTenantMembership"("userId");

-- CreateIndex
CREATE INDEX "UserTenantMembership_tenantId_idx" ON "UserTenantMembership"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenantMembership_userId_tenantId_key" ON "UserTenantMembership"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_tenantId_userId_idx" ON "Session"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "ContractDraft_tenantId_updatedAt_idx" ON "ContractDraft"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContractSubject_draftId_key" ON "ContractSubject"("draftId");

-- CreateIndex
CREATE INDEX "ContractSubject_contractNumber_idx" ON "ContractSubject"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ContractParties_draftId_key" ON "ContractParties"("draftId");

-- CreateIndex
CREATE INDEX "ContractPartyMember_partiesId_side_idx" ON "ContractPartyMember"("partiesId", "side");

-- CreateIndex
CREATE UNIQUE INDEX "ContractFinancial_draftId_key" ON "ContractFinancial"("draftId");

-- CreateIndex
CREATE INDEX "FinancialCategory_financialId_idx" ON "FinancialCategory"("financialId");

-- CreateIndex
CREATE INDEX "FinancialDueItem_financialId_categoryId_idx" ON "FinancialDueItem"("financialId", "categoryId");

-- CreateIndex
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");

-- CreateIndex
CREATE INDEX "Block_tenantId_idx" ON "Block"("tenantId");

-- CreateIndex
CREATE INDEX "Unit_tenantId_blockId_idx" ON "Unit"("tenantId", "blockId");

-- CreateIndex
CREATE INDEX "DirectoryPerson_tenantId_role_personType_idx" ON "DirectoryPerson"("tenantId", "role", "personType");

-- CreateIndex
CREATE INDEX "Sale_tenantId_status_createdAt_idx" ON "Sale"("tenantId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "UserTenantMembership" ADD CONSTRAINT "UserTenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantMembership" ADD CONSTRAINT "UserTenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDraft" ADD CONSTRAINT "ContractDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSubject" ADD CONSTRAINT "ContractSubject_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSubject" ADD CONSTRAINT "ContractSubject_contractorEmployeeId_fkey" FOREIGN KEY ("contractorEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSubject" ADD CONSTRAINT "ContractSubject_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSubject" ADD CONSTRAINT "ContractSubject_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractParties" ADD CONSTRAINT "ContractParties_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPartyMember" ADD CONSTRAINT "ContractPartyMember_partiesId_fkey" FOREIGN KEY ("partiesId") REFERENCES "ContractParties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPartyMember" ADD CONSTRAINT "ContractPartyMember_directoryId_fkey" FOREIGN KEY ("directoryId") REFERENCES "DirectoryPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractFinancial" ADD CONSTRAINT "ContractFinancial_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialCategory" ADD CONSTRAINT "FinancialCategory_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "ContractFinancial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialDueItem" ADD CONSTRAINT "FinancialDueItem_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "ContractFinancial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialDueItem" ADD CONSTRAINT "FinancialDueItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryPerson" ADD CONSTRAINT "DirectoryPerson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
