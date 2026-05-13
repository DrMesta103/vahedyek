export type ContractStatus = 'draft' | 'appendix_draft' | 'pending_approval' | 'completed';
export type ContractType = 'sale' | 'pre-sale';
export type ContractorType = 'self' | 'employee' | 'former-employee';
export type AppendixIssuerType = 'self' | 'employee' | 'former-employee';
export type AppendixStatus = 'draft' | 'pending_approval' | 'completed';
export type ContractEntityKind = 'contract' | 'appendix';
export type AppendixSourceKind = 'contract' | 'appendix';
export type AppendixTagGroupKey = 'financial' | 'conditions' | 'parties' | 'dates';
export type AppendixTagKey =
  | 'loan'
  | 'adjustment'
  | 'side-costs'
  | 'contract-base-costs'
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
  | 'areaDiscrepancy'
  | 'notification'
  | 'draftTemplateUsage';

export type TerminationBuyerPanel = 'list' | BuyerTerminationSubsectionId;

export interface BuyerTerminationCompletion {
  lateDelivery: boolean;
  specificationChanges: boolean;
  breachOfObligations: boolean;
  areaDiscrepancy: boolean;
  notification: boolean;
  draftTemplateUsage: boolean;
}

export interface BuyerTerminationTerms {
  lateDelivery: {
    ruleEnabled: boolean;
    calculationBasis: 'last-addendum' | 'project-end' | 'contract-date';
    gracePreset: '3' | '7' | '10' | '15' | '30' | 'other';
    graceDaysCustom: string;
    expertApprovalRequired: boolean;
  };
  specificationChanges: {
    ruleEnabled: boolean;
    includedTypes: Array<'unit-plan' | 'floor-change' | 'facility-reduction' | 'block-change' | 'material-quality'>;
    priorApprovalRequired: boolean;
  };
  breachOfObligations: {
    ruleEnabled: boolean;
    obligationTypes: Array<
      'construction-progress' | 'quality-standards' | 'infrastructure-delivery' | 'legal-docs' | 'service-connections'
    >;
    rectificationPreset: '3' | '7' | '10' | '15' | '30' | 'other';
    rectificationDaysCustom: string;
  };
  areaDiscrepancy: {
    ruleEnabled: boolean;
    thresholdPreset: '1' | '2' | '3' | 'other';
    thresholdPercentCustom: string;
    referenceSources: Array<'title-deed' | 'final-survey' | 'property-registration'>;
    financialSettlementInsteadOfTermination: boolean;
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
  | 'first-party'
  | 'second-party'
  | 'unit-delivery-date'
  | 'adjustment'
  | 'contract-base-costs'
  | 'side-costs';

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
