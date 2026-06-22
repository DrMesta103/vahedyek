import { scryptSync } from 'node:crypto';
import {
  ContractApprovalDecisionType,
  ContractApprovalInstanceStatus,
  ContractorType,
  ContractType,
  DirectoryRole,
  PartySide,
  PersonType,
  PricingType,
  Prisma,
  PrismaClient,
  ShareMode,
} from '../node_modules/.prisma/client';
import { createInitialRuleState } from '../app/lib/businessContractRules';
import { normalizeBuilderPenaltyRuleState } from '../app/lib/builderPenalty';

const prisma = new PrismaClient();

const tenantOwnerMobile = '9024552578';
const draftId = 'demo-approved-contract-001';
const workflowId = 'demo-approved-workflow-001';
const approvalInstanceId = 'demo-approved-instance-001';
const contractNumber = 'TAAV-1405-0001';
const contractDate = '1405/01/20';
const deliveryDate = '1405/12/29';
const secondDraftId = 'draft-demo-001';
const secondWorkflowId = 'demo-approved-workflow-002';
const secondApprovalInstanceId = 'demo-approved-instance-002';
const secondContractNumber = 'TAAV-1405-0002';
const secondContractDate = '1405/03/05';
const secondDeliveryDate = '1406/03/05';

function buildRuleState(ruleId: Parameters<typeof createInitialRuleState>[0], values: Record<string, string | boolean>, activeTab?: string) {
  const state = createInitialRuleState(ruleId);
  state.active = true;
  if (activeTab) state.activeTab = activeTab;
  Object.assign(state.values, values);
  return state;
}

async function ensureContractDraftRuleSettingsTable() {
  await prisma.$executeRaw(
    Prisma.sql`
      CREATE TABLE IF NOT EXISTS "ContractDraftRuleSettings" (
        "id" TEXT NOT NULL,
        "draftId" TEXT NOT NULL,
        "ruleId" TEXT NOT NULL,
        "payload" JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ContractDraftRuleSettings_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ContractDraftRuleSettings_draftId_fkey"
          FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `,
  );

  await prisma.$executeRaw(
    Prisma.sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "ContractDraftRuleSettings_draftId_ruleId_key"
      ON "ContractDraftRuleSettings"("draftId", "ruleId")
    `,
  );

  await prisma.$executeRaw(
    Prisma.sql`
      CREATE INDEX IF NOT EXISTS "ContractDraftRuleSettings_draftId_idx"
      ON "ContractDraftRuleSettings"("draftId")
    `,
  );
}

async function main() {
  await ensureContractDraftRuleSettingsTable();

  const ownerUser = await prisma.appUser.findFirst({
    where: { mobile: tenantOwnerMobile },
    select: { id: true, fullName: true, mobile: true },
  });

  if (!ownerUser) {
    throw new Error(`No user found with mobile ${tenantOwnerMobile}. Seed aborted.`);
  }

  const ownerMembership = await prisma.userTenantMembership.findFirst({
    where: { userId: ownerUser.id, role: 'owner' },
    select: {
      tenant: { select: { id: true, slug: true, name: true } },
    },
  });

  const fallbackMembership = ownerMembership
    ? null
    : await prisma.userTenantMembership.findFirst({
        where: { userId: ownerUser.id },
        select: {
          tenant: { select: { id: true, slug: true, name: true } },
        },
      });

  const tenant = ownerMembership?.tenant ?? fallbackMembership?.tenant;

  if (!tenant) {
    throw new Error(`No tenant membership found for mobile ${tenantOwnerMobile}. Seed aborted.`);
  }

  const approvedContractsCount = await prisma.contractDraft.count({
    where: {
      tenantId: tenant.id,
      approvalInstance: { isNot: null },
    },
  });

  if (approvedContractsCount >= 2) {
    console.log(
      `Tenant ${tenant.slug} already has ${approvedContractsCount} approved contracts. Skipping demo contract seed.`,
    );
    return;
  }

  const adminSalt = 'vahedyek-demo-admin-salt';
  const reviewerSalt = 'vahedyek-demo-reviewer-salt';

  const adminUser = await prisma.appUser.upsert({
    where: { email: 'admin@taav.ir' },
    update: {
      firstName: 'علی',
      lastName: 'علینقی پور',
      fullName: 'علی علینقی پور',
      mobile: '9301000001',
      passwordHash: scryptSync('admin123', adminSalt, 64).toString('hex'),
      passwordSalt: adminSalt,
    },
    create: {
      firstName: 'علی',
      lastName: 'علینقی پور',
      fullName: 'علی علینقی پور',
      email: 'admin@taav.ir',
      mobile: '9301000001',
      passwordHash: scryptSync('admin123', adminSalt, 64).toString('hex'),
      passwordSalt: adminSalt,
    },
  });

  const reviewerUser = await prisma.appUser.upsert({
    where: { email: 'reviewer@taav.ir' },
    update: {
      firstName: 'مینا',
      lastName: 'کاظمی',
      fullName: 'مینا کاظمی',
      mobile: '9301000002',
      passwordHash: scryptSync('reviewer123', reviewerSalt, 64).toString('hex'),
      passwordSalt: reviewerSalt,
    },
    create: {
      firstName: 'مینا',
      lastName: 'کاظمی',
      fullName: 'مینا کاظمی',
      email: 'reviewer@taav.ir',
      mobile: '9301000002',
      passwordHash: scryptSync('reviewer123', reviewerSalt, 64).toString('hex'),
      passwordSalt: reviewerSalt,
    },
  });

  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenant.id } },
    update: { role: 'owner' },
    create: { userId: adminUser.id, tenantId: tenant.id, role: 'owner' },
  });

  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: reviewerUser.id, tenantId: tenant.id } },
    update: { role: 'member' },
    create: { userId: reviewerUser.id, tenantId: tenant.id, role: 'member' },
  });

  const blockRows = [
    { id: 'demo-block-skyline', name: 'بلوک آسمان' },
    { id: 'demo-block-mehr', name: 'بلوک مهر' },
  ];

  for (const block of blockRows) {
    await prisma.block.upsert({
      where: { id: block.id },
      update: {
        tenantId: tenant.id,
        name: block.name,
      },
      create: {
        id: block.id,
        tenantId: tenant.id,
        name: block.name,
      },
    });
  }

  const unitRows = [
    {
      id: 'demo-unit-301',
      blockId: 'demo-block-skyline',
      floorName: 'طبقه سوم',
      name: 'واحد 301',
      usage: 'residential',
    },
    {
      id: 'demo-unit-302',
      blockId: 'demo-block-skyline',
      floorName: 'طبقه سوم',
      name: 'واحد 302',
      usage: 'residential',
    },
    {
      id: 'demo-unit-201P',
      blockId: 'demo-block-mehr',
      floorName: 'طبقه دوم',
      name: 'واحد 201P',
      usage: 'parking',
    },
    {
      id: 'demo-unit-101S',
      blockId: 'demo-block-mehr',
      floorName: 'همکف',
      name: 'انبار S01',
      usage: 'storage',
    },
  ];

  for (const unit of unitRows) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      update: {
        tenantId: tenant.id,
        blockId: unit.blockId,
        floorName: unit.floorName,
        name: unit.name,
        usage: unit.usage,
        category: 'unit',
        saleEnabled: true,
        deliveryStatus: 'ready',
        areaPricingMode: 'unit-only',
      },
      create: {
        id: unit.id,
        tenantId: tenant.id,
        blockId: unit.blockId,
        floorName: unit.floorName,
        name: unit.name,
        usage: unit.usage,
        category: 'unit',
        saleEnabled: true,
        deliveryStatus: 'ready',
        areaPricingMode: 'unit-only',
      },
    });
  }

  const directoryPeople = [
    { id: 'demo-seller-company', name: 'شرکت آفاق سازه پاسارگاد', role: DirectoryRole.partner, personType: PersonType.legal },
    { id: 'demo-seller-company-2', name: 'شرکت توسعه افق', role: DirectoryRole.partner, personType: PersonType.legal },
    { id: 'demo-buyer-1', name: 'سارا محمدی', role: DirectoryRole.buyer, personType: PersonType.natural },
    { id: 'demo-buyer-2', name: 'رضا عباسی', role: DirectoryRole.buyer, personType: PersonType.natural },
    { id: 'demo-buyer-3', name: 'نگار یوسفی', role: DirectoryRole.buyer, personType: PersonType.natural },
  ];

  for (const person of directoryPeople) {
    await prisma.directoryPerson.upsert({
      where: { id: person.id },
      update: {
        tenantId: tenant.id,
        name: person.name,
        role: person.role,
        personType: person.personType,
      },
      create: {
        id: person.id,
        tenantId: tenant.id,
        name: person.name,
        role: person.role,
        personType: person.personType,
      },
    });
  }

  await prisma.contractApprovalDecision.deleteMany({ where: { instanceId: approvalInstanceId } });
  await prisma.contractApprovalInstance.deleteMany({ where: { id: approvalInstanceId } });
  await prisma.approvalWorkflow.deleteMany({ where: { id: workflowId } });
  await prisma.contractDraftRuleSettings.deleteMany({ where: { draftId } });
  await prisma.contractDraft.deleteMany({ where: { id: draftId } });

  const draft = await prisma.contractDraft.create({
    data: {
      id: draftId,
      tenantId: tenant.id,
      approvalReturnedPending: false,
      approvalLastRejectionReason: null,
      approvalLastRejectedAt: null,
      releasedFromApprovedForEdit: false,
    },
  });

  await prisma.contractSubject.create({
    data: {
      draftId: draft.id,
      contractorType: ContractorType.former_employee,
      contractorFormerName: 'رضا احمدی',
      contractType: ContractType.pre_sale,
      contractDate,
      contractNumber,
      deliveryDate,
      blockId: 'demo-block-skyline',
      unitId: 'demo-unit-301',
    },
  });

  const parties = await prisma.contractParties.create({
    data: {
      draftId: draft.id,
      partyOneMode: ShareMode.dang,
      partyTwoMode: ShareMode.percent,
    },
  });

  await prisma.contractPartyMember.createMany({
    data: [
      {
        id: 'demo-party-seller-1',
        partiesId: parties.id,
        side: PartySide.party_one,
        personId: 'demo-seller-company',
        directoryId: 'demo-seller-company',
        personType: PersonType.legal,
        name: 'شرکت آفاق سازه پاسارگاد',
        shareValue: 6,
        isPrimary: true,
      },
      {
        id: 'demo-party-buyer-1',
        partiesId: parties.id,
        side: PartySide.party_two,
        personId: 'demo-buyer-1',
        directoryId: 'demo-buyer-1',
        personType: PersonType.natural,
        name: 'سارا محمدی',
        shareValue: 50,
        isPrimary: true,
      },
      {
        id: 'demo-party-buyer-2',
        partiesId: parties.id,
        side: PartySide.party_two,
        personId: 'demo-buyer-2',
        directoryId: 'demo-buyer-2',
        personType: PersonType.natural,
        name: 'رضا عباسی',
        shareValue: 30,
        isPrimary: false,
      },
      {
        id: 'demo-party-buyer-3',
        partiesId: parties.id,
        side: PartySide.party_two,
        personId: 'demo-buyer-3',
        directoryId: 'demo-buyer-3',
        personType: PersonType.natural,
        name: 'نگار یوسفی',
        shareValue: 20,
        isPrimary: false,
      },
    ],
  });

  const financial = await prisma.contractFinancial.create({
    data: {
      draftId: draft.id,
      pricingType: PricingType.fixed,
      fixedTotalAmount: 17_500_000_000,
      activeTab: 'installment-1',
      areaPricingMode: 'unit-only',
    },
  });

  await prisma.financialCategory.createMany({
    data: [
      {
        id: `${financial.id}:principal`,
        financialId: financial.id,
        name: 'مبلغ اصل قرارداد',
        capAmount: 17_500_000_000,
        dueAmount: 0,
        noDueAmount: 17_500_000_000,
        system: true,
        requiresDue: false,
      },
      {
        id: `${financial.id}:advance`,
        financialId: financial.id,
        name: 'پیش‌پرداخت',
        capAmount: 2_500_000_000,
        dueAmount: 2_500_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${financial.id}:installment-1`,
        financialId: financial.id,
        name: 'قسط اول',
        capAmount: 3_500_000_000,
        dueAmount: 3_500_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${financial.id}:installment-2`,
        financialId: financial.id,
        name: 'قسط دوم',
        capAmount: 3_500_000_000,
        dueAmount: 3_500_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${financial.id}:loan`,
        financialId: financial.id,
        name: 'وام بانکی',
        capAmount: 2_000_000_000,
        dueAmount: 2_000_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${financial.id}:handover`,
        financialId: financial.id,
        name: 'تحویل واحد',
        capAmount: 5_000_000_000,
        dueAmount: 5_000_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${financial.id}:document`,
        financialId: financial.id,
        name: 'تحویل اسناد',
        capAmount: 1_000_000_000,
        dueAmount: 1_000_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${financial.id}:parking`,
        financialId: financial.id,
        name: 'پارکینگ',
        capAmount: 500_000_000,
        dueAmount: 500_000_000,
        noDueAmount: 0,
        system: false,
        requiresDue: true,
      },
      {
        id: `${financial.id}:storage`,
        financialId: financial.id,
        name: 'انباری',
        capAmount: 500_000_000,
        dueAmount: 500_000_000,
        noDueAmount: 0,
        system: false,
        requiresDue: true,
      },
    ],
  });

  await prisma.financialDueItem.createMany({
    data: [
      {
        id: `${financial.id}:advance-1`,
        financialId: financial.id,
        categoryId: `${financial.id}:advance`,
        title: 'پیش‌پرداخت اولیه',
        amount: 2_500_000_000,
        dueDate: '1405/02/01',
      },
      {
        id: `${financial.id}:installment-1-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:installment-1`,
        title: 'قسط اول',
        amount: 3_500_000_000,
        dueDate: '1405/04/01',
      },
      {
        id: `${financial.id}:installment-2-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:installment-2`,
        title: 'قسط دوم',
        amount: 3_500_000_000,
        dueDate: '1405/06/01',
      },
      {
        id: `${financial.id}:loan-1-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:loan`,
        title: 'بخش وام بانکی',
        amount: 2_000_000_000,
        dueDate: '1405/05/10',
      },
      {
        id: `${financial.id}:handover-1-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:handover`,
        title: 'مانده تحویل واحد',
        amount: 5_000_000_000,
        dueDate: '1405/09/01',
      },
      {
        id: `${financial.id}:document-1-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:document`,
        title: 'تحویل اسناد و پایان‌کار',
        amount: 1_000_000_000,
        dueDate: '1405/10/15',
      },
      {
        id: `${financial.id}:parking-1-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:parking`,
        title: 'پارکینگ',
        amount: 500_000_000,
        dueDate: '1405/11/01',
      },
      {
        id: `${financial.id}:storage-1-due`,
        financialId: financial.id,
        categoryId: `${financial.id}:storage`,
        title: 'انباری',
        amount: 500_000_000,
        dueDate: '1406/01/15',
      },
    ],
  });

  const penalties = await prisma.contractPenalties.create({
    data: { draftId: draft.id },
  });

  await prisma.contractPenaltyType.createMany({
    data: [
      {
        id: `${penalties.id}:late-installment`,
        penaltiesId: penalties.id,
        title: 'تاخیر در پرداخت اقساط',
        active: true,
      },
      {
        id: `${penalties.id}:loan-delay`,
        penaltiesId: penalties.id,
        title: 'تاخیر بازپرداخت وام',
        active: true,
      },
      {
        id: `${penalties.id}:handover-delay`,
        penaltiesId: penalties.id,
        title: 'تاخیر در تحویل واحد',
        active: true,
      },
      {
        id: `${penalties.id}:document-delay`,
        penaltiesId: penalties.id,
        title: 'تاخیر در تحویل اسناد',
        active: false,
      },
    ],
  });

  await prisma.contractPenaltyRule.createMany({
    data: [
      {
        id: `${penalties.id}:rule-installment-fixed`,
        penaltiesId: penalties.id,
        penaltyTypeId: `${penalties.id}:late-installment`,
        mode: 'fixed',
        period: 'daily',
        fixedAmount: 25_000_000,
        penaltyPercent: 0,
        bankInterestPercent: 0,
        graceDays: 5,
        roundRule: '100',
        extraFeeEnabled: true,
        extraFeeType: 'percent',
        extraFeeAmount: 3,
        extraFeeRoundRule: '0',
        progressiveRows: null,
      },
      {
        id: `${penalties.id}:rule-loan-contract`,
        penaltiesId: penalties.id,
        penaltyTypeId: `${penalties.id}:loan-delay`,
        mode: 'contract',
        period: 'monthly',
        fixedAmount: 0,
        penaltyPercent: 0,
        bankInterestPercent: 18,
        graceDays: 0,
        roundRule: '1000',
        extraFeeEnabled: true,
        extraFeeType: 'fixed',
        extraFeeAmount: 12_000_000,
        extraFeeRoundRule: '100',
        progressiveRows: null,
      },
      {
        id: `${penalties.id}:rule-handover-progressive`,
        penaltiesId: penalties.id,
        penaltyTypeId: `${penalties.id}:handover-delay`,
        mode: 'progressive',
        period: 'daily',
        fixedAmount: 0,
        penaltyPercent: 0,
        bankInterestPercent: 0,
        graceDays: 10,
        roundRule: '100',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: 0,
        extraFeeRoundRule: '100',
        progressiveRows: [
          { id: 'row-1', fromDay: '1', toDay: '30', rate: '0.25' },
          { id: 'row-2', fromDay: '31', toDay: '60', rate: '0.5' },
          { id: 'row-3', fromDay: '61', toDay: '', rate: '1', openEnded: true },
        ],
      },
      {
        id: `${penalties.id}:rule-document-fixed`,
        penaltiesId: penalties.id,
        penaltyTypeId: `${penalties.id}:document-delay`,
        mode: 'fixed',
        period: 'monthly',
        fixedAmount: 15_000_000,
        penaltyPercent: 0,
        bankInterestPercent: 0,
        graceDays: 3,
        roundRule: '100',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: 0,
        extraFeeRoundRule: '100',
        progressiveRows: null,
      },
    ],
  });

  const forgivenessState = buildRuleState(
    'forgiveness',
    {
      forgiveAllowed: true,
      forgiveMaxDelayCount: '4',
      forgiveScope: 'itemized',
      forgiveEntryId: 'installment-delay',
      forgiveValueMode: 'percent',
      forgiveMinValue: '10000000',
      forgiveMaxValue: '500000000',
      forgiveOutsideBuyerControl: true,
      forgiveManagerApproval: false,
      forgiveDraftTemplateUsageEnabled: true,
      forgiveEnabledEntryIds: JSON.stringify(['installment-delay', 'unit-handover-delay', 'document-delay']),
      forgiveEntryValues: JSON.stringify({
        'installment-delay': { mode: 'amount', value: '150000000' },
        'unit-handover-delay': { mode: 'percent', value: '35' },
        'document-delay': { mode: 'amount', value: '90000000' },
      }),
    },
    'itemized',
  );

  const interestState = buildRuleState(
    'interest',
    {
      interestApr: '24',
      interestPenaltyEnabled: true,
      interestRoundRule: '0.00',
      interestReducingPrincipal: false,
      interestTogetherPayment: true,
      interestPrincipalAtEnd: false,
      interestDraftTemplateUsageEnabled: true,
      interestAprCompound: '28',
      interestCompoundPeriod: 'monthly',
      interestPenaltyEnabledCompound: true,
      interestRoundRuleCompound: 'کسر 1000',
      interestReducingPrincipalCompound: true,
      interestTogetherPaymentCompound: false,
      interestPrincipalAtEndCompound: false,
      interestAprRemaining: '30',
      interestPenaltyEnabledRemaining: true,
      interestRoundRuleRemaining: 'کسر 100',
      interestReducingPrincipalRemaining: true,
      interestTogetherPaymentRemaining: false,
      interestPrincipalAtEndRemaining: false,
    },
    'compound-interest',
  );

  const builderPenaltyState = normalizeBuilderPenaltyRuleState(
    buildRuleState(
      'builder-penalty',
      {
        unitDeliveryDelayEnabled: true,
        unitDeliveryDelayMode: 'percent',
        unitDeliveryDelayPeriod: 'روزانه',
        unitDeliveryDelayFixedAmount: '75000000',
        unitDeliveryDelayPercentAmount: '0.5',
        unitDeliveryDelayPenaltyCap: '900000000',
        unitDeliveryDelayGraceDays: '10',
        unitDeliveryDelayPenaltyCapUnlimited: false,
        unitDeliveryDelayPercentBasis: 'مبلغ تعیین‌شده توسط کارشناس',
        unitDeliveryDelayMarketValueAmount: '',
        unitDeliveryDelayMarketValueReference: '',
        unitDeliveryDelayExpertAmount: '8500000000',
        unitDeliveryDelayExpertReference: 'گزارش کارشناسی شماره ۱۴۰۵/۰۲',
        unitDeliveryDelayCustomBasisTitle: '',
        unitDeliveryDelayCustomBasisAmount: '',
        unitDeliveryDelayCustomBasisReference: '',
        unitDeliveryDelayProgressiveRow1From: '1',
        unitDeliveryDelayProgressiveRow1To: '15',
        unitDeliveryDelayProgressiveRow1Rate: '0.25',
        unitDeliveryDelayProgressiveRow2From: '16',
        unitDeliveryDelayProgressiveRow2To: '30',
        unitDeliveryDelayProgressiveRow2Rate: '0.5',
        unitDeliveryDelayProgressiveRow3From: '31',
        unitDeliveryDelayProgressiveRow3To: '60',
        unitDeliveryDelayProgressiveRow3Rate: '0.75',
        unitDeliveryDelayProgressiveRow4From: '61',
        unitDeliveryDelayProgressiveRow4To: '90',
        unitDeliveryDelayProgressiveRow4Rate: '1',
        materialSpecsChangeEnabled: true,
        materialSpecsChangeMode: 'progressive',
        materialSpecsChangePeriod: 'ماهانه',
        materialSpecsChangeFixedAmount: '50000000',
        materialSpecsChangePercentAmount: '1.5',
        materialSpecsChangePenaltyCap: '400000000',
        materialSpecsChangeProgressiveRow1From: '1',
        materialSpecsChangeProgressiveRow1To: '10',
        materialSpecsChangeProgressiveRow1Rate: '0.3',
        materialSpecsChangeProgressiveRow2From: '11',
        materialSpecsChangeProgressiveRow2To: '20',
        materialSpecsChangeProgressiveRow2Rate: '0.6',
        materialSpecsChangeProgressiveRow3From: '21',
        materialSpecsChangeProgressiveRow3To: '30',
        materialSpecsChangeProgressiveRow3Rate: '0.9',
        materialSpecsChangeProgressiveRow4From: '31',
        materialSpecsChangeProgressiveRow4To: '60',
        materialSpecsChangeProgressiveRow4Rate: '1.2',
      },
      'unit-delivery-delay',
    ),
  );

  const terminationBuyerRules = {
    buyerTerms: {
      lateDelivery: {
        ruleEnabled: true,
        calculationBasis: ['contract-delivery-date', 'last-addendum', 'mutual-adjusted-date'],
        gracePreset: '6',
        graceMonthsCustom: '',
      },
      specificationChanges: {
        ruleEnabled: true,
        includedTypes: ['unit-plan', 'material-quality', 'floor-change'],
        priorApprovalRequired: true,
      },
      breachOfObligations: {
        ruleEnabled: true,
        obligationTypes: ['construction-progress', 'quality-standards', 'legal-docs', 'service-connections'],
        rectificationPreset: '15',
        rectificationDaysCustom: '',
      },
      physicalProgressDelay: {
        ruleEnabled: true,
        milestoneTypes: ['progress-50', 'skeleton-complete', 'finishing-complete'],
        timelinePreset: '6',
        timelineMonthsCustom: '',
        timelineSpecificDate: '',
        gracePreset: '30',
        graceDaysCustom: '',
        milestoneSettings: {
          'progress-50': {
            timelinePreset: '6',
            timelineMonthsCustom: '',
            timelineSpecificDate: '',
            gracePreset: '30',
            graceDaysCustom: '',
          },
          'finishing-complete': {
            timelinePreset: '9',
            timelineMonthsCustom: '',
            timelineSpecificDate: '',
            gracePreset: '45',
            graceDaysCustom: '',
          },
        },
        triggerCondition: 'any-milestone',
        progressCertificationSource: 'official-expert-report',
      },
      areaDiscrepancy: {
        ruleEnabled: true,
        thresholdPreset: '2',
        thresholdPercentCustom: '2.5',
        discrepancyScopes: ['deficit-only', 'surplus-only'],
        referenceSources: ['official-title-deed', 'official-expert-report', 'parties-agreement'],
        financialSettlementInsteadOfTermination: true,
        settlementPricingBasis: 'market-price',
      },
      notification: {
        ruleEnabled: true,
        notifyBuyer: true,
        notifyContractManager: true,
        showManagementOptionInGrid: true,
      },
      draftTemplateUsage: {
        ruleEnabled: true,
        allowPerContractOverride: true,
      },
    },
    buyerCompletion: {
      lateDelivery: true,
      specificationChanges: true,
      breachOfObligations: true,
      physicalProgressDelay: true,
      areaDiscrepancy: true,
      notification: true,
      draftTemplateUsage: true,
    },
    terminationBuyerPanel: 'list',
  };

  await prisma.contractDraftRuleSettings.createMany({
    data: [
      {
        id: `${draft.id}:forgiveness`,
        draftId: draft.id,
        ruleId: 'forgiveness',
        payload: forgivenessState as unknown as Prisma.InputJsonValue,
      },
      {
        id: `${draft.id}:interest`,
        draftId: draft.id,
        ruleId: 'interest',
        payload: interestState as unknown as Prisma.InputJsonValue,
      },
      {
        id: `${draft.id}:builder-penalty`,
        draftId: draft.id,
        ruleId: 'builder-penalty',
        payload: builderPenaltyState as unknown as Prisma.InputJsonValue,
      },
      {
        id: `${draft.id}:termination`,
        draftId: draft.id,
        ruleId: 'termination',
        payload: terminationBuyerRules as unknown as Prisma.InputJsonValue,
      },
    ],
  });

  await prisma.terminationRules.create({
    data: {
      draftId: draft.id,
      buyerRules: terminationBuyerRules as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.contractExtraCosts.create({
    data: {
      draftId: draft.id,
      payload: [
        {
          id: 'commission',
          type: 'COMMISSION',
          calculationMethod: 'PERCENTAGE',
          totalValue: 3,
          buyerSharePercentage: 50,
          sellerSharePercentage: 50,
          sellerName: 'شرکت آفاق سازه پاسارگاد',
        },
        {
          id: 'notary',
          type: 'NOTARY',
          calculationMethod: 'AMOUNT',
          totalValue: 150_000_000,
          buyerSharePercentage: 100,
          sellerSharePercentage: 0,
          sellerName: '',
        },
        {
          id: 'legal-fee',
          type: 'LEGAL',
          calculationMethod: 'AMOUNT',
          totalValue: 75_000_000,
          buyerSharePercentage: 0,
          sellerSharePercentage: 100,
          sellerName: 'فروشنده',
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.contractTechnicalSpecs.create({
    data: {
      draftId: draft.id,
      specs: [
        {
          id: 'structure',
          title: 'سازه و پوسته',
          selectedSpecIds: ['concrete-c30', 'rebar-b500', 'foundation-waterproofing'],
        },
        {
          id: 'mechanical',
          title: 'تاسیسات مکانیکی',
          selectedSpecIds: ['central-heating', 'elevator-1', 'fire-pump'],
        },
        {
          id: 'finishing',
          title: 'نازک‌کاری و نما',
          selectedSpecIds: ['porcelain-floor', 'composite-facade', 'mdf-cabinet'],
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.contractAttachments.create({
    data: {
      draftId: draft.id,
      notes: 'نمونهٔ کامل قرارداد تاییدشده با چند سناریوی مالی و حقوقی.',
      documents: [
        {
          id: 'identity-docs',
          category: 'legal',
          title: 'کارت ملی و شناسنامه طرفین',
          date: '1405/01/21',
          description: 'اسناد هویتی طرفین و مدارک نمایندگی',
          provided: true,
        },
        {
          id: 'ownership-docs',
          category: 'legal',
          title: 'سند مالکیت و پروانه ساخت',
          date: '1405/01/22',
          description: 'مدارک ثبتی و مجوزهای ساخت',
          provided: true,
        },
        {
          id: 'technical-appendix',
          category: 'technical',
          title: 'پیوست مشخصات فنی',
          date: '1405/01/23',
          description: 'فهرست مصالح، استانداردها و کیفیت اجرا',
          provided: true,
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });

  const workflowSteps = [
    {
      id: 'legal-review',
      title: 'بازبینی حقوقی',
      approvers: [reviewerUser.id, adminUser.id],
      logic: { mode: 'MINIMUM_COUNT', count: 1 },
      type: 'PARALLEL',
      permissions: {
        rejectToDraftApproverIds: 'ALL_APPROVERS',
        requestRevisionApproverIds: 'ALL_APPROVERS',
      },
    },
    {
      id: 'final-approval',
      title: 'تایید نهایی',
      approvers: [adminUser.id],
      finalApproverId: adminUser.id,
      logic: { mode: 'ALL_MUST_APPROVE' },
      type: 'SEQUENTIAL',
      permissions: {
        rejectToDraftApproverIds: [adminUser.id],
        requestRevisionApproverIds: [adminUser.id],
      },
      isFinal: true,
    },
  ];

  await prisma.approvalWorkflow.create({
    data: {
      id: workflowId,
      tenantId: tenant.id,
      title: 'فرایند تایید قرارداد مسکونی نمونه',
      usageTypes: ['residential'],
      steps: workflowSteps as unknown as Prisma.InputJsonValue,
      buyerShouldApprove: true,
      active: true,
      finalApproverUserId: adminUser.id,
    },
  });

  await prisma.contractApprovalInstance.create({
    data: {
      id: approvalInstanceId,
      tenantId: tenant.id,
      draftId: draft.id,
      workflowId,
      status: ContractApprovalInstanceStatus.APPROVED,
      currentStepIndex: 1,
      finalApproverUserId: adminUser.id,
      stepsSnapshot: workflowSteps as unknown as Prisma.InputJsonValue,
      decisions: {
        create: [
          {
            id: `${approvalInstanceId}:step-legal-review`,
            stepId: 'legal-review',
            approverUserId: reviewerUser.id,
            decision: ContractApprovalDecisionType.APPROVE,
            reason: 'تمام بندهای حقوقی و مالی بررسی شد.',
          },
          {
            id: `${approvalInstanceId}:step-final-approval`,
            stepId: 'final-approval',
            approverUserId: adminUser.id,
            decision: ContractApprovalDecisionType.APPROVE,
            reason: 'تایید نهایی برای نمونهٔ کامل قرارداد انجام شد.',
          },
        ],
      },
    },
  });

  await prisma.contractApprovalDecision.deleteMany({ where: { instanceId: secondApprovalInstanceId } });
  await prisma.contractApprovalInstance.deleteMany({ where: { id: secondApprovalInstanceId } });
  await prisma.approvalWorkflow.deleteMany({ where: { id: secondWorkflowId } });
  await prisma.contractDraftRuleSettings.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractSubject.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractParties.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractFinancial.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractPenalties.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.terminationRules.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractExtraCosts.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractTechnicalSpecs.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractAttachments.deleteMany({ where: { draftId: secondDraftId } });
  await prisma.contractDraft.deleteMany({ where: { id: secondDraftId } });

  const secondDraft = await prisma.contractDraft.create({
    data: {
      id: secondDraftId,
      tenantId: tenant.id,
      approvalReturnedPending: false,
      approvalLastRejectionReason: null,
      approvalLastRejectedAt: null,
      releasedFromApprovedForEdit: false,
    },
  });

  await prisma.contractSubject.create({
    data: {
      draftId: secondDraft.id,
      contractorType: ContractorType.self,
      contractType: ContractType.sale,
      contractDate: secondContractDate,
      contractNumber: secondContractNumber,
      deliveryDate: secondDeliveryDate,
      blockId: 'demo-block-mehr',
      unitId: 'demo-unit-302',
    },
  });

  const secondParties = await prisma.contractParties.create({
    data: {
      draftId: secondDraft.id,
      partyOneMode: ShareMode.dang,
      partyTwoMode: ShareMode.dang,
    },
  });

  await prisma.contractPartyMember.createMany({
    data: [
      {
        id: 'demo2-party-seller-1',
        partiesId: secondParties.id,
        side: PartySide.party_one,
        personId: 'demo-seller-company-2',
        directoryId: 'demo-seller-company-2',
        personType: PersonType.legal,
        name: 'شرکت توسعه افق',
        shareValue: 6,
        isPrimary: true,
      },
      {
        id: 'demo2-party-buyer-1',
        partiesId: secondParties.id,
        side: PartySide.party_two,
        personId: 'demo-buyer-1',
        directoryId: 'demo-buyer-1',
        personType: PersonType.natural,
        name: 'سارا محمدی',
        shareValue: 70,
        isPrimary: true,
      },
      {
        id: 'demo2-party-buyer-2',
        partiesId: secondParties.id,
        side: PartySide.party_two,
        personId: 'demo-buyer-2',
        directoryId: 'demo-buyer-2',
        personType: PersonType.natural,
        name: 'رضا عباسی',
        shareValue: 30,
        isPrimary: false,
      },
    ],
  });

  const secondFinancial = await prisma.contractFinancial.create({
    data: {
      draftId: secondDraft.id,
      pricingType: PricingType.metered,
      totalArea: 112,
      unitArea: 92,
      parkingArea: 12,
      storageArea: 8,
      pricePerMeter: 95_000_000,
      parkingPricePerMeter: 45_000_000,
      storagePricePerMeter: 25_000_000,
      activeTab: 'principal',
      areaPricingMode: 'unit-plus-storage-parking',
    },
  });

  await prisma.financialCategory.createMany({
    data: [
      {
        id: `${secondFinancial.id}:principal`,
        financialId: secondFinancial.id,
        name: 'مبلغ اصل قرارداد',
        capAmount: 13_200_000_000,
        dueAmount: 0,
        noDueAmount: 13_200_000_000,
        system: true,
        requiresDue: false,
      },
      {
        id: `${secondFinancial.id}:advance`,
        financialId: secondFinancial.id,
        name: 'پیش‌پرداخت',
        capAmount: 1_800_000_000,
        dueAmount: 1_800_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${secondFinancial.id}:installment-1`,
        financialId: secondFinancial.id,
        name: 'قسط اول',
        capAmount: 3_400_000_000,
        dueAmount: 3_400_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${secondFinancial.id}:installment-2`,
        financialId: secondFinancial.id,
        name: 'قسط دوم',
        capAmount: 3_400_000_000,
        dueAmount: 3_400_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${secondFinancial.id}:handover`,
        financialId: secondFinancial.id,
        name: 'تحویل واحد',
        capAmount: 2_300_000_000,
        dueAmount: 2_300_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${secondFinancial.id}:document`,
        financialId: secondFinancial.id,
        name: 'تحویل اسناد',
        capAmount: 900_000_000,
        dueAmount: 900_000_000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: `${secondFinancial.id}:parking`,
        financialId: secondFinancial.id,
        name: 'پارکینگ',
        capAmount: 540_000_000,
        dueAmount: 540_000_000,
        noDueAmount: 0,
        system: false,
        requiresDue: true,
      },
      {
        id: `${secondFinancial.id}:storage`,
        financialId: secondFinancial.id,
        name: 'انباری',
        capAmount: 200_000_000,
        dueAmount: 200_000_000,
        noDueAmount: 0,
        system: false,
        requiresDue: true,
      },
    ],
  });

  await prisma.financialDueItem.createMany({
    data: [
      {
        id: `${secondFinancial.id}:advance-1`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:advance`,
        title: 'پیش‌پرداخت اولیه',
        amount: 1_800_000_000,
        dueDate: '1405/04/01',
      },
      {
        id: `${secondFinancial.id}:installment-1-due`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:installment-1`,
        title: 'قسط اول',
        amount: 3_400_000_000,
        dueDate: '1405/06/15',
      },
      {
        id: `${secondFinancial.id}:installment-2-due`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:installment-2`,
        title: 'قسط دوم',
        amount: 3_400_000_000,
        dueDate: '1405/08/15',
      },
      {
        id: `${secondFinancial.id}:handover-1-due`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:handover`,
        title: 'باقیمانده تحویل',
        amount: 2_300_000_000,
        dueDate: '1405/11/20',
      },
      {
        id: `${secondFinancial.id}:document-1-due`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:document`,
        title: 'اسناد قطعی',
        amount: 900_000_000,
        dueDate: '1405/12/05',
      },
      {
        id: `${secondFinancial.id}:parking-1-due`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:parking`,
        title: 'پارکینگ',
        amount: 540_000_000,
        dueDate: '1406/01/10',
      },
      {
        id: `${secondFinancial.id}:storage-1-due`,
        financialId: secondFinancial.id,
        categoryId: `${secondFinancial.id}:storage`,
        title: 'انباری',
        amount: 200_000_000,
        dueDate: '1406/01/25',
      },
    ],
  });

  const secondPenalties = await prisma.contractPenalties.create({
    data: { draftId: secondDraft.id },
  });

  await prisma.contractPenaltyType.createMany({
    data: [
      {
        id: `${secondPenalties.id}:installment-delay`,
        penaltiesId: secondPenalties.id,
        title: 'تاخیر در پرداخت اقساط',
        active: true,
      },
      {
        id: `${secondPenalties.id}:handover-delay`,
        penaltiesId: secondPenalties.id,
        title: 'تاخیر در تحویل واحد',
        active: true,
      },
      {
        id: `${secondPenalties.id}:document-delay`,
        penaltiesId: secondPenalties.id,
        title: 'تاخیر در تحویل اسناد',
        active: false,
      },
    ],
  });

  await prisma.contractPenaltyRule.createMany({
    data: [
      {
        id: `${secondPenalties.id}:rule-installment-fixed`,
        penaltiesId: secondPenalties.id,
        penaltyTypeId: `${secondPenalties.id}:installment-delay`,
        mode: 'fixed',
        period: 'daily',
        fixedAmount: 18_000_000,
        penaltyPercent: 0,
        bankInterestPercent: 0,
        graceDays: 7,
        roundRule: '0',
        extraFeeEnabled: true,
        extraFeeType: 'fixed',
        extraFeeAmount: 8_000_000,
        extraFeeRoundRule: '100',
        progressiveRows: null,
      },
      {
        id: `${secondPenalties.id}:rule-handover-progressive`,
        penaltiesId: secondPenalties.id,
        penaltyTypeId: `${secondPenalties.id}:handover-delay`,
        mode: 'progressive',
        period: 'daily',
        fixedAmount: 0,
        penaltyPercent: 0,
        bankInterestPercent: 0,
        graceDays: 14,
        roundRule: '100',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: 0,
        extraFeeRoundRule: '100',
        progressiveRows: [
          { id: 'row-1', fromDay: '1', toDay: '20', rate: '0.2' },
          { id: 'row-2', fromDay: '21', toDay: '45', rate: '0.45' },
          { id: 'row-3', fromDay: '46', toDay: '', rate: '0.9', openEnded: true },
        ],
      },
      {
        id: `${secondPenalties.id}:rule-document-contract`,
        penaltiesId: secondPenalties.id,
        penaltyTypeId: `${secondPenalties.id}:document-delay`,
        mode: 'contract',
        period: 'monthly',
        fixedAmount: 0,
        penaltyPercent: 0,
        bankInterestPercent: 16,
        graceDays: 2,
        roundRule: '1000',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: 0,
        extraFeeRoundRule: '100',
        progressiveRows: null,
      },
    ],
  });

  const secondForgivenessState = buildRuleState(
    'forgiveness',
    {
      forgiveAllowed: true,
      forgiveMaxDelayCount: '2',
      forgiveScope: 'whole',
      forgiveEntryId: 'whole-contract',
      forgiveValueMode: 'amount',
      forgiveMinValue: '5000000',
      forgiveMaxValue: '120000000',
      forgiveOutsideBuyerControl: false,
      forgiveManagerApproval: true,
      forgiveDraftTemplateUsageEnabled: true,
      forgiveEnabledEntryIds: JSON.stringify(['whole-contract']),
      forgiveEntryValues: JSON.stringify({
        'whole-contract': { mode: 'amount', value: '120000000' },
      }),
    },
    'whole-contract',
  );

  const secondInterestState = buildRuleState(
    'interest',
    {
      interestApr: '20',
      interestPenaltyEnabled: true,
      interestRoundRule: '0.0',
      interestReducingPrincipal: true,
      interestTogetherPayment: false,
      interestPrincipalAtEnd: false,
      interestDraftTemplateUsageEnabled: true,
      interestAprCompound: '24',
      interestCompoundPeriod: 'yearly',
      interestPenaltyEnabledCompound: false,
      interestRoundRuleCompound: '0.00',
      interestReducingPrincipalCompound: false,
      interestTogetherPaymentCompound: true,
      interestPrincipalAtEndCompound: false,
      interestAprRemaining: '22',
      interestPenaltyEnabledRemaining: true,
      interestRoundRuleRemaining: '0.00',
      interestReducingPrincipalRemaining: true,
      interestTogetherPaymentRemaining: true,
      interestPrincipalAtEndRemaining: false,
    },
    'simple-interest',
  );

  const secondBuilderPenaltyState = normalizeBuilderPenaltyRuleState(
    buildRuleState(
      'builder-penalty',
      {
        unitDeliveryDelayEnabled: true,
        unitDeliveryDelayMode: 'fixed',
        unitDeliveryDelayPeriod: 'ماهانه',
        unitDeliveryDelayFixedAmount: '60000000',
        unitDeliveryDelayPercentAmount: '0.35',
        unitDeliveryDelayPenaltyCap: '300000000',
        unitDeliveryDelayGraceDays: '14',
        unitDeliveryDelayPenaltyCapUnlimited: false,
        unitDeliveryDelayPercentBasis: 'مبلغ کل قرارداد',
        unitDeliveryDelayMarketValueAmount: '',
        unitDeliveryDelayMarketValueReference: '',
        unitDeliveryDelayExpertAmount: '',
        unitDeliveryDelayExpertReference: '',
        unitDeliveryDelayCustomBasisTitle: '',
        unitDeliveryDelayCustomBasisAmount: '',
        unitDeliveryDelayCustomBasisReference: '',
        unitDeliveryDelayProgressiveRow1From: '1',
        unitDeliveryDelayProgressiveRow1To: '30',
        unitDeliveryDelayProgressiveRow1Rate: '0.2',
        unitDeliveryDelayProgressiveRow2From: '31',
        unitDeliveryDelayProgressiveRow2To: '60',
        unitDeliveryDelayProgressiveRow2Rate: '0.4',
        unitDeliveryDelayProgressiveRow3From: '61',
        unitDeliveryDelayProgressiveRow3To: '90',
        unitDeliveryDelayProgressiveRow3Rate: '0.7',
        unitDeliveryDelayProgressiveRow4From: '91',
        unitDeliveryDelayProgressiveRow4To: '120',
        unitDeliveryDelayProgressiveRow4Rate: '1',
        materialSpecsChangeEnabled: false,
        materialSpecsChangeMode: 'fixed',
        materialSpecsChangePeriod: 'سالانه',
        materialSpecsChangeFixedAmount: '25000000',
        materialSpecsChangePercentAmount: '1',
        materialSpecsChangePenaltyCap: '150000000',
        materialSpecsChangeProgressiveRow1From: '1',
        materialSpecsChangeProgressiveRow1To: '10',
        materialSpecsChangeProgressiveRow1Rate: '0.25',
        materialSpecsChangeProgressiveRow2From: '11',
        materialSpecsChangeProgressiveRow2To: '20',
        materialSpecsChangeProgressiveRow2Rate: '0.5',
        materialSpecsChangeProgressiveRow3From: '21',
        materialSpecsChangeProgressiveRow3To: '30',
        materialSpecsChangeProgressiveRow3Rate: '0.75',
        materialSpecsChangeProgressiveRow4From: '31',
        materialSpecsChangeProgressiveRow4To: '60',
        materialSpecsChangeProgressiveRow4Rate: '1',
      },
      'unit-delivery-delay',
    ),
  );

  const secondTerminationBuyerRules = {
    buyerTerms: {
      lateDelivery: {
        ruleEnabled: true,
        calculationBasis: ['contract-delivery-date'],
        gracePreset: '3',
        graceMonthsCustom: '',
      },
      specificationChanges: {
        ruleEnabled: true,
        includedTypes: ['unit-plan', 'block-change'],
        priorApprovalRequired: false,
      },
      breachOfObligations: {
        ruleEnabled: true,
        obligationTypes: ['construction-progress', 'service-connections'],
        rectificationPreset: '10',
        rectificationDaysCustom: '',
      },
      physicalProgressDelay: {
        ruleEnabled: true,
        milestoneTypes: ['progress-70', 'finishing-complete'],
        timelinePreset: '9',
        timelineMonthsCustom: '',
        timelineSpecificDate: '',
        gracePreset: '45',
        graceDaysCustom: '',
        milestoneSettings: {
          'progress-70': {
            timelinePreset: '9',
            timelineMonthsCustom: '',
            timelineSpecificDate: '',
            gracePreset: '45',
            graceDaysCustom: '',
          },
        },
        triggerCondition: 'all-milestones',
        progressCertificationSource: 'contract-manager-approval',
      },
      areaDiscrepancy: {
        ruleEnabled: true,
        thresholdPreset: '3',
        thresholdPercentCustom: '3',
        discrepancyScopes: ['deficit-only'],
        referenceSources: ['official-title-deed', 'parties-agreement'],
        financialSettlementInsteadOfTermination: false,
        settlementPricingBasis: 'contract-price',
      },
      notification: {
        ruleEnabled: true,
        notifyBuyer: true,
        notifyContractManager: false,
        showManagementOptionInGrid: true,
      },
      draftTemplateUsage: {
        ruleEnabled: true,
        allowPerContractOverride: false,
      },
    },
    buyerCompletion: {
      lateDelivery: true,
      specificationChanges: true,
      breachOfObligations: true,
      physicalProgressDelay: true,
      areaDiscrepancy: true,
      notification: true,
      draftTemplateUsage: true,
    },
    terminationBuyerPanel: 'lateDelivery',
  };

  await prisma.contractDraftRuleSettings.createMany({
    data: [
      {
        id: `${secondDraft.id}:forgiveness`,
        draftId: secondDraft.id,
        ruleId: 'forgiveness',
        payload: secondForgivenessState as unknown as Prisma.InputJsonValue,
      },
      {
        id: `${secondDraft.id}:interest`,
        draftId: secondDraft.id,
        ruleId: 'interest',
        payload: secondInterestState as unknown as Prisma.InputJsonValue,
      },
      {
        id: `${secondDraft.id}:builder-penalty`,
        draftId: secondDraft.id,
        ruleId: 'builder-penalty',
        payload: secondBuilderPenaltyState as unknown as Prisma.InputJsonValue,
      },
      {
        id: `${secondDraft.id}:termination`,
        draftId: secondDraft.id,
        ruleId: 'termination',
        payload: secondTerminationBuyerRules as unknown as Prisma.InputJsonValue,
      },
    ],
  });

  await prisma.terminationRules.create({
    data: {
      draftId: secondDraft.id,
      buyerRules: secondTerminationBuyerRules as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.contractExtraCosts.create({
    data: {
      draftId: secondDraft.id,
      payload: [
        {
          id: 'commission',
          type: 'COMMISSION',
          calculationMethod: 'PERCENTAGE',
          totalValue: 2.5,
          buyerSharePercentage: 60,
          sellerSharePercentage: 40,
          sellerName: 'شرکت توسعه افق',
        },
        {
          id: 'notary',
          type: 'NOTARY',
          calculationMethod: 'AMOUNT',
          totalValue: 120_000_000,
          buyerSharePercentage: 50,
          sellerSharePercentage: 50,
          sellerName: 'دفترخانه',
        },
        {
          id: 'legal-fee',
          type: 'LEGAL',
          calculationMethod: 'AMOUNT',
          totalValue: 90_000_000,
          buyerSharePercentage: 100,
          sellerSharePercentage: 0,
          sellerName: '',
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.contractTechnicalSpecs.create({
    data: {
      draftId: secondDraft.id,
      specs: [
        {
          id: 'structure',
          title: 'سازه و دیوارچینی',
          selectedSpecIds: ['concrete-c35', 'rebar-b500c', 'wall-aac'],
        },
        {
          id: 'facade',
          title: 'نما و مشاعات',
          selectedSpecIds: ['stone-facade', 'common-area-floor', 'parking-ventilation'],
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.contractAttachments.create({
    data: {
      draftId: secondDraft.id,
      notes: 'قرارداد دوم برای سناریوی متفاوت: فروش، قیمت‌گذاری مترمربعی و تایید تک‌مرحله‌ای.',
      documents: [
        {
          id: 'payment-plan',
          category: 'financial',
          title: 'برنامه پرداخت',
          date: '1405/03/06',
          description: 'زمان‌بندی اقساط و پیش‌پرداخت',
          provided: true,
        },
        {
          id: 'spec-sheet',
          category: 'technical',
          title: 'برگه مشخصات فنی',
          date: '1405/03/07',
          description: 'مشخصات مصالح و کیفیت اجرا',
          provided: true,
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });

  const secondWorkflowSteps = [
    {
      id: 'final-approval',
      title: 'تایید نهایی',
      approvers: [adminUser.id],
      finalApproverId: adminUser.id,
      logic: { mode: 'ALL_MUST_APPROVE' },
      type: 'SEQUENTIAL',
      permissions: {
        rejectToDraftApproverIds: [adminUser.id],
        requestRevisionApproverIds: [adminUser.id],
      },
      isFinal: true,
    },
  ];

  await prisma.approvalWorkflow.create({
    data: {
      id: secondWorkflowId,
      tenantId: tenant.id,
      title: 'فرایند تایید قرارداد فروش دوم',
      usageTypes: ['residential'],
      steps: secondWorkflowSteps as unknown as Prisma.InputJsonValue,
      buyerShouldApprove: true,
      active: true,
      finalApproverUserId: adminUser.id,
    },
  });

  await prisma.contractApprovalInstance.create({
    data: {
      id: secondApprovalInstanceId,
      tenantId: tenant.id,
      draftId: secondDraft.id,
      workflowId: secondWorkflowId,
      status: ContractApprovalInstanceStatus.APPROVED,
      currentStepIndex: 0,
      finalApproverUserId: adminUser.id,
      stepsSnapshot: secondWorkflowSteps as unknown as Prisma.InputJsonValue,
      decisions: {
        create: [
          {
            id: `${secondApprovalInstanceId}:step-final-approval`,
            stepId: 'final-approval',
            approverUserId: adminUser.id,
            decision: ContractApprovalDecisionType.APPROVE,
            reason: 'قرارداد دوم هم برای سناریوی تکمیل‌شده تایید شد.',
          },
        ],
      },
    },
  });

  console.log(
    [
      'Demo approved contracts seeded successfully.',
      `draftId=${draft.id}`,
      `contractNumber=${contractNumber}`,
      `secondDraftId=${secondDraft.id}`,
      `secondContractNumber=${secondContractNumber}`,
      `workflowId=${workflowId}`,
      `secondWorkflowId=${secondWorkflowId}`,
      `approvalStatus=${ContractApprovalInstanceStatus.APPROVED}`,
    ].join(' '),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
