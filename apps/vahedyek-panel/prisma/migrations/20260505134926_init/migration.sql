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
CREATE TYPE "DirectoryRole" AS ENUM ('partner', 'buyer', 'shareholder');

-- CreateEnum
CREATE TYPE "RepresentativePrincipalType" AS ENUM ('partner', 'legal_shareholder');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandCode" TEXT NOT NULL DEFAULT 'VN',
    "packageKey" TEXT NOT NULL DEFAULT 'starter',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
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
CREATE TABLE "TenantRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantRolePermission_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tenantId" TEXT,
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
CREATE TABLE "TerminationRules" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "buyerRules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerminationRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractExtraCosts" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractExtraCosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTechnicalSpecs" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "specs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTechnicalSpecs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAttachments" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractAttachments_pkey" PRIMARY KEY ("id")
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
    "unitArea" DECIMAL(18,2),
    "parkingArea" DECIMAL(18,2),
    "totalArea" DECIMAL(18,2),
    "pricePerMeter" DECIMAL(18,2),
    "parkingPricePerMeter" DECIMAL(18,2),
    "fixedTotalAmount" DECIMAL(18,2),
    "activeTab" TEXT,

    CONSTRAINT "ContractFinancial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPenalties" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,

    CONSTRAINT "ContractPenalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPenaltyType" (
    "id" TEXT NOT NULL,
    "penaltiesId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContractPenaltyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPenaltyRule" (
    "id" TEXT NOT NULL,
    "penaltiesId" TEXT NOT NULL,
    "penaltyTypeId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "fixedAmount" DECIMAL(18,2),
    "penaltyPercent" DECIMAL(18,2),
    "bankInterestPercent" DECIMAL(18,2),
    "graceDays" INTEGER,
    "roundRule" TEXT,
    "extraFeeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "extraFeeType" TEXT,
    "extraFeeAmount" DECIMAL(18,2),
    "extraFeeRoundRule" TEXT,
    "progressiveRows" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractPenaltyRule_pkey" PRIMARY KEY ("id")
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
    "title" TEXT NOT NULL DEFAULT '',
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
CREATE TABLE "FormerEmployee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormerEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainPlate" TEXT,
    "subPlate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'incomplete',
    "usageCounts" JSONB NOT NULL DEFAULT '{"residential":0,"commercial":0,"office":0,"parking":0,"storage":0,"amenity":0}',

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockFloor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockFloor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPlate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "mainPlate" TEXT NOT NULL,
    "subPlates" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPlate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "floorName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'unit',
    "unitType" TEXT,
    "usage" TEXT NOT NULL DEFAULT 'residential',
    "saleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'ready',
    "area" DOUBLE PRECISION,
    "balconyCount" INTEGER NOT NULL DEFAULT 0,
    "bedroomCount" INTEGER NOT NULL DEFAULT 0,
    "postalCode" TEXT,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "baseInfo" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'unknown',
    "areaPricingMode" TEXT NOT NULL DEFAULT 'unit-only',
    "assignedToUnitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

-- CreateTable
CREATE TABLE "TenantContractRuleSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rulesPayload" JSONB NOT NULL DEFAULT '{}',
    "loanPayload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantContractRuleSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_mobile_key" ON "AppUser"("mobile");

-- CreateIndex
CREATE INDEX "UserTenantMembership_userId_idx" ON "UserTenantMembership"("userId");

-- CreateIndex
CREATE INDEX "UserTenantMembership_tenantId_idx" ON "UserTenantMembership"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenantMembership_userId_tenantId_key" ON "UserTenantMembership"("userId", "tenantId");

-- CreateIndex
CREATE INDEX "TenantRole_tenantId_idx" ON "TenantRole"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRole_tenantId_key_key" ON "TenantRole"("tenantId", "key");

-- CreateIndex
CREATE INDEX "TenantRolePermission_roleId_idx" ON "TenantRolePermission"("roleId");

-- CreateIndex
CREATE INDEX "TenantRolePermission_permissionKey_idx" ON "TenantRolePermission"("permissionKey");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRolePermission_roleId_permissionKey_key" ON "TenantRolePermission"("roleId", "permissionKey");

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
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_tenantId_userId_idx" ON "Session"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "ContractDraft_tenantId_updatedAt_idx" ON "ContractDraft"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TerminationRules_draftId_key" ON "TerminationRules"("draftId");

-- CreateIndex
CREATE INDEX "TerminationRules_draftId_idx" ON "TerminationRules"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractExtraCosts_draftId_key" ON "ContractExtraCosts"("draftId");

-- CreateIndex
CREATE INDEX "ContractExtraCosts_draftId_idx" ON "ContractExtraCosts"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTechnicalSpecs_draftId_key" ON "ContractTechnicalSpecs"("draftId");

-- CreateIndex
CREATE INDEX "ContractTechnicalSpecs_draftId_idx" ON "ContractTechnicalSpecs"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractAttachments_draftId_key" ON "ContractAttachments"("draftId");

-- CreateIndex
CREATE INDEX "ContractAttachments_draftId_idx" ON "ContractAttachments"("draftId");

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
CREATE UNIQUE INDEX "ContractPenalties_draftId_key" ON "ContractPenalties"("draftId");

-- CreateIndex
CREATE INDEX "ContractPenaltyType_penaltiesId_idx" ON "ContractPenaltyType"("penaltiesId");

-- CreateIndex
CREATE INDEX "ContractPenaltyRule_penaltiesId_penaltyTypeId_idx" ON "ContractPenaltyRule"("penaltiesId", "penaltyTypeId");

-- CreateIndex
CREATE INDEX "FinancialCategory_financialId_idx" ON "FinancialCategory"("financialId");

-- CreateIndex
CREATE INDEX "FinancialDueItem_financialId_categoryId_idx" ON "FinancialDueItem"("financialId", "categoryId");

-- CreateIndex
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");

-- CreateIndex
CREATE INDEX "FormerEmployee_tenantId_fullName_idx" ON "FormerEmployee"("tenantId", "fullName");

-- CreateIndex
CREATE UNIQUE INDEX "FormerEmployee_tenantId_normalizedName_key" ON "FormerEmployee"("tenantId", "normalizedName");

-- CreateIndex
CREATE INDEX "Block_tenantId_idx" ON "Block"("tenantId");

-- CreateIndex
CREATE INDEX "BlockFloor_tenantId_blockId_idx" ON "BlockFloor"("tenantId", "blockId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockFloor_tenantId_blockId_name_key" ON "BlockFloor"("tenantId", "blockId", "name");

-- CreateIndex
CREATE INDEX "ProjectPlate_tenantId_idx" ON "ProjectPlate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPlate_tenantId_mainPlate_key" ON "ProjectPlate"("tenantId", "mainPlate");

-- CreateIndex
CREATE INDEX "Unit_tenantId_blockId_idx" ON "Unit"("tenantId", "blockId");

-- CreateIndex
CREATE INDEX "Unit_tenantId_blockId_category_idx" ON "Unit"("tenantId", "blockId", "category");

-- CreateIndex
CREATE INDEX "Unit_tenantId_assignedToUnitId_idx" ON "Unit"("tenantId", "assignedToUnitId");

-- CreateIndex
CREATE INDEX "DirectoryPerson_tenantId_role_personType_idx" ON "DirectoryPerson"("tenantId", "role", "personType");

-- CreateIndex
CREATE INDEX "DirectoryRepresentative_tenantId_principalType_idx" ON "DirectoryRepresentative"("tenantId", "principalType");

-- CreateIndex
CREATE INDEX "DirectoryRepresentative_principalId_idx" ON "DirectoryRepresentative"("principalId");

-- CreateIndex
CREATE INDEX "DirectoryRepresentative_userId_idx" ON "DirectoryRepresentative"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantContractRuleSettings_tenantId_key" ON "TenantContractRuleSettings"("tenantId");

-- CreateIndex
CREATE INDEX "TenantContractRuleSettings_tenantId_idx" ON "TenantContractRuleSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "UserTenantMembership" ADD CONSTRAINT "UserTenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantMembership" ADD CONSTRAINT "UserTenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRole" ADD CONSTRAINT "TenantRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRolePermission" ADD CONSTRAINT "TenantRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantMembershipRole" ADD CONSTRAINT "UserTenantMembershipRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "UserTenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTenantMembershipRole" ADD CONSTRAINT "UserTenantMembershipRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRoleMenuPermission" ADD CONSTRAINT "TenantRoleMenuPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDraft" ADD CONSTRAINT "ContractDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminationRules" ADD CONSTRAINT "TerminationRules_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractExtraCosts" ADD CONSTRAINT "ContractExtraCosts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTechnicalSpecs" ADD CONSTRAINT "ContractTechnicalSpecs_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAttachments" ADD CONSTRAINT "ContractAttachments_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "ContractPenalties" ADD CONSTRAINT "ContractPenalties_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPenaltyType" ADD CONSTRAINT "ContractPenaltyType_penaltiesId_fkey" FOREIGN KEY ("penaltiesId") REFERENCES "ContractPenalties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPenaltyRule" ADD CONSTRAINT "ContractPenaltyRule_penaltiesId_fkey" FOREIGN KEY ("penaltiesId") REFERENCES "ContractPenalties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPenaltyRule" ADD CONSTRAINT "ContractPenaltyRule_penaltyTypeId_fkey" FOREIGN KEY ("penaltyTypeId") REFERENCES "ContractPenaltyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialCategory" ADD CONSTRAINT "FinancialCategory_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "ContractFinancial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialDueItem" ADD CONSTRAINT "FinancialDueItem_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "ContractFinancial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialDueItem" ADD CONSTRAINT "FinancialDueItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormerEmployee" ADD CONSTRAINT "FormerEmployee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockFloor" ADD CONSTRAINT "BlockFloor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockFloor" ADD CONSTRAINT "BlockFloor_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPlate" ADD CONSTRAINT "ProjectPlate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryPerson" ADD CONSTRAINT "DirectoryPerson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryRepresentative" ADD CONSTRAINT "DirectoryRepresentative_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryRepresentative" ADD CONSTRAINT "DirectoryRepresentative_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "DirectoryPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryRepresentative" ADD CONSTRAINT "DirectoryRepresentative_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantContractRuleSettings" ADD CONSTRAINT "TenantContractRuleSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
