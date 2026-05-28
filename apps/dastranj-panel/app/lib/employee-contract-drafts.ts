import { DEFAULT_PAYROLL_SETTINGS, normalizePayrollSettings, type PayrollSettings, type TaxBracket } from './payroll-business-settings';
import type { ContractDraftTemplate, ContractDraftTemplateUsageType } from './contract-draft-templates';
import { getPayrollSettingsStorageKey } from './payroll-business-settings';

export type EmployeeContractDraftUsageType = ContractDraftTemplateUsageType;

export type EmployeeContractDraftStepId =
  | 'parties'
  | 'timing'
  | 'subject'
  | 'financial'
  | 'insuranceTax'
  | 'benefits'
  | 'workTimePayRules'
  | 'leave'
  | 'future';

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
};

export type EmployeeSupplementalProfile = {
  fatherName: string;
  birthDate: string;
  issuePlace: string;
  gender: '' | 'male' | 'female' | 'other';
  educationField: string;
  educationDegree: string;
  jobTitle: string;
  firstContractDate: string;
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
  status: 'draft' | 'in_progress' | 'completed';
  templateId: string | null;
  templateName: string | null;
  templateSnapshot: EmployeeDraftTemplateSnapshot | null;
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
    { enabled: boolean; amount: number }
  >;
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

export const EMPLOYEE_BENEFIT_KEYS = ['workerAllowance', 'housingAllowance', 'childAllowance', 'marriageAllowance', 'seniorityAllowance'] as const;

export const EMPLOYEE_CONTRACT_DRAFT_STEPS: Record<EmployeeContractDraftUsageType, EmployeeContractDraftStep[]> = {
  attendance_only: [
    { id: 'parties', title: 'مشخصات طرفین قرارداد', detail: 'کارفرما و کارمند', implemented: true },
    { id: 'timing', title: 'مشخصات زمانی و ثبت قرارداد', detail: 'تاریخ‌ها و شماره ثبت', implemented: true },
    { id: 'subject', title: 'موضوع قرارداد', detail: 'نوع همکاری و محل کار', implemented: true },
    { id: 'financial', title: 'اطلاعات مالی تردد', detail: 'دقایق موظفی روزانه', implemented: true },
    { id: 'workTimePayRules', title: 'پرداخت زمان کاری', detail: 'در ادامه تکمیل می‌شود', implemented: false },
    { id: 'leave', title: 'مرخصی', detail: 'در ادامه تکمیل می‌شود', implemented: false },
    { id: 'future', title: 'سایر مراحل', detail: 'در ادامه تکمیل می‌شود', implemented: false },
  ],
  payroll_attendance: [
    { id: 'parties', title: 'مشخصات طرفین قرارداد', detail: 'کارفرما و کارمند', implemented: true },
    { id: 'timing', title: 'مشخصات زمانی و ثبت قرارداد', detail: 'تاریخ‌ها و شماره ثبت', implemented: true },
    { id: 'subject', title: 'موضوع قرارداد', detail: 'نوع همکاری و محل کار', implemented: true },
    { id: 'financial', title: 'اطلاعات مالی قرارداد', detail: 'حقوق، دقایق موظفی و مبنا', implemented: true },
    { id: 'insuranceTax', title: 'بیمه و مالیات', detail: 'تعهدات بیمه‌ای و مالیاتی', implemented: true },
    { id: 'benefits', title: 'مزایای پایه و مستمر', detail: 'مزایای ثابت و قانونی', implemented: true },
    { id: 'future', title: 'سایر مراحل', detail: 'در ادامه تکمیل می‌شود', implemented: false },
  ],
};

function buildProgress(stepIds: EmployeeContractDraftStepId[], currentStepId: EmployeeContractDraftStepId): EmployeeDraftProgress {
  const initial = Object.fromEntries(
    Object.values(['parties', 'timing', 'subject', 'financial', 'insuranceTax', 'benefits', 'workTimePayRules', 'leave', 'future'] as EmployeeContractDraftStepId[]).map((stepId) => [
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
  return EMPLOYEE_CONTRACT_DRAFT_STEPS[usageType];
}

export function getEmployeeDraftStorageKey() {
  return EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY;
}

export function getEmployeeSupplementalStorageKey() {
  return EMPLOYEE_SUPPLEMENTAL_PROFILE_STORAGE_KEY;
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

export function normalizeEmployeeSupplementalProfile(value: unknown): EmployeeSupplementalProfile {
  const source = value && typeof value === 'object' ? (value as Partial<EmployeeSupplementalProfile>) : {};
  return {
    fatherName: source.fatherName ?? '',
    birthDate: source.birthDate ?? '',
    issuePlace: source.issuePlace ?? '',
    gender: source.gender ?? '',
    educationField: source.educationField ?? '',
    educationDegree: source.educationDegree ?? '',
    jobTitle: source.jobTitle ?? '',
    firstContractDate: source.firstContractDate ?? '',
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
  };
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

function createUniqueContractNumber(drafts: EmployeeContractDraft[]) {
  const year = new Date().getFullYear();
  const nextIndex = drafts.filter((draft) => draft.contractNumber.startsWith(`CN-${year}-`)).length + 1;
  return `CN-${year}-${String(nextIndex).padStart(3, '0')}`;
}

export function buildTemplateSnapshot(
  template: ContractDraftTemplate,
  baseSettings: PayrollSettings = DEFAULT_PAYROLL_SETTINGS,
): EmployeeDraftTemplateSnapshot {
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
      employerInsurancePercent: baseSettings.deductions.employerInsurancePercent,
      employeeInsurancePercent: baseSettings.deductions.employeeInsurancePercent,
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
  };
}

function normalizeBenefitState(value: unknown, fallbackAmount: number) {
  const source = value && typeof value === 'object' ? (value as Partial<{ enabled: boolean; amount: number }>) : {};
  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : true,
    amount: Number.isFinite(source.amount) ? Number(source.amount) : fallbackAmount,
  };
}

export function normalizeEmployeeContractDraft(value: unknown): EmployeeContractDraft | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<EmployeeContractDraft>;
  if (!draft.id || !draft.employeeId || !draft.employeeName || !draft.usageType) return null;
  const usageType = draft.usageType as EmployeeContractDraftUsageType;
  const steps = getEmployeeDraftSteps(usageType).map((item) => item.id);
  const defaultProgress = buildProgress(steps, steps[0]);
  const baseSettings = DEFAULT_PAYROLL_SETTINGS;
  return {
    id: draft.id,
    employeeId: draft.employeeId,
    employeeName: draft.employeeName,
    usageType,
    status: draft.status ?? 'draft',
    templateId: draft.templateId ?? null,
    templateName: draft.templateName ?? null,
    templateSnapshot: draft.templateSnapshot ?? null,
    createdAt: draft.createdAt ?? new Date().toISOString(),
    updatedAt: draft.updatedAt ?? draft.createdAt ?? new Date().toISOString(),
    contractNumber: draft.contractNumber ?? createUniqueContractNumber([]),
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
      responsibility: draft.subject?.responsibility ?? '',
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
      workerAllowance: normalizeBenefitState(draft.benefits?.workerAllowance, baseSettings.benefits.workerAllowance),
      housingAllowance: normalizeBenefitState(draft.benefits?.housingAllowance, baseSettings.benefits.housingAllowance),
      childAllowance: normalizeBenefitState(draft.benefits?.childAllowance, baseSettings.benefits.childAllowance),
      marriageAllowance: normalizeBenefitState(draft.benefits?.marriageAllowance, baseSettings.benefits.marriageAllowance),
      seniorityAllowance: normalizeBenefitState(draft.benefits?.seniorityAllowance, baseSettings.benefits.seniorityAllowance),
    },
    progress: draft.progress ?? defaultProgress,
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
  supplemental,
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
  supplemental?: EmployeeSupplementalProfile | null;
}): EmployeeContractDraft {
  const resolvedBase = baseSettings ? normalizePayrollSettings(baseSettings) : DEFAULT_PAYROLL_SETTINGS;
  const snapshot = template ? buildTemplateSnapshot(template, resolvedBase) : null;
  const steps = getEmployeeDraftSteps(usageType).map((item) => item.id);
  const progress = buildProgress(steps, steps[0]);
  const now = new Date();
  const registrationNumber = createUniqueContractNumber(drafts);

  return {
    id: `employee-contract-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    employeeId,
    employeeName,
    usageType,
    status: 'draft',
    templateId: template?.id ?? null,
    templateName: template?.name ?? null,
    templateSnapshot: snapshot,
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
      contractType: snapshot?.classification.contractType ?? '',
      contractSubType: '',
      jobGroup: '',
      responsibility: '',
      locationGroup: snapshot?.classification.locationGroup ?? '',
      locationType: '',
    },
    financial: {
      dailyRequiredMinutes: snapshot?.financial.dailyRequiredMinutes ?? resolvedBase.financial.dailyRequiredMinutes,
      dailyBaseSalary: snapshot?.financial.dailyBaseSalary ?? resolvedBase.financial.dailyBaseSalary,
    },
    insuranceTax: {
      insuranceEnabled: snapshot?.insuranceTax.insuranceEnabled ?? false,
      employerInsurancePercent: snapshot?.insuranceTax.employerInsurancePercent ?? resolvedBase.deductions.employerInsurancePercent,
      employeeInsurancePercent: snapshot?.insuranceTax.employeeInsurancePercent ?? resolvedBase.deductions.employeeInsurancePercent,
      taxEnabled: snapshot?.insuranceTax.taxEnabled ?? false,
      taxPayer: snapshot?.insuranceTax.taxPayer ?? 'employee',
      taxBrackets: snapshot?.insuranceTax.taxBrackets.map((item) => ({ ...item })) ?? resolvedBase.deductions.taxBrackets.map((item) => ({ ...item })),
    },
    benefits: {
      workerAllowance: { enabled: true, amount: snapshot?.benefits.workerAllowance ?? resolvedBase.benefits.workerAllowance },
      housingAllowance: { enabled: true, amount: snapshot?.benefits.housingAllowance ?? resolvedBase.benefits.housingAllowance },
      childAllowance: { enabled: true, amount: snapshot?.benefits.childAllowance ?? resolvedBase.benefits.childAllowance },
      marriageAllowance: { enabled: true, amount: snapshot?.benefits.marriageAllowance ?? resolvedBase.benefits.marriageAllowance },
      seniorityAllowance: { enabled: true, amount: snapshot?.benefits.seniorityAllowance ?? resolvedBase.benefits.seniorityAllowance },
    },
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

export function persistEmployeeDrafts(drafts: EmployeeContractDraft[]) {
  window.localStorage.setItem(EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

export function readEmployeeDrafts() {
  return getEmployeeDraftsFromStorage(window.localStorage.getItem(EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY));
}

export function readEmployeeSupplementalProfiles(): Record<string, EmployeeSupplementalProfile> {
  const raw = window.localStorage.getItem(EMPLOYEE_SUPPLEMENTAL_PROFILE_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, EmployeeSupplementalProfile>>((result, [key, value]) => {
      result[key] = normalizeEmployeeSupplementalProfile(value);
      return result;
    }, {});
  } catch {
    window.localStorage.removeItem(EMPLOYEE_SUPPLEMENTAL_PROFILE_STORAGE_KEY);
    return {};
  }
}

export function persistEmployeeSupplementalProfiles(profiles: Record<string, EmployeeSupplementalProfile>) {
  window.localStorage.setItem(EMPLOYEE_SUPPLEMENTAL_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

export function readBaseSettingsByTemplate(template: ContractDraftTemplate | null | undefined) {
  if (!template) return DEFAULT_PAYROLL_SETTINGS;
  const raw = window.localStorage.getItem(getPayrollSettingsStorageKey(template.baseSettingsYear));
  if (!raw) return DEFAULT_PAYROLL_SETTINGS;
  try {
    return normalizePayrollSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_PAYROLL_SETTINGS;
  }
}
