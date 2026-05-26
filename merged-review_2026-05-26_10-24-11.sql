--
-- PostgreSQL database dump
--

\restrict 8FOoEfpPNvE6nQ9UkN29pBu8Yo8bw7VaTKQxcumjj5i3drgpcmACkBTu1hdWe09

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."UserTenantMembership" DROP CONSTRAINT IF EXISTS "UserTenantMembership_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserTenantMembership" DROP CONSTRAINT IF EXISTS "UserTenantMembership_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserTenantMembershipRole" DROP CONSTRAINT IF EXISTS "UserTenantMembershipRole_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserTenantMembershipRole" DROP CONSTRAINT IF EXISTS "UserTenantMembershipRole_membershipId_fkey";
ALTER TABLE IF EXISTS ONLY public."Unit" DROP CONSTRAINT IF EXISTS "Unit_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."Unit" DROP CONSTRAINT IF EXISTS "Unit_blockId_fkey";
ALTER TABLE IF EXISTS ONLY public."TerminationRules" DROP CONSTRAINT IF EXISTS "TerminationRules_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."TenantRole" DROP CONSTRAINT IF EXISTS "TenantRole_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."TenantRolePermission" DROP CONSTRAINT IF EXISTS "TenantRolePermission_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public."TenantRoleMenuPermission" DROP CONSTRAINT IF EXISTS "TenantRoleMenuPermission_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public."TenantContractRuleSettings" DROP CONSTRAINT IF EXISTS "TenantContractRuleSettings_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."TenantBusinessProfileSettings" DROP CONSTRAINT IF EXISTS "TenantBusinessProfileSettings_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectPlate" DROP CONSTRAINT IF EXISTS "ProjectPlate_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."FormerEmployee" DROP CONSTRAINT IF EXISTS "FormerEmployee_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."FinancialDueItem" DROP CONSTRAINT IF EXISTS "FinancialDueItem_financialId_fkey";
ALTER TABLE IF EXISTS ONLY public."FinancialDueItem" DROP CONSTRAINT IF EXISTS "FinancialDueItem_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."FinancialCategory" DROP CONSTRAINT IF EXISTS "FinancialCategory_financialId_fkey";
ALTER TABLE IF EXISTS ONLY public."Employee" DROP CONSTRAINT IF EXISTS "Employee_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."DirectoryRepresentative" DROP CONSTRAINT IF EXISTS "DirectoryRepresentative_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."DirectoryRepresentative" DROP CONSTRAINT IF EXISTS "DirectoryRepresentative_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."DirectoryRepresentative" DROP CONSTRAINT IF EXISTS "DirectoryRepresentative_principalId_fkey";
ALTER TABLE IF EXISTS ONLY public."DirectoryPerson" DROP CONSTRAINT IF EXISTS "DirectoryPerson_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageThread" DROP CONSTRAINT IF EXISTS "DevPageThread_updatedById_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageThread" DROP CONSTRAINT IF EXISTS "DevPageThread_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageMessage" DROP CONSTRAINT IF EXISTS "DevPageMessage_threadId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageMessage" DROP CONSTRAINT IF EXISTS "DevPageMessage_authorUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocument" DROP CONSTRAINT IF EXISTS "DevPageDocument_updatedById_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocument" DROP CONSTRAINT IF EXISTS "DevPageDocument_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocument" DROP CONSTRAINT IF EXISTS "DevPageDocument_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocumentReadState" DROP CONSTRAINT IF EXISTS "DevPageDocumentReadState_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocumentReadState" DROP CONSTRAINT IF EXISTS "DevPageDocumentReadState_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocumentEvent" DROP CONSTRAINT IF EXISTS "DevPageDocumentEvent_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocumentEvent" DROP CONSTRAINT IF EXISTS "DevPageDocumentEvent_actorUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractTechnicalSpecs" DROP CONSTRAINT IF EXISTS "ContractTechnicalSpecs_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractSubject" DROP CONSTRAINT IF EXISTS "ContractSubject_unitId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractSubject" DROP CONSTRAINT IF EXISTS "ContractSubject_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractSubject" DROP CONSTRAINT IF EXISTS "ContractSubject_contractorEmployeeId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractSubject" DROP CONSTRAINT IF EXISTS "ContractSubject_blockId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractReceipt" DROP CONSTRAINT IF EXISTS "ContractReceipt_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenaltyType" DROP CONSTRAINT IF EXISTS "ContractPenaltyType_penaltiesId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenaltyRule" DROP CONSTRAINT IF EXISTS "ContractPenaltyRule_penaltyTypeId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenaltyRule" DROP CONSTRAINT IF EXISTS "ContractPenaltyRule_penaltiesId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenalties" DROP CONSTRAINT IF EXISTS "ContractPenalties_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractPartyMember" DROP CONSTRAINT IF EXISTS "ContractPartyMember_partiesId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractPartyMember" DROP CONSTRAINT IF EXISTS "ContractPartyMember_directoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractParties" DROP CONSTRAINT IF EXISTS "ContractParties_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractFinancial" DROP CONSTRAINT IF EXISTS "ContractFinancial_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractExtraCosts" DROP CONSTRAINT IF EXISTS "ContractExtraCosts_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractDraft" DROP CONSTRAINT IF EXISTS "ContractDraft_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractCustomerWalletLedger" DROP CONSTRAINT IF EXISTS "ContractCustomerWalletLedger_receiptId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractCustomerWalletLedger" DROP CONSTRAINT IF EXISTS "ContractCustomerWalletLedger_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAttachments" DROP CONSTRAINT IF EXISTS "ContractAttachments_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractApprovalInstance" DROP CONSTRAINT IF EXISTS "ContractApprovalInstance_workflowId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractApprovalInstance" DROP CONSTRAINT IF EXISTS "ContractApprovalInstance_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractApprovalDecision" DROP CONSTRAINT IF EXISTS "ContractApprovalDecision_instanceId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendix" DROP CONSTRAINT IF EXISTS "ContractAppendix_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendix" DROP CONSTRAINT IF EXISTS "ContractAppendix_previousAppendixId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendix" DROP CONSTRAINT IF EXISTS "ContractAppendix_draftId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendix" DROP CONSTRAINT IF EXISTS "ContractAppendix_createdByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixItem" DROP CONSTRAINT IF EXISTS "ContractAppendixItem_appendixId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixApprovalInstance" DROP CONSTRAINT IF EXISTS "ContractAppendixApprovalInstance_workflowId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixApprovalInstance" DROP CONSTRAINT IF EXISTS "ContractAppendixApprovalInstance_appendixId_fkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixApprovalDecision" DROP CONSTRAINT IF EXISTS "ContractAppendixApprovalDecision_instanceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Block" DROP CONSTRAINT IF EXISTS "Block_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlockFloor" DROP CONSTRAINT IF EXISTS "BlockFloor_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlockFloor" DROP CONSTRAINT IF EXISTS "BlockFloor_blockId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_tenantId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_actorUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."ApprovalWorkflow" DROP CONSTRAINT IF EXISTS "ApprovalWorkflow_tenantId_fkey";
DROP INDEX IF EXISTS public."UserTenantMembership_userId_tenantId_key";
DROP INDEX IF EXISTS public."UserTenantMembership_userId_idx";
DROP INDEX IF EXISTS public."UserTenantMembership_tenantId_idx";
DROP INDEX IF EXISTS public."UserTenantMembershipRole_roleId_idx";
DROP INDEX IF EXISTS public."UserTenantMembershipRole_membershipId_roleId_key";
DROP INDEX IF EXISTS public."UserTenantMembershipRole_membershipId_idx";
DROP INDEX IF EXISTS public."Unit_tenantId_blockId_idx";
DROP INDEX IF EXISTS public."Unit_tenantId_blockId_category_idx";
DROP INDEX IF EXISTS public."Unit_tenantId_assignedToUnitId_idx";
DROP INDEX IF EXISTS public."TerminationRules_draftId_key";
DROP INDEX IF EXISTS public."TerminationRules_draftId_idx";
DROP INDEX IF EXISTS public."Tenant_slug_key";
DROP INDEX IF EXISTS public."TenantRole_tenantId_key_key";
DROP INDEX IF EXISTS public."TenantRole_tenantId_idx";
DROP INDEX IF EXISTS public."TenantRolePermission_roleId_permissionKey_key";
DROP INDEX IF EXISTS public."TenantRolePermission_roleId_idx";
DROP INDEX IF EXISTS public."TenantRolePermission_permissionKey_idx";
DROP INDEX IF EXISTS public."TenantRoleMenuPermission_roleId_menuItemId_key";
DROP INDEX IF EXISTS public."TenantRoleMenuPermission_roleId_idx";
DROP INDEX IF EXISTS public."TenantRoleMenuPermission_menuItemId_idx";
DROP INDEX IF EXISTS public."TenantContractRuleSettings_tenantId_key";
DROP INDEX IF EXISTS public."TenantContractRuleSettings_tenantId_idx";
DROP INDEX IF EXISTS public."TenantBusinessProfileSettings_tenantId_idx";
DROP INDEX IF EXISTS public."Session_token_key";
DROP INDEX IF EXISTS public."Session_tenantId_userId_idx";
DROP INDEX IF EXISTS public."ProjectPlate_tenantId_mainPlate_key";
DROP INDEX IF EXISTS public."ProjectPlate_tenantId_idx";
DROP INDEX IF EXISTS public."FormerEmployee_tenantId_normalizedName_key";
DROP INDEX IF EXISTS public."FormerEmployee_tenantId_fullName_idx";
DROP INDEX IF EXISTS public."FinancialDueItem_financialId_categoryId_idx";
DROP INDEX IF EXISTS public."FinancialCategory_financialId_idx";
DROP INDEX IF EXISTS public."Employee_tenantId_nationalCode_key";
DROP INDEX IF EXISTS public."Employee_tenantId_idx";
DROP INDEX IF EXISTS public."DirectoryRepresentative_userId_idx";
DROP INDEX IF EXISTS public."DirectoryRepresentative_tenantId_principalType_idx";
DROP INDEX IF EXISTS public."DirectoryRepresentative_principalId_idx";
DROP INDEX IF EXISTS public."DirectoryPerson_tenantId_role_personType_idx";
DROP INDEX IF EXISTS public."DevPageThread_appId_updatedAt_idx";
DROP INDEX IF EXISTS public."DevPageThread_appId_pageKey_idx";
DROP INDEX IF EXISTS public."DevPageMessage_threadId_createdAt_idx";
DROP INDEX IF EXISTS public."DevPageDocument_tenantId_updatedAt_idx";
DROP INDEX IF EXISTS public."DevPageDocument_tenantId_pageKey_idx";
DROP INDEX IF EXISTS public."DevPageDocument_tenantId_appId_updatedAt_idx";
DROP INDEX IF EXISTS public."DevPageDocument_tenantId_appId_pageKey_idx";
DROP INDEX IF EXISTS public."DevPageDocumentReadState_tenantId_appId_userId_documentId_key";
DROP INDEX IF EXISTS public."DevPageDocumentEvent_tenantId_appId_createdAt_idx";
DROP INDEX IF EXISTS public."ContractTechnicalSpecs_draftId_key";
DROP INDEX IF EXISTS public."ContractTechnicalSpecs_draftId_idx";
DROP INDEX IF EXISTS public."ContractSubject_draftId_key";
DROP INDEX IF EXISTS public."ContractSubject_contractNumber_idx";
DROP INDEX IF EXISTS public."ContractReceipt_tenantId_draftId_idx";
DROP INDEX IF EXISTS public."ContractReceipt_draftId_allocationDate_idx";
DROP INDEX IF EXISTS public."ContractPenaltyType_penaltiesId_idx";
DROP INDEX IF EXISTS public."ContractPenaltyRule_penaltiesId_penaltyTypeId_idx";
DROP INDEX IF EXISTS public."ContractPenalties_draftId_key";
DROP INDEX IF EXISTS public."ContractPartyMember_partiesId_side_idx";
DROP INDEX IF EXISTS public."ContractParties_draftId_key";
DROP INDEX IF EXISTS public."ContractFinancial_draftId_key";
DROP INDEX IF EXISTS public."ContractExtraCosts_draftId_key";
DROP INDEX IF EXISTS public."ContractExtraCosts_draftId_idx";
DROP INDEX IF EXISTS public."ContractDraft_tenantId_updatedAt_idx";
DROP INDEX IF EXISTS public."ContractCustomerWalletLedger_tenantId_draftId_idx";
DROP INDEX IF EXISTS public."ContractCustomerWalletLedger_receiptId_idx";
DROP INDEX IF EXISTS public."ContractAttachments_draftId_key";
DROP INDEX IF EXISTS public."ContractAttachments_draftId_idx";
DROP INDEX IF EXISTS public."ContractApprovalInstance_tenantId_status_idx";
DROP INDEX IF EXISTS public."ContractApprovalInstance_tenantId_idx";
DROP INDEX IF EXISTS public."ContractApprovalInstance_draftId_key";
DROP INDEX IF EXISTS public."ContractApprovalDecision_instanceId_stepId_idx";
DROP INDEX IF EXISTS public."ContractApprovalDecision_approverUserId_idx";
DROP INDEX IF EXISTS public."ContractAppendix_tenantId_status_createdAt_idx";
DROP INDEX IF EXISTS public."ContractAppendix_tenantId_draftId_createdAt_idx";
DROP INDEX IF EXISTS public."ContractAppendix_previousAppendixId_idx";
DROP INDEX IF EXISTS public."ContractAppendix_draftId_appendixNumber_key";
DROP INDEX IF EXISTS public."ContractAppendixItem_appendixId_tagKey_idx";
DROP INDEX IF EXISTS public."ContractAppendixItem_appendixId_groupKey_idx";
DROP INDEX IF EXISTS public."ContractAppendixApprovalInstance_tenantId_status_idx";
DROP INDEX IF EXISTS public."ContractAppendixApprovalInstance_tenantId_idx";
DROP INDEX IF EXISTS public."ContractAppendixApprovalInstance_appendixId_key";
DROP INDEX IF EXISTS public."ContractAppendixApprovalDecision_instanceId_stepId_idx";
DROP INDEX IF EXISTS public."ContractAppendixApprovalDecision_approverUserId_idx";
DROP INDEX IF EXISTS public."Block_tenantId_idx";
DROP INDEX IF EXISTS public."BlockFloor_tenantId_blockId_name_key";
DROP INDEX IF EXISTS public."BlockFloor_tenantId_blockId_idx";
DROP INDEX IF EXISTS public."AuditLog_tenantId_entityType_idx";
DROP INDEX IF EXISTS public."AuditLog_tenantId_createdAt_idx";
DROP INDEX IF EXISTS public."AuditLog_tenantId_actorUserId_idx";
DROP INDEX IF EXISTS public."AuditLog_tenantId_action_idx";
DROP INDEX IF EXISTS public."ApprovalWorkflow_tenantId_usageTypes_idx";
DROP INDEX IF EXISTS public."ApprovalWorkflow_tenantId_idx";
DROP INDEX IF EXISTS public."ApprovalWorkflow_tenantId_active_idx";
DROP INDEX IF EXISTS public."AppUser_mobile_key";
DROP INDEX IF EXISTS public."AppUser_email_key";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."UserTenantMembership" DROP CONSTRAINT IF EXISTS "UserTenantMembership_pkey";
ALTER TABLE IF EXISTS ONLY public."UserTenantMembershipRole" DROP CONSTRAINT IF EXISTS "UserTenantMembershipRole_pkey";
ALTER TABLE IF EXISTS ONLY public."Unit" DROP CONSTRAINT IF EXISTS "Unit_pkey";
ALTER TABLE IF EXISTS ONLY public."TerminationRules" DROP CONSTRAINT IF EXISTS "TerminationRules_pkey";
ALTER TABLE IF EXISTS ONLY public."Tenant" DROP CONSTRAINT IF EXISTS "Tenant_pkey";
ALTER TABLE IF EXISTS ONLY public."TenantRole" DROP CONSTRAINT IF EXISTS "TenantRole_pkey";
ALTER TABLE IF EXISTS ONLY public."TenantRolePermission" DROP CONSTRAINT IF EXISTS "TenantRolePermission_pkey";
ALTER TABLE IF EXISTS ONLY public."TenantRoleMenuPermission" DROP CONSTRAINT IF EXISTS "TenantRoleMenuPermission_pkey";
ALTER TABLE IF EXISTS ONLY public."TenantContractRuleSettings" DROP CONSTRAINT IF EXISTS "TenantContractRuleSettings_pkey";
ALTER TABLE IF EXISTS ONLY public."TenantBusinessProfileSettings" DROP CONSTRAINT IF EXISTS "TenantBusinessProfileSettings_tenantId_key";
ALTER TABLE IF EXISTS ONLY public."TenantBusinessProfileSettings" DROP CONSTRAINT IF EXISTS "TenantBusinessProfileSettings_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectPlate" DROP CONSTRAINT IF EXISTS "ProjectPlate_pkey";
ALTER TABLE IF EXISTS ONLY public."FormerEmployee" DROP CONSTRAINT IF EXISTS "FormerEmployee_pkey";
ALTER TABLE IF EXISTS ONLY public."FinancialDueItem" DROP CONSTRAINT IF EXISTS "FinancialDueItem_pkey";
ALTER TABLE IF EXISTS ONLY public."FinancialCategory" DROP CONSTRAINT IF EXISTS "FinancialCategory_pkey";
ALTER TABLE IF EXISTS ONLY public."Employee" DROP CONSTRAINT IF EXISTS "Employee_pkey";
ALTER TABLE IF EXISTS ONLY public."DirectoryRepresentative" DROP CONSTRAINT IF EXISTS "DirectoryRepresentative_pkey";
ALTER TABLE IF EXISTS ONLY public."DirectoryPerson" DROP CONSTRAINT IF EXISTS "DirectoryPerson_pkey";
ALTER TABLE IF EXISTS ONLY public."DevPageThread" DROP CONSTRAINT IF EXISTS "DevPageThread_pkey";
ALTER TABLE IF EXISTS ONLY public."DevPageMessage" DROP CONSTRAINT IF EXISTS "DevPageMessage_pkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocument" DROP CONSTRAINT IF EXISTS "DevPageDocument_pkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocumentReadState" DROP CONSTRAINT IF EXISTS "DevPageDocumentReadState_pkey";
ALTER TABLE IF EXISTS ONLY public."DevPageDocumentEvent" DROP CONSTRAINT IF EXISTS "DevPageDocumentEvent_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractTechnicalSpecs" DROP CONSTRAINT IF EXISTS "ContractTechnicalSpecs_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractSubject" DROP CONSTRAINT IF EXISTS "ContractSubject_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractReceipt" DROP CONSTRAINT IF EXISTS "ContractReceipt_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenaltyType" DROP CONSTRAINT IF EXISTS "ContractPenaltyType_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenaltyRule" DROP CONSTRAINT IF EXISTS "ContractPenaltyRule_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractPenalties" DROP CONSTRAINT IF EXISTS "ContractPenalties_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractPartyMember" DROP CONSTRAINT IF EXISTS "ContractPartyMember_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractParties" DROP CONSTRAINT IF EXISTS "ContractParties_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractFinancial" DROP CONSTRAINT IF EXISTS "ContractFinancial_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractExtraCosts" DROP CONSTRAINT IF EXISTS "ContractExtraCosts_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractDraft" DROP CONSTRAINT IF EXISTS "ContractDraft_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractCustomerWalletLedger" DROP CONSTRAINT IF EXISTS "ContractCustomerWalletLedger_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractAttachments" DROP CONSTRAINT IF EXISTS "ContractAttachments_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractApprovalInstance" DROP CONSTRAINT IF EXISTS "ContractApprovalInstance_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractApprovalDecision" DROP CONSTRAINT IF EXISTS "ContractApprovalDecision_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendix" DROP CONSTRAINT IF EXISTS "ContractAppendix_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixItem" DROP CONSTRAINT IF EXISTS "ContractAppendixItem_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixApprovalInstance" DROP CONSTRAINT IF EXISTS "ContractAppendixApprovalInstance_pkey";
ALTER TABLE IF EXISTS ONLY public."ContractAppendixApprovalDecision" DROP CONSTRAINT IF EXISTS "ContractAppendixApprovalDecision_pkey";
ALTER TABLE IF EXISTS ONLY public."Block" DROP CONSTRAINT IF EXISTS "Block_pkey";
ALTER TABLE IF EXISTS ONLY public."BlockFloor" DROP CONSTRAINT IF EXISTS "BlockFloor_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
ALTER TABLE IF EXISTS ONLY public."ApprovalWorkflow" DROP CONSTRAINT IF EXISTS "ApprovalWorkflow_pkey";
ALTER TABLE IF EXISTS ONLY public."AppUser" DROP CONSTRAINT IF EXISTS "AppUser_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."UserTenantMembershipRole";
DROP TABLE IF EXISTS public."UserTenantMembership";
DROP TABLE IF EXISTS public."Unit";
DROP TABLE IF EXISTS public."TerminationRules";
DROP TABLE IF EXISTS public."TenantRolePermission";
DROP TABLE IF EXISTS public."TenantRoleMenuPermission";
DROP TABLE IF EXISTS public."TenantRole";
DROP TABLE IF EXISTS public."TenantContractRuleSettings";
DROP TABLE IF EXISTS public."TenantBusinessProfileSettings";
DROP TABLE IF EXISTS public."Tenant";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."ProjectPlate";
DROP TABLE IF EXISTS public."FormerEmployee";
DROP TABLE IF EXISTS public."FinancialDueItem";
DROP TABLE IF EXISTS public."FinancialCategory";
DROP TABLE IF EXISTS public."Employee";
DROP TABLE IF EXISTS public."DirectoryRepresentative";
DROP TABLE IF EXISTS public."DirectoryPerson";
DROP TABLE IF EXISTS public."DevPageThread";
DROP TABLE IF EXISTS public."DevPageMessage";
DROP TABLE IF EXISTS public."DevPageDocumentReadState";
DROP TABLE IF EXISTS public."DevPageDocumentEvent";
DROP TABLE IF EXISTS public."DevPageDocument";
DROP TABLE IF EXISTS public."ContractTechnicalSpecs";
DROP TABLE IF EXISTS public."ContractSubject";
DROP TABLE IF EXISTS public."ContractReceipt";
DROP TABLE IF EXISTS public."ContractPenaltyType";
DROP TABLE IF EXISTS public."ContractPenaltyRule";
DROP TABLE IF EXISTS public."ContractPenalties";
DROP TABLE IF EXISTS public."ContractPartyMember";
DROP TABLE IF EXISTS public."ContractParties";
DROP TABLE IF EXISTS public."ContractFinancial";
DROP TABLE IF EXISTS public."ContractExtraCosts";
DROP TABLE IF EXISTS public."ContractDraft";
DROP TABLE IF EXISTS public."ContractCustomerWalletLedger";
DROP TABLE IF EXISTS public."ContractAttachments";
DROP TABLE IF EXISTS public."ContractApprovalInstance";
DROP TABLE IF EXISTS public."ContractApprovalDecision";
DROP TABLE IF EXISTS public."ContractAppendixItem";
DROP TABLE IF EXISTS public."ContractAppendixApprovalInstance";
DROP TABLE IF EXISTS public."ContractAppendixApprovalDecision";
DROP TABLE IF EXISTS public."ContractAppendix";
DROP TABLE IF EXISTS public."BlockFloor";
DROP TABLE IF EXISTS public."Block";
DROP TABLE IF EXISTS public."AuditLog";
DROP TABLE IF EXISTS public."ApprovalWorkflow";
DROP TABLE IF EXISTS public."AppUser";
DROP TYPE IF EXISTS public."ShareMode";
DROP TYPE IF EXISTS public."RepresentativePrincipalType";
DROP TYPE IF EXISTS public."PricingType";
DROP TYPE IF EXISTS public."PersonType";
DROP TYPE IF EXISTS public."PartySide";
DROP TYPE IF EXISTS public."DirectoryRole";
DROP TYPE IF EXISTS public."ContractorType";
DROP TYPE IF EXISTS public."ContractType";
DROP TYPE IF EXISTS public."ContractApprovalInstanceStatus";
DROP TYPE IF EXISTS public."ContractApprovalDecisionType";
DROP TYPE IF EXISTS public."ContractAppendixStatus";
DROP EXTENSION IF EXISTS dblink;
--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


--
-- Name: ContractAppendixStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractAppendixStatus" AS ENUM (
    'DRAFT',
    'IN_REVIEW',
    'APPROVED'
);


--
-- Name: ContractApprovalDecisionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractApprovalDecisionType" AS ENUM (
    'APPROVE',
    'REQUEST_REVISION',
    'REJECT_TO_DRAFT'
);


--
-- Name: ContractApprovalInstanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractApprovalInstanceStatus" AS ENUM (
    'IN_REVIEW',
    'REVISION_REQUESTED',
    'REJECTED_TO_DRAFT',
    'APPROVED'
);


--
-- Name: ContractType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractType" AS ENUM (
    'sale',
    'pre_sale'
);


--
-- Name: ContractorType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractorType" AS ENUM (
    'self',
    'employee',
    'former_employee'
);


--
-- Name: DirectoryRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DirectoryRole" AS ENUM (
    'partner',
    'buyer',
    'shareholder'
);


--
-- Name: PartySide; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PartySide" AS ENUM (
    'party_one',
    'party_two'
);


--
-- Name: PersonType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PersonType" AS ENUM (
    'natural',
    'legal'
);


--
-- Name: PricingType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PricingType" AS ENUM (
    'fixed',
    'metered'
);


--
-- Name: RepresentativePrincipalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RepresentativePrincipalType" AS ENUM (
    'partner',
    'legal_shareholder'
);


--
-- Name: ShareMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ShareMode" AS ENUM (
    'percent',
    'dang'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AppUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AppUser" (
    id text NOT NULL,
    email text,
    "fullName" text NOT NULL,
    "passwordHash" text NOT NULL,
    "passwordSalt" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    mobile text,
    "firstName" text,
    "lastName" text
);


--
-- Name: ApprovalWorkflow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApprovalWorkflow" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    title text NOT NULL,
    "usageTypes" text[] DEFAULT ARRAY[]::text[],
    steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    "buyerShouldApprove" boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "finalApproverUserId" text
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "actorUserId" text,
    "actorName" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    "entityLabel" text,
    summary text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    diff jsonb DEFAULT '[]'::jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Block; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Block" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    "mainPlate" text,
    "subPlate" text,
    status text DEFAULT 'incomplete'::text NOT NULL,
    "usageCounts" jsonb DEFAULT '{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}'::jsonb NOT NULL
);


--
-- Name: BlockFloor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlockFloor" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "blockId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContractAppendix; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractAppendix" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "draftId" text NOT NULL,
    "previousAppendixId" text,
    "sourceKind" text DEFAULT 'contract'::text NOT NULL,
    "sourceId" text,
    status public."ContractAppendixStatus" DEFAULT 'DRAFT'::public."ContractAppendixStatus" NOT NULL,
    "appendixNumber" integer NOT NULL,
    title text NOT NULL,
    summary text,
    "effectiveDate" text NOT NULL,
    "issuerType" text NOT NULL,
    "issuerName" text NOT NULL,
    notes text,
    "approvalReturnedPending" boolean DEFAULT false NOT NULL,
    "approvalLastRejectionReason" text,
    "approvalLastRejectedAt" timestamp(3) without time zone,
    "releasedFromApprovedForEdit" boolean DEFAULT false NOT NULL,
    "createdByUserId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractAppendixApprovalDecision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractAppendixApprovalDecision" (
    id text NOT NULL,
    "instanceId" text NOT NULL,
    "stepId" text NOT NULL,
    "approverUserId" text NOT NULL,
    decision public."ContractApprovalDecisionType" NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContractAppendixApprovalInstance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractAppendixApprovalInstance" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "appendixId" text NOT NULL,
    "workflowId" text NOT NULL,
    status public."ContractApprovalInstanceStatus" DEFAULT 'IN_REVIEW'::public."ContractApprovalInstanceStatus" NOT NULL,
    "currentStepIndex" integer DEFAULT 0 NOT NULL,
    "finalApproverUserId" text,
    "stepsSnapshot" jsonb NOT NULL,
    "revisionResumeStepIndex" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractAppendixItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractAppendixItem" (
    id text NOT NULL,
    "appendixId" text NOT NULL,
    "tagKey" text NOT NULL,
    "groupKey" text NOT NULL,
    title text NOT NULL,
    description text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractApprovalDecision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractApprovalDecision" (
    id text NOT NULL,
    "instanceId" text NOT NULL,
    "stepId" text NOT NULL,
    "approverUserId" text NOT NULL,
    decision public."ContractApprovalDecisionType" NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContractApprovalInstance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractApprovalInstance" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "draftId" text NOT NULL,
    "workflowId" text NOT NULL,
    status public."ContractApprovalInstanceStatus" DEFAULT 'IN_REVIEW'::public."ContractApprovalInstanceStatus" NOT NULL,
    "currentStepIndex" integer DEFAULT 0 NOT NULL,
    "stepsSnapshot" jsonb NOT NULL,
    "revisionResumeStepIndex" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "finalApproverUserId" text
);


--
-- Name: ContractAttachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractAttachments" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    documents jsonb DEFAULT '[]'::jsonb NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractCustomerWalletLedger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractCustomerWalletLedger" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "draftId" text NOT NULL,
    "receiptId" text,
    "amountRial" numeric(18,2) NOT NULL,
    reason text DEFAULT 'overpayment'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContractDraft; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractDraft" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "approvalReturnedPending" boolean DEFAULT false NOT NULL,
    "approvalLastRejectionReason" text,
    "approvalLastRejectedAt" timestamp(3) without time zone,
    "releasedFromApprovedForEdit" boolean DEFAULT false NOT NULL
);


--
-- Name: ContractExtraCosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractExtraCosts" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    payload jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractFinancial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractFinancial" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    "pricingType" public."PricingType" DEFAULT 'fixed'::public."PricingType" NOT NULL,
    "totalArea" numeric(18,2),
    "pricePerMeter" numeric(18,2),
    "fixedTotalAmount" numeric(18,2),
    "activeTab" text,
    "unitArea" numeric(18,2),
    "parkingArea" numeric(18,2),
    "parkingPricePerMeter" numeric(18,2),
    "areaPricingMode" text DEFAULT 'unit-only'::text NOT NULL,
    "storageArea" numeric(18,2),
    "storagePricePerMeter" numeric(18,2),
    "parkingFixedAmount" numeric(18,2),
    "storageFixedAmount" numeric(18,2)
);


--
-- Name: ContractParties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractParties" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    "partyOneMode" public."ShareMode" DEFAULT 'dang'::public."ShareMode" NOT NULL,
    "partyTwoMode" public."ShareMode" DEFAULT 'dang'::public."ShareMode" NOT NULL
);


--
-- Name: ContractPartyMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractPartyMember" (
    id text NOT NULL,
    "partiesId" text NOT NULL,
    side public."PartySide" NOT NULL,
    "personId" text NOT NULL,
    "directoryId" text,
    "personType" public."PersonType" NOT NULL,
    name text NOT NULL,
    "shareValue" numeric(18,2) NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContractPenalties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractPenalties" (
    id text NOT NULL,
    "draftId" text NOT NULL
);


--
-- Name: ContractPenaltyRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractPenaltyRule" (
    id text NOT NULL,
    "penaltiesId" text NOT NULL,
    "penaltyTypeId" text NOT NULL,
    mode text NOT NULL,
    period text NOT NULL,
    "fixedAmount" numeric(18,2),
    "penaltyPercent" numeric(18,2),
    "bankInterestPercent" numeric(18,2),
    "graceDays" integer,
    "roundRule" text,
    "extraFeeEnabled" boolean DEFAULT false NOT NULL,
    "extraFeeType" text,
    "extraFeeAmount" numeric(18,2),
    "extraFeeRoundRule" text,
    "progressiveRows" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractPenaltyType; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractPenaltyType" (
    id text NOT NULL,
    "penaltiesId" text NOT NULL,
    title text NOT NULL,
    active boolean DEFAULT false NOT NULL
);


--
-- Name: ContractReceipt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractReceipt" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "draftId" text NOT NULL,
    "allocationMode" text NOT NULL,
    "allocationDate" text NOT NULL,
    "transferKind" text NOT NULL,
    "depositorName" text NOT NULL,
    "paidAmountRial" numeric(18,2) NOT NULL,
    "depositDate" text NOT NULL,
    "depositTime" text,
    "destinationValue" text,
    "destinationHolder" text,
    "destinationHolders" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "trackingNumber" text,
    "referenceNumber" text,
    "receiptNumber" text,
    notes text,
    documents jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContractSubject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractSubject" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    "contractorType" public."ContractorType" NOT NULL,
    "contractorEmployeeId" text,
    "contractorFormerName" text,
    "contractType" public."ContractType" NOT NULL,
    "contractDate" text NOT NULL,
    "contractNumber" text NOT NULL,
    "deliveryDate" text NOT NULL,
    "blockId" text NOT NULL,
    "unitId" text NOT NULL
);


--
-- Name: ContractTechnicalSpecs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContractTechnicalSpecs" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    specs jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DevPageDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DevPageDocument" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "pagePath" text NOT NULL,
    "pageKey" text NOT NULL,
    title text NOT NULL,
    "docType" text DEFAULT 'free'::text NOT NULL,
    "contentHtml" text DEFAULT ''::text NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "appId" text DEFAULT 'vahedyek'::text NOT NULL,
    "audioDataUrl" text,
    "audioMimeType" text,
    "labelsJson" text DEFAULT '[]'::text NOT NULL
);


--
-- Name: DevPageDocumentEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DevPageDocumentEvent" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "appId" text DEFAULT 'vahedyek'::text NOT NULL,
    "pagePath" text NOT NULL,
    "pageKey" text NOT NULL,
    "docId" text,
    "docTitle" text,
    "eventType" text NOT NULL,
    details text,
    "actorUserId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "docType" text,
    "labelsJson" text DEFAULT '[]'::text NOT NULL
);


--
-- Name: DevPageDocumentReadState; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DevPageDocumentReadState" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "appId" text DEFAULT 'vahedyek'::text NOT NULL,
    "userId" text NOT NULL,
    "documentId" text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DevPageMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DevPageMessage" (
    id text NOT NULL,
    "threadId" text NOT NULL,
    "authorUserId" text NOT NULL,
    "replyToMessageId" text,
    "messageType" text DEFAULT 'text'::text NOT NULL,
    text text,
    "attachmentDataUrl" text,
    "attachmentMimeType" text,
    "attachmentName" text,
    "attachmentSize" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DevPageThread; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DevPageThread" (
    id text NOT NULL,
    "appId" text DEFAULT 'vahedyek'::text NOT NULL,
    "pageKey" text NOT NULL,
    "pagePathSample" text DEFAULT '/'::text NOT NULL,
    title text NOT NULL,
    "docType" text DEFAULT 'free'::text NOT NULL,
    priority text DEFAULT 'p2'::text NOT NULL,
    "labelsJson" text DEFAULT '[]'::text NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'todo'::text NOT NULL
);


--
-- Name: DirectoryPerson; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DirectoryPerson" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    role public."DirectoryRole" NOT NULL,
    "personType" public."PersonType" NOT NULL
);


--
-- Name: DirectoryRepresentative; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DirectoryRepresentative" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "principalId" text NOT NULL,
    "userId" text,
    "principalType" public."RepresentativePrincipalType" NOT NULL,
    "fullName" text NOT NULL,
    email text,
    "hasSigningAuthority" boolean DEFAULT false NOT NULL,
    "panelAccessEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Employee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Employee" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "nationalCode" text
);


--
-- Name: FinancialCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FinancialCategory" (
    id text NOT NULL,
    "financialId" text NOT NULL,
    name text NOT NULL,
    "capAmount" numeric(18,2) NOT NULL,
    "dueAmount" numeric(18,2) NOT NULL,
    "noDueAmount" numeric(18,2) NOT NULL,
    system boolean DEFAULT false NOT NULL,
    "requiresDue" boolean DEFAULT true NOT NULL
);


--
-- Name: FinancialDueItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FinancialDueItem" (
    id text NOT NULL,
    "financialId" text NOT NULL,
    "categoryId" text NOT NULL,
    amount numeric(18,2) NOT NULL,
    "dueDate" text NOT NULL,
    title text DEFAULT ''::text NOT NULL
);


--
-- Name: FormerEmployee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FormerEmployee" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "fullName" text NOT NULL,
    "normalizedName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProjectPlate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectPlate" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "mainPlate" text NOT NULL,
    "subPlates" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    token text NOT NULL,
    "tenantId" text,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    "brandCode" text DEFAULT 'VN'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "packageKey" text DEFAULT 'starter'::text NOT NULL,
    "billingCycle" text DEFAULT 'monthly'::text NOT NULL,
    "projectUnitTypes" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "projectReportData" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "projectTechnicalSpecs" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "projectAddressData" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "approvalProcessConfig" jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: TenantBusinessProfileSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantBusinessProfileSettings" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "profilePayload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TenantContractRuleSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantContractRuleSettings" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "rulesPayload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "loanPayload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TenantRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantRole" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    system boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TenantRoleMenuPermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantRoleMenuPermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "menuItemId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TenantRolePermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantRolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TerminationRules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TerminationRules" (
    id text NOT NULL,
    "draftId" text NOT NULL,
    "buyerRules" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Unit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Unit" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "blockId" text NOT NULL,
    "floorName" text NOT NULL,
    name text NOT NULL,
    category text DEFAULT 'unit'::text NOT NULL,
    "unitType" text,
    usage text DEFAULT 'residential'::text NOT NULL,
    "saleEnabled" boolean DEFAULT true NOT NULL,
    "deliveryStatus" text DEFAULT 'ready'::text NOT NULL,
    area double precision,
    "balconyCount" integer DEFAULT 0 NOT NULL,
    "bedroomCount" integer DEFAULT 0 NOT NULL,
    "postalCode" text,
    amenities jsonb DEFAULT '[]'::jsonb NOT NULL,
    direction text DEFAULT 'unknown'::text NOT NULL,
    "assignedToUnitId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "baseInfo" text,
    "areaPricingMode" text DEFAULT 'unit-only'::text NOT NULL
);


--
-- Name: UserTenantMembership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserTenantMembership" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tenantId" text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserTenantMembershipRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserTenantMembershipRole" (
    id text NOT NULL,
    "membershipId" text NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AppUser; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AppUser" (id, email, "fullName", "passwordHash", "passwordSalt", "createdAt", "updatedAt", mobile, "firstName", "lastName") FROM stdin;
cmoebtr040001wcjkjeyfyrul	admin@lind.ir	علی علی‌نقی پور	39bdf95bb4e358b5d4e54ad5854ca14a208e97f810985b4c086a22922f759605c721afaff26f491647a9538897d1996c089660d06e353c4c762ddc81bf6f26ca	vahedyek-demo-salt	2026-04-25 12:39:36.437	2026-04-25 12:39:36.437	\N	\N	\N
cmoebzvyh0000wc3cbhb8ug46	a@gmail.com	علی	d2f57190e432b5d2a4078ed9b1d2f822318ca773da4565dbf72aa953afa26c1d3037eb509098c1314b158238b77fb371f5caca2c07e5f288c653c2643e2c73e0	5e6c67d9d8db971785425c197ddd567b	2026-04-25 12:44:22.794	2026-04-25 12:44:22.794	\N	\N	\N
cmofqwtsv0000ot6wn9vcs7xp	aaa@gmail.com	علی	3897500729a0834bd593297969101d141e84ef5b03366406f4ed99587fbc8c76fc953e09fd1a30e37adc207eda4264c4db016881341b76d7199601d233128433	7f9b2faa8b288712e5f12629b533f021	2026-04-26 12:29:40.447	2026-04-26 12:29:40.447	\N	\N	\N
cmogqxilf0000wc0og32ocxau	aa@gmail.com	سلام	f582de036ca6688b94c624b2e6fba3396d59a264fb39836937402edec02d37eb14c7ffef1101bb960cd976803e4e7af05a37bf08e867d3df010a6c948e204c26	2e27250d6d534e477ffdc96024474864	2026-04-27 05:17:58.755	2026-04-27 05:17:58.755	\N	\N	\N
cmogr3x540000otts2c8tm83j	s@gmail.com	سعید	82c713671e7f3e8acf2402d480f7302172740d374b7424aaad9487ab3e1e3e14d0358c08e79d1ad377aae0bb7678f07d098d6b6d2c5b2741f52a600b395c6165	4f1a3e83b11b5397ce75b666fe4f0fb7	2026-04-27 05:22:57.544	2026-04-27 05:22:57.544	\N	\N	\N
cmogr7fox0000oyr0fcmh1sfe	z@gmail.com	z	a89b79fe9602dda5090d5c0136e6ed84c61d1dbafe5a9b9335717f00d85042b03de82b23a698e97137d6fb59f5a3401d893879a4ccfc2f42be231331334b5420	9c446bdc8572e4f0298ef256f89532d5	2026-04-27 05:25:41.553	2026-04-27 05:25:41.553	\N	\N	\N
cmoh0le3a0000oy48im9l62m3	a1@gmail.com	احمدرضا	69cf40220d5bf4ea0748a9b6d7d5a1ff01989fb8cf68d170a3c09a5d726761e7c3a622d74d9bd0cc3ff1c996428a6b2a1abc3b077060c1532fcfa801681b7992	10ca4579dc2667f294921559444a88bc	2026-04-27 09:48:29.206	2026-04-27 09:48:29.206	\N	\N	\N
cmpdlxei30000volk8ynndqfn	\N	amin mtz	f03f34335af8f46e21a98b61ebfcd3cc99916bac5352016e28131f569a3d9b7c8a189b3cf1c872e2ae202aecc2a1c494e2b40b20c58e2de71890856e094053f4	9ea6cc8db054edd6a27714c06a8abe6b	2026-05-20 05:14:19.176	2026-05-20 05:14:19.176	9177330997	amin	mtz
cmpjf7y7v0000ri2vtexe9hwr	\N	zahra ahmadi	afb996f65a15b757a3a597a1fef67fde465cbe149f19e13c61a3e3590371a67be7bb6548eccf79f97dd6e030a66b0e883d9d2c33835bc31c38538d8f43e9a96b	d4c84894517b4782306897302620e539	2026-05-24 06:53:11.035	2026-05-24 06:53:11.035	9027651550	zahra	ahmadi
\.


--
-- Data for Name: ApprovalWorkflow; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApprovalWorkflow" (id, "tenantId", title, "usageTypes", steps, "buyerShouldApprove", active, "createdAt", "updatedAt", "finalApproverUserId") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "tenantId", "actorUserId", "actorName", action, "entityType", "entityId", "entityLabel", summary, details, diff, metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: Block; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Block" (id, "tenantId", name, "mainPlate", "subPlate", status, "usageCounts") FROM stdin;
block-001	cmoebtqxu0000wcjkkb46arl7	بلوک آفتاب	\N	\N	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
block-002	cmoebtqxu0000wcjkkb46arl7	بلوک سپهر	\N	\N	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
block-003	cmoebtqxu0000wcjkkb46arl7	بلوک نگین	\N	\N	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
34d13699-6d60-41ce-9275-d47939446749	cmoec06b60001wc3cv6bp30hg	1	4	3	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
ff8ea6f2-ddaf-4599-a94f-463440dbdb8b	cmogqxt3z0001wc0o6wbr9fxc	a	1	1	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
8d0597b8-3806-4a14-8067-51f46904322d	cmogr7tg50001oyr0z8zzs01m	A1	2	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
5e3e29fe-6d12-4812-8a12-445dfcf1aa8c	cmoh0lqin0001oy48y754st1v	A-2	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
bf75a941-2644-4f92-8e63-ce879c793c84	cmoh0lqin0001oy48y754st1v	A-3	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
ec8c8d1e-7d14-4102-a8b9-7f2a293c8da1	cmoh0lqin0001oy48y754st1v	A-4	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
addd36d0-1158-4844-8061-f7f280c192ba	cmoh0lqin0001oy48y754st1v	A-5	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
4fcb5449-1f85-4e07-b8e7-d6d0227a451c	cmoh0lqin0001oy48y754st1v	A-6	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
02869753-7e89-4b1b-8f8a-1846510060e1	cmoh0lqin0001oy48y754st1v	A-7	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
e7abd202-d064-4ce6-8219-90fec5daef61	cmoh0lqin0001oy48y754st1v	A-8	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
f2b25b36-8df9-4369-b400-8104e6f6e569	cmoh0lqin0001oy48y754st1v	A-9	10	5	incomplete	{"office": 0, "amenity": 0, "parking": 0, "storage": 0, "commercial": 0, "residential": 0}
\.


--
-- Data for Name: BlockFloor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BlockFloor" (id, "tenantId", "blockId", name, "createdAt") FROM stdin;
e624ba87-579f-44f3-a425-207634957ee2	cmoec06b60001wc3cv6bp30hg	34d13699-6d60-41ce-9275-d47939446749	ط-1	2026-04-25 12:45:25.858
47d1bc76-50c7-42a4-b7e4-017a1bdc2be2	cmoec06b60001wc3cv6bp30hg	34d13699-6d60-41ce-9275-d47939446749	ط-2	2026-04-25 12:45:25.886
d7eb1167-f764-457c-b191-9d2db6165de8	cmoec06b60001wc3cv6bp30hg	34d13699-6d60-41ce-9275-d47939446749	ط-3	2026-04-25 12:45:25.914
aa3c6066-a836-4876-ba5a-f3b7a127be91	cmogqxt3z0001wc0o6wbr9fxc	ff8ea6f2-ddaf-4599-a94f-463440dbdb8b	a	2026-04-27 05:20:30.129
750f270a-d7f7-4ecf-ac4e-24e4dfcca850	cmoh0lqin0001oy48y754st1v	5e3e29fe-6d12-4812-8a12-445dfcf1aa8c	AR-1	2026-04-27 09:49:40.397
63c5766a-f7e5-4136-a7ee-5729e48c756d	cmoh0lqin0001oy48y754st1v	5e3e29fe-6d12-4812-8a12-445dfcf1aa8c	AR-2	2026-04-27 09:49:40.426
f987de41-adf1-440a-9504-d8fbe177087c	cmoh0lqin0001oy48y754st1v	5e3e29fe-6d12-4812-8a12-445dfcf1aa8c	AR-3	2026-04-27 09:49:40.46
\.


--
-- Data for Name: ContractAppendix; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractAppendix" (id, "tenantId", "draftId", "previousAppendixId", "sourceKind", "sourceId", status, "appendixNumber", title, summary, "effectiveDate", "issuerType", "issuerName", notes, "approvalReturnedPending", "approvalLastRejectionReason", "approvalLastRejectedAt", "releasedFromApprovedForEdit", "createdByUserId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContractAppendixApprovalDecision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractAppendixApprovalDecision" (id, "instanceId", "stepId", "approverUserId", decision, reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: ContractAppendixApprovalInstance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractAppendixApprovalInstance" (id, "tenantId", "appendixId", "workflowId", status, "currentStepIndex", "finalApproverUserId", "stepsSnapshot", "revisionResumeStepIndex", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContractAppendixItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractAppendixItem" (id, "appendixId", "tagKey", "groupKey", title, description, payload, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContractApprovalDecision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractApprovalDecision" (id, "instanceId", "stepId", "approverUserId", decision, reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: ContractApprovalInstance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractApprovalInstance" (id, "tenantId", "draftId", "workflowId", status, "currentStepIndex", "stepsSnapshot", "revisionResumeStepIndex", "createdAt", "updatedAt", "finalApproverUserId") FROM stdin;
\.


--
-- Data for Name: ContractAttachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractAttachments" (id, "draftId", documents, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContractCustomerWalletLedger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractCustomerWalletLedger" (id, "tenantId", "draftId", "receiptId", "amountRial", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: ContractDraft; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractDraft" (id, "tenantId", "createdAt", "updatedAt", "approvalReturnedPending", "approvalLastRejectionReason", "approvalLastRejectedAt", "releasedFromApprovedForEdit") FROM stdin;
draft-demo-001	cmoebtqxu0000wcjkkb46arl7	2026-04-25 12:39:37.241	2026-04-25 12:39:37.241	f	\N	\N	f
5218a700-b3eb-4ed7-9086-5fb2b0aaeac7	cmoec06b60001wc3cv6bp30hg	2026-04-25 12:48:18.442	2026-04-25 12:48:18.442	f	\N	\N	f
4adfe7e9-1c60-462f-86bf-ed1f4c74751d	cmoec06b60001wc3cv6bp30hg	2026-04-25 12:48:18.711	2026-04-25 12:48:18.711	f	\N	\N	f
5a4b726f-afbb-4007-a3f0-deee4956d214	cmogqxt3z0001wc0o6wbr9fxc	2026-04-27 05:45:52.673	2026-04-27 05:45:52.673	f	\N	\N	f
7d1573e3-03e5-4ee4-aac1-986f4b947d07	cmogqxt3z0001wc0o6wbr9fxc	2026-04-27 05:45:52.703	2026-04-27 05:45:52.703	f	\N	\N	f
dba0c2e5-8c6d-4648-bfdb-8817594af497	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 08:32:36.148	2026-04-28 08:32:36.148	f	\N	\N	f
de42ea6c-b3e8-42b1-845c-dcc7d153a4e6	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 08:32:36.148	2026-04-28 08:32:36.148	f	\N	\N	f
99c86a73-7a2e-4c6b-8249-130800526c0a	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 09:55:07.639	2026-04-28 09:55:07.639	f	\N	\N	f
713ecba7-b419-40f1-99b7-2c39e8abc949	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 09:55:07.669	2026-04-28 09:55:07.669	f	\N	\N	f
e26d50e6-6924-4a3d-8455-c88f34a7cb2c	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 10:51:58.585	2026-04-28 10:51:58.585	f	\N	\N	f
9165a6ef-f56b-4560-ad42-f14ca290d2b9	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 10:51:58.697	2026-04-28 10:51:58.697	f	\N	\N	f
19ca48ad-1236-4367-a47f-b097f0fb15a7	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 10:52:34.737	2026-04-28 10:52:34.737	f	\N	\N	f
a79088b1-c75f-4157-a3fd-f5fcbf269e52	cmogqxt3z0001wc0o6wbr9fxc	2026-04-28 10:52:34.739	2026-04-28 10:52:34.739	f	\N	\N	f
\.


--
-- Data for Name: ContractExtraCosts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractExtraCosts" (id, "draftId", payload, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContractFinancial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractFinancial" (id, "draftId", "pricingType", "totalArea", "pricePerMeter", "fixedTotalAmount", "activeTab", "unitArea", "parkingArea", "parkingPricePerMeter", "areaPricingMode", "storageArea", "storagePricePerMeter", "parkingFixedAmount", "storageFixedAmount") FROM stdin;
cmoebts7f0009wcjks703lh0p	draft-demo-001	fixed	\N	\N	12500000000.00	advance	\N	\N	\N	unit-only	\N	\N	\N	\N
cmoec7dvm01atwc3cd4rc96br	4adfe7e9-1c60-462f-86bf-ed1f4c74751d	fixed	100.00	0.00	200000000.00	advance	100.00	0.00	0.00	unit-only	\N	\N	\N	\N
cmogs0v6r00f9wcokk0y1ozz8	7d1573e3-03e5-4ee4-aac1-986f4b947d07	fixed	150.00	0.00	10000000.00	installment	150.00	0.00	0.00	unit-only	\N	\N	\N	\N
\.


--
-- Data for Name: ContractParties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractParties" (id, "draftId", "partyOneMode", "partyTwoMode") FROM stdin;
cmoebtrts0007wcjkngjd505l	draft-demo-001	dang	percent
cmoec75tb01apwc3c537ydhvl	4adfe7e9-1c60-462f-86bf-ed1f4c74751d	dang	dang
cmogrym9n00f3wcokmxwq42qs	7d1573e3-03e5-4ee4-aac1-986f4b947d07	dang	dang
\.


--
-- Data for Name: ContractPartyMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractPartyMember" (id, "partiesId", side, "personId", "directoryId", "personType", name, "shareValue", "isPrimary", "createdAt") FROM stdin;
draft-demo-001-party-1	cmoebtrts0007wcjkngjd505l	party_one	partner-legal-1	partner-legal-1	legal	شرکت فپکو	6.00	t	2026-04-25 12:39:37.833
draft-demo-001-party-2	cmoebtrts0007wcjkngjd505l	party_two	buyer-natural-1	buyer-natural-1	natural	سارا محمدی	60.00	t	2026-04-25 12:39:37.833
draft-demo-001-party-3	cmoebtrts0007wcjkngjd505l	party_two	buyer-natural-2	buyer-natural-2	natural	رضا عباسی	40.00	f	2026-04-25 12:39:37.833
cmogr6hvr00r4oti02jxj8g9a	cmoec75tb01apwc3c537ydhvl	party_one	5726bf3b-6f79-4563-b832-763f57607fb4	5726bf3b-6f79-4563-b832-763f57607fb4	natural	تسا	6.00	t	2026-04-27 05:24:57.735
cmogr6hvr00r5oti0515odwpj	cmoec75tb01apwc3c537ydhvl	party_two	287b1c4e-3ea8-4daa-a414-e9a80007760a	287b1c4e-3ea8-4daa-a414-e9a80007760a	natural	123	5.99	t	2026-04-27 05:24:57.735
cmogrza8y00f6wcok2gllaods	cmogrym9n00f3wcokmxwq42qs	party_one	c9c0d734-3c8d-4840-8487-72a951133f3b	c9c0d734-3c8d-4840-8487-72a951133f3b	natural	زارع	6.00	t	2026-04-27 05:47:20.866
cmogrza8y00f7wcokvq2brh04	cmogrym9n00f3wcokmxwq42qs	party_two	7226b1e1-0cce-49e5-b804-3330db6c6989	7226b1e1-0cce-49e5-b804-3330db6c6989	natural	علی	6.00	t	2026-04-27 05:47:20.866
\.


--
-- Data for Name: ContractPenalties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractPenalties" (id, "draftId") FROM stdin;
cmofefbep0031wci87tgcr7dj	4adfe7e9-1c60-462f-86bf-ed1f4c74751d
\.


--
-- Data for Name: ContractPenaltyRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractPenaltyRule" (id, "penaltiesId", "penaltyTypeId", mode, period, "fixedAmount", "penaltyPercent", "bankInterestPercent", "graceDays", "roundRule", "extraFeeEnabled", "extraFeeType", "extraFeeAmount", "extraFeeRoundRule", "progressiveRows", "createdAt", "updatedAt") FROM stdin;
cmofefbep0031wci87tgcr7dj:rule-pwrsonif	cmofefbep0031wci87tgcr7dj	cmofefbep0031wci87tgcr7dj:unit-handover-delay	fixed	monthly	25.00	0.00	0.00	2	100	f	percent	0.00	100	[{"id": "row-1", "rate": "0.5", "toDay": "4", "fromDay": "1"}, {"id": "row-2", "rate": "0.5", "toDay": "6", "fromDay": "5"}, {"id": "row-3", "rate": "3.3", "toDay": "65", "fromDay": "7"}, {"id": "row-4", "rate": "", "toDay": "", "fromDay": ""}]	2026-04-27 05:25:05.041	2026-04-27 05:25:05.041
\.


--
-- Data for Name: ContractPenaltyType; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractPenaltyType" (id, "penaltiesId", title, active) FROM stdin;
cmofefbep0031wci87tgcr7dj:unit-handover-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در تحویل واحد	t
cmofefbep0031wci87tgcr7dj:installment-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در پرداخت اقساط	f
cmofefbep0031wci87tgcr7dj:document-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در تحویل سند	f
cmofefbep0031wci87tgcr7dj:advance-payment-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در پیش‌پرداخت	f
cmofefbep0031wci87tgcr7dj:misc-cost-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در هزینه‌های متفرقه	f
cmofefbep0031wci87tgcr7dj:adjustment-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در پرداخت تعدیل	f
cmofefbep0031wci87tgcr7dj:penalty-payment-delay	cmofefbep0031wci87tgcr7dj	جریمه تاخیر در پرداخت جرایم	f
cmofefbep0031wci87tgcr7dj:bank-loan-case-delay	cmofefbep0031wci87tgcr7dj	تاخیر در تشکیل پرونده تسهیلات بانکی	f
cmofefbep0031wci87tgcr7dj:lawsuit-cost	cmofefbep0031wci87tgcr7dj	هزینه تشکیل پرونده دادرسی بابت بدهی	f
cmofefbep0031wci87tgcr7dj:document-transfer-followup	cmofefbep0031wci87tgcr7dj	عدم پیگیری مراحل اداری انتقال سند	f
cmofefbep0031wci87tgcr7dj:discount-cancelled	cmofefbep0031wci87tgcr7dj	جریمه تخفیف لغو شده	f
\.


--
-- Data for Name: ContractReceipt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractReceipt" (id, "tenantId", "draftId", "allocationMode", "allocationDate", "transferKind", "depositorName", "paidAmountRial", "depositDate", "depositTime", "destinationValue", "destinationHolder", "destinationHolders", "trackingNumber", "referenceNumber", "receiptNumber", notes, documents, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContractSubject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractSubject" (id, "draftId", "contractorType", "contractorEmployeeId", "contractorFormerName", "contractType", "contractDate", "contractNumber", "deliveryDate", "blockId", "unitId") FROM stdin;
cmoebtrnx0005wcjkk2edj3h2	draft-demo-001	self	\N	\N	pre_sale	1405/01/20	CNT-1405-001	1405/06/15	block-001	unit-001
cmoec6pqa01anwc3c4a9d9k2g	4adfe7e9-1c60-462f-86bf-ed1f4c74751d	self	\N	\N	pre_sale	۱۴۰۵/۰۲/۰۵	5	۱۴۰۵/۰۲/۲۹	34d13699-6d60-41ce-9275-d47939446749	8bcf77b6-00f4-42e2-b3f1-d9f311cdbce5
cmogryjgs00f1wcoksdfqc76n	7d1573e3-03e5-4ee4-aac1-986f4b947d07	self	\N	\N	pre_sale	۱۴۰۵/۰۲/۰۱	1234	۱۴۰۵/۰۲/۲۲	ff8ea6f2-ddaf-4599-a94f-463440dbdb8b	0b013cb0-e444-4950-a881-8ac3d284dba0
cmoifaux40001wcjsjsbsqiaa	dba0c2e5-8c6d-4648-bfdb-8817594af497	self	\N	\N	pre_sale	۱۴۰۵/۰۲/۰۸	1	۱۴۰۵/۰۲/۰۲	ff8ea6f2-ddaf-4599-a94f-463440dbdb8b	0b013cb0-e444-4950-a881-8ac3d284dba0
\.


--
-- Data for Name: ContractTechnicalSpecs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContractTechnicalSpecs" (id, "draftId", specs, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DevPageDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DevPageDocument" (id, "tenantId", "pagePath", "pageKey", title, "docType", "contentHtml", "createdById", "updatedById", "createdAt", "updatedAt", "appId", "audioDataUrl", "audioMimeType", "labelsJson") FROM stdin;
\.


--
-- Data for Name: DevPageDocumentEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DevPageDocumentEvent" (id, "tenantId", "appId", "pagePath", "pageKey", "docId", "docTitle", "eventType", details, "actorUserId", "createdAt", "docType", "labelsJson") FROM stdin;
\.


--
-- Data for Name: DevPageDocumentReadState; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DevPageDocumentReadState" (id, "tenantId", "appId", "userId", "documentId", "isRead", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DevPageMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DevPageMessage" (id, "threadId", "authorUserId", "replyToMessageId", "messageType", text, "attachmentDataUrl", "attachmentMimeType", "attachmentName", "attachmentSize", "createdAt") FROM stdin;
\.


--
-- Data for Name: DevPageThread; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DevPageThread" (id, "appId", "pageKey", "pagePathSample", title, "docType", priority, "labelsJson", "createdById", "updatedById", "createdAt", "updatedAt", status) FROM stdin;
\.


--
-- Data for Name: DirectoryPerson; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DirectoryPerson" (id, "tenantId", name, role, "personType") FROM stdin;
partner-natural-1	cmoebtqxu0000wcjkkb46arl7	علی رضایی	partner	natural
partner-natural-2	cmoebtqxu0000wcjkkb46arl7	مریم احمدی	partner	natural
partner-natural-3	cmoebtqxu0000wcjkkb46arl7	حسین کریمی	partner	natural
partner-legal-1	cmoebtqxu0000wcjkkb46arl7	شرکت فپکو	partner	legal
partner-legal-2	cmoebtqxu0000wcjkkb46arl7	شرکت توسعه سپهر	partner	legal
partner-legal-3	cmoebtqxu0000wcjkkb46arl7	موسسه سرمایه گستر	partner	legal
buyer-natural-1	cmoebtqxu0000wcjkkb46arl7	سارا محمدی	buyer	natural
buyer-natural-2	cmoebtqxu0000wcjkkb46arl7	رضا عباسی	buyer	natural
buyer-natural-3	cmoebtqxu0000wcjkkb46arl7	نرگس یوسفی	buyer	natural
buyer-legal-1	cmoebtqxu0000wcjkkb46arl7	شرکت افق سازان	buyer	legal
buyer-legal-2	cmoebtqxu0000wcjkkb46arl7	شرکت آتیه مسکن	buyer	legal
buyer-legal-3	cmoebtqxu0000wcjkkb46arl7	گروه سرمایه گذاری پرگاس	buyer	legal
5726bf3b-6f79-4563-b832-763f57607fb4	cmoec06b60001wc3cv6bp30hg	تسا	partner	natural
287b1c4e-3ea8-4daa-a414-e9a80007760a	cmoec06b60001wc3cv6bp30hg	123	buyer	natural
c9c0d734-3c8d-4840-8487-72a951133f3b	cmogqxt3z0001wc0o6wbr9fxc	زارع	partner	natural
7226b1e1-0cce-49e5-b804-3330db6c6989	cmogqxt3z0001wc0o6wbr9fxc	علی	buyer	natural
\.


--
-- Data for Name: DirectoryRepresentative; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DirectoryRepresentative" (id, "tenantId", "principalId", "userId", "principalType", "fullName", email, "hasSigningAuthority", "panelAccessEnabled", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Employee" (id, "tenantId", "firstName", "lastName", "isActive", "nationalCode") FROM stdin;
emp-001	cmoebtqxu0000wcjkkb46arl7	علی	محمدی	t	\N
emp-002	cmoebtqxu0000wcjkkb46arl7	سارا	احمدی	t	\N
emp-003	cmoebtqxu0000wcjkkb46arl7	رضا	کاظمی	t	\N
\.


--
-- Data for Name: FinancialCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FinancialCategory" (id, "financialId", name, "capAmount", "dueAmount", "noDueAmount", system, "requiresDue") FROM stdin;
advance	cmoebts7f0009wcjks703lh0p	پیش پرداخت	2500000000.00	2500000000.00	0.00	t	t
document	cmoebts7f0009wcjks703lh0p	تحویل سند	3000000000.00	3000000000.00	0.00	t	t
cmoec7dvm01atwc3cd4rc96br:advance	cmoec7dvm01atwc3cd4rc96br	پیش پرداخت	0.00	0.00	0.00	t	t
cmoec7dvm01atwc3cd4rc96br:installment	cmoec7dvm01atwc3cd4rc96br	اقساط ثابت	0.00	0.00	0.00	t	t
cmoec7dvm01atwc3cd4rc96br:loan	cmoec7dvm01atwc3cd4rc96br	وام بانکی	0.00	0.00	0.00	t	f
cmoec7dvm01atwc3cd4rc96br:handover	cmoec7dvm01atwc3cd4rc96br	تحویل واحد	0.00	0.00	0.00	t	f
cmoec7dvm01atwc3cd4rc96br:document	cmoec7dvm01atwc3cd4rc96br	تحویل سند	0.00	0.00	0.00	t	f
cmogs0v6r00f9wcokk0y1ozz8:advance	cmogs0v6r00f9wcokk0y1ozz8	پیش پرداخت	10000000.00	10000000.00	0.00	t	t
cmogs0v6r00f9wcokk0y1ozz8:installment	cmogs0v6r00f9wcokk0y1ozz8	اقساط ثابت	0.00	0.00	0.00	t	t
cmogs0v6r00f9wcokk0y1ozz8:loan	cmogs0v6r00f9wcokk0y1ozz8	وام بانکی	0.00	0.00	0.00	t	f
cmogs0v6r00f9wcokk0y1ozz8:handover	cmogs0v6r00f9wcokk0y1ozz8	تحویل واحد	0.00	0.00	0.00	t	f
cmogs0v6r00f9wcokk0y1ozz8:document	cmogs0v6r00f9wcokk0y1ozz8	تحویل سند	0.00	0.00	0.00	t	f
\.


--
-- Data for Name: FinancialDueItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FinancialDueItem" (id, "financialId", "categoryId", amount, "dueDate", title) FROM stdin;
draft-demo-001-due-1	cmoebts7f0009wcjks703lh0p	advance	2500000000.00	1405/02/01	
draft-demo-001-due-2	cmoebts7f0009wcjks703lh0p	document	3000000000.00	1405/04/01	
cmogs0v6r00f9wcokk0y1ozz8:due-1777268911171	cmogs0v6r00f9wcokk0y1ozz8	cmogs0v6r00f9wcokk0y1ozz8:advance	10000000.00	۱۴۰۵/۰۲/۱۵	test
\.


--
-- Data for Name: FormerEmployee; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FormerEmployee" (id, "tenantId", "fullName", "normalizedName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectPlate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProjectPlate" (id, "tenantId", "mainPlate", "subPlates", "createdAt") FROM stdin;
84b0c47c-3ca4-4c12-9fe7-02e9059cd9c4	cmoec06b60001wc3cv6bp30hg	4	["3"]	2026-04-25 12:45:07.924
412f0104-13a5-441f-88e4-32e1bb8e49a2	cmogqxt3z0001wc0o6wbr9fxc	1	["1"]	2026-04-27 05:20:19.573
582dced2-68de-4858-9097-173d69aa9193	cmogr7tg50001oyr0z8zzs01m	2	["5"]	2026-04-27 05:26:32.096
121d3169-4426-46a9-aa1c-b953a184ed4e	cmoh0lqin0001oy48y754st1v	10	["5"]	2026-04-27 09:49:19.749
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, token, "tenantId", "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tenant" (id, slug, name, "brandCode", "createdAt", "updatedAt", "packageKey", "billingCycle", "projectUnitTypes", "projectReportData", "projectTechnicalSpecs", "projectAddressData", "approvalProcessConfig") FROM stdin;
cmoebtqxu0000wcjkkb46arl7	lind	لیند	LIND	2026-04-25 12:39:36.354	2026-04-25 12:39:36.354	starter	monthly	[]	{}	{}	{}	{}
cmoec06b60001wc3cv6bp30hg	fepco	فپکو	VN	2026-04-25 12:44:36.21	2026-04-25 12:44:36.21	starter	monthly	[]	{}	{}	{}	{}
cmogqxt3z0001wc0o6wbr9fxc	test	test	VN	2026-04-27 05:18:12.383	2026-04-27 05:18:12.383	starter	monthly	[]	{}	{}	{}	{}
cmogr7tg50001oyr0z8zzs01m	taaav	taav	VN	2026-04-27 05:25:59.382	2026-04-27 05:25:59.382	starter	monthly	[]	{}	{}	{}	{}
cmogtwawv0030wc8kvg7yo2mt	test2	test2	VN	2026-04-27 06:41:00.991	2026-04-27 06:41:00.991	starter	monthly	[]	{}	{}	{}	{}
cmoh0lqin0001oy48y754st1v	taav	taav	VN	2026-04-27 09:48:45.312	2026-04-27 09:48:45.312	starter	monthly	[]	{}	{}	{}	{}
\.


--
-- Data for Name: TenantBusinessProfileSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantBusinessProfileSettings" (id, "tenantId", "profilePayload", "createdAt", "updatedAt") FROM stdin;
85aa23e7-6356-414d-b466-4e11bfff093f	cmogqxt3z0001wc0o6wbr9fxc	{"legal": {"brandName": "", "legalType": "شرکت سهامی خاص", "nationalId": "", "companyName": "", "economicCode": "45454", "taxFileNumber": "22", "registrationDate": "", "registrationNumber": ""}, "natural": {"economicCode": "45454", "taxFileNumber": "22"}, "branding": {"logoImage": "", "sealImage": "", "footerImage": "", "headerImage": "", "legalStatement": ""}, "calendar": {"format": "yyyy/mm/dd-short", "system": "jalali"}, "currency": {"baseCurrency": "irr", "quoteCurrency": "toman"}, "directory": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "mobile": "+989121111111", "canEmail": true, "fullName": "عباس عباسی", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "avatarImage": ""}, {"id": "rep-2", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "canEmail": false, "fullName": "احمدرضا زارع", "isPrimary": false, "avatarMode": "ghost", "avatarText": "ا", "linkedUser": true, "avatarImage": ""}, {"id": "rep-3", "email": "m.kazem@example.com", "mobile": "+989334442511", "canEmail": false, "fullName": "محمد کاظم عباسی", "isPrimary": true, "avatarMode": "badge", "avatarText": "1", "linkedUser": false, "avatarImage": ""}], "languages": {"activeLanguages": ["fa-IR", "en-US", "ar-AR", "fr-CA"], "defaultLanguage": "fa-IR"}, "measurement": {"unit": "meter"}, "bankAccounts": [{"id": "bank-1", "sheba": "IR35056061182800578179201", "title": "وجه التزام", "usage": "primary", "owners": ["رضا رضایی"], "bankCode": "ث", "bankName": "ثامن", "cardNumber": "50781879201", "accountType": "current", "bankLogoMode": "badge", "accountNumber": "6219 8619 8943 9962", "showInContracts": true}, {"id": "bank-2", "sheba": "IR75019000002004875550007", "title": "حساب هزینه پروژه", "usage": "project-cost", "owners": ["محمدرضا"], "bankCode": "س", "bankName": "سپه‌گارد", "cardNumber": "204875550007", "accountType": "short", "bankLogoMode": "text", "accountNumber": "5022 2915 8286 3957", "showInContracts": true}, {"id": "bank-3", "sheba": "IR34363636363636363636363636", "title": "سایر", "usage": "other", "owners": ["kJ"], "bankCode": "م", "bankName": "ملی", "cardNumber": "5555555555", "accountType": "long", "bankLogoMode": "text", "accountNumber": "6037 7995 6565 6565", "showInContracts": false}], "ownershipKind": "natural", "representatives": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "mobile": "+989121111111", "fullName": "عباس عباسی", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "avatarImage": ""}, {"id": "rep-2", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "fullName": "احمدرضا زارع", "isPrimary": false, "avatarMode": "ghost", "avatarText": "ا", "linkedUser": true, "avatarImage": ""}, {"id": "rep-3", "email": "m.kazem@example.com", "mobile": "+989334442511", "fullName": "محمد کاظم عباسی", "isPrimary": true, "avatarMode": "badge", "avatarText": "1", "linkedUser": false, "avatarImage": ""}], "legalShareholders": [{"id": "legal-shareholder-1", "brandName": "", "legalType": "شرکت سهامی عام", "avatarMode": "badge", "avatarText": "1", "nationalId": "155184845451515151515151518448", "avatarImage": "", "companyName": "1111111", "economicCode": "545454848484484848484844484844", "sharePercent": "11.2", "taxFileNumber": "", "representatives": [{"id": "rep-3", "email": "m.kazem@example.com", "mobile": "+989334442511", "fullName": "محمد کاظم عباسی", "isPrimary": true, "avatarMode": "badge", "avatarText": "1", "linkedUser": false, "avatarImage": ""}], "registrationDate": "1404/07/13", "registrationNumber": "15151616124124684464748464646"}, {"id": "legal-shareholder-2", "brandName": "", "legalType": "شرکت سهامی عام", "avatarMode": "ghost", "avatarText": "م", "nationalId": "", "avatarImage": "", "companyName": "ماد", "economicCode": "", "sharePercent": "10", "taxFileNumber": "", "representatives": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "mobile": "+989121111111", "fullName": "عباس عباسی", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "avatarImage": ""}, {"id": "rep-2", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "fullName": "احمدرضا زارع", "isPrimary": false, "avatarMode": "ghost", "avatarText": "ا", "linkedUser": true, "avatarImage": ""}], "registrationDate": "", "registrationNumber": ""}], "naturalShareholders": [{"id": "natural-shareholder-1", "email": "ahmad.zarei@example.com", "mobile": "+989121000001", "fullName": "احمد زارعی", "avatarMode": "badge", "avatarText": "ا", "avatarImage": "", "sharePercent": "50"}, {"id": "natural-shareholder-2", "email": "", "mobile": "+989121000002", "fullName": "علی کریمی", "avatarMode": "image", "avatarText": "ع", "avatarImage": "", "sharePercent": "20"}, {"id": "natural-shareholder-3", "email": "gholanda@example.com", "mobile": "+989121000003", "fullName": "قلندا الغا", "avatarMode": "ghost", "avatarText": "ق", "avatarImage": "", "sharePercent": "25"}, {"id": "natural-shareholder-4", "email": "", "mobile": "+989121000004", "fullName": "احمدرضا زارع", "avatarMode": "ghost", "avatarText": "ا", "avatarImage": "", "sharePercent": "20"}]}	2026-04-28 09:32:49.433	2026-04-28 09:32:49.433
98742635-1b11-4462-88a6-a86a11964871	cmoh0lqin0001oy48y754st1v	{"legal": {"brandName": "", "legalType": "شرکت سهامی خاص", "nationalId": "", "companyName": "", "economicCode": "45454", "taxFileNumber": "22", "registrationDate": "", "registrationNumber": ""}, "natural": {"economicCode": "45454", "taxFileNumber": "22"}, "branding": {"logoImage": "", "sealImage": "", "footerImage": "", "headerImage": "", "legalStatement": ""}, "calendar": {"format": "yyyy/mm/dd-short", "system": "jalali"}, "currency": {"baseCurrency": "irr", "quoteCurrency": "irr"}, "directory": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "gender": "male", "mobile": "+989121111111", "canEmail": true, "fullName": "عباس عباسی", "lastName": "عباسی", "firstName": "عباس", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "nationalId": "بلی", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-2", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "canEmail": false, "fullName": "احمدرضا زارع", "isPrimary": false, "avatarMode": "ghost", "avatarText": "ا", "linkedUser": true, "avatarImage": ""}, {"id": "rep-3", "email": "m.kazem@example.com", "mobile": "+989334442511", "canEmail": false, "fullName": "محمد کاظم عباسی", "isPrimary": true, "avatarMode": "badge", "avatarText": "1", "linkedUser": false, "avatarImage": ""}, {"id": "rep-1777375465167", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032765", "canEmail": true, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "1234567890", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-1777377263485", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032555", "canEmail": true, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza", "avatarImage": "", "secondaryMobile": "09254565897"}, {"id": "rep-1777380330521", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "", "canEmail": true, "fullName": "سییب یسبسیب", "lastName": "یسبسیب", "firstName": "سییب", "isPrimary": false, "avatarMode": "ghost", "avatarText": "س", "linkedUser": false, "nationalId": "یسب", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-1777440557239", "email": "", "gender": "male", "mobile": "09173032565", "canEmail": false, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza reza", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-1777443328940", "email": "", "gender": "male", "mobile": "09173032565", "canEmail": false, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza reza", "avatarImage": "", "secondaryMobile": ""}], "languages": {"activeLanguages": ["fa-IR", "en-US", "ar-AR", "fr-CA"], "defaultLanguage": "fa-IR"}, "measurement": {"unit": "meter"}, "bankAccounts": [{"id": "bank-1", "sheba": "IR35056061182800578179201", "title": "وجه التزام", "usage": "primary", "owners": ["رضا رضایی"], "bankCode": "ث", "bankName": "ثامن", "cardNumber": "50781879201", "accountType": "current", "bankLogoMode": "badge", "accountNumber": "6219 8619 8943 9962", "showInContracts": true}, {"id": "bank-2", "sheba": "IR75019000002004875550007", "title": "حساب هزینه پروژه", "usage": "project-cost", "owners": ["محمدرضا"], "bankCode": "س", "bankName": "سپه‌گارد", "cardNumber": "204875550007", "accountType": "short", "bankLogoMode": "text", "accountNumber": "5022 2915 8286 3957", "showInContracts": true}, {"id": "bank-3", "sheba": "IR34363636363636363636363636", "title": "سایر", "usage": "other", "owners": ["kJ"], "bankCode": "م", "bankName": "ملی", "cardNumber": "5555555555", "accountType": "long", "bankLogoMode": "text", "accountNumber": "6037 7995 6565 6565", "showInContracts": false}], "boardMembers": [{"id": "board-1", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "fullName": "محمدرضا زارعی", "isPrimary": false, "avatarMode": "ghost", "avatarText": "م", "linkedUser": true, "avatarImage": ""}, {"id": "board-2", "email": "abbas.abbasi@example.com", "mobile": "+989121111111", "fullName": "عباس عباسی", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "avatarImage": ""}], "ownershipKind": "legal", "representatives": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "gender": "male", "mobile": "+989121111111", "fullName": "عباس عباسی", "lastName": "عباسی", "firstName": "عباس", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "nationalId": "بلی", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-2", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "fullName": "احمدرضا زارع", "isPrimary": false, "avatarMode": "ghost", "avatarText": "ا", "linkedUser": true, "avatarImage": ""}, {"id": "rep-3", "email": "m.kazem@example.com", "mobile": "+989334442511", "fullName": "محمد کاظم عباسی", "isPrimary": true, "avatarMode": "badge", "avatarText": "1", "linkedUser": false, "avatarImage": ""}, {"id": "rep-1777375465167", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032765", "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "1234567890", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-1777377263485", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032555", "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza", "avatarImage": "", "secondaryMobile": "09254565897"}, {"id": "rep-1777380330521", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "", "fullName": "سییب یسبسیب", "lastName": "یسبسیب", "firstName": "سییب", "isPrimary": false, "avatarMode": "ghost", "avatarText": "س", "linkedUser": false, "nationalId": "یسب", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-1777440557239", "email": "", "gender": "male", "mobile": "09173032565", "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza reza", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-1777443328940", "email": "", "gender": "male", "mobile": "09173032565", "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza reza", "avatarImage": "", "secondaryMobile": ""}], "legalShareholders": [{"id": "legal-shareholder-1777454384915", "brandName": "", "legalType": "شرکت با مسئولیت محدود", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777453677510", "brandName": "", "legalType": "شرکت با مسئولیت محدود", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [{"id": "rep-1777440557239", "email": "", "gender": "male", "mobile": "09173032565", "canEmail": false, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza reza", "avatarImage": "", "secondaryMobile": ""}], "registrationDate": "۱۴۰۵/۰۲/۰۱", "registrationNumber": ""}, {"id": "legal-shareholder-1777453670618", "brandName": "", "legalType": "شرکت با مسئولیت محدود", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777452801617", "brandName": "", "legalType": "شرکت با مسئولیت محدود", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777451186064", "brandName": "", "legalType": "شرکت با مسئولیت محدود", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777450411988", "brandName": "", "legalType": "شرکت با مسئولیت محدود", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777379553810", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "س", "nationalId": "شبشبی", "avatarImage": "", "companyName": "سیبشب", "economicCode": "شبیسش", "sharePercent": "شیسبس", "taxFileNumber": "", "representatives": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "gender": "male", "mobile": "+989121111111", "canEmail": true, "fullName": "عباس عباسی", "lastName": "عباسی", "firstName": "عباس", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "nationalId": "بلی", "avatarImage": "", "secondaryMobile": ""}], "registrationDate": "۱۴۰۵/۰۲/۰۹", "registrationNumber": "شبیبش"}, {"id": "legal-shareholder-1777379133840", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "ئ", "nationalId": "دذئذدئ", "avatarImage": "", "companyName": "ئدذئذدئ", "economicCode": "دذئذدئذد", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "۱۴۰۵/۰۲/۰۸", "registrationNumber": "ذدئ"}, {"id": "legal-shareholder-1777377193483", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [{"id": "rep-1777377263485", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032555", "canEmail": true, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "reza", "avatarImage": "", "secondaryMobile": "09254565897"}], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777377151877", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [{"id": "rep-1777375465167", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032765", "canEmail": true, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "1234567890", "avatarImage": "", "secondaryMobile": ""}], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777375536298", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "image", "avatarText": "ش", "nationalId": "", "avatarImage": "data:image/png;base64,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", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777375441663", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [{"id": "rep-1777375465167", "email": "zareahmadreza12@gmail.com", "gender": "male", "mobile": "09173032765", "canEmail": true, "fullName": "reza reza", "lastName": "reza", "firstName": "reza", "isPrimary": false, "avatarMode": "ghost", "avatarText": "r", "linkedUser": false, "nationalId": "1234567890", "avatarImage": "", "secondaryMobile": ""}], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777370718234", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1777369191118", "brandName": "", "legalType": "شرکت سهامی خاص", "avatarMode": "ghost", "avatarText": "ش", "nationalId": "", "avatarImage": "", "companyName": "", "economicCode": "", "sharePercent": "", "taxFileNumber": "", "representatives": [], "registrationDate": "", "registrationNumber": ""}, {"id": "legal-shareholder-1", "brandName": "", "legalType": "شرکت سهامی عام", "avatarMode": "badge", "avatarText": "1", "nationalId": "155184845451515151515151518448", "avatarImage": "", "companyName": "1111111", "economicCode": "545454848484484848484844484844", "sharePercent": "11.2", "taxFileNumber": "", "representatives": [{"id": "rep-3", "email": "m.kazem@example.com", "mobile": "+989334442511", "fullName": "محمد کاظم عباسی", "isPrimary": true, "avatarMode": "badge", "avatarText": "1", "linkedUser": false, "avatarImage": ""}], "registrationDate": "1404/07/13", "registrationNumber": "15151616124124684464748464646"}, {"id": "legal-shareholder-2", "brandName": "", "legalType": "شرکت سهامی عام", "avatarMode": "ghost", "avatarText": "م", "nationalId": "", "avatarImage": "", "companyName": "ماد", "economicCode": "", "sharePercent": "10", "taxFileNumber": "", "representatives": [{"id": "rep-1", "email": "abbas.abbasi@example.com", "gender": "male", "mobile": "+989121111111", "canEmail": true, "fullName": "عباس عباسی", "lastName": "عباسی", "firstName": "عباس", "isPrimary": false, "avatarMode": "image", "avatarText": "ع", "linkedUser": true, "nationalId": "بلی", "avatarImage": "", "secondaryMobile": ""}, {"id": "rep-2", "email": "ahmad.zare@example.com", "mobile": "+989137477540", "fullName": "احمدرضا زارع", "isPrimary": false, "avatarMode": "ghost", "avatarText": "ا", "linkedUser": true, "avatarImage": ""}], "registrationDate": "", "registrationNumber": ""}], "principalPartners": [{"id": "principal-partner-1", "email": "reza.mohammadi@example.com", "mobile": "+989121000101", "fullName": "رضا محمدی", "avatarMode": "badge", "avatarText": "ر", "avatarImage": "", "sharePercent": "40"}, {"id": "principal-partner-2", "email": "", "mobile": "+989121000102", "fullName": "زهرا صالحی", "avatarMode": "ghost", "avatarText": "ز", "avatarImage": "", "sharePercent": "35"}], "naturalShareholders": [{"id": "natural-shareholder-1777440557557", "email": "", "mobile": "09173032565", "fullName": "reza reza", "avatarMode": "ghost", "avatarText": "r", "avatarImage": "", "sharePercent": "0", "mandateEndDate": "", "signatureAvatarMode": "badge", "signatureAvatarText": "ن", "signatureAvatarImage": ""}, {"id": "natural-shareholder-1777382261911", "email": "zareahmadreza12@gmail.com", "mobile": "09173032765", "fullName": "reza reza", "avatarMode": "ghost", "avatarText": "r", "avatarImage": "", "sharePercent": "0"}, {"id": "natural-shareholder-1777380350151", "email": "zareahmadreza12@gmail.com", "mobile": "09173032765", "fullName": "reza reza", "avatarMode": "ghost", "avatarText": "r", "avatarImage": "", "sharePercent": "0"}, {"id": "natural-shareholder-1777380331526", "email": "zareahmadreza12@gmail.com", "mobile": "", "fullName": "سییب یسبسیب", "avatarMode": "ghost", "avatarText": "س", "avatarImage": "", "sharePercent": "0"}, {"id": "natural-shareholder-1777377386178", "email": "", "mobile": "", "fullName": "", "avatarMode": "ghost", "avatarText": "ش", "avatarImage": "", "sharePercent": ""}, {"id": "natural-shareholder-1", "email": "ahmad.zarei@example.com", "mobile": "+989121000001", "fullName": "احمد زارعی", "avatarMode": "badge", "avatarText": "ا", "avatarImage": "", "sharePercent": "50"}, {"id": "natural-shareholder-2", "email": "", "mobile": "+989121000002", "fullName": "علی کریمی", "avatarMode": "image", "avatarText": "ع", "avatarImage": "", "sharePercent": "20"}, {"id": "natural-shareholder-3", "email": "gholanda@example.com", "mobile": "+989121000003", "fullName": "قلندا الغا", "avatarMode": "ghost", "avatarText": "ق", "avatarImage": "", "sharePercent": "25"}, {"id": "natural-shareholder-4", "email": "", "mobile": "+989121000004", "fullName": "احمدرضا زارع", "avatarMode": "ghost", "avatarText": "ا", "avatarImage": "", "sharePercent": "20"}]}	2026-04-28 09:22:25.955	2026-05-03 05:06:26.598
\.


--
-- Data for Name: TenantContractRuleSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantContractRuleSettings" (id, "tenantId", "rulesPayload", "loanPayload", "createdAt", "updatedAt") FROM stdin;
cmoh3d0xc02u1wctspxcvidb6	cmogqxt3z0001wc0o6wbr9fxc	{"penalty": {"active": true, "values": {"penaltyDebtRound": "بدون گرد کردن", "penaltyFixedRound": "بدون گرد کردن", "penaltyDebtFeeType": "ثابت", "penaltyDebtPercent": "", "penaltyFixedAmount": "", "penaltyFixedPeriod": "روزانه", "penaltyContractType": "ساده", "penaltyContractPeriod": "ماهانه", "penaltyContractPercent": "", "penaltyProgressiveFrom": "", "penaltyProgressiveFirst": "", "penaltyProgressiveThird": "", "penaltyProgressiveSecond": ""}, "activeTab": "fixed"}, "discount": {"active": true, "values": {"discountEarlyValue": "", "discountEarlyTarget": "درصد", "discountContractValue": "", "discountEarlyDeadline": "", "discountContractTarget": "درصد", "discountEarlyKeepOnDelay": false, "discountContractSettlement": "همان روز", "discountContractNeedApproval": false}, "activeTab": "early-payment"}, "interest": {"active": true, "values": {"interestRate": "", "interestPeriod": "ماهانه", "interestCaption": "", "interestCompound": false, "interestSuggestion": "اقساط استاندارد", "interestSeparateRow": false, "interestShowPreview": false}, "activeTab": "financial"}, "adjustment": {"active": true, "values": {"adjustFixedCap": "", "adjustFixedRound": "بدون گرد کردن", "adjustFixedPercent": "", "adjustIndicatorBase": "", "adjustIndicatorName": "تورم بانک مرکزی", "adjustIndicatorSource": "مرکز آمار", "adjustMultiLaborWeight": "", "adjustMultiHousingWeight": "", "adjustMultiManualOverride": false, "adjustMultiMaterialWeight": ""}, "activeTab": "fixed-percent", "activeChip": "سالانه"}, "prepayment": {"active": true, "values": {"prePercent": "", "prePercentMin": "", "preFixedAmount": "10000000", "preSalesEnabled": true, "preCombinedAmount": "", "preCombinedPercent": "", "preFixedInstallmentWindow": "در اختیار مدیر فروش", "preSalesInstallmentWindow": "در اختیار مدیر فروش", "preFixedInstallmentEnabled": true, "preSalesInstallmentEnabled": true, "prePercentInstallmentWindow": "دو ماه", "preCombinedInstallmentWindow": "در اختیار مدیر فروش", "prePercentInstallmentEnabled": true, "preCombinedInstallmentEnabled": true}, "activeTab": "fixed"}, "forgiveness": {"active": true, "values": {"forgiveAmount": "", "forgivePercent": "", "forgiveAmountTarget": "کل جریمه", "forgiveAmountMaxDelay": "", "forgivePercentMaxDelay": "", "forgivePercentNeedApproval": false}, "activeTab": "amount"}, "installments": {"active": false, "values": {"regularInterval": "در بازه قابل تنظیم در زمان عقد قرارداد", "regularLastDueDate": "", "irregularLastDueDate": "", "regularBalloonWindow": "۳ ماه آخر", "regularBalloonEnabled": false, "regularBalloonPercent": "", "irregularBalloonWindow": "۳ ماه آخر", "irregularBalloonEnabled": false, "irregularBalloonPercent": ""}, "activeTab": "regular"}, "additional-costs": {"active": true, "values": {"costDebtTitle": "", "costDebtPeriod": "ماهانه", "costPercentCap": "", "costAmountPayer": "خریدار", "costAmountTitle": "", "costAmountValue": "", "costDebtPercent": "", "costCombinedRule": "هر دو", "costDebtAutoStop": false, "costPercentPayer": "خریدار", "costPercentTitle": "", "costPercentValue": "", "costCombinedTitle": "", "costCombinedAmount": "", "costCombinedPercent": "", "costAmountPerInstallment": false}, "activeTab": "amount"}}	{}	2026-04-27 11:05:57.743	2026-04-27 11:05:57.743
\.


--
-- Data for Name: TenantRole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantRole" (id, "tenantId", key, label, system, "createdAt", "updatedAt") FROM stdin;
cmoh0lqto000loy48e5fsqyv2	cmoh0lqin0001oy48y754st1v	employee	کارمند	t	2026-04-27 09:48:45.526	2026-05-03 05:34:42.61
cmogr7tm50005oyr0nahbbzo9	cmogr7tg50001oyr0z8zzs01m	business_owner	صاحب کسب و کار	t	2026-04-27 05:25:59.598	2026-04-27 05:27:01.068
cmoec06he0005wc3cgql6tut6	cmoec06b60001wc3cv6bp30hg	business_owner	صاحب کسب و کار	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.632
cmoh0lqt6000hoy48z8xpukbg	cmoh0lqin0001oy48y754st1v	shareholder	سهام دار	t	2026-04-27 09:48:45.526	2026-05-03 05:34:42.61
cmoh0lqt6000foy48r5otg32h	cmoh0lqin0001oy48y754st1v	partner_representative	نماینده شریک	t	2026-04-27 09:48:45.527	2026-05-03 05:34:42.611
cmoec06n5000lwc3c3lsulhfc	cmoec06b60001wc3cv6bp30hg	legal_shareholder_representative	نماینده سهام دار حقوقی	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmoec06li000dwc3cw9fomyiq	cmoec06b60001wc3cv6bp30hg	buyer	خریدار	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmoec06li000fwc3cp34q2x0j	cmoec06b60001wc3cv6bp30hg	shareholder	سهام دار	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmoec06lh000bwc3caftj770c	cmoec06b60001wc3cv6bp30hg	partner_representative	نماینده شریک	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmoec06lv000jwc3cz5tp4ibi	cmoec06b60001wc3cv6bp30hg	customer	مشتری	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmoec06ig0007wc3caktk1311	cmoec06b60001wc3cv6bp30hg	representative	نماینده	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmogr7ui7000joyr00co9mscc	cmogr7tg50001oyr0z8zzs01m	customer	مشتری	t	2026-04-27 05:25:59.598	2026-04-27 05:27:01.057
cmogr7u960009oyr0edb134eo	cmogr7tg50001oyr0z8zzs01m	investor	سرمایه گذار	t	2026-04-27 05:25:59.598	2026-04-27 05:27:01.068
cmogr7ui6000hoyr0nnhe68dd	cmogr7tg50001oyr0z8zzs01m	buyer	خریدار	t	2026-04-27 05:25:59.599	2026-04-27 05:27:01.069
cmogr7ui6000foyr0gb3oxfz5	cmogr7tg50001oyr0z8zzs01m	shareholder	سهام دار	t	2026-04-27 05:25:59.598	2026-04-27 05:27:01.069
cmogtwb3z003cwc8k33zwqtct	cmogtwawv0030wc8kvg7yo2mt	buyer	خریدار	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmogtwb3z003dwc8k9ie672tm	cmogtwawv0030wc8kvg7yo2mt	investor	سرمایه گذار	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmogtwb380034wc8kj03cxib8	cmogtwawv0030wc8kvg7yo2mt	representative	نماینده	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmogtwb3z003gwc8k1vslnse1	cmogtwawv0030wc8kvg7yo2mt	partner_representative	نماینده شریک	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmogqxtao000bwc0oh2lb3sgc	cmogqxt3z0001wc0o6wbr9fxc	customer	مشتری	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.998
cmogqxtdn000dwc0oegqu0dtv	cmogqxt3z0001wc0o6wbr9fxc	investor	سرمایه گذار	t	2026-04-27 05:18:12.6	2026-04-29 09:22:22.998
cmogqxtdr000hwc0ou5suoto8	cmogqxt3z0001wc0o6wbr9fxc	employee	کارمند	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.999
cmogqxtds000jwc0oif6wd1i9	cmogqxt3z0001wc0o6wbr9fxc	shareholder	سهام دار	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.999
cmoec06l50009wc3cbktoa4bi	cmoec06b60001wc3cv6bp30hg	investor	سرمایه گذار	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmoec06lp000hwc3c78s8wtc8	cmoec06b60001wc3cv6bp30hg	employee	کارمند	t	2026-04-25 12:44:36.435	2026-04-27 06:40:37.771
cmogr7u2y0007oyr0c2wbxwkd	cmogr7tg50001oyr0z8zzs01m	representative	نماینده	t	2026-04-27 05:25:59.598	2026-04-27 05:27:01.068
cmogr7ui7000loyr0dej4n1lb	cmogr7tg50001oyr0z8zzs01m	partner_representative	نماینده شریک	t	2026-04-27 05:25:59.599	2026-04-27 05:27:01.069
cmoh0lqt20009oy48846v43tv	cmoh0lqin0001oy48y754st1v	representative	نماینده	t	2026-04-27 09:48:45.525	2026-05-03 05:34:42.61
cmogr7ui3000boyr05ciuurl5	cmogr7tg50001oyr0z8zzs01m	employee	کارمند	t	2026-04-27 05:25:59.598	2026-04-27 05:27:01.069
cmogr7ui6000doyr0hrarcdy2	cmogr7tg50001oyr0z8zzs01m	legal_shareholder_representative	نماینده سهام دار حقوقی	t	2026-04-27 05:25:59.599	2026-04-27 05:27:01.069
cmoh0lqt3000boy48qxos65x4	cmoh0lqin0001oy48y754st1v	investor	سرمایه گذار	t	2026-04-27 09:48:45.525	2026-05-03 05:34:42.61
cmoh0lqol0005oy48shusv1ei	cmoh0lqin0001oy48y754st1v	business_owner	صاحب کسب و کار	t	2026-04-27 09:48:45.525	2026-05-03 05:34:42.61
cmoh0lqt7000joy48s9rwyxq7	cmoh0lqin0001oy48y754st1v	customer	مشتری	t	2026-04-27 09:48:45.526	2026-05-03 05:34:42.61
cmoh0lqt5000doy48tkw6zolb	cmoh0lqin0001oy48y754st1v	buyer	خریدار	t	2026-04-27 09:48:45.526	2026-05-03 05:34:42.611
cmogtwb3z003ewc8kgfp20mjq	cmogtwawv0030wc8kvg7yo2mt	business_owner	صاحب کسب و کار	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.533
cmogtwb40003kwc8k1v8uehq6	cmogtwawv0030wc8kvg7yo2mt	shareholder	سهام دار	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmogtwb3z0036wc8kscplo88t	cmogtwawv0030wc8kvg7yo2mt	customer	مشتری	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmoh0lqsz0007oy48pd4kdzye	cmoh0lqin0001oy48y754st1v	legal_shareholder_representative	نماینده سهام دار حقوقی	t	2026-04-27 09:48:45.527	2026-05-03 05:34:42.611
cmogtwb3z003iwc8kwkahhjnz	cmogtwawv0030wc8kvg7yo2mt	employee	کارمند	t	2026-04-27 06:41:01.22	2026-04-27 06:42:03.535
cmogtwb3z0038wc8k6gomw3sb	cmogtwawv0030wc8kvg7yo2mt	legal_shareholder_representative	نماینده سهام دار حقوقی	t	2026-04-27 06:41:01.221	2026-04-27 06:42:03.534
cmogqxtan0007wc0oxqrldpu3	cmogqxt3z0001wc0o6wbr9fxc	business_owner	صاحب کسب و کار	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.998
cmogqxtao0009wc0oig9up5yz	cmogqxt3z0001wc0o6wbr9fxc	representative	نماینده	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.998
cmogqxt9z0005wc0o4kjl6akl	cmogqxt3z0001wc0o6wbr9fxc	legal_shareholder_representative	نماینده سهام دار حقوقی	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.999
cmogqxtdq000fwc0ohjc4lj1n	cmogqxt3z0001wc0o6wbr9fxc	partner_representative	نماینده شریک	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.999
cmogqxtds000lwc0ozvawainy	cmogqxt3z0001wc0o6wbr9fxc	buyer	خریدار	t	2026-04-27 05:18:12.599	2026-04-29 09:22:22.999
\.


--
-- Data for Name: TenantRoleMenuPermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantRoleMenuPermission" (id, "roleId", "menuItemId", "createdAt") FROM stdin;
\.


--
-- Data for Name: TenantRolePermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantRolePermission" (id, "roleId", "permissionKey", "createdAt") FROM stdin;
cmoec06pu0012wc3czsxnj2wy	cmoec06he0005wc3cgql6tut6	platform.users.delete	2026-04-25 12:44:36.738
cmoec06pu0010wc3c2avsrmol	cmoec06he0005wc3cgql6tut6	platform.reports.view	2026-04-25 12:44:36.738
cmoec06pt000rwc3c8tkbjq1o	cmoec06he0005wc3cgql6tut6	platform.users.create	2026-04-25 12:44:36.738
cmoec06pu000vwc3c52p8y8bz	cmoec06he0005wc3cgql6tut6	platform.users.update	2026-04-25 12:44:36.738
cmoec06pt000qwc3cl3hr8y0d	cmoec06he0005wc3cgql6tut6	platform.settings.manageAccess	2026-04-25 12:44:36.738
cmoec06pu0013wc3cog0hqva3	cmoec06he0005wc3cgql6tut6	business.profile.update	2026-04-25 12:44:36.738
cmoec06pu000zwc3c8h6rufqw	cmoec06he0005wc3cgql6tut6	business.profile.view	2026-04-25 12:44:36.738
cmoec06pt000twc3cgj50xg9i	cmoec06he0005wc3cgql6tut6	platform.settings.view	2026-04-25 12:44:36.738
cmoec06pt000swc3ckr5f4nll	cmoec06he0005wc3cgql6tut6	platform.users.view	2026-04-25 12:44:36.738
cmoec06uz0015wc3cmrqjerp0	cmoec06he0005wc3cgql6tut6	contracts.view	2026-04-25 12:44:36.739
cmoec06v30017wc3cmvfdcblj	cmoec06he0005wc3cgql6tut6	contracts.create	2026-04-25 12:44:36.739
cmoec06v30019wc3ccxs4geev	cmoec06he0005wc3cgql6tut6	complex.manage	2026-04-25 12:44:36.739
cmoec06v9001bwc3cgzyrh7c9	cmoec06he0005wc3cgql6tut6	complex.view	2026-04-25 12:44:36.738
cmoec06wg001fwc3c9bxa71in	cmoec06he0005wc3cgql6tut6	contracts.delete	2026-04-25 12:44:36.739
cmoec06wh001hwc3cyztwj2e0	cmoec06he0005wc3cgql6tut6	contracts.export	2026-04-25 12:44:36.739
cmoec06wg001dwc3c301avx8x	cmoec06he0005wc3cgql6tut6	contracts.sign	2026-04-25 12:44:36.739
cmoec073i001jwc3cyvk0rw06	cmoec06he0005wc3cgql6tut6	contracts.update	2026-04-25 12:44:36.739
cmogqxtfe0011wc0ol26prq11	cmogqxtan0007wc0oxqrldpu3	business.profile.update	2026-04-27 05:18:12.794
cmogqxtfe0012wc0odkhb83p5	cmogqxtan0007wc0oxqrldpu3	complex.view	2026-04-27 05:18:12.794
cmogqxtfe000owc0o15s35dgx	cmogqxtan0007wc0oxqrldpu3	platform.settings.manageAccess	2026-04-27 05:18:12.794
cmogqxtfe000vwc0o14bd6dzq	cmogqxtan0007wc0oxqrldpu3	platform.users.update	2026-04-27 05:18:12.794
cmogqxtfe000swc0olb53lehp	cmogqxtan0007wc0oxqrldpu3	platform.users.view	2026-04-27 05:18:12.794
cmogqxtfe000pwc0o5tkg8obx	cmogqxtan0007wc0oxqrldpu3	platform.settings.view	2026-04-27 05:18:12.794
cmogqxtfe000xwc0oeq3lke6f	cmogqxtan0007wc0oxqrldpu3	platform.users.delete	2026-04-27 05:18:12.794
cmogqxtfe0013wc0ohxn5yxhe	cmogqxtan0007wc0oxqrldpu3	platform.reports.view	2026-04-27 05:18:12.794
cmogqxtfe000uwc0onrkgi3qc	cmogqxtan0007wc0oxqrldpu3	platform.users.create	2026-04-27 05:18:12.794
cmogqxtj40015wc0oyshshid1	cmogqxtan0007wc0oxqrldpu3	contracts.export	2026-04-27 05:18:12.795
cmogqxtja0017wc0oxdb0n5mv	cmogqxtan0007wc0oxqrldpu3	contracts.sign	2026-04-27 05:18:12.794
cmogqxtjc0019wc0o3z02o7ga	cmogqxtan0007wc0oxqrldpu3	contracts.delete	2026-04-27 05:18:12.794
cmogqxtjd001bwc0od0oqgc1p	cmogqxtan0007wc0oxqrldpu3	contracts.update	2026-04-27 05:18:12.794
cmogqxtje001fwc0owat5juyn	cmogqxtan0007wc0oxqrldpu3	business.profile.view	2026-04-27 05:18:12.794
cmogqxtjg001hwc0on39lrste	cmogqxtan0007wc0oxqrldpu3	contracts.create	2026-04-27 05:18:12.794
cmogqxtjg001jwc0opm02856h	cmogqxtan0007wc0oxqrldpu3	complex.manage	2026-04-27 05:18:12.794
cmogqxtje001dwc0oib70cmof	cmogqxtan0007wc0oxqrldpu3	contracts.view	2026-04-27 05:18:12.794
cmogr7uk1000noyr0yq6y3mgp	cmogr7tm50005oyr0nahbbzo9	platform.settings.view	2026-04-27 05:26:00.817
cmogr7uk1000royr08ac8u12o	cmogr7tm50005oyr0nahbbzo9	platform.users.view	2026-04-27 05:26:00.817
cmogr7uk20011oyr0h3imptjz	cmogr7tm50005oyr0nahbbzo9	business.profile.view	2026-04-27 05:26:00.818
cmogr7uk20013oyr0e2a9cdgv	cmogr7tm50005oyr0nahbbzo9	business.profile.update	2026-04-27 05:26:00.818
cmogr7uk1000woyr097csgeqr	cmogr7tm50005oyr0nahbbzo9	platform.users.update	2026-04-27 05:26:00.818
cmogr7uk1000poyr03esqpjm1	cmogr7tm50005oyr0nahbbzo9	platform.settings.manageAccess	2026-04-27 05:26:00.817
cmogr7uk1000toyr03octomo6	cmogr7tm50005oyr0nahbbzo9	platform.users.create	2026-04-27 05:26:00.818
cmogr7uk1000xoyr06vop4zsa	cmogr7tm50005oyr0nahbbzo9	platform.users.delete	2026-04-27 05:26:00.818
cmogr7uk2000zoyr0108538kw	cmogr7tm50005oyr0nahbbzo9	platform.reports.view	2026-04-27 05:26:00.818
cmogr7v0o0015oyr0zurjw02h	cmogr7tm50005oyr0nahbbzo9	complex.manage	2026-04-27 05:26:00.819
cmogr7v0t0017oyr0gdh0nzbi	cmogr7tm50005oyr0nahbbzo9	contracts.export	2026-04-27 05:26:00.82
cmogr7v0t001doyr01aihcm8y	cmogr7tm50005oyr0nahbbzo9	contracts.sign	2026-04-27 05:26:00.82
cmogr7v0t001boyr052vnif2k	cmogr7tm50005oyr0nahbbzo9	complex.view	2026-04-27 05:26:00.819
cmogr7v0t0019oyr0gcc8f6zh	cmogr7tm50005oyr0nahbbzo9	contracts.delete	2026-04-27 05:26:00.82
cmogr7v12001foyr063lwad80	cmogr7tm50005oyr0nahbbzo9	contracts.view	2026-04-27 05:26:00.819
cmogr7v13001hoyr0ensvb5f2	cmogr7tm50005oyr0nahbbzo9	contracts.create	2026-04-27 05:26:00.819
cmogr7v13001joyr081xyf8mx	cmogr7tm50005oyr0nahbbzo9	contracts.update	2026-04-27 05:26:00.819
cmogtwb5v003rwc8k8dk9oric	cmogtwb3z003ewc8kgfp20mjq	platform.settings.view	2026-04-27 06:41:01.315
cmogtwb5v0042wc8kojo6z1ct	cmogtwb3z003ewc8kgfp20mjq	business.profile.update	2026-04-27 06:41:01.315
cmogtwb5v003uwc8k04fz3mxd	cmogtwb3z003ewc8kgfp20mjq	platform.users.update	2026-04-27 06:41:01.315
cmogtwb5v003pwc8kv8t3env0	cmogtwb3z003ewc8kgfp20mjq	platform.settings.manageAccess	2026-04-27 06:41:01.315
cmogtwb5v003swc8k7jhw3kj0	cmogtwb3z003ewc8kgfp20mjq	platform.users.create	2026-04-27 06:41:01.315
cmogtwb5v003ywc8kf5i26gej	cmogtwb3z003ewc8kgfp20mjq	platform.reports.view	2026-04-27 06:41:01.315
cmogtwb5v003xwc8kwin8pyhc	cmogtwb3z003ewc8kgfp20mjq	platform.users.delete	2026-04-27 06:41:01.315
cmogtwb5v0041wc8kxmu4rrn7	cmogtwb3z003ewc8kgfp20mjq	business.profile.view	2026-04-27 06:41:01.315
cmogtwb5v003qwc8k7eswqpbr	cmogtwb3z003ewc8kgfp20mjq	platform.users.view	2026-04-27 06:41:01.315
cmogtwb6o0044wc8kxz14mdn2	cmogtwb3z003ewc8kgfp20mjq	contracts.create	2026-04-27 06:41:01.315
cmogtwb6o004awc8ka4r6u56v	cmogtwb3z003ewc8kgfp20mjq	complex.view	2026-04-27 06:41:01.315
cmogtwb6o0048wc8k9tggavsp	cmogtwb3z003ewc8kgfp20mjq	contracts.view	2026-04-27 06:41:01.315
cmogtwb6p004cwc8kvphrjskl	cmogtwb3z003ewc8kgfp20mjq	contracts.export	2026-04-27 06:41:01.315
cmogtwb6p004gwc8ka87mo3p2	cmogtwb3z003ewc8kgfp20mjq	contracts.delete	2026-04-27 06:41:01.315
cmogtwb6o0047wc8kvu94lzu7	cmogtwb3z003ewc8kgfp20mjq	contracts.update	2026-04-27 06:41:01.315
cmogtwb6p004ewc8kmthz8zul	cmogtwb3z003ewc8kgfp20mjq	contracts.sign	2026-04-27 06:41:01.315
cmogtwb7c004iwc8k2nhmlg7b	cmogtwb3z003ewc8kgfp20mjq	complex.manage	2026-04-27 06:41:01.315
cmoh0lqvc000roy482kaxrxbp	cmoh0lqol0005oy48shusv1ei	platform.users.view	2026-04-27 09:48:45.769
cmoh0lqvc000poy48ye7qf2i5	cmoh0lqol0005oy48shusv1ei	platform.settings.manageAccess	2026-04-27 09:48:45.768
cmoh0lqvd000zoy48nbmih4ei	cmoh0lqol0005oy48shusv1ei	platform.reports.view	2026-04-27 09:48:45.769
cmoh0lqvd000voy48gsm6a30e	cmoh0lqol0005oy48shusv1ei	platform.users.update	2026-04-27 09:48:45.769
cmoh0lqvd0011oy481d67xukr	cmoh0lqol0005oy48shusv1ei	business.profile.view	2026-04-27 09:48:45.769
cmoh0lqvc000toy48rc16mi0g	cmoh0lqol0005oy48shusv1ei	platform.users.create	2026-04-27 09:48:45.769
cmoh0lqvd0013oy4837i5be4j	cmoh0lqol0005oy48shusv1ei	business.profile.update	2026-04-27 09:48:45.77
cmoh0lqvd000xoy48u6oxfzta	cmoh0lqol0005oy48shusv1ei	platform.users.delete	2026-04-27 09:48:45.769
cmoh0lqvc000noy48euh7vora	cmoh0lqol0005oy48shusv1ei	platform.settings.view	2026-04-27 09:48:45.768
cmoh0lqzr0015oy48pip1f2xi	cmoh0lqol0005oy48shusv1ei	contracts.sign	2026-04-27 09:48:45.771
cmoh0lr060017oy483bexu9oe	cmoh0lqol0005oy48shusv1ei	contracts.view	2026-04-27 09:48:45.77
cmoh0lr06001doy48bhr7t8fj	cmoh0lqol0005oy48shusv1ei	contracts.delete	2026-04-27 09:48:45.77
cmoh0lr06001eoy482wmnprsk	cmoh0lqol0005oy48shusv1ei	contracts.update	2026-04-27 09:48:45.77
cmoh0lr06001foy48wv37aevc	cmoh0lqol0005oy48shusv1ei	contracts.export	2026-04-27 09:48:45.771
cmoh0lr060019oy48g4bsu6g9	cmoh0lqol0005oy48shusv1ei	complex.view	2026-04-27 09:48:45.77
cmoh0lr0c001hoy48qu1iizf6	cmoh0lqol0005oy48shusv1ei	complex.manage	2026-04-27 09:48:45.77
cmoh0lr0g001joy48aoytqqmv	cmoh0lqol0005oy48shusv1ei	contracts.create	2026-04-27 09:48:45.77
\.


--
-- Data for Name: TerminationRules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TerminationRules" (id, "draftId", "buyerRules", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Unit" (id, "tenantId", "blockId", "floorName", name, category, "unitType", usage, "saleEnabled", "deliveryStatus", area, "balconyCount", "bedroomCount", "postalCode", amenities, direction, "assignedToUnitId", "createdAt", "updatedAt", "baseInfo", "areaPricingMode") FROM stdin;
unit-001	cmoebtqxu0000wcjkkb46arl7	block-001	طبقه اول	واحد ۱۰۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-002	cmoebtqxu0000wcjkkb46arl7	block-001	طبقه اول	واحد ۱۰۲	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-003	cmoebtqxu0000wcjkkb46arl7	block-001	طبقه دوم	واحد ۲۰۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-004	cmoebtqxu0000wcjkkb46arl7	block-001	طبقه دوم	واحد ۲۰۲	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-005	cmoebtqxu0000wcjkkb46arl7	block-002	طبقه همکف	واحد G01	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-006	cmoebtqxu0000wcjkkb46arl7	block-002	طبقه اول	واحد ۱۱۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-007	cmoebtqxu0000wcjkkb46arl7	block-002	طبقه سوم	واحد ۳۰۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-008	cmoebtqxu0000wcjkkb46arl7	block-003	طبقه دوم	واحد ۲۲۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-009	cmoebtqxu0000wcjkkb46arl7	block-003	طبقه سوم	واحد ۳۲۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
unit-010	cmoebtqxu0000wcjkkb46arl7	block-003	طبقه چهارم	واحد ۴۰۱	unit	\N	residential	t	ready	\N	0	0	\N	[]	unknown	\N	2026-04-25 12:39:37.018	2026-04-25 12:39:37.018	\N	unit-only
8bcf77b6-00f4-42e2-b3f1-d9f311cdbce5	cmoec06b60001wc3cv6bp30hg	34d13699-6d60-41ce-9275-d47939446749	ط-1	123	unit	تیپ A	residential	t	ready	100	1	2	\N	[]	unknown	\N	2026-04-25 12:46:13.25	2026-04-25 12:46:13.25	\N	unit-only
0b013cb0-e444-4950-a881-8ac3d284dba0	cmogqxt3z0001wc0o6wbr9fxc	ff8ea6f2-ddaf-4599-a94f-463440dbdb8b	a	a	unit	تیپ A	residential	t	ready	150	0	0	\N	[]	unknown	\N	2026-04-27 05:20:49.503	2026-04-27 05:20:49.503	\N	unit-only
\.


--
-- Data for Name: UserTenantMembership; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserTenantMembership" (id, "userId", "tenantId", role, "createdAt") FROM stdin;
cmoebtr1m0003wcjksqm2q9fi	cmoebtr040001wcjkjeyfyrul	cmoebtqxu0000wcjkkb46arl7	owner	2026-04-25 12:39:36.49
cmoec06b60003wc3ccpgoe4cp	cmoebzvyh0000wc3cbhb8ug46	cmoec06b60001wc3cv6bp30hg	owner	2026-04-25 12:44:36.21
cmogqxt410003wc0ogkivw140	cmogqxilf0000wc0og32ocxau	cmogqxt3z0001wc0o6wbr9fxc	owner	2026-04-27 05:18:12.383
cmogr7tg50003oyr0b0rwa2pi	cmogr7fox0000oyr0fcmh1sfe	cmogr7tg50001oyr0z8zzs01m	owner	2026-04-27 05:25:59.382
cmogtwawv0032wc8k6gk2mkne	cmogqxilf0000wc0og32ocxau	cmogtwawv0030wc8kvg7yo2mt	owner	2026-04-27 06:41:00.991
cmoh0lqin0003oy48ffoj4x20	cmoh0le3a0000oy48im9l62m3	cmoh0lqin0001oy48y754st1v	owner	2026-04-27 09:48:45.312
\.


--
-- Data for Name: UserTenantMembershipRole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserTenantMembershipRole" (id, "membershipId", "roleId", "createdAt") FROM stdin;
cmoec07cs001lwc3ct0f7jw3z	cmoec06b60003wc3ccpgoe4cp	cmoec06he0005wc3cgql6tut6	2026-04-25 12:44:37.564
cmogqxtyu001lwc0o0hvisj8l	cmogqxt410003wc0ogkivw140	cmogqxtan0007wc0oxqrldpu3	2026-04-27 05:18:13.494
cmogr7vga001loyr0kjjyugq4	cmogr7tg50003oyr0b0rwa2pi	cmogr7tm50005oyr0nahbbzo9	2026-04-27 05:26:01.978
cmogtwbf4004kwc8kxqdfsg4d	cmogtwawv0032wc8k6gk2mkne	cmogtwb3z003ewc8kgfp20mjq	2026-04-27 06:41:01.648
cmoh0lr9n001loy48pxp97lcq	cmoh0lqin0003oy48ffoj4x20	cmoh0lqol0005oy48shusv1ei	2026-04-27 09:48:46.284
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
688cef2c-4624-4aae-8b1b-9c4767394416	a8b62abcdcc55cda76e25c56f3084efc9249d7b20eda2d4e4ec01fd43a526ba0	2026-04-27 06:45:21.377303+00	20260419093248_multi_tenant_user_membership	\N	\N	2026-04-27 06:45:20.507506+00	1
02b5fb63-2d18-4e3c-bb5b-372fbbb05c47	d2ebd521cb443702b11b13e08db50a0b1ca03e8a1b7c5b02cc285b02cf9cad2a	2026-04-27 06:45:22.442312+00	20260420124000_add_former_employee_directory	\N	\N	2026-04-27 06:45:21.677707+00	1
cee230b0-a25a-4432-91aa-36851ef64ffa	e959ad326ffad5f236ed1d6e33477b9a5ff920ab50dc9086d54b08ee73b9894a	2026-04-27 06:45:23.521074+00	20260421120000_add_access_control	\N	\N	2026-04-27 06:45:22.7422+00	1
1873e4a7-e38c-45db-a782-3a2b9842c6b6	52048cd73675feeb1d6a174abc3c08e1aa2e7b3b18a6a6afcaffcd50fb6ce306	2026-04-27 06:45:24.582774+00	20260421130000_reconcile_db_push_changes	\N	\N	2026-04-27 06:45:23.820203+00	1
a6be4567-00dc-4003-b6f8-9e6983cb7894	be934371e9532da72178b81aaf78cd0d7fdec9f7bd88a2ac690e4b612a5e410e	2026-04-27 06:45:25.654323+00	20260421143000_add_action_permissions	\N	\N	2026-04-27 06:45:24.883199+00	1
c5b4e9c2-8605-4b9b-9c49-147ab39bdd34	80de363072933a30af6e660f0c2f7217f9f8b84008ba1de3d86384dedc15281c	2026-04-27 06:45:26.725264+00	20260422082608_22_4_2026	\N	\N	2026-04-27 06:45:25.954538+00	1
7e62f1fe-386f-4674-9f07-1fd159a17ec8	3ecfa556707eada0bd6d4e246dda410aa483124019868cfca64f9cc3d8ef2012	2026-04-27 06:45:27.781443+00	20260422120000_add_block_management_metadata	\N	\N	2026-04-27 06:45:27.02607+00	1
536c4678-e7df-40ee-9790-948c0738f0b7	9d788b361d0369fb012b71b0cfa79b9eec96ad2a7ac226e2aaab77b8831ab796	2026-04-27 06:45:28.859926+00	20260422133000_add_block_floors_and_project_plates	\N	\N	2026-04-27 06:45:28.083819+00	1
13d54843-771b-4f86-938a-e0b2062947f8	f472c3a7b6ed09c130d3b55d83e29f3a1bf44ef03485236906c367121e6cd205	2026-04-27 06:45:29.934052+00	20260422143000_expand_unit_business_fields	\N	\N	2026-04-27 06:45:29.159913+00	1
c7a58789-5588-4f6b-8229-1c43cde0947e	5b5f7dc6a2741a028813372c1f646b131a5c5676ee02ffd2746a979b1f980752	2026-04-27 06:45:31.000324+00	20260422150000_add_unit_base_info	\N	\N	2026-04-27 06:45:30.23485+00	1
65a57887-4a61-48f3-875b-fd6032dc455a	8d5d19c4bab5d4ad182953f5179e8b370581ce61faf5f4b2862bc6b24d341bb6	2026-04-27 06:45:32.056741+00	20260422153000_add_contract_parking_pricing	\N	\N	2026-04-27 06:45:31.299788+00	1
bf439b66-70d7-4b13-a2e9-23a641b7c381	d56b5e5ee33cbec706f06163fb53cc1e7725ce1ab5c8eab3c061013a80c902ed	2026-04-27 06:45:33.140228+00	20260425130000_add_contract_penalties	\N	\N	2026-04-27 06:45:32.357905+00	1
fed06955-f40a-49f9-b4f5-3e9fa1ab6b6b	9aca253e4e4daf615013efb7647d01ebe048bb5ffa0b2726b5896fda7b9821f8	\N	20260505120000_add_termination_rules	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260505120000_add_termination_rules\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: constraint "TerminationRules_draftId_fkey" for relation "TerminationRules" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "constraint \\"TerminationRules_draftId_fkey\\" for relation \\"TerminationRules\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(9829), routine: Some("ATExecAddConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260505120000_add_termination_rules"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260505120000_add_termination_rules"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260	2026-05-05 09:05:34.360975+00	2026-05-05 09:01:39.022252+00	0
28040a93-af0b-4d5d-999a-7a635d2ce26c	9aca253e4e4daf615013efb7647d01ebe048bb5ffa0b2726b5896fda7b9821f8	2026-05-05 09:05:34.688538+00	20260505120000_add_termination_rules		\N	2026-05-05 09:05:34.688538+00	0
f48e8a4a-9b7c-4af0-b908-c342198b9e3f	46b5438b2a989b49ef1bcb2e62fac0fb0a35764ffb59ef4d65559673782a097b	2026-05-05 09:05:47.702378+00	20260505120500_add_contract_steps_789_tables	\N	\N	2026-05-05 09:05:46.880905+00	1
149580c9-63ac-4b7f-833a-1d7415362423	91115aadcc52bde9dc6cba488acdb30fcf71c8ffaafdcf78596f54c3b3530137	2026-05-06 09:39:12.091144+00	20260506130524_add_employee_national_code	\N	\N	2026-05-06 09:39:11.069515+00	1
190b4633-adc9-4180-96f1-ee9da16ab710	3f64a0306f727d5dd5665054666d9d286259bcb21279bf680a8459c9fd6906cd	2026-05-09 06:17:00.782962+00	20260507120000_workflow_approval_system	\N	\N	2026-05-09 06:17:00.782962+00	1
87ee878e-eaf4-4f6d-9645-1d89afef9fca	3661d74445e95377186e663a177d999b2785effe0090db585837aac9d4aca920	2026-05-09 06:17:01.778605+00	20260507133000_workflow_single_usage_and_final_approver	\N	\N	2026-05-09 06:17:01.778605+00	1
43c7303b-63ac-4ff5-bc05-f92acc812e72	8a1e785d32b74fce3f51ed56d339c90208d5de47efb394ea3d01faac550636e8	2026-05-14 04:38:29.951706+00	20260505134926_init	\N	\N	2026-05-11 12:44:55.227832+00	1
2b15127e-ab65-4a93-bd47-65f46b5cf778	aa523fc7529094e53c44f6d7a87f2ecec1cef67c16d50fc3c39af3fdc13c706a	2026-05-14 04:40:48.877091+00	20260506204500_tenant_approval_process_config	\N	\N	2026-05-14 04:40:48.877091+00	1
07b7eff7-38f2-40c7-ab63-c557374de052	0dbb87353812ab204a8d75b69159de46206e3b539d33ea4edc123cdb4060e039	2026-05-14 04:40:49.236064+00	20260506211000_repair_missing_tenant_owner_role	\N	\N	2026-05-14 04:40:49.236064+00	1
88b1e0b8-b55b-4a53-931e-85720c4f0471	3ff2b037cc703a81a225c0291d3018c1755b999cb665d0371e3f0aeeeea70c20	2026-05-14 04:40:49.596072+00	20260509140000_released_from_approved_for_edit	\N	\N	2026-05-14 04:40:49.596072+00	1
ca184ec6-5c23-4d38-b48d-e7ed34b1e955	2ec2288c203348a697abd7470a5c80aa9d5725ed847f17e6b3e3d6497d7f5278	2026-05-14 04:40:49.95605+00	20260511140000_contract_financial_storage_pricing	\N	\N	2026-05-14 04:40:49.95605+00	1
ca369a41-a989-4ec0-97b6-fffde0a040d2	c5069fba478e37486fdb19faf6f12b95f91352f8513ba6551f16d8595fd7bc7e	2026-05-14 04:40:50.316243+00	20260511150000_contract_financial_fixed_split_amounts	\N	\N	2026-05-14 04:40:50.316243+00	1
e14e5fec-270c-4eb5-9b64-a7c25aeb5e9c	45a5982e33a5ef11fe127b10bbbaf8e0b21867331bce4d5eea9b524722edd690	2026-05-14 04:40:50.676181+00	20260511161000_add_audit_logs	\N	\N	2026-05-14 04:40:50.676181+00	1
f1245830-bb66-472b-9d10-c54530ffb687	b5806b0eb15d4acd7654e538a52bd30f89544da35dfc8d0ff881dc00f42a91cf	2026-05-14 04:40:51.05978+00	20260512100000_contract_receipt_and_wallet_ledger	\N	\N	2026-05-14 04:40:51.05978+00	1
b2a9fd4c-8d4e-4dcc-8e3d-dfb245e4d24f	1ad453f4dc1f3b81347746a5a21ee303b1bd1ffbfa25a407e7a291be97adc3e6	2026-05-14 04:40:51.435267+00	20260512120000_enforce_unique_contract_subject_unit	\N	\N	2026-05-14 04:40:51.435267+00	1
7e02142b-30ec-4b69-83da-ae1805672805	7a1049eff5065e0d243af3565c960107f365ee105f09fd4dc6a14277da5024f3	2026-05-14 04:40:51.801048+00	20260512153000_contract_appendices	\N	\N	2026-05-14 04:40:51.801048+00	1
100bdabb-85da-4e29-844a-3c93c58589ec	3eec65518fd64e32135570bad726a891c6fa6a53b4dcab2028ba122a770185e3	2026-05-14 04:40:52.161072+00	20260512190000_appendix_lifecycle	\N	\N	2026-05-14 04:40:52.161072+00	1
5f69b4e8-e015-487f-8e7f-590edaf8e515	562cce3612fac6c86dd92fc85f48d89c871376d6d77a0ed04c8c877c2f64e563	2026-05-14 04:41:09.534128+00	20260506195500_contract_approval_return	\N	\N	2026-05-14 04:39:29.319722+00	1
\.


--
-- Name: AppUser AppUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_pkey" PRIMARY KEY (id);


--
-- Name: ApprovalWorkflow ApprovalWorkflow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalWorkflow"
    ADD CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BlockFloor BlockFloor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockFloor"
    ADD CONSTRAINT "BlockFloor_pkey" PRIMARY KEY (id);


--
-- Name: Block Block_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "Block_pkey" PRIMARY KEY (id);


--
-- Name: ContractAppendixApprovalDecision ContractAppendixApprovalDecision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixApprovalDecision"
    ADD CONSTRAINT "ContractAppendixApprovalDecision_pkey" PRIMARY KEY (id);


--
-- Name: ContractAppendixApprovalInstance ContractAppendixApprovalInstance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixApprovalInstance"
    ADD CONSTRAINT "ContractAppendixApprovalInstance_pkey" PRIMARY KEY (id);


--
-- Name: ContractAppendixItem ContractAppendixItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixItem"
    ADD CONSTRAINT "ContractAppendixItem_pkey" PRIMARY KEY (id);


--
-- Name: ContractAppendix ContractAppendix_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendix"
    ADD CONSTRAINT "ContractAppendix_pkey" PRIMARY KEY (id);


--
-- Name: ContractApprovalDecision ContractApprovalDecision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractApprovalDecision"
    ADD CONSTRAINT "ContractApprovalDecision_pkey" PRIMARY KEY (id);


--
-- Name: ContractApprovalInstance ContractApprovalInstance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractApprovalInstance"
    ADD CONSTRAINT "ContractApprovalInstance_pkey" PRIMARY KEY (id);


--
-- Name: ContractAttachments ContractAttachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAttachments"
    ADD CONSTRAINT "ContractAttachments_pkey" PRIMARY KEY (id);


--
-- Name: ContractCustomerWalletLedger ContractCustomerWalletLedger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractCustomerWalletLedger"
    ADD CONSTRAINT "ContractCustomerWalletLedger_pkey" PRIMARY KEY (id);


--
-- Name: ContractDraft ContractDraft_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractDraft"
    ADD CONSTRAINT "ContractDraft_pkey" PRIMARY KEY (id);


--
-- Name: ContractExtraCosts ContractExtraCosts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractExtraCosts"
    ADD CONSTRAINT "ContractExtraCosts_pkey" PRIMARY KEY (id);


--
-- Name: ContractFinancial ContractFinancial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractFinancial"
    ADD CONSTRAINT "ContractFinancial_pkey" PRIMARY KEY (id);


--
-- Name: ContractParties ContractParties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractParties"
    ADD CONSTRAINT "ContractParties_pkey" PRIMARY KEY (id);


--
-- Name: ContractPartyMember ContractPartyMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPartyMember"
    ADD CONSTRAINT "ContractPartyMember_pkey" PRIMARY KEY (id);


--
-- Name: ContractPenalties ContractPenalties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenalties"
    ADD CONSTRAINT "ContractPenalties_pkey" PRIMARY KEY (id);


--
-- Name: ContractPenaltyRule ContractPenaltyRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenaltyRule"
    ADD CONSTRAINT "ContractPenaltyRule_pkey" PRIMARY KEY (id);


--
-- Name: ContractPenaltyType ContractPenaltyType_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenaltyType"
    ADD CONSTRAINT "ContractPenaltyType_pkey" PRIMARY KEY (id);


--
-- Name: ContractReceipt ContractReceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractReceipt"
    ADD CONSTRAINT "ContractReceipt_pkey" PRIMARY KEY (id);


--
-- Name: ContractSubject ContractSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractSubject"
    ADD CONSTRAINT "ContractSubject_pkey" PRIMARY KEY (id);


--
-- Name: ContractTechnicalSpecs ContractTechnicalSpecs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractTechnicalSpecs"
    ADD CONSTRAINT "ContractTechnicalSpecs_pkey" PRIMARY KEY (id);


--
-- Name: DevPageDocumentEvent DevPageDocumentEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocumentEvent"
    ADD CONSTRAINT "DevPageDocumentEvent_pkey" PRIMARY KEY (id);


--
-- Name: DevPageDocumentReadState DevPageDocumentReadState_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocumentReadState"
    ADD CONSTRAINT "DevPageDocumentReadState_pkey" PRIMARY KEY (id);


--
-- Name: DevPageDocument DevPageDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocument"
    ADD CONSTRAINT "DevPageDocument_pkey" PRIMARY KEY (id);


--
-- Name: DevPageMessage DevPageMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageMessage"
    ADD CONSTRAINT "DevPageMessage_pkey" PRIMARY KEY (id);


--
-- Name: DevPageThread DevPageThread_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageThread"
    ADD CONSTRAINT "DevPageThread_pkey" PRIMARY KEY (id);


--
-- Name: DirectoryPerson DirectoryPerson_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectoryPerson"
    ADD CONSTRAINT "DirectoryPerson_pkey" PRIMARY KEY (id);


--
-- Name: DirectoryRepresentative DirectoryRepresentative_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectoryRepresentative"
    ADD CONSTRAINT "DirectoryRepresentative_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: FinancialCategory FinancialCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinancialCategory"
    ADD CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY (id);


--
-- Name: FinancialDueItem FinancialDueItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinancialDueItem"
    ADD CONSTRAINT "FinancialDueItem_pkey" PRIMARY KEY (id);


--
-- Name: FormerEmployee FormerEmployee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FormerEmployee"
    ADD CONSTRAINT "FormerEmployee_pkey" PRIMARY KEY (id);


--
-- Name: ProjectPlate ProjectPlate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectPlate"
    ADD CONSTRAINT "ProjectPlate_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: TenantBusinessProfileSettings TenantBusinessProfileSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantBusinessProfileSettings"
    ADD CONSTRAINT "TenantBusinessProfileSettings_pkey" PRIMARY KEY (id);


--
-- Name: TenantBusinessProfileSettings TenantBusinessProfileSettings_tenantId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantBusinessProfileSettings"
    ADD CONSTRAINT "TenantBusinessProfileSettings_tenantId_key" UNIQUE ("tenantId");


--
-- Name: TenantContractRuleSettings TenantContractRuleSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantContractRuleSettings"
    ADD CONSTRAINT "TenantContractRuleSettings_pkey" PRIMARY KEY (id);


--
-- Name: TenantRoleMenuPermission TenantRoleMenuPermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRoleMenuPermission"
    ADD CONSTRAINT "TenantRoleMenuPermission_pkey" PRIMARY KEY (id);


--
-- Name: TenantRolePermission TenantRolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRolePermission"
    ADD CONSTRAINT "TenantRolePermission_pkey" PRIMARY KEY (id);


--
-- Name: TenantRole TenantRole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRole"
    ADD CONSTRAINT "TenantRole_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: TerminationRules TerminationRules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TerminationRules"
    ADD CONSTRAINT "TerminationRules_pkey" PRIMARY KEY (id);


--
-- Name: Unit Unit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_pkey" PRIMARY KEY (id);


--
-- Name: UserTenantMembershipRole UserTenantMembershipRole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserTenantMembershipRole"
    ADD CONSTRAINT "UserTenantMembershipRole_pkey" PRIMARY KEY (id);


--
-- Name: UserTenantMembership UserTenantMembership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserTenantMembership"
    ADD CONSTRAINT "UserTenantMembership_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AppUser_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AppUser_email_key" ON public."AppUser" USING btree (email);


--
-- Name: AppUser_mobile_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AppUser_mobile_key" ON public."AppUser" USING btree (mobile);


--
-- Name: ApprovalWorkflow_tenantId_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalWorkflow_tenantId_active_idx" ON public."ApprovalWorkflow" USING btree ("tenantId", active);


--
-- Name: ApprovalWorkflow_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalWorkflow_tenantId_idx" ON public."ApprovalWorkflow" USING btree ("tenantId");


--
-- Name: ApprovalWorkflow_tenantId_usageTypes_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalWorkflow_tenantId_usageTypes_idx" ON public."ApprovalWorkflow" USING btree ("tenantId");


--
-- Name: AuditLog_tenantId_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_tenantId_action_idx" ON public."AuditLog" USING btree ("tenantId", action);


--
-- Name: AuditLog_tenantId_actorUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_tenantId_actorUserId_idx" ON public."AuditLog" USING btree ("tenantId", "actorUserId");


--
-- Name: AuditLog_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON public."AuditLog" USING btree ("tenantId", "createdAt");


--
-- Name: AuditLog_tenantId_entityType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_tenantId_entityType_idx" ON public."AuditLog" USING btree ("tenantId", "entityType");


--
-- Name: BlockFloor_tenantId_blockId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlockFloor_tenantId_blockId_idx" ON public."BlockFloor" USING btree ("tenantId", "blockId");


--
-- Name: BlockFloor_tenantId_blockId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlockFloor_tenantId_blockId_name_key" ON public."BlockFloor" USING btree ("tenantId", "blockId", name);


--
-- Name: Block_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Block_tenantId_idx" ON public."Block" USING btree ("tenantId");


--
-- Name: ContractAppendixApprovalDecision_approverUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendixApprovalDecision_approverUserId_idx" ON public."ContractAppendixApprovalDecision" USING btree ("approverUserId");


--
-- Name: ContractAppendixApprovalDecision_instanceId_stepId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendixApprovalDecision_instanceId_stepId_idx" ON public."ContractAppendixApprovalDecision" USING btree ("instanceId", "stepId");


--
-- Name: ContractAppendixApprovalInstance_appendixId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractAppendixApprovalInstance_appendixId_key" ON public."ContractAppendixApprovalInstance" USING btree ("appendixId");


--
-- Name: ContractAppendixApprovalInstance_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendixApprovalInstance_tenantId_idx" ON public."ContractAppendixApprovalInstance" USING btree ("tenantId");


--
-- Name: ContractAppendixApprovalInstance_tenantId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendixApprovalInstance_tenantId_status_idx" ON public."ContractAppendixApprovalInstance" USING btree ("tenantId", status);


--
-- Name: ContractAppendixItem_appendixId_groupKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendixItem_appendixId_groupKey_idx" ON public."ContractAppendixItem" USING btree ("appendixId", "groupKey");


--
-- Name: ContractAppendixItem_appendixId_tagKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendixItem_appendixId_tagKey_idx" ON public."ContractAppendixItem" USING btree ("appendixId", "tagKey");


--
-- Name: ContractAppendix_draftId_appendixNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractAppendix_draftId_appendixNumber_key" ON public."ContractAppendix" USING btree ("draftId", "appendixNumber");


--
-- Name: ContractAppendix_previousAppendixId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendix_previousAppendixId_idx" ON public."ContractAppendix" USING btree ("previousAppendixId");


--
-- Name: ContractAppendix_tenantId_draftId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendix_tenantId_draftId_createdAt_idx" ON public."ContractAppendix" USING btree ("tenantId", "draftId", "createdAt");


--
-- Name: ContractAppendix_tenantId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAppendix_tenantId_status_createdAt_idx" ON public."ContractAppendix" USING btree ("tenantId", status, "createdAt");


--
-- Name: ContractApprovalDecision_approverUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractApprovalDecision_approverUserId_idx" ON public."ContractApprovalDecision" USING btree ("approverUserId");


--
-- Name: ContractApprovalDecision_instanceId_stepId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractApprovalDecision_instanceId_stepId_idx" ON public."ContractApprovalDecision" USING btree ("instanceId", "stepId");


--
-- Name: ContractApprovalInstance_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractApprovalInstance_draftId_key" ON public."ContractApprovalInstance" USING btree ("draftId");


--
-- Name: ContractApprovalInstance_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractApprovalInstance_tenantId_idx" ON public."ContractApprovalInstance" USING btree ("tenantId");


--
-- Name: ContractApprovalInstance_tenantId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractApprovalInstance_tenantId_status_idx" ON public."ContractApprovalInstance" USING btree ("tenantId", status);


--
-- Name: ContractAttachments_draftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractAttachments_draftId_idx" ON public."ContractAttachments" USING btree ("draftId");


--
-- Name: ContractAttachments_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractAttachments_draftId_key" ON public."ContractAttachments" USING btree ("draftId");


--
-- Name: ContractCustomerWalletLedger_receiptId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractCustomerWalletLedger_receiptId_idx" ON public."ContractCustomerWalletLedger" USING btree ("receiptId");


--
-- Name: ContractCustomerWalletLedger_tenantId_draftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractCustomerWalletLedger_tenantId_draftId_idx" ON public."ContractCustomerWalletLedger" USING btree ("tenantId", "draftId");


--
-- Name: ContractDraft_tenantId_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractDraft_tenantId_updatedAt_idx" ON public."ContractDraft" USING btree ("tenantId", "updatedAt");


--
-- Name: ContractExtraCosts_draftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractExtraCosts_draftId_idx" ON public."ContractExtraCosts" USING btree ("draftId");


--
-- Name: ContractExtraCosts_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractExtraCosts_draftId_key" ON public."ContractExtraCosts" USING btree ("draftId");


--
-- Name: ContractFinancial_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractFinancial_draftId_key" ON public."ContractFinancial" USING btree ("draftId");


--
-- Name: ContractParties_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractParties_draftId_key" ON public."ContractParties" USING btree ("draftId");


--
-- Name: ContractPartyMember_partiesId_side_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractPartyMember_partiesId_side_idx" ON public."ContractPartyMember" USING btree ("partiesId", side);


--
-- Name: ContractPenalties_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractPenalties_draftId_key" ON public."ContractPenalties" USING btree ("draftId");


--
-- Name: ContractPenaltyRule_penaltiesId_penaltyTypeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractPenaltyRule_penaltiesId_penaltyTypeId_idx" ON public."ContractPenaltyRule" USING btree ("penaltiesId", "penaltyTypeId");


--
-- Name: ContractPenaltyType_penaltiesId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractPenaltyType_penaltiesId_idx" ON public."ContractPenaltyType" USING btree ("penaltiesId");


--
-- Name: ContractReceipt_draftId_allocationDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractReceipt_draftId_allocationDate_idx" ON public."ContractReceipt" USING btree ("draftId", "allocationDate");


--
-- Name: ContractReceipt_tenantId_draftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractReceipt_tenantId_draftId_idx" ON public."ContractReceipt" USING btree ("tenantId", "draftId");


--
-- Name: ContractSubject_contractNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractSubject_contractNumber_idx" ON public."ContractSubject" USING btree ("contractNumber");


--
-- Name: ContractSubject_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractSubject_draftId_key" ON public."ContractSubject" USING btree ("draftId");


--
-- Name: ContractTechnicalSpecs_draftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContractTechnicalSpecs_draftId_idx" ON public."ContractTechnicalSpecs" USING btree ("draftId");


--
-- Name: ContractTechnicalSpecs_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContractTechnicalSpecs_draftId_key" ON public."ContractTechnicalSpecs" USING btree ("draftId");


--
-- Name: DevPageDocumentEvent_tenantId_appId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageDocumentEvent_tenantId_appId_createdAt_idx" ON public."DevPageDocumentEvent" USING btree ("tenantId", "appId", "createdAt" DESC);


--
-- Name: DevPageDocumentReadState_tenantId_appId_userId_documentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DevPageDocumentReadState_tenantId_appId_userId_documentId_key" ON public."DevPageDocumentReadState" USING btree ("tenantId", "appId", "userId", "documentId");


--
-- Name: DevPageDocument_tenantId_appId_pageKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageDocument_tenantId_appId_pageKey_idx" ON public."DevPageDocument" USING btree ("tenantId", "appId", "pageKey");


--
-- Name: DevPageDocument_tenantId_appId_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageDocument_tenantId_appId_updatedAt_idx" ON public."DevPageDocument" USING btree ("tenantId", "appId", "updatedAt" DESC);


--
-- Name: DevPageDocument_tenantId_pageKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageDocument_tenantId_pageKey_idx" ON public."DevPageDocument" USING btree ("tenantId", "pageKey");


--
-- Name: DevPageDocument_tenantId_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageDocument_tenantId_updatedAt_idx" ON public."DevPageDocument" USING btree ("tenantId", "updatedAt" DESC);


--
-- Name: DevPageMessage_threadId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageMessage_threadId_createdAt_idx" ON public."DevPageMessage" USING btree ("threadId", "createdAt");


--
-- Name: DevPageThread_appId_pageKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageThread_appId_pageKey_idx" ON public."DevPageThread" USING btree ("appId", "pageKey");


--
-- Name: DevPageThread_appId_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DevPageThread_appId_updatedAt_idx" ON public."DevPageThread" USING btree ("appId", "updatedAt" DESC);


--
-- Name: DirectoryPerson_tenantId_role_personType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DirectoryPerson_tenantId_role_personType_idx" ON public."DirectoryPerson" USING btree ("tenantId", role, "personType");


--
-- Name: DirectoryRepresentative_principalId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DirectoryRepresentative_principalId_idx" ON public."DirectoryRepresentative" USING btree ("principalId");


--
-- Name: DirectoryRepresentative_tenantId_principalType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DirectoryRepresentative_tenantId_principalType_idx" ON public."DirectoryRepresentative" USING btree ("tenantId", "principalType");


--
-- Name: DirectoryRepresentative_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DirectoryRepresentative_userId_idx" ON public."DirectoryRepresentative" USING btree ("userId");


--
-- Name: Employee_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Employee_tenantId_idx" ON public."Employee" USING btree ("tenantId");


--
-- Name: Employee_tenantId_nationalCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Employee_tenantId_nationalCode_key" ON public."Employee" USING btree ("tenantId", "nationalCode");


--
-- Name: FinancialCategory_financialId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FinancialCategory_financialId_idx" ON public."FinancialCategory" USING btree ("financialId");


--
-- Name: FinancialDueItem_financialId_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FinancialDueItem_financialId_categoryId_idx" ON public."FinancialDueItem" USING btree ("financialId", "categoryId");


--
-- Name: FormerEmployee_tenantId_fullName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FormerEmployee_tenantId_fullName_idx" ON public."FormerEmployee" USING btree ("tenantId", "fullName");


--
-- Name: FormerEmployee_tenantId_normalizedName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FormerEmployee_tenantId_normalizedName_key" ON public."FormerEmployee" USING btree ("tenantId", "normalizedName");


--
-- Name: ProjectPlate_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectPlate_tenantId_idx" ON public."ProjectPlate" USING btree ("tenantId");


--
-- Name: ProjectPlate_tenantId_mainPlate_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProjectPlate_tenantId_mainPlate_key" ON public."ProjectPlate" USING btree ("tenantId", "mainPlate");


--
-- Name: Session_tenantId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_tenantId_userId_idx" ON public."Session" USING btree ("tenantId", "userId");


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: TenantBusinessProfileSettings_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantBusinessProfileSettings_tenantId_idx" ON public."TenantBusinessProfileSettings" USING btree ("tenantId");


--
-- Name: TenantContractRuleSettings_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantContractRuleSettings_tenantId_idx" ON public."TenantContractRuleSettings" USING btree ("tenantId");


--
-- Name: TenantContractRuleSettings_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TenantContractRuleSettings_tenantId_key" ON public."TenantContractRuleSettings" USING btree ("tenantId");


--
-- Name: TenantRoleMenuPermission_menuItemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRoleMenuPermission_menuItemId_idx" ON public."TenantRoleMenuPermission" USING btree ("menuItemId");


--
-- Name: TenantRoleMenuPermission_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRoleMenuPermission_roleId_idx" ON public."TenantRoleMenuPermission" USING btree ("roleId");


--
-- Name: TenantRoleMenuPermission_roleId_menuItemId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TenantRoleMenuPermission_roleId_menuItemId_key" ON public."TenantRoleMenuPermission" USING btree ("roleId", "menuItemId");


--
-- Name: TenantRolePermission_permissionKey_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRolePermission_permissionKey_idx" ON public."TenantRolePermission" USING btree ("permissionKey");


--
-- Name: TenantRolePermission_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRolePermission_roleId_idx" ON public."TenantRolePermission" USING btree ("roleId");


--
-- Name: TenantRolePermission_roleId_permissionKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TenantRolePermission_roleId_permissionKey_key" ON public."TenantRolePermission" USING btree ("roleId", "permissionKey");


--
-- Name: TenantRole_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRole_tenantId_idx" ON public."TenantRole" USING btree ("tenantId");


--
-- Name: TenantRole_tenantId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TenantRole_tenantId_key_key" ON public."TenantRole" USING btree ("tenantId", key);


--
-- Name: Tenant_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tenant_slug_key" ON public."Tenant" USING btree (slug);


--
-- Name: TerminationRules_draftId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TerminationRules_draftId_idx" ON public."TerminationRules" USING btree ("draftId");


--
-- Name: TerminationRules_draftId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TerminationRules_draftId_key" ON public."TerminationRules" USING btree ("draftId");


--
-- Name: Unit_tenantId_assignedToUnitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Unit_tenantId_assignedToUnitId_idx" ON public."Unit" USING btree ("tenantId", "assignedToUnitId");


--
-- Name: Unit_tenantId_blockId_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Unit_tenantId_blockId_category_idx" ON public."Unit" USING btree ("tenantId", "blockId", category);


--
-- Name: Unit_tenantId_blockId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Unit_tenantId_blockId_idx" ON public."Unit" USING btree ("tenantId", "blockId");


--
-- Name: UserTenantMembershipRole_membershipId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserTenantMembershipRole_membershipId_idx" ON public."UserTenantMembershipRole" USING btree ("membershipId");


--
-- Name: UserTenantMembershipRole_membershipId_roleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserTenantMembershipRole_membershipId_roleId_key" ON public."UserTenantMembershipRole" USING btree ("membershipId", "roleId");


--
-- Name: UserTenantMembershipRole_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserTenantMembershipRole_roleId_idx" ON public."UserTenantMembershipRole" USING btree ("roleId");


--
-- Name: UserTenantMembership_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserTenantMembership_tenantId_idx" ON public."UserTenantMembership" USING btree ("tenantId");


--
-- Name: UserTenantMembership_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserTenantMembership_userId_idx" ON public."UserTenantMembership" USING btree ("userId");


--
-- Name: UserTenantMembership_userId_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserTenantMembership_userId_tenantId_key" ON public."UserTenantMembership" USING btree ("userId", "tenantId");


--
-- Name: ApprovalWorkflow ApprovalWorkflow_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalWorkflow"
    ADD CONSTRAINT "ApprovalWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlockFloor BlockFloor_blockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockFloor"
    ADD CONSTRAINT "BlockFloor_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES public."Block"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlockFloor BlockFloor_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockFloor"
    ADD CONSTRAINT "BlockFloor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Block Block_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "Block_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractAppendixApprovalDecision ContractAppendixApprovalDecision_instanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixApprovalDecision"
    ADD CONSTRAINT "ContractAppendixApprovalDecision_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES public."ContractAppendixApprovalInstance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractAppendixApprovalInstance ContractAppendixApprovalInstance_appendixId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixApprovalInstance"
    ADD CONSTRAINT "ContractAppendixApprovalInstance_appendixId_fkey" FOREIGN KEY ("appendixId") REFERENCES public."ContractAppendix"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractAppendixApprovalInstance ContractAppendixApprovalInstance_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixApprovalInstance"
    ADD CONSTRAINT "ContractAppendixApprovalInstance_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public."ApprovalWorkflow"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContractAppendixItem ContractAppendixItem_appendixId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendixItem"
    ADD CONSTRAINT "ContractAppendixItem_appendixId_fkey" FOREIGN KEY ("appendixId") REFERENCES public."ContractAppendix"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractAppendix ContractAppendix_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendix"
    ADD CONSTRAINT "ContractAppendix_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractAppendix ContractAppendix_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendix"
    ADD CONSTRAINT "ContractAppendix_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractAppendix ContractAppendix_previousAppendixId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendix"
    ADD CONSTRAINT "ContractAppendix_previousAppendixId_fkey" FOREIGN KEY ("previousAppendixId") REFERENCES public."ContractAppendix"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractAppendix ContractAppendix_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAppendix"
    ADD CONSTRAINT "ContractAppendix_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractApprovalDecision ContractApprovalDecision_instanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractApprovalDecision"
    ADD CONSTRAINT "ContractApprovalDecision_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES public."ContractApprovalInstance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractApprovalInstance ContractApprovalInstance_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractApprovalInstance"
    ADD CONSTRAINT "ContractApprovalInstance_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractApprovalInstance ContractApprovalInstance_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractApprovalInstance"
    ADD CONSTRAINT "ContractApprovalInstance_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public."ApprovalWorkflow"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContractAttachments ContractAttachments_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractAttachments"
    ADD CONSTRAINT "ContractAttachments_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractCustomerWalletLedger ContractCustomerWalletLedger_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractCustomerWalletLedger"
    ADD CONSTRAINT "ContractCustomerWalletLedger_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractCustomerWalletLedger ContractCustomerWalletLedger_receiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractCustomerWalletLedger"
    ADD CONSTRAINT "ContractCustomerWalletLedger_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES public."ContractReceipt"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractDraft ContractDraft_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractDraft"
    ADD CONSTRAINT "ContractDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractExtraCosts ContractExtraCosts_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractExtraCosts"
    ADD CONSTRAINT "ContractExtraCosts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractFinancial ContractFinancial_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractFinancial"
    ADD CONSTRAINT "ContractFinancial_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractParties ContractParties_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractParties"
    ADD CONSTRAINT "ContractParties_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractPartyMember ContractPartyMember_directoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPartyMember"
    ADD CONSTRAINT "ContractPartyMember_directoryId_fkey" FOREIGN KEY ("directoryId") REFERENCES public."DirectoryPerson"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractPartyMember ContractPartyMember_partiesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPartyMember"
    ADD CONSTRAINT "ContractPartyMember_partiesId_fkey" FOREIGN KEY ("partiesId") REFERENCES public."ContractParties"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractPenalties ContractPenalties_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenalties"
    ADD CONSTRAINT "ContractPenalties_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractPenaltyRule ContractPenaltyRule_penaltiesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenaltyRule"
    ADD CONSTRAINT "ContractPenaltyRule_penaltiesId_fkey" FOREIGN KEY ("penaltiesId") REFERENCES public."ContractPenalties"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractPenaltyRule ContractPenaltyRule_penaltyTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenaltyRule"
    ADD CONSTRAINT "ContractPenaltyRule_penaltyTypeId_fkey" FOREIGN KEY ("penaltyTypeId") REFERENCES public."ContractPenaltyType"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractPenaltyType ContractPenaltyType_penaltiesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractPenaltyType"
    ADD CONSTRAINT "ContractPenaltyType_penaltiesId_fkey" FOREIGN KEY ("penaltiesId") REFERENCES public."ContractPenalties"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractReceipt ContractReceipt_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractReceipt"
    ADD CONSTRAINT "ContractReceipt_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractSubject ContractSubject_blockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractSubject"
    ADD CONSTRAINT "ContractSubject_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES public."Block"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContractSubject ContractSubject_contractorEmployeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractSubject"
    ADD CONSTRAINT "ContractSubject_contractorEmployeeId_fkey" FOREIGN KEY ("contractorEmployeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContractSubject ContractSubject_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractSubject"
    ADD CONSTRAINT "ContractSubject_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContractSubject ContractSubject_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractSubject"
    ADD CONSTRAINT "ContractSubject_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContractTechnicalSpecs ContractTechnicalSpecs_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContractTechnicalSpecs"
    ADD CONSTRAINT "ContractTechnicalSpecs_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DevPageDocumentEvent DevPageDocumentEvent_actorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocumentEvent"
    ADD CONSTRAINT "DevPageDocumentEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DevPageDocumentEvent DevPageDocumentEvent_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocumentEvent"
    ADD CONSTRAINT "DevPageDocumentEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DevPageDocumentReadState DevPageDocumentReadState_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocumentReadState"
    ADD CONSTRAINT "DevPageDocumentReadState_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DevPageDocumentReadState DevPageDocumentReadState_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocumentReadState"
    ADD CONSTRAINT "DevPageDocumentReadState_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DevPageDocument DevPageDocument_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocument"
    ADD CONSTRAINT "DevPageDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DevPageDocument DevPageDocument_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocument"
    ADD CONSTRAINT "DevPageDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DevPageDocument DevPageDocument_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageDocument"
    ADD CONSTRAINT "DevPageDocument_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DevPageMessage DevPageMessage_authorUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageMessage"
    ADD CONSTRAINT "DevPageMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DevPageMessage DevPageMessage_threadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageMessage"
    ADD CONSTRAINT "DevPageMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES public."DevPageThread"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DevPageThread DevPageThread_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageThread"
    ADD CONSTRAINT "DevPageThread_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DevPageThread DevPageThread_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DevPageThread"
    ADD CONSTRAINT "DevPageThread_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DirectoryPerson DirectoryPerson_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectoryPerson"
    ADD CONSTRAINT "DirectoryPerson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DirectoryRepresentative DirectoryRepresentative_principalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectoryRepresentative"
    ADD CONSTRAINT "DirectoryRepresentative_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES public."DirectoryPerson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DirectoryRepresentative DirectoryRepresentative_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectoryRepresentative"
    ADD CONSTRAINT "DirectoryRepresentative_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DirectoryRepresentative DirectoryRepresentative_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectoryRepresentative"
    ADD CONSTRAINT "DirectoryRepresentative_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Employee Employee_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FinancialCategory FinancialCategory_financialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinancialCategory"
    ADD CONSTRAINT "FinancialCategory_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES public."ContractFinancial"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FinancialDueItem FinancialDueItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinancialDueItem"
    ADD CONSTRAINT "FinancialDueItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."FinancialCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FinancialDueItem FinancialDueItem_financialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinancialDueItem"
    ADD CONSTRAINT "FinancialDueItem_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES public."ContractFinancial"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormerEmployee FormerEmployee_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FormerEmployee"
    ADD CONSTRAINT "FormerEmployee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectPlate ProjectPlate_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectPlate"
    ADD CONSTRAINT "ProjectPlate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantBusinessProfileSettings TenantBusinessProfileSettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantBusinessProfileSettings"
    ADD CONSTRAINT "TenantBusinessProfileSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantContractRuleSettings TenantContractRuleSettings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantContractRuleSettings"
    ADD CONSTRAINT "TenantContractRuleSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantRoleMenuPermission TenantRoleMenuPermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRoleMenuPermission"
    ADD CONSTRAINT "TenantRoleMenuPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."TenantRole"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantRolePermission TenantRolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRolePermission"
    ADD CONSTRAINT "TenantRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."TenantRole"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantRole TenantRole_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRole"
    ADD CONSTRAINT "TenantRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TerminationRules TerminationRules_draftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TerminationRules"
    ADD CONSTRAINT "TerminationRules_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES public."ContractDraft"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Unit Unit_blockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES public."Block"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Unit Unit_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTenantMembershipRole UserTenantMembershipRole_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserTenantMembershipRole"
    ADD CONSTRAINT "UserTenantMembershipRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public."UserTenantMembership"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTenantMembershipRole UserTenantMembershipRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserTenantMembershipRole"
    ADD CONSTRAINT "UserTenantMembershipRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."TenantRole"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTenantMembership UserTenantMembership_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserTenantMembership"
    ADD CONSTRAINT "UserTenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTenantMembership UserTenantMembership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserTenantMembership"
    ADD CONSTRAINT "UserTenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."AppUser"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 8FOoEfpPNvE6nQ9UkN29pBu8Yo8bw7VaTKQxcumjj5i3drgpcmACkBTu1hdWe09

