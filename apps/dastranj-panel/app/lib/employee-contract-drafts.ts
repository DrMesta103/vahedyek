import {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_FIXED_BENEFIT_RULES,
  DEFAULT_SENIORITY_BENEFIT_RULES,
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  getActiveTenantStorageId,
  normalizePayrollSettings,
  normalizeCalculationRules,
  normalizeLeaveSettings,
  normalizeMissionSettings,
  normalizePaymentSchedule,
  normalizeWorkTimePayRules,
  DEFAULT_PAYMENT_SCHEDULE,
  type MissionSettings,
  type CalculationRules,
  type PaymentSchedule,
  type PayrollSettings,
  type TaxBracket,
  getPayrollSettingsStorageKey,
} from './payroll-business-settings';
import type { ContractDraftTemplate, ContractDraftTemplateUsageType, VariableTemplateItem } from './contract-draft-templates';
import { formatSubjectResponsibilities, parseSubjectResponsibilities } from './contract-subject-options';
import type { AttachmentDraft } from './employee-requests';

export type EmployeeContractDraftUsageType = ContractDraftTemplateUsageType;

export type EmployeeContractDraftStepId =
  | 'parties'
  | 'timing'
  | 'subject'
  | 'financial'
  | 'insuranceTax'
  | 'benefits'
  | 'benefitsEnd'
  | 'variablePayments'
  | 'paymentType'
  | 'workTimePayRules'
  | 'leave'
  | 'mission'
  | 'specialCommitments'
  | 'attachments'
  | 'future';

export type EmployeeBenefitPaymentPeriod = 'monthly' | 'quarterly' | 'semiAnnual' | 'annual' | 'none';
export type EmployeePaymentCycle = 'monthly' | 'weekly' | 'biweekly' | 'daily' | 'project' | 'seasonal';

export type EmployeeMissionRule = MissionSettings['rules'][number];
export type EmployeeMissionSettings = MissionSettings;

export type EmployeeSpecialCommitments = {
  selected: string[];
  attachments: AttachmentDraft[];
};

export type EmployeeContractAttachments = {
  requiredDocuments: Record<string, string[]>;
  files: AttachmentDraft[];
};

export type EmployeeDraftStepState = {
  opened: boolean;
  completed: boolean;
  dirty: boolean;
  saved: boolean;
};

export type EmployeeDraftProgress = Record<EmployeeContractDraftStepId, EmployeeDraftStepState>;

export type EmployeeDraftTemplateSnapshot = {
  id: string;
  name: string;
  usageType: EmployeeContractDraftUsageType;
  baseSettingsYear: number;
  classification: {
    contractType: string;
    locationGroup: string;
  };
  timing: {
    durationMonths: number;
  };
  financial: {
    dailyRequiredMinutes: number;
    dailyBaseSalary: number;
  };
  insuranceTax: {
    insuranceEnabled: boolean;
    employerInsurancePercent: number;
    employeeInsurancePercent: number;
    taxEnabled: boolean;
    taxPayer: 'employee' | 'employer';
    taxBrackets: TaxBracket[];
  };
  benefits: Record<'workerAllowance' | 'housingAllowance' | 'childAllowance' | 'marriageAllowance' | 'seniorityAllowance', number>;
  benefitRules: Record<'workerAllowance' | 'housingAllowance' | 'childAllowance' | 'marriageAllowance' | 'seniorityAllowance', CalculationRules>;
  benefitsEnd?: {
    eidBonus: {
      amount: number;
      period: EmployeeBenefitPaymentPeriod;
    };
    endOfService: {
      enabled: boolean;
      severancePaymentMethod: 'end_of_work' | 'periodic';
      finalSettlementEnabled: boolean;
    };
  };
  variablePayments?: {
    enabled: boolean;
    additions: VariableTemplateItem[];
    deductions: VariableTemplateItem[];
  };
  paymentSchedule?: PaymentSchedule;
  paymentType?: {
    type: string;
    period: EmployeePaymentCycle;
  };
  workTimePayRules?: PayrollSettings['workTimePayRules'];
  leave?: PayrollSettings['leave'];
  mission?: EmployeeMissionSettings;
  specialCommitments?: EmployeeSpecialCommitments;
  attachments?: EmployeeContractAttachments;
};

export type EmployeeEducationRecord = {
  id: string;
  field: string;
  degree: string;
};

export type EmployeeJobRecord = {
  id: string;
  title: string;
  startDate: string;
};

export type EmployeeSupplementalProfile = {
  fatherName: string;
  birthDate: string;
  issuePlace: string;
  gender: '' | 'male' | 'female' | 'other';
  educationField: string;
  educationDegree: string;
  educationRecords: EmployeeEducationRecord[];
  jobTitle: string;
  firstContractDate: string;
  jobRecords: EmployeeJobRecord[];
  militaryStatus: string;
  country: string;
  province: string;
  city: string;
  street: string;
  buildingName: string;
  alley: string;
  plaque: string;
  floor: string;
  unit: string;
  postalCode: string;
};

export type EmployeeContractDraft = {
  id: string;
  employeeId: string;
  employeeName: string;
  usageType: EmployeeContractDraftUsageType;
  status: 'draft' | 'in_progress' | 'completed' | 'active' | 'ended' | 'canceled';
  isCurrent?: boolean;
  finalizedAt?: string | null;
  templateId: string | null;
  templateName: string | null;
  templateSnapshot: EmployeeDraftTemplateSnapshot | null;
  comparisonBaseSettingsId: string | null;
  comparisonBaseSettingsSnapshot: EmployeeDraftTemplateSnapshot | null;
  comparisonBaseYear: number | null;
  createdAt: string;
  updatedAt: string;
  contractNumber: string;
  parties: {
    employerName: string;
    employerNationalId: string;
    employerEconomicCode: string;
    legalRepresentative: string;
  };
  employeeSupplemental: EmployeeSupplementalProfile;
  timing: {
    contractDate: string;
    registrationNumber: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
  };
  subject: {
    contractType: string;
    contractSubType: string;
    jobGroup: string;
    responsibility: string;
    responsibilities?: string[];
    locationGroup: string;
    locationType: string;
  };
  financial: {
    dailyRequiredMinutes: number;
    dailyBaseSalary: number;
  };
  insuranceTax: {
    insuranceEnabled: boolean;
    employerInsurancePercent: number;
    employeeInsurancePercent: number;
    taxEnabled: boolean;
    taxPayer: 'employee' | 'employer';
    taxBrackets: TaxBracket[];
  };
  benefits: Record<
    'workerAllowance' | 'housingAllowance' | 'childAllowance' | 'seniorityAllowance' | 'marriageAllowance',
    { enabled: boolean; amount: number; calculationRules: CalculationRules }
  >;
  benefitsEnd?: {
    eidBonus: {
      amount: number;
      period: EmployeeBenefitPaymentPeriod;
    };
    endOfService: {
      enabled: boolean;
      severancePaymentMethod: 'end_of_work' | 'periodic';
      finalSettlementEnabled: boolean;
    };
  };
  variablePayments?: {
    enabled: boolean;
    additions: VariableTemplateItem[];
    deductions: VariableTemplateItem[];
  };
  paymentSchedule?: PaymentSchedule;
  paymentType?: {
    type: string;
    period: EmployeePaymentCycle;
  };
  workTimePayRules?: PayrollSettings['workTimePayRules'];
  leave?: PayrollSettings['leave'];
  mission?: EmployeeMissionSettings;
  specialCommitments?: EmployeeSpecialCommitments;
  attachments?: EmployeeContractAttachments;
  progress: EmployeeDraftProgress;
};

export type EmployeeContractDraftStep = {
  id: EmployeeContractDraftStepId;
  title: string;
  detail: string;
  implemented: boolean;
};

export type EmployeeContractDraftTemplateChoice = {
  id: string;
  name: string;
  usageType: EmployeeContractDraftUsageType;
  baseSettingsYear: number;
};

export const EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY = 'dastranj-employee-contract-drafts-v1';
export const EMPLOYEE_SUPPLEMENTAL_PROFILE_STORAGE_KEY = 'dastranj-employee-supplemental-profile-v1';

function scopeStorageKey(key: string, tenantId?: string | null) {
  const scope = tenantId ?? getActiveTenantStorageId();
  return scope ? `${key}:${scope}` : key;
}

export function getEmployeeContractDraftsStorageKey(tenantId?: string | null) {
  return scopeStorageKey(EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY, tenantId);
}

export function getEmployeeSupplementalStorageKey(tenantId?: string | null) {
  return scopeStorageKey(EMPLOYEE_SUPPLEMENTAL_PROFILE_STORAGE_KEY, tenantId);
}

export const EMPLOYEE_BENEFIT_KEYS = ['workerAllowance', 'housingAllowance', 'childAllowance', 'marriageAllowance', 'seniorityAllowance'] as const;

export const EMPLOYEE_CONTRACT_BENEFIT_LABELS: Record<(typeof EMPLOYEE_BENEFIT_KEYS)[number], string> = {
  workerAllowance: 'بن کارگری',
  housingAllowance: 'حق مسکن',
  childAllowance: 'حق اولاد',
  marriageAllowance: 'حق تأهل',
  seniorityAllowance: 'مزد پایه سنوات',
};

export const EMPLOYEE_CONTRACT_BENEFIT_DESCRIPTIONS: Record<(typeof EMPLOYEE_BENEFIT_KEYS)[number], string> = {
  workerAllowance:
    'بن کارگری کمک‌هزینه‌ای است که به‌صورت ماهانه به کارگران پرداخت می‌شود تا بخشی از هزینه‌های معیشتی آنان را پوشش دهد. این مبلغ توسط شورای عالی کار تعیین شده و کارفرما موظف به پرداخت آن است.',
  housingAllowance:
    'حق مسکن کمک‌هزینه‌ای است که کارفرما موظف است ماهانه به کارگران پرداخت کند تا بخشی از هزینه‌های مسکن آن‌ها را جبران نماید. این مبلغ سالانه توسط شورای عالی کار تعیین و در فیش حقوقی درج می‌شود.',
  childAllowance:
    'حق اولاد کمک‌هزینه‌ای است که کارفرما موظف است به ازای هر فرزند تحت تکفل کارگر پرداخت کند. این مبلغ بر اساس حداقل حقوق پایه و تعداد فرزندان محاسبه شده و در فیش حقوقی ماهانه لحاظ می‌شود.',
  marriageAllowance:
    'حق تأهل کمک‌هزینه‌ای است که کارفرما به کارگران متأهل پرداخت می‌کند. این مبلغ به‌صورت ماهانه همراه با حقوق و بر اساس قوانین اداره کار تعیین شده و در قراردادها و فیش‌های پرداختی اعمال می‌شود.',
  seniorityAllowance:
    'مزد پایه سنوات مبلغی است که به کارگرانی که حداقل یک سال سابقه کار در یک واحد دارند، پرداخت می‌شود. این مبلغ برای جبران تجربه و سابقه کاری کارگران در نظر گرفته شده و به‌صورت ماهانه همراه با حقوق پایه پرداخت می‌شود.',
};

const EMPLOYEE_BENEFIT_END_PAYMENT_PERIODS: Array<{ value: EmployeeBenefitPaymentPeriod; label: string }> = [
  { value: 'monthly', label: 'Ù…Ø§Ù‡ÛŒØ§Ù†Ù‡' },
  { value: 'quarterly', label: 'Ø³Ù‡â€ŒÙ…Ø§Ù‡Ù‡' },
  { value: 'semiAnnual', label: 'Ø´Ø´â€ŒÙ…Ø§Ù‡' },
  { value: 'annual', label: 'Ø³Ø§ÙÙ‡Ø§Ù†Ù‡' },
  { value: 'none', label: 'Ø¨Ø¯ÙˆÙ† Ø¹ÛŒØ¯ÛŒ' },
];

const EMPLOYEE_PAYMENT_CYCLES: Array<{ value: EmployeePaymentCycle; label: string }> = [
  { value: 'monthly', label: 'Ù¾Ø±Ø¯Ø§Ø®Øª Ù…Ø§Ù‡Ø§Ù†Ù‡' },
  { value: 'weekly', label: 'Ù¾Ø±Ø¯Ø§Ø®Øª Ù‡ÙØªÙ‡â€ŒØ§ÛŒ' },
  { value: 'biweekly', label: 'Ù¾Ø±Ø¯Ø§Ø®Øª Ø¯Ùˆ Ù‡ÙØªÙ‡ ÛŒÚ© Ø¨Ø§Ø±' },
  { value: 'daily', label: 'Ù¾Ø±Ø¯Ø§Ø®Øª Ø±ÙˆØ²Ø§ÙÙ‡' },
  { value: 'project', label: 'Ù¾Ø±Ø¯Ø§Ø®Øª Ù¾Ø±ÙˆÚ˜Ù‡â€ŒØ§ÛŒ' },
  { value: 'seasonal', label: 'Ù¾Ø±Ø¯Ø§Ø®Øª ÙØµÙ„ÛŒ' },
];

function legacyPaymentTypeLabelFromSchedule(schedule: PaymentSchedule) {
  if (schedule.type === 'job_activity') return 'پرداخت بر اساس نوع شغل و فعالیت';
  if (schedule.type === 'hybrid_special') return 'پرداخت ترکیبی و روش‌های خاص';
  return 'پرداخت بر اساس دوره‌های زمانی';
}

function toLegacyPaymentType(schedule: PaymentSchedule): { type: string; period: EmployeePaymentCycle } {
  return {
    type: legacyPaymentTypeLabelFromSchedule(schedule),
    period: schedule.period ?? 'monthly',
  };
}

function normalizeVariableTemplateItem(raw: unknown, type: 'addition' | 'deduction'): VariableTemplateItem {
  const source = raw && typeof raw === 'object' ? (raw as Partial<VariableTemplateItem>) : {};
  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : `${type}-${Date.now()}`,
    title: typeof source.title === 'string' ? source.title : '',
    type,
    method: source.method === 'percentage' ? 'percentage' : 'fixed',
    amount: Number.isFinite(source.amount) ? Number(source.amount) : 0,
    percent: Number.isFinite(source.percent) ? Number(source.percent) : 0,
    base: source.base === 'grossPay' ? 'grossPay' : 'baseSalary',
    calculationRules: normalizeCalculationRules(
      source.calculationRules,
      type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES,
    ),
  };
}

function normalizeEmployeeProgress(stepIds: EmployeeContractDraftStepId[], progress?: Partial<EmployeeDraftProgress> | null) {
  const defaultProgress = buildProgress(stepIds, stepIds[0]);
  if (!progress) return defaultProgress;
  const merged = { ...defaultProgress };
  for (const stepId of stepIds) {
    merged[stepId] = {
      ...merged[stepId],
      ...(progress[stepId] ?? {}),
    };
  }
  return merged;
}

export const EMPLOYEE_CONTRACT_DRAFT_STEPS: Record<EmployeeContractDraftUsageType, EmployeeContractDraftStep[]> = {
  attendance_only: [
    { id: 'parties', title: 'مشخصات طرفین قرارداد', detail: 'کارفرما و کارمند', implemented: true },
    { id: 'timing', title: 'مشخصات زمانی و ثبت قرارداد', detail: 'تاریخ‌ها و شماره ثبت', implemented: true },
    { id: 'subject', title: 'موضوع قرارداد', detail: 'نوع همکاری و محل کار', implemented: true },
    { id: 'financial', title: 'اطلاعات مالی تردد', detail: 'دقایق موظفی روزانه', implemented: true },
    { id: 'workTimePayRules', title: 'پرداخت زمان کاری', detail: 'ضرایب اضافه‌کاری و تردد', implemented: true },
    { id: 'leave', title: 'مرخصی', detail: 'سهمیه، انتقال و تسویه', implemented: true },
    { id: 'future', title: 'سایر مراحل', detail: 'در ادامه تکمیل می‌شود', implemented: false },
  ],
  payroll_attendance: [
    { id: 'parties', title: 'مشخصات طرفین قرارداد', detail: 'کارفرما و کارمند', implemented: true },
    { id: 'timing', title: 'مشخصات زمانی و ثبت قرارداد', detail: 'تاریخ‌ها و شماره ثبت', implemented: true },
    { id: 'subject', title: 'موضوع قرارداد', detail: 'نوع همکاری و محل کار', implemented: true },
    { id: 'financial', title: 'اطلاعات مالی قرارداد', detail: 'حقوق، دقایق موظفی و مبنا', implemented: true },
    { id: 'insuranceTax', title: 'بیمه و مالیات', detail: 'تعهدات بیمه‌ای و مالیاتی', implemented: true },
    { id: 'benefits', title: 'مزایای پایه و مستمر', detail: 'مزایای ثابت و قانونی', implemented: true },
    { id: 'benefitsEnd', title: 'مزایای پایان سال و پایان کار', detail: 'عیدی و سنوات', implemented: true },
    { id: 'variablePayments', title: 'پرداخت‌های متغیر', detail: 'اضافات و کسورات اختیاری', implemented: true },
    { id: 'paymentType', title: 'نوع پرداخت حقوق و مزایا', detail: 'دوره‌ای و ماهانه', implemented: true },
    { id: 'workTimePayRules', title: 'پرداخت زمان کاری', detail: 'ضرایب اضافه‌کاری و تردد', implemented: true },
    { id: 'leave', title: 'مرخصی', detail: 'سهمیه، انتقال و تسویه', implemented: true },
    { id: 'mission', title: 'ماموریت', detail: 'قوانین پرداخت ماموریت', implemented: true },
    { id: 'specialCommitments', title: 'تعهدات خاص قرارداد', detail: 'بندهای حقوقی و پیوست‌ها', implemented: true },
    { id: 'attachments', title: 'پیوست‌ها و مدارک', detail: 'مدارک موردنیاز قرارداد', implemented: true },
    { id: 'future', title: 'سایر مراحل', detail: 'در ادامه تکمیل می‌شود', implemented: false },
  ],
};

const ALL_EMPLOYEE_CONTRACT_DRAFT_STEP_IDS: Record<EmployeeContractDraftStepId, EmployeeContractDraftStepId> = {
  parties: 'parties',
  timing: 'timing',
  subject: 'subject',
  financial: 'financial',
  insuranceTax: 'insuranceTax',
  benefits: 'benefits',
  benefitsEnd: 'benefitsEnd',
  variablePayments: 'variablePayments',
  paymentType: 'paymentType',
  workTimePayRules: 'workTimePayRules',
  leave: 'leave',
  mission: 'mission',
  specialCommitments: 'specialCommitments',
  attachments: 'attachments',
  future: 'future',
};

function buildProgress(stepIds: EmployeeContractDraftStepId[], currentStepId: EmployeeContractDraftStepId): EmployeeDraftProgress {
  const initial = Object.fromEntries(
    Object.values(ALL_EMPLOYEE_CONTRACT_DRAFT_STEP_IDS).map((stepId) => [
      stepId,
      { opened: false, completed: false, dirty: false, saved: false },
    ]),
  ) as EmployeeDraftProgress;

  stepIds.forEach((stepId, index) => {
    initial[stepId] = {
      opened: index === 0,
      completed: false,
      dirty: false,
      saved: false,
    };
  });

  if (initial[currentStepId]) {
    initial[currentStepId].opened = true;
  }

  return initial;
}

export function getEmployeeDraftSteps(usageType: EmployeeContractDraftUsageType) {
  return EMPLOYEE_CONTRACT_DRAFT_STEPS[usageType].filter((step) => step.id !== 'future');
}

export function getEmployeeDraftStorageKey(tenantId?: string | null) {
  return getEmployeeContractDraftsStorageKey(tenantId);
}

export function getEmployeeDraftsFromStorage(raw: string | null | undefined) {
  if (!raw) return [] as EmployeeContractDraft[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [] as EmployeeContractDraft[];
    return parsed.map((item) => normalizeEmployeeContractDraft(item)).filter(Boolean) as EmployeeContractDraft[];
  } catch {
    return [] as EmployeeContractDraft[];
  }
}

function createSupplementalRecordId() {
  return globalThis.crypto?.randomUUID?.() ?? `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyEducationRecord(): EmployeeEducationRecord {
  return { id: createSupplementalRecordId(), field: '', degree: '' };
}

export function createEmptyJobRecord(): EmployeeJobRecord {
  return { id: createSupplementalRecordId(), title: '', startDate: '' };
}

function normalizeEducationRecords(source: Partial<EmployeeSupplementalProfile>) {
  if (Array.isArray(source.educationRecords) && source.educationRecords.length) {
    return source.educationRecords
      .map((item) => {
        const record = (item && typeof item === 'object' ? item : {}) as Partial<EmployeeEducationRecord>;
        return {
          id: typeof record.id === 'string' && record.id.trim() ? record.id : createSupplementalRecordId(),
          field: typeof record.field === 'string' ? record.field : '',
          degree: typeof record.degree === 'string' ? record.degree : '',
        } satisfies EmployeeEducationRecord;
      })
      .filter(Boolean);
  }

  if (source.educationField?.trim() || source.educationDegree?.trim()) {
    return [
      {
        id: createSupplementalRecordId(),
        field: source.educationField ?? '',
        degree: source.educationDegree ?? '',
      },
    ];
  }

  return [createEmptyEducationRecord()];
}

function normalizeJobRecords(source: Partial<EmployeeSupplementalProfile>) {
  if (Array.isArray(source.jobRecords) && source.jobRecords.length) {
    return source.jobRecords
      .map((item) => {
        const record = (item && typeof item === 'object' ? item : {}) as Partial<EmployeeJobRecord>;
        return {
          id: typeof record.id === 'string' && record.id.trim() ? record.id : createSupplementalRecordId(),
          title: typeof record.title === 'string' ? record.title : '',
          startDate: typeof record.startDate === 'string' ? record.startDate : '',
        } satisfies EmployeeJobRecord;
      })
      .filter(Boolean);
  }

  if (source.jobTitle?.trim() || source.firstContractDate?.trim()) {
    return [
      {
        id: createSupplementalRecordId(),
        title: source.jobTitle ?? '',
        startDate: source.firstContractDate ?? '',
      },
    ];
  }

  return [createEmptyJobRecord()];
}

export function syncSupplementalLegacyFields(profile: EmployeeSupplementalProfile): EmployeeSupplementalProfile {
  const educationRecords = profile.educationRecords.length ? profile.educationRecords : [createEmptyEducationRecord()];
  const jobRecords = profile.jobRecords.length ? profile.jobRecords : [createEmptyJobRecord()];
  const firstEducation = educationRecords[0];
  const firstJob = jobRecords[0];

  return {
    ...profile,
    educationRecords,
    jobRecords,
    educationField: firstEducation?.field ?? '',
    educationDegree: firstEducation?.degree ?? '',
    jobTitle: firstJob?.title ?? '',
    firstContractDate: firstJob?.startDate ?? '',
  };
}

export function normalizeEmployeeSupplementalProfile(value: unknown): EmployeeSupplementalProfile {
  const source = value && typeof value === 'object' ? (value as Partial<EmployeeSupplementalProfile>) : {};
  const educationRecords = normalizeEducationRecords(source);
  const jobRecords = normalizeJobRecords(source);

  return syncSupplementalLegacyFields({
    fatherName: source.fatherName ?? '',
    birthDate: source.birthDate ?? '',
    issuePlace: source.issuePlace ?? '',
    gender: source.gender ?? '',
    educationField: source.educationField ?? educationRecords[0]?.field ?? '',
    educationDegree: source.educationDegree ?? educationRecords[0]?.degree ?? '',
    educationRecords,
    jobTitle: source.jobTitle ?? jobRecords[0]?.title ?? '',
    firstContractDate: source.firstContractDate ?? jobRecords[0]?.startDate ?? '',
    jobRecords,
    militaryStatus: source.militaryStatus ?? '',
    country: source.country ?? '',
    province: source.province ?? '',
    city: source.city ?? '',
    street: source.street ?? '',
    buildingName: source.buildingName ?? '',
    alley: source.alley ?? '',
    plaque: source.plaque ?? '',
    floor: source.floor ?? '',
    unit: source.unit ?? '',
    postalCode: source.postalCode ?? '',
  });
}

export function getDefaultEmployeeSupplementalProfile(): EmployeeSupplementalProfile {
  return normalizeEmployeeSupplementalProfile({});
}

function toDateOffset(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function toMonthOffset(base: Date, months: number) {
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
}

export function buildTemplateSnapshot(
  template: ContractDraftTemplate,
  baseSettings: PayrollSettings = DEFAULT_PAYROLL_SETTINGS,
): EmployeeDraftTemplateSnapshot {
  const workTimePayRules = normalizeWorkTimePayRules(template.data.workTimePayRules, baseSettings.workTimePayRules);
  return {
    id: template.id,
    name: template.name,
    usageType: template.usageType,
    baseSettingsYear: template.baseSettingsYear,
    classification: {
      contractType: template.data.classification.contractType ?? '',
      locationGroup: template.data.classification.workLocationCategories[0] ?? '',
    },
    timing: {
      durationMonths: 12,
    },
    financial: {
      dailyRequiredMinutes: template.data.payrollBase.dailyRequiredMinutes || baseSettings.financial.dailyRequiredMinutes,
      dailyBaseSalary: template.data.payrollBase.dailyBaseSalary || baseSettings.financial.dailyBaseSalary,
    },
    insuranceTax: {
      insuranceEnabled: template.data.payrollBase.insuranceEnabled,
      employerInsurancePercent: template.data.payrollBase.employerInsurancePercent,
      employeeInsurancePercent: template.data.payrollBase.employeeInsurancePercent,
      taxEnabled: template.data.payrollBase.taxEnabled,
      taxPayer: template.data.payrollBase.taxPayer,
      taxBrackets: baseSettings.deductions.taxBrackets.map((item) => ({ ...item })),
    },
    benefits: {
      workerAllowance: template.data.benefits.workerAllowance.enabled ? template.data.benefits.workerAllowance.amount : 0,
      housingAllowance: template.data.benefits.housingAllowance.enabled ? template.data.benefits.housingAllowance.amount : 0,
      childAllowance: template.data.benefits.childAllowance.enabled ? template.data.benefits.childAllowance.amount : 0,
      marriageAllowance: template.data.benefits.marriageAllowance.enabled ? template.data.benefits.marriageAllowance.amount : 0,
      seniorityAllowance: template.data.benefits.seniorityAllowance.enabled ? template.data.benefits.seniorityAllowance.amount : 0,
    },
    benefitRules: {
      workerAllowance: normalizeCalculationRules(template.data.benefits.workerAllowance.calculationRules, baseSettings.benefitRules.workerAllowance),
      housingAllowance: normalizeCalculationRules(template.data.benefits.housingAllowance.calculationRules, baseSettings.benefitRules.housingAllowance),
      childAllowance: normalizeCalculationRules(template.data.benefits.childAllowance.calculationRules, baseSettings.benefitRules.childAllowance),
      marriageAllowance: normalizeCalculationRules(template.data.benefits.marriageAllowance.calculationRules, baseSettings.benefitRules.marriageAllowance),
      seniorityAllowance: normalizeCalculationRules(template.data.benefits.seniorityAllowance.calculationRules, baseSettings.benefitRules.seniorityAllowance ?? DEFAULT_SENIORITY_BENEFIT_RULES),
    },
    benefitsEnd: {
      eidBonus: {
        amount: template.data.benefits.eidBonus.enabled ? template.data.benefits.eidBonus.amount : 0,
        period: template.data.benefits.eidBonus.enabled ? 'annual' : 'none',
      },
      endOfService: {
        enabled: true,
        severancePaymentMethod: template.data.benefits.severancePaymentMethod,
        finalSettlementEnabled: template.data.benefits.finalSettlementEnabled,
      },
    },
    variablePayments: {
      enabled: template.data.variablePayments.enabled,
      additions: template.data.variablePayments.additions.map((item) => normalizeVariableTemplateItem(item, 'addition')),
      deductions: template.data.variablePayments.deductions.map((item) => normalizeVariableTemplateItem(item, 'deduction')),
    },
    paymentSchedule: normalizePaymentSchedule(template.data.paymentSchedule ?? template.data.paymentType, DEFAULT_PAYMENT_SCHEDULE),
    paymentType: toLegacyPaymentType(normalizePaymentSchedule(template.data.paymentSchedule ?? template.data.paymentType, DEFAULT_PAYMENT_SCHEDULE)),
    workTimePayRules,
    leave: normalizeLeaveSettings(template.data.leave, baseSettings.leave),
    mission: normalizeMissionSettings(template.data.mission, {
      enabled: true,
      rules: [
        { id: 'mission-with-stay', title: 'ماموریت با اقامتگاه', coefficient: workTimePayRules.mission.coefficient, paymentBase: 'base_salary', active: true },
        { id: 'mission-without-stay', title: 'ماموریت بدون اقامتگاه', coefficient: workTimePayRules.mission.coefficient, paymentBase: 'base_salary', active: true },
      ],
    }),
    specialCommitments: {
      selected: Array.isArray(template.data.specialCommitments.selected) ? template.data.specialCommitments.selected : [],
      attachments: [],
    },
    attachments: {
      requiredDocuments: template.data.attachments.requiredDocuments ?? {},
      files: [],
    },
  };
}

function normalizeBenefitState(value: unknown, fallbackAmount: number, fallbackRules: CalculationRules) {
  const source = value && typeof value === 'object' ? (value as Partial<{ enabled: boolean; amount: number; calculationRules: CalculationRules }>) : {};
  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : true,
    amount: Number.isFinite(source.amount) ? Number(source.amount) : fallbackAmount,
    calculationRules: normalizeCalculationRules(source.calculationRules, fallbackRules),
  };
}

export function normalizeEmployeeContractDraft(value: unknown): EmployeeContractDraft | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<EmployeeContractDraft>;
  if (!draft.id || !draft.employeeId || !draft.employeeName || !draft.usageType) return null;
  const usageType = draft.usageType as EmployeeContractDraftUsageType;
  const steps = getEmployeeDraftSteps(usageType).map((item) => item.id);
  const baseSettings = DEFAULT_PAYROLL_SETTINGS;
  return {
    id: draft.id,
    employeeId: draft.employeeId,
    employeeName: draft.employeeName,
    usageType,
    status: draft.status ?? 'draft',
    isCurrent: Boolean(draft.isCurrent),
    finalizedAt: draft.finalizedAt ?? null,
    templateId: draft.templateId ?? null,
    templateName: draft.templateName ?? null,
    templateSnapshot: draft.templateSnapshot
      ? {
          ...draft.templateSnapshot,
          benefitRules: {
            workerAllowance: normalizeCalculationRules(draft.templateSnapshot.benefitRules?.workerAllowance, DEFAULT_FIXED_BENEFIT_RULES),
            housingAllowance: normalizeCalculationRules(draft.templateSnapshot.benefitRules?.housingAllowance, DEFAULT_FIXED_BENEFIT_RULES),
            childAllowance: normalizeCalculationRules(draft.templateSnapshot.benefitRules?.childAllowance, DEFAULT_FIXED_BENEFIT_RULES),
            marriageAllowance: normalizeCalculationRules(draft.templateSnapshot.benefitRules?.marriageAllowance, DEFAULT_FIXED_BENEFIT_RULES),
            seniorityAllowance: normalizeCalculationRules(draft.templateSnapshot.benefitRules?.seniorityAllowance, DEFAULT_SENIORITY_BENEFIT_RULES),
          },
          paymentSchedule: normalizePaymentSchedule(
            draft.templateSnapshot.paymentSchedule ?? draft.templateSnapshot.paymentType,
            DEFAULT_PAYMENT_SCHEDULE,
          ),
          paymentType: draft.templateSnapshot.paymentType
            ?? toLegacyPaymentType(
              normalizePaymentSchedule(
                draft.templateSnapshot.paymentSchedule ?? draft.templateSnapshot.paymentType,
                DEFAULT_PAYMENT_SCHEDULE,
              ),
            ),
          workTimePayRules: normalizeWorkTimePayRules(
            draft.templateSnapshot.workTimePayRules ?? baseSettings.workTimePayRules,
            baseSettings.workTimePayRules,
          ),
        }
      : null,
    comparisonBaseSettingsId: draft.comparisonBaseSettingsId ?? null,
    comparisonBaseYear: Number.isFinite(draft.comparisonBaseYear) ? Number(draft.comparisonBaseYear) : null,
    comparisonBaseSettingsSnapshot: draft.comparisonBaseSettingsSnapshot
      ? {
          ...draft.comparisonBaseSettingsSnapshot,
          benefitRules: {
            workerAllowance: normalizeCalculationRules(
              draft.comparisonBaseSettingsSnapshot.benefitRules?.workerAllowance,
              DEFAULT_FIXED_BENEFIT_RULES,
            ),
            housingAllowance: normalizeCalculationRules(
              draft.comparisonBaseSettingsSnapshot.benefitRules?.housingAllowance,
              DEFAULT_FIXED_BENEFIT_RULES,
            ),
            childAllowance: normalizeCalculationRules(
              draft.comparisonBaseSettingsSnapshot.benefitRules?.childAllowance,
              DEFAULT_FIXED_BENEFIT_RULES,
            ),
            marriageAllowance: normalizeCalculationRules(
              draft.comparisonBaseSettingsSnapshot.benefitRules?.marriageAllowance,
              DEFAULT_FIXED_BENEFIT_RULES,
            ),
            seniorityAllowance: normalizeCalculationRules(
              draft.comparisonBaseSettingsSnapshot.benefitRules?.seniorityAllowance,
              DEFAULT_SENIORITY_BENEFIT_RULES,
            ),
          },
          paymentSchedule: normalizePaymentSchedule(
            draft.comparisonBaseSettingsSnapshot.paymentSchedule ?? draft.comparisonBaseSettingsSnapshot.paymentType,
            DEFAULT_PAYMENT_SCHEDULE,
          ),
          paymentType:
            draft.comparisonBaseSettingsSnapshot.paymentType ??
            toLegacyPaymentType(
              normalizePaymentSchedule(
                draft.comparisonBaseSettingsSnapshot.paymentSchedule ?? draft.comparisonBaseSettingsSnapshot.paymentType,
                DEFAULT_PAYMENT_SCHEDULE,
              ),
            ),
          workTimePayRules: normalizeWorkTimePayRules(
            draft.comparisonBaseSettingsSnapshot.workTimePayRules ?? baseSettings.workTimePayRules,
            baseSettings.workTimePayRules,
          ),
        }
      : null,
    createdAt: draft.createdAt ?? new Date().toISOString(),
    updatedAt: draft.updatedAt ?? draft.createdAt ?? new Date().toISOString(),
    contractNumber: draft.contractNumber ?? '',
    parties: {
      employerName: draft.parties?.employerName ?? '',
      employerNationalId: draft.parties?.employerNationalId ?? '',
      employerEconomicCode: draft.parties?.employerEconomicCode ?? '',
      legalRepresentative: draft.parties?.legalRepresentative ?? '',
    },
    employeeSupplemental: normalizeEmployeeSupplementalProfile(draft.employeeSupplemental),
    timing: {
      contractDate: draft.timing?.contractDate ?? '',
      registrationNumber: draft.timing?.registrationNumber ?? '',
      startDate: draft.timing?.startDate ?? '',
      endDate: draft.timing?.endDate ?? '',
      durationMonths: Number.isFinite(draft.timing?.durationMonths) ? Number(draft.timing?.durationMonths) : 12,
    },
    subject: {
      contractType: draft.subject?.contractType ?? '',
      contractSubType: draft.subject?.contractSubType ?? '',
      jobGroup: draft.subject?.jobGroup ?? '',
      responsibilities: (() => {
        const parsed = parseSubjectResponsibilities({
          responsibility: typeof draft.subject?.responsibility === 'string' ? draft.subject.responsibility : '',
          responsibilities: Array.isArray(draft.subject?.responsibilities) ? draft.subject.responsibilities : undefined,
        });
        return parsed;
      })(),
      responsibility: (() => {
        const parsed = parseSubjectResponsibilities({
          responsibility: typeof draft.subject?.responsibility === 'string' ? draft.subject.responsibility : '',
          responsibilities: Array.isArray(draft.subject?.responsibilities) ? draft.subject.responsibilities : undefined,
        });
        return formatSubjectResponsibilities(parsed);
      })(),
      locationGroup: draft.subject?.locationGroup ?? '',
      locationType: draft.subject?.locationType ?? '',
    },
    financial: {
      dailyRequiredMinutes: Number.isFinite(draft.financial?.dailyRequiredMinutes)
        ? Number(draft.financial?.dailyRequiredMinutes)
        : baseSettings.financial.dailyRequiredMinutes,
      dailyBaseSalary: Number.isFinite(draft.financial?.dailyBaseSalary)
        ? Number(draft.financial?.dailyBaseSalary)
        : baseSettings.financial.dailyBaseSalary,
    },
    insuranceTax: {
      insuranceEnabled: draft.insuranceTax?.insuranceEnabled ?? false,
      employerInsurancePercent: Number.isFinite(draft.insuranceTax?.employerInsurancePercent)
        ? Number(draft.insuranceTax?.employerInsurancePercent)
        : baseSettings.deductions.employerInsurancePercent,
      employeeInsurancePercent: Number.isFinite(draft.insuranceTax?.employeeInsurancePercent)
        ? Number(draft.insuranceTax?.employeeInsurancePercent)
        : baseSettings.deductions.employeeInsurancePercent,
      taxEnabled: draft.insuranceTax?.taxEnabled ?? false,
      taxPayer: draft.insuranceTax?.taxPayer ?? 'employee',
      taxBrackets: Array.isArray(draft.insuranceTax?.taxBrackets) ? draft.insuranceTax.taxBrackets : [],
    },
    benefits: {
      workerAllowance: normalizeBenefitState(draft.benefits?.workerAllowance, baseSettings.benefits.workerAllowance, baseSettings.benefitRules?.workerAllowance ?? DEFAULT_FIXED_BENEFIT_RULES),
      housingAllowance: normalizeBenefitState(draft.benefits?.housingAllowance, baseSettings.benefits.housingAllowance, baseSettings.benefitRules?.housingAllowance ?? DEFAULT_FIXED_BENEFIT_RULES),
      childAllowance: normalizeBenefitState(draft.benefits?.childAllowance, baseSettings.benefits.childAllowance, baseSettings.benefitRules?.childAllowance ?? DEFAULT_FIXED_BENEFIT_RULES),
      marriageAllowance: normalizeBenefitState(draft.benefits?.marriageAllowance, baseSettings.benefits.marriageAllowance, baseSettings.benefitRules?.marriageAllowance ?? DEFAULT_FIXED_BENEFIT_RULES),
      seniorityAllowance: normalizeBenefitState(draft.benefits?.seniorityAllowance, baseSettings.benefits.seniorityAllowance, baseSettings.benefitRules?.seniorityAllowance ?? DEFAULT_SENIORITY_BENEFIT_RULES),
    },
    benefitsEnd: draft.benefitsEnd,
    variablePayments: draft.variablePayments,
    paymentSchedule: normalizePaymentSchedule(draft.paymentSchedule ?? draft.paymentType, DEFAULT_PAYMENT_SCHEDULE),
    paymentType: toLegacyPaymentType(normalizePaymentSchedule(draft.paymentSchedule ?? draft.paymentType, DEFAULT_PAYMENT_SCHEDULE)),
    workTimePayRules: normalizeWorkTimePayRules(
      draft.workTimePayRules ?? draft.templateSnapshot?.workTimePayRules ?? baseSettings.workTimePayRules,
      baseSettings.workTimePayRules,
    ),
    leave: normalizeLeaveSettings(draft.leave ?? draft.templateSnapshot?.leave ?? baseSettings.leave, baseSettings.leave),
    mission: normalizeMissionSettings(draft.mission ?? draft.templateSnapshot?.mission, {
      enabled: true,
      rules: [
        { id: 'mission-with-stay', title: 'ماموریت با اقامتگاه', coefficient: baseSettings.workTimePayRules.mission.coefficient, paymentBase: 'base_salary', active: true },
        { id: 'mission-without-stay', title: 'ماموریت بدون اقامتگاه', coefficient: baseSettings.workTimePayRules.mission.coefficient, paymentBase: 'base_salary', active: true },
      ],
    }),
    specialCommitments: draft.specialCommitments ?? draft.templateSnapshot?.specialCommitments ?? { selected: [], attachments: [] },
    attachments: draft.attachments ?? draft.templateSnapshot?.attachments ?? { requiredDocuments: {}, files: [] },
    progress: normalizeEmployeeProgress(steps, draft.progress),
  };
}

export function createInitialEmployeeContractDraft({
  employeeId,
  employeeName,
  usageType,
  drafts,
  businessProfile,
  template,
  baseSettings,
  comparisonBaseSnapshot,
  comparisonBaseSettingsId,
  comparisonBaseYear,
  supplemental,
  contractNumberOverride,
}: {
  employeeId: string;
  employeeName: string;
  usageType: EmployeeContractDraftUsageType;
  drafts: EmployeeContractDraft[];
  businessProfile?: {
    brandName?: string | null;
    legalName?: string | null;
    contactEmail?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  template?: ContractDraftTemplate | null;
  baseSettings?: PayrollSettings | null;
  comparisonBaseSnapshot?: EmployeeDraftTemplateSnapshot | null;
  comparisonBaseSettingsId?: string | null;
  comparisonBaseYear?: number | null;
  supplemental?: EmployeeSupplementalProfile | null;
  contractNumberOverride?: string | null;
}): EmployeeContractDraft {
  const resolvedBase = baseSettings ? normalizePayrollSettings(baseSettings) : DEFAULT_PAYROLL_SETTINGS;
  const templateSnapshot = template ? buildTemplateSnapshot(template, resolvedBase) : null;
  const valueSource = templateSnapshot ?? comparisonBaseSnapshot ?? null;
  const steps = getEmployeeDraftSteps(usageType).map((item) => item.id);
  const progress = buildProgress(steps, steps[0]);
  const now = new Date();
  const registrationNumber = contractNumberOverride?.trim() ?? '';

  return {
    id: `employee-contract-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    employeeId,
    employeeName,
    usageType,
    status: 'draft',
    templateId: template?.id ?? null,
    templateName: template?.name ?? null,
    templateSnapshot,
    comparisonBaseSettingsId: comparisonBaseSettingsId ?? null,
    comparisonBaseYear: comparisonBaseYear ?? comparisonBaseSnapshot?.baseSettingsYear ?? null,
    comparisonBaseSettingsSnapshot: comparisonBaseSnapshot ?? null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    contractNumber: registrationNumber,
    parties: {
      employerName: businessProfile?.brandName?.trim() || businessProfile?.legalName?.trim() || '',
      employerNationalId: '',
      employerEconomicCode: '',
      legalRepresentative: '',
    },
    employeeSupplemental: supplemental ?? getDefaultEmployeeSupplementalProfile(),
    timing: {
      contractDate: now.toISOString().slice(0, 10),
      registrationNumber,
      startDate: now.toISOString().slice(0, 10),
      endDate: toMonthOffset(now, 12),
      durationMonths: 12,
    },
    subject: {
      contractType: valueSource?.classification.contractType ?? '',
      contractSubType: '',
      jobGroup: '',
      responsibility: '',
      responsibilities: [],
      locationGroup: valueSource?.classification.locationGroup ?? '',
      locationType: '',
    },
    financial: {
      dailyRequiredMinutes: valueSource?.financial.dailyRequiredMinutes ?? resolvedBase.financial.dailyRequiredMinutes,
      dailyBaseSalary: valueSource?.financial.dailyBaseSalary ?? resolvedBase.financial.dailyBaseSalary,
    },
    insuranceTax: {
      insuranceEnabled: valueSource?.insuranceTax.insuranceEnabled ?? false,
      employerInsurancePercent: valueSource?.insuranceTax.employerInsurancePercent ?? resolvedBase.deductions.employerInsurancePercent,
      employeeInsurancePercent: valueSource?.insuranceTax.employeeInsurancePercent ?? resolvedBase.deductions.employeeInsurancePercent,
      taxEnabled: valueSource?.insuranceTax.taxEnabled ?? false,
      taxPayer: valueSource?.insuranceTax.taxPayer ?? 'employee',
      taxBrackets: valueSource?.insuranceTax.taxBrackets.map((item) => ({ ...item })) ?? resolvedBase.deductions.taxBrackets.map((item) => ({ ...item })),
    },
    benefits: {
      workerAllowance: { enabled: true, amount: valueSource?.benefits.workerAllowance ?? resolvedBase.benefits.workerAllowance, calculationRules: { ...(valueSource?.benefitRules?.workerAllowance ?? resolvedBase.benefitRules?.workerAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
      housingAllowance: { enabled: true, amount: valueSource?.benefits.housingAllowance ?? resolvedBase.benefits.housingAllowance, calculationRules: { ...(valueSource?.benefitRules?.housingAllowance ?? resolvedBase.benefitRules?.housingAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
      childAllowance: { enabled: true, amount: valueSource?.benefits.childAllowance ?? resolvedBase.benefits.childAllowance, calculationRules: { ...(valueSource?.benefitRules?.childAllowance ?? resolvedBase.benefitRules?.childAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
      marriageAllowance: { enabled: true, amount: valueSource?.benefits.marriageAllowance ?? resolvedBase.benefits.marriageAllowance, calculationRules: { ...(valueSource?.benefitRules?.marriageAllowance ?? resolvedBase.benefitRules?.marriageAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
      seniorityAllowance: { enabled: true, amount: valueSource?.benefits.seniorityAllowance ?? resolvedBase.benefits.seniorityAllowance, calculationRules: { ...(valueSource?.benefitRules?.seniorityAllowance ?? resolvedBase.benefitRules?.seniorityAllowance ?? DEFAULT_SENIORITY_BENEFIT_RULES) } },
    },
    benefitsEnd: valueSource?.benefitsEnd,
    variablePayments: valueSource?.variablePayments,
    paymentSchedule: valueSource?.paymentSchedule ?? normalizePaymentSchedule(valueSource?.paymentType, DEFAULT_PAYMENT_SCHEDULE),
    paymentType: valueSource?.paymentType ?? toLegacyPaymentType(valueSource?.paymentSchedule ?? DEFAULT_PAYMENT_SCHEDULE),
    workTimePayRules: normalizeWorkTimePayRules(valueSource?.workTimePayRules ?? resolvedBase.workTimePayRules, resolvedBase.workTimePayRules),
    leave: normalizeLeaveSettings(valueSource?.leave ?? resolvedBase.leave, resolvedBase.leave),
    mission: valueSource?.mission ?? normalizeMissionSettings(undefined, {
      enabled: true,
      rules: [
        { id: 'mission-with-stay', title: 'ماموریت با اقامتگاه', coefficient: resolvedBase.workTimePayRules.mission.coefficient, paymentBase: 'base_salary', active: true },
        { id: 'mission-without-stay', title: 'ماموریت بدون اقامتگاه', coefficient: resolvedBase.workTimePayRules.mission.coefficient, paymentBase: 'base_salary', active: true },
      ],
    }),
    specialCommitments: valueSource?.specialCommitments ?? { selected: [], attachments: [] },
    attachments: valueSource?.attachments ?? { requiredDocuments: {}, files: [] },
    progress,
  };
}

export function updateEmployeeDraftProgress(
  draft: EmployeeContractDraft,
  patch: Partial<EmployeeDraftProgress>,
  activeStep: EmployeeContractDraftStepId,
): EmployeeContractDraft {
  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    progress: {
      ...draft.progress,
      ...patch,
      [activeStep]: {
        ...(draft.progress[activeStep] ?? { opened: true, completed: false, dirty: false, saved: false }),
        ...(patch[activeStep] ?? {}),
      },
    },
  };
}

export function getEmployeeDraftsByEmployeeId(drafts: EmployeeContractDraft[], employeeId: string) {
  return drafts.filter((draft) => draft.employeeId === employeeId).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function findEmployeeDraft(drafts: EmployeeContractDraft[], employeeId: string, draftId: string) {
  return drafts.find((draft) => draft.employeeId === employeeId && draft.id === draftId) ?? null;
}
