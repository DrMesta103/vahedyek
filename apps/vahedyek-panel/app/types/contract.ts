export type ContractStatus = 'finalized' | 'draft';
export type ContractType = 'sale' | 'pre-sale';
export type ContractorType = 'self' | 'employee' | 'former-employee';
export type ShareMode = 'percent' | 'dang';
export type PersonType = 'natural' | 'legal';
export type PricingType = 'fixed' | 'metered';
export type PenaltyMode = 'fixed' | 'overdue' | 'contract' | 'progressive';
export type PenaltyPeriod = 'daily' | 'monthly' | 'yearly';
export type PenaltyExtraFeeType = 'percent' | 'fixed';
export type PenaltyRoundRule = '0.5' | '5' | '100' | '1000';

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

export interface ContractFormData {
  subject: ContractSubjectData;
  parties: ContractPartiesData;
  financial?: ContractFinancialData;
  penalties?: ContractPenaltiesData;
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
