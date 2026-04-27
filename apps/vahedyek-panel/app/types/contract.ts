export type ContractStatus = 'finalized' | 'draft';
export type ContractType = 'sale' | 'pre-sale';
export type ContractorType = 'self' | 'employee' | 'former-employee';
export type ShareMode = 'percent' | 'dang';
export type PersonType = 'natural' | 'legal';
export type PricingType = 'fixed' | 'metered';
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

export interface ContractFinancialData {
  pricingType: PricingType;
  unitArea?: string;
  parkingArea?: string;
  totalArea: string;
  pricePerMeter: string;
  parkingPricePerMeter?: string;
  fixedTotalAmount: string;
  activeTab: string;
  categories: FinancialCategoryData[];
  dueItems: FinancialDueItemData[];
}

export interface PenaltyProgressiveRowData {
  id: string;
  fromDay: string;
  toDay: string;
  rate: string;
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

export interface ContractTerminationData {
  terminationEnabled: boolean;
  activeMainTab: 'builder' | 'buyer' | 'draft';
  builder: {
    enabled: boolean;
    activeForm: 'installment-delay' | 'financial-default' | 'document-defect' | 'other-breach' | 'notifications';
    installmentDelay: {
      enabled: boolean;
      allowedDelayPreset: '3' | '7' | '10' | '15' | '30' | 'other';
      allowedDelayDays: string;
      delayBasis: 'unpaid-installment' | 'debt-amount' | 'consecutive-unpaid-installments';
      minDebtAmount: string;
      partialPaymentMode: 'activate-on-incomplete' | 'ignore-partial' | 'decide-by-balance';
    };
    financialDefault: {
      enabled: boolean;
      obligationTypes: Array<'contract-costs' | 'contract-penalties' | 'custom-financial' | 'extra-costs' | 'side-costs' | 'installments'>;
      gracePeriodPreset: '3' | '7' | '15' | '30' | 'other';
      gracePeriodDays: string;
      officialNoticeRequired: boolean;
    };
    documentDefect: {
      enabled: boolean;
      requiredItems: Array<'identity-documents' | 'signature-completion' | 'legal-permits' | 'payment-documents' | 'physical-attendance'>;
      gracePeriodPreset: '3' | '7' | '10' | '15' | '30' | 'other';
      gracePeriodDays: string;
      reminderBeforeTermination: boolean;
    };
    otherBreach: {
      enabled: boolean;
      breachTypes: Array<'transfer-restriction' | 'refusal-to-sign' | 'false-information' | 'non-cooperation'>;
      gracePeriodPreset: '3' | '7' | '15' | '30' | 'other';
      gracePeriodDays: string;
      managerApprovalRequired: boolean;
    };
    notifications: {
      notifyBuilderOnActivation: boolean;
      notifyContractManager: boolean;
      showTerminationSectionInDetails: boolean;
    };
  };
  buyer: {
    enabled: boolean;
    activeForm: 'delivery-delay' | 'spec-change' | 'area-discrepancy' | 'notifications';
    deliveryDelay: {
      enabled: boolean;
      deliveryBasis: 'latest-addendum-date' | 'official-project-end-date' | 'contract-delivery-date';
      allowedDelayPreset: '10' | '30' | '60' | '90' | '180' | 'other';
      allowedDelayDays: string;
      expertApprovalRequired: boolean;
    };
    specChange: {
      enabled: boolean;
      changeTypes: Array<'unit-area' | 'materials' | 'layout' | 'shared-spaces' | 'parking-storage'>;
      tolerancePercent: string;
      allowCompensationBeforeTermination: boolean;
      managerReviewRequired: boolean;
    };
    areaDiscrepancy: {
      enabled: boolean;
      discrepancyBasis: 'contract-area' | 'official-survey' | 'delivery-session';
      toleranceMode: 'percent' | 'meter';
      toleranceValue: string;
      allowPriceAdjustmentFirst: boolean;
      expertApprovalRequired: boolean;
    };
    notifications: {
      notifyBuyerOnActivation: boolean;
      notifyContractManager: boolean;
      showTerminationSectionInDetails: boolean;
    };
  };
  draftUsage: {
    useAsDefault: boolean;
    allowPerContractOverride: boolean;
  };
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
  createdAt: string;
  updatedAt: string;
  data: ContractFormData;
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
