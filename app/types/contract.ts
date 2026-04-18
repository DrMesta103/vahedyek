// وضعیت قرارداد
export type ContractStatus = 'finalized' | 'draft';

// نوع قرارداد
export type ContractType = 'sale' | 'pre-sale';

// نوع منعقدکننده
export type ContractorType = 'self' | 'employee' | 'former-employee';

// حالت سهم‌بندی
export type ShareMode = 'percent' | 'dang';

// نوع شخص
export type PersonType = 'natural' | 'legal';

// سهم
export interface Share {
  value: number;
  mode: ShareMode;
}

// منعقدکننده قرارداد
export interface Contractor {
  type: ContractorType;
  employeeId?: string;       // برای نوع 'employee'
  formerFirstName?: string;  // برای نوع 'former-employee'
  formerLastName?: string;   // برای نوع 'former-employee'
}

// طرف قرارداد (یک نفر)
export interface ContractParty {
  personId: string;
  personType: PersonType;
  name: string;
  share: Share;
}

// داده‌های مرحله اول فرم
export interface ContractSubjectData {
  contractor: Contractor;
  contractType: ContractType;
  contractDate: string;    // تاریخ شمسی به فرمت YYYY/MM/DD
  contractNumber: string;
  deliveryDate: string;    // تاریخ شمسی
  blockId: string;
  unitId: string;
}

// داده‌های مرحله دوم فرم
export interface ContractPartiesData {
  partyOne: ContractParty[];  // طرف اول (صاحب کسب‌وکار یا شرکا)
  partyTwo: ContractParty[];  // طرف دوم (خریداران)
}

// داده کامل فرم قرارداد
export interface ContractFormData {
  subject: ContractSubjectData;
  parties: ContractPartiesData;
}

// موجودیت قرارداد ذخیره‌شده
export interface Contract {
  id: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  data: ContractFormData;
}

// وضعیت فیلترها
export interface FilterState {
  contractType: ContractType | null;
  dateFrom: string | null;
  dateTo: string | null;
  blockId: string | null;
  unitId: string | null;
}

// موجودیت‌های مرجع
export interface Block {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  blockId: string;
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
