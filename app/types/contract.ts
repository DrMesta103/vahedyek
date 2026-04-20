export type ContractStatus = 'finalized' | 'draft';
export type ContractType = 'sale' | 'pre-sale';
export type ContractorType = 'self' | 'employee' | 'former-employee';
export type ShareMode = 'percent' | 'dang';
export type PersonType = 'natural' | 'legal';
export type PricingType = 'fixed' | 'metered';

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
  totalArea: string;
  pricePerMeter: string;
  fixedTotalAmount: string;
  activeTab: string;
  categories: FinancialCategoryData[];
  dueItems: FinancialDueItemData[];
}

export interface ContractFormData {
  subject: ContractSubjectData;
  parties: ContractPartiesData;
  financial?: ContractFinancialData;
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
