export type ContractStatus = 'draft' | 'appendix_draft' | 'pending_approval' | 'completed';
export type ContractType = 'sale' | 'pre-sale';
export type ContractorType = 'self' | 'employee' | 'former-employee';
export type AppendixIssuerType = 'self' | 'employee' | 'former-employee';
export type AppendixStatus = 'draft' | 'pending_approval' | 'completed';
export type ContractEntityKind = 'contract' | 'appendix';
export type AppendixSourceKind = 'contract' | 'appendix';
export type AppendixTagGroupKey = 'financial' | 'conditions' | 'parties' | 'dates' | 'quality';
export type AppendixTagKey =
  | 'loan'
  | 'adjustment'
  | 'side-costs'
  | 'contract-base-costs'
  | 'material-specs-change'
  | 'installments'
  | 'prepayment'
  | 'unit-delivery'
  | 'forgiveness'
  | 'contract-costs'
  | 'penalty-waiver'
  | 'workshop-conditions'
  | 'arbitration'
  | 'first-party'
  | 'second-party'
  | 'due-dates'
  | 'commitment-date'
  | 'unit-delivery-date';
export type ShareMode = 'percent' | 'dang';
export type PersonType = 'natural' | 'legal';
export type PricingType = 'fixed' | 'metered';
export type AreaPricingMode = 'unit-only' | 'unit-plus-parking' | 'unit-plus-storage' | 'unit-plus-storage-parking';
export type PenaltyMode = 'fixed' | 'overdue' | 'contract' | 'progressive';
export type PenaltyPeriod = 'daily' | 'monthly' | 'yearly';
export type PenaltyExtraFeeType = 'percent' | 'fixed';
export type PenaltyRoundRule = '00' | '0' | '100' | '1000';
export type DiscountScope = 'whole' | 'itemized';
export type DiscountValueMode = 'amount' | 'percent';

export interface Share {
  value: number;
  mode: ShareMode;
}

export interface Contractor {
  type: ContractorType;
  employeeId?: string;
  formerFirstName?: string;
  formerLastName?: string;
}

export interface ContractParty {
  personId: string;
  directoryId?: string | null;
  personType: PersonType;
  name: string;
  share: Share;
  isPrimary?: boolean;
}

export interface ContractSubjectData {
  contractor: Contractor;
  contractType: ContractType;
  contractDate: string;
  contractNumber: string;
  deliveryDate: string;
  blockId: string;
  unitId: string;
  blockName?: string | null;
  unitName?: string | null;
  floorName?: string | null;
  unitUsage?: string | null;
}

export interface ContractPartiesData {
  partyOneMode: ShareMode;
  partyTwoMode: ShareMode;
  partyOne: ContractParty[];
  partyTwo: ContractParty[];
}

export interface FinancialCategoryData {
  id: string;
  name: string;
  capAmount: number;
  dueAmount: number;
  noDueAmount: number;
  system: boolean;
  requiresDue: boolean;
}

export interface FinancialDueItemData {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  dueDate: string;
}

export interface AppendixDeliveryDatePayload {
  previousDate: string;
  nextDate: string;
  reason: string;
}

export interface AppendixPartiesPayload {
  shareMode: ShareMode;
  parties: ContractParty[];
}

export interface AppendixAdjustmentPayload {
  activeTab: string;
  categories: FinancialCategoryData[];
  dueItems: FinancialDueItemData[];
}

export interface AppendixContractBaseCostsPayload {
  activeTab: string;
  categories: FinancialCategoryData[];
  dueItems: FinancialDueItemData[];
}

export interface AppendixSideCostsPayload {
  activeTab: string;
  categories: FinancialCategoryData[];
  dueItems: FinancialDueItemData[];
}

export interface AppendixMaterialSpecsChangePayload {
  changeTypes: string[];
  importanceLevel: string;
  comparisonReferences: string[];
  equivalentReplacementAllowed: boolean;
  equivalentReplacementApplied: boolean;
  buyerApprovalRequired: boolean;
  buyerApproved: boolean;
  selectedOutcomes: string[];
  requiredDocuments: string[];
  enforcementEnabled: boolean;
  enforcementReason: string;
  caseSummary: string;
  internalNotes: string;
}

export type AppendixLoanPaymentStatus = 'unselected' | 'full' | 'less' | 'more' | 'none';
export type AppendixLoanFlowStep = 'status' | 'details';
export type AppendixLoanTiming = 'undated' | 'contract-date' | 'before-contract' | 'dated';
export type AppendixLoanRepaymentTiming =
  | 'before-contract-started'
  | 'with-appendix-contract'
  | 'undated'
  | 'with-contract-bank-installments';
export type AppendixLoanRepaymentSettledBy = 'buyer' | 'seller';
export type AppendixLoanGracePeriodUnit = 'month' | 'day';
export type AppendixLoanBankFeeMode = 'fixed' | 'percent' | 'combined';
export type AppendixLoanPenaltyMode = 'progressive' | 'contract-percent' | 'debt-percent' | 'fixed';
export type AppendixLoanPenaltyPeriod = 'daily' | 'monthly';
export type AppendixLoanPenaltyExtraFeeMode = 'percent' | 'fixed';
export type AppendixLoanDiscountMode = 'amount' | 'percent';

export interface AppendixLoanPenaltyProgressiveRow {
  fromDay: string;
  toDay: string;
  rate: string;
}

export interface AppendixLoanPayload {
  flowStep: AppendixLoanFlowStep;
  paymentStatus: AppendixLoanPaymentStatus;
  contractLoanAmount: string;
  allocations: {
    adjustment: string;
    landscaping: string;
    utilities: string;
  };
  loanAmount: string;
  loanTiming: AppendixLoanTiming;
  loanReceivedDate: string;
  repaymentTiming: AppendixLoanRepaymentTiming;
  repaymentSettledBy: AppendixLoanRepaymentSettledBy;
  repaymentFirstInstallmentDate: string;
  loanGracePeriodUnit: AppendixLoanGracePeriodUnit;
  loanGracePeriodValue: string;
  loanBankInterestEnabled: boolean;
  loanBankInterestRate: string;
  loanBankFeePayer: 'buyer' | 'seller';
  loanBankFeeBankPolicyEnabled: boolean;
  loanBankFeeMode: AppendixLoanBankFeeMode;
  loanBankFeeValue: string;
  loanParticipationPayer: 'buyer' | 'seller';
  loanParticipationBankPolicyEnabled: boolean;
  loanParticipationRate: string;
  loanExpertPayer: 'buyer' | 'seller';
  loanExpertBankPolicyEnabled: boolean;
  loanExpertRate: string;
  loanPriorityBondPayer: 'buyer' | 'seller';
  loanPriorityBondBankPolicyEnabled: boolean;
  loanPriorityBondRate: string;
  loanPenaltyEnabled: boolean;
  loanPenaltyMode: AppendixLoanPenaltyMode;
  loanPenaltyPeriod: AppendixLoanPenaltyPeriod;
  loanPenaltyFixedAmount: string;
  loanPenaltyPercent: string;
  loanPenaltyBankPercent: string;
  loanPenaltyGraceDays: string;
  loanPenaltyRoundingMode: string;
  loanPenaltyExtraFeeEnabled: boolean;
  loanPenaltyExtraFeeMode: AppendixLoanPenaltyExtraFeeMode;
  loanPenaltyExtraFeeValue: string;
  loanPenaltyProgressiveRows: AppendixLoanPenaltyProgressiveRow[];
  loanDiscountEnabled: boolean;
  loanDiscountMode: AppendixLoanDiscountMode;
  loanDiscountMinValue: string;
  loanDiscountMaxValue: string;
  loanDiscountConditionEnabled: boolean;
  loanDiscountConditionMaxDelayCount: string;
  loanDiscountConditionGraceDays: string;
  loanDiscountConditionDueKeys: string[];
  loanDiscountConditionInstallmentAllowed: boolean;
  loanDiscountConditionPenaltyEnabled: boolean;
  loanDiscountSettlementTargets: string[];
  loanDiscountManagerApprovalEnabled: boolean;
  loanDiscountApprovalThreshold: string;
  loanForgivenessEnabled: boolean;
  loanForgivenessMode: AppendixLoanDiscountMode;
  loanForgivenessMinValue: string;
  loanForgivenessMaxValue: string;
  loanForgivenessOutsideBuyerControlEnabled: boolean;
  loanForgivenessManagerApprovalEnabled: boolean;
  loanForgivenessApprovalThreshold: string;
  loanRemainingDebtPrepaymentDueItems: FinancialDueItemData[];
  loanRemainingDebtInstallmentDueItems: FinancialDueItemData[];
  loanRemainingDebtLateInstallmentDueItems: FinancialDueItemData[];
  loanRemainingDebtPrepaymentAmount: string;
  loanRemainingDebtPrepaymentCount: string;
  loanRemainingDebtPrepaymentTotal: string;
  loanRemainingDebtInstallmentAmount: string;
  loanRemainingDebtInstallmentCount: string;
  loanRemainingDebtInstallmentTotal: string;
  loanRemainingDebtLateInstallmentCount: string;
  loanRemainingDebtLateInstallmentTotal: string;
  loanRemainingDebtUnitDeliveryAmount: string;
  loanRemainingDebtDocumentDeliveryAmount: string;
  selectedBank: string;
}

export interface ContractFinancialData {
  pricingType: PricingType;
  areaPricingMode?: AreaPricingMode;
  unitArea?: string;
  parkingArea?: string;
  storageArea?: string;
  totalArea: string;
  pricePerMeter: string;
  parkingPricePerMeter?: string;
  storagePricePerMeter?: string;
  fixedTotalAmount: string;
  parkingFixedAmount?: string;
  storageFixedAmount?: string;
  activeTab: string;
  categories: FinancialCategoryData[];
  dueItems: FinancialDueItemData[];
}

export interface PenaltyProgressiveRowData {
  id: string;
  fromDay: string;
  toDay: string;
  rate: string;
  openEnded?: boolean;
}

export interface PenaltyTypeStateData {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

export interface PenaltyRuleData {
  id: string;
  penaltyTypeId: string;
  mode: PenaltyMode;
  period: PenaltyPeriod;
  fixedAmount: string;
  penaltyPercent: string;
  bankInterestPercent: string;
  graceDays: string;
  roundRule: PenaltyRoundRule;
  extraFeeEnabled: boolean;
  extraFeeType: PenaltyExtraFeeType;
  extraFeeAmount: string;
  extraFeeRoundRule: PenaltyRoundRule;
  progressiveRows: PenaltyProgressiveRowData[];
}

export interface ContractPenaltiesData {
  activeTab: string;
  types: PenaltyTypeStateData[];
  rules: PenaltyRuleData[];
}

export interface DiscountTypeStateData {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

export interface DiscountRuleData {
  id: string;
  discountTypeId: string;
  scope: DiscountScope;
  entryId: string;
  valueMode: DiscountValueMode;
  minValue: string;
  maxValue: string;
  conditionNote: string;
  conditionConfigured?: boolean;
  conditionMaxDelayCount?: string;
  conditionGraceDays?: string;
  conditionDueBasis?: string[];
  conditionKeepOnDelay?: boolean;
  conditionPenaltyOnDiscount?: boolean;
  conditionSettlementTiming?: string;
  managerApproval: boolean;
  approvalThreshold: string;
}

export interface ContractDiscountsData {
  activeTab: string;
  types: DiscountTypeStateData[];
  rules: DiscountRuleData[];
}

/** Sub-views after opening «تنظیمات فسخ سازنده» */
export type ConstructorTerminationSubsectionId =
  | 'lateInstallment'
  | 'financialObligations'
  | 'documentDeficiencies'
  | 'otherBreach'
  | 'notifications';

/** تب اصلی: فسخ سازنده/فروشنده در برابر فسخ خریدار */
export type TerminationPartyTab = 'seller' | 'buyer';

/** محتوای تب فسخ سازنده: فهرست زیربخش‌ها یا یک زیربخش باز شده */
export type TerminationConstructorPanel = 'list' | ConstructorTerminationSubsectionId;

/** زیربخش‌های فسخ خریدار */
export type BuyerTerminationSubsectionId =
  | 'lateDelivery'
  | 'specificationChanges'
  | 'breachOfObligations'
  | 'physicalProgressDelay'
  | 'areaDiscrepancy'
  | 'notification'
  | 'draftTemplateUsage';

export type TerminationBuyerPanel = 'list' | BuyerTerminationSubsectionId;

export interface BuyerTerminationCompletion {
  lateDelivery: boolean;
  specificationChanges: boolean;
  breachOfObligations: boolean;
  physicalProgressDelay: boolean;
  areaDiscrepancy: boolean;
  notification: boolean;
  draftTemplateUsage: boolean;
}

export type PhysicalProgressMilestoneType =
  | 'progress-20'
  | 'progress-30'
  | 'progress-50'
  | 'progress-70'
  | 'progress-90'
  | 'skeleton-complete'
  | 'shell-complete'
  | 'finishing-complete'
  | 'mep-complete'
  | 'final-delivery'
  | 'other';

export type PhysicalProgressTimelinePreset = '1' | '3' | '6' | '9' | '12' | '18' | '24' | 'specific-date' | 'other';

export type PhysicalProgressGracePreset = '15' | '30' | '45' | '60' | '90' | 'other';

/**
 * پیکربندی مستقل هر مرحله پیشرفت برای سناریوی فسخ بر مبنای تأخیر.
 * هر مرحله باید هم زمان هدف داشته باشد و هم مهلت مجاز تأخیر.
 */
export interface MilestoneTerminationConfig {
  milestoneType?: PhysicalProgressMilestoneType;
  timelinePreset: PhysicalProgressTimelinePreset;
  timelineMonthsCustom: string;
  timelineSpecificDate: string;
  gracePreset: PhysicalProgressGracePreset;
  graceDaysCustom: string;
}

export interface PhysicalProgressMilestoneSetting extends MilestoneTerminationConfig {}

export interface BuyerTerminationTerms {
  lateDelivery: {
    ruleEnabled: boolean;
    calculationBasis: Array<'contract-delivery-date' | 'last-addendum' | 'mutual-adjusted-date'>;
    gracePreset: '1' | '3' | '6' | '9' | '12' | '18' | '24' | 'other';
    graceMonthsCustom: string;
  };
  specificationChanges: {
    ruleEnabled: boolean;
    includedTypes: Array<'unit-plan' | 'floor-change' | 'facility-reduction' | 'block-change' | 'material-quality'>;
    priorApprovalRequired: boolean;
  };
  breachOfObligations: {
    ruleEnabled: boolean;
    obligationTypes: Array<
      'construction-progress' | 'quality-standards' | 'infrastructure-delivery' | 'legal-docs' | 'service-connections' | 'other'
    >;
    rectificationPreset: '3' | '7' | '10' | '15' | '30' | 'other';
    rectificationDaysCustom: string;
  };
  physicalProgressDelay: {
    ruleEnabled: boolean;
    milestoneTypes: PhysicalProgressMilestoneType[];
    timelinePreset: PhysicalProgressTimelinePreset;
    timelineMonthsCustom: string;
    timelineSpecificDate: string;
    gracePreset: PhysicalProgressGracePreset;
    graceDaysCustom: string;
    milestoneSettings: Partial<Record<PhysicalProgressMilestoneType, PhysicalProgressMilestoneSetting>>;
    triggerCondition: 'any-milestone' | 'all-milestones';
    progressCertificationSource:
      | 'project-supervisor-report'
      | 'official-expert-report'
      | 'constructor-reported-progress'
      | 'contract-manager-approval'
      | 'parties-agreement';
  };
  areaDiscrepancy: {
    ruleEnabled: boolean;
    thresholdPreset: '1' | '2' | '3' | '5' | '10' | 'other';
    thresholdPercentCustom: string;
    discrepancyScopes: Array<'deficit-only' | 'surplus-only'>;
    referenceSources: Array<
      'official-title-deed' | 'partition-statement' | 'official-expert-report' | 'parties-agreement' | 'court-or-arbitration-award'
    >;
    financialSettlementInsteadOfTermination: boolean;
    settlementPricingBasis: 'contract-price' | 'market-price' | 'official-expert';
  };
  notification: {
    ruleEnabled: boolean;
    notifyBuyer: boolean;
    notifyContractManager: boolean;
    showManagementOptionInGrid: boolean;
  };
  draftTemplateUsage: {
    ruleEnabled: boolean;
    allowPerContractOverride: boolean;
  };
}

/** ذخیره در ستون JSONB «buyerRules» جدول TerminationRules */
export interface BuyerRulesPersisted {
  buyerTerms: BuyerTerminationTerms;
  buyerCompletion: BuyerTerminationCompletion;
  terminationBuyerPanel?: TerminationBuyerPanel;
}

export interface TerminationConstructorCompletion {
  lateInstallment: boolean;
  financialObligations: boolean;
  documentDeficiencies: boolean;
  otherBreach: boolean;
  notifications: boolean;
}

export interface ContractTerminationData {
  terminationEnabled: boolean;
  terminationPartyTab: TerminationPartyTab;
  terminationConstructorPanel: TerminationConstructorPanel;
  /** محتوای تب فسخ خریدار: فهرست یا جزئیات یک زیربخش */
  terminationBuyerPanel: TerminationBuyerPanel;
  /** باز کردن مسیر «فسخ سازنده» (حداقل یک‌بار تا ثبت کل مرحله معتبر شود). */
  sellerTerminationEngaged: boolean;
  /** باز کردن مسیر «فسخ خریدار» (حداقل یک‌بار تا ثبت کل مرحله معتبر شود). */
  buyerTerminationEngaged: boolean;
  constructorCompletion: TerminationConstructorCompletion;
  buyerCompletion: BuyerTerminationCompletion;
  /** تنظیمات فسخ سازنده؛ نام عمداً غیر از `constructor` است تا با نمونهٔ آبجکت جاوااسکریپت تداخل نداشته باشد. */
  constructorTerms: {
    lateInstallment: {
      ruleEnabled: boolean;
      gracePreset: '3' | '7' | '10' | '15' | '30' | 'other';
      graceDaysCustom: string;
      detectionBasis: 'per-installment' | 'total-debt' | 'consecutive-installments';
      minDebtAmount: string;
      consecutiveInstallmentsCount: string;
      partialHandling: 'if-not-full' | 'if-partial' | 'by-remaining-debt';
    };
    financialObligations: {
      ruleEnabled: boolean;
      obligationTypes: Array<
        'contract-costs' | 'penalties' | 'custom-commitments' | 'extra-costs' | 'side-costs'
      >;
      gracePreset: '3' | '7' | '10' | '15' | '30' | 'other';
      graceDaysCustom: string;
      officialDemandRequired: boolean;
    };
    documentDeficiencies: {
      ruleEnabled: boolean;
      mandatoryItems: Array<
        'identity' | 'legal-permits' | 'signing-docs' | 'payment-docs' | 'physical-presence'
      >;
      completionDeadlineDays: '3' | '7' | '10' | '15' | '30' | 'other';
      completionDeadlineDaysCustom: string;
      autoReminderEnabled: boolean;
    };
    otherBreach: {
      ruleEnabled: boolean;
      violationTypes: Array<
        'transfer-restrictions' | 'refusal-to-sign' | 'lack-cooperation' | 'false-information'
      >;
      rectificationDays: '3' | '7' | '10' | '15' | '30' | 'other';
      rectificationDaysCustom: string;
      requiresContractManagerApproval: boolean;
    };
    notifications: {
      ruleEnabled: boolean;
      notifyConstructor: boolean;
      notifyManager: boolean;
      showTerminationActionInContractDetails: boolean;
    };
  };
  buyerTerms: BuyerTerminationTerms;
}

export interface ContractFormData {
  subject: ContractSubjectData;
  parties: ContractPartiesData;
  financial?: ContractFinancialData;
  penalties?: ContractPenaltiesData;
  discounts?: ContractDiscountsData;
  termination?: ContractTerminationData;
}

export interface Contract {
  id: string;
  status: ContractStatus;
  entityKind?: ContractEntityKind;
  baseContractId?: string;
  sourceAppendixId?: string | null;
  appendixStatusBadge?: string | null;
  latestApprovedAppendixId?: string | null;
  hasApprovedAppendix?: boolean;
  appendixDraftId?: string | null;
  appendixNumber?: number | null;
  createdAt: string;
  updatedAt: string;
  data: ContractFormData;
}

export interface ContractAppendixTagDefinition {
  key: AppendixTagKey;
  groupKey: AppendixTagGroupKey;
  title: string;
  description: string;
}

export interface ContractAppendixItem {
  id: string;
  tagKey: AppendixTagKey;
  groupKey: AppendixTagGroupKey;
  title: string;
  description: string;
  payload: Record<string, unknown>;
}

export type SupportedAppendixTagKey =
  | 'loan'
  | 'first-party'
  | 'second-party'
  | 'unit-delivery-date'
  | 'adjustment'
  | 'contract-base-costs'
  | 'side-costs'
  | 'material-specs-change';

export interface ContractAppendix {
  id: string;
  draftId: string;
  status: AppendixStatus;
  appendixNumber: number;
  title: string;
  summary: string;
  effectiveDate: string;
  issuerType: AppendixIssuerType;
  issuerName: string;
  notes: string;
  previousAppendixId?: string | null;
  sourceKind?: AppendixSourceKind;
  sourceId?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
  canSubmit?: boolean;
  approvalSummary?: {
    status: AppendixStatus;
    currentStepIndex?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  items: ContractAppendixItem[];
}

export interface ContractAppendixReferenceData {
  currentUserName: string;
  employees: Array<{ id: string; label: string }>;
  formerEmployees: Array<{ id: string; label: string }>;
}

export interface ContractAppendixListResponse {
  items: ContractAppendix[];
  nextAppendixNumber: number;
  reference: ContractAppendixReferenceData;
}

export interface ContractAppendixDetailResponse {
  item: ContractAppendix;
  contract: Contract;
  compareBase: {
    sourceKind: AppendixSourceKind;
    sourceId: string | null;
    sourceLabel: string;
  };
}

export interface CreateContractAppendixItemInput {
  tagKey: AppendixTagKey;
  payload: Record<string, unknown>;
}

export interface CreateContractAppendixInput {
  appendixNumber: number;
  effectiveDate: string;
  issuerType: AppendixIssuerType;
  issuerEmployeeId?: string | null;
  issuerFormerEmployeeId?: string | null;
  notes?: string;
  submitMode?: 'draft' | 'pending_approval';
  items: CreateContractAppendixItemInput[];
}

export interface FilterState {
  contractType: ContractType | null;
  dateFrom: string | null;
  dateTo: string | null;
  blockId: string | null;
  unitId: string | null;
}

export interface Block {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  blockId: string;
  floorName?: string;
  name: string;
  category?: string;
  area?: number | null;
  assignedToUnitId?: string | null;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Partner {
  id: string;
  name: string;
  personType: PersonType;
}

export interface Buyer {
  id: string;
  name: string;
  personType: PersonType;
}
