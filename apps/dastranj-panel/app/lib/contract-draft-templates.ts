import {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_FIXED_BENEFIT_RULES,
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  DEFAULT_MISSION_SETTINGS,
  DEFAULT_PAYMENT_SCHEDULE,
  normalizeCalculationRules,
  normalizeLeaveSettings,
  normalizeMissionSettings,
  normalizePaymentSchedule,
  normalizeWorkTimePayRules,
  type CalculationRules,
  type MissionSettings,
  type PaymentSchedule,
  type PayrollSettings,
  getActiveTenantStorageId,
} from './payroll-business-settings';

export type ContractDraftTemplateUsageType = 'attendance_only' | 'payroll_attendance';

export type ContractDraftTemplateStepId =
  | 'attendanceBase'
  | 'classification'
  | 'payrollBase'
  | 'benefits'
  | 'variablePayments'
  | 'paymentType'
  | 'workTimePayRules'
  | 'leave'
  | 'mission'
  | 'specialCommitments'
  | 'attachments';

export type ContractDraftTemplateProgress = {
  openedStepIds: ContractDraftTemplateStepId[];
  completedStepIds: ContractDraftTemplateStepId[];
  currentStepId: ContractDraftTemplateStepId;
  dirtyStepIds: ContractDraftTemplateStepId[];
  savedStepIds: ContractDraftTemplateStepId[];
};

export type BenefitTemplateItem = {
  enabled: boolean;
  amount: number;
  calculationRules: CalculationRules;
};

export type VariableTemplateItem = {
  id: string;
  title: string;
  type: 'addition' | 'deduction';
  method: 'fixed' | 'percentage';
  amount: number;
  percent: number;
  base: 'baseSalary' | 'grossPay';
  calculationRules: CalculationRules;
};

export type ContractDraftTemplate = {
  id: string;
  name: string;
  usageType: ContractDraftTemplateUsageType;
  baseSettingsYear: number;
  baseSettingsId: string;
  status: 'draft';
  createdAt: string;
  updatedAt: string;
  stepsProgress: ContractDraftTemplateProgress;
  data: {
    classification: {
      contractType: string;
      contractSubType: string;
      workLocationCategories: string[];
      workLocationSubCategory: string;
    };
    attendanceBase: {
      monthlyOvertimeLimitHours: number;
      monthlyLeaveQuotaHours: number;
      annualLeaveTransfer: { enabled: boolean; hours: number | null };
    };
    payrollBase: {
      dailyRequiredMinutes: number;
      dailyBaseSalary: number;
      insuranceEnabled: boolean;
      employerInsurancePercent: number;
      employeeInsurancePercent: number;
      taxEnabled: boolean;
      taxPayer: 'employee' | 'employer';
    };
    benefits: {
      workerAllowance: BenefitTemplateItem;
      housingAllowance: BenefitTemplateItem;
      childAllowance: BenefitTemplateItem;
      marriageAllowance: BenefitTemplateItem;
      seniorityAllowance: BenefitTemplateItem;
      eidBonus: BenefitTemplateItem;
      severancePaymentMethod: 'end_of_work' | 'periodic';
      finalSettlementEnabled: boolean;
    };
    variablePayments: {
      enabled: boolean;
      additions: VariableTemplateItem[];
      deductions: VariableTemplateItem[];
    };
    paymentSchedule: PaymentSchedule;
    paymentType: {
      type: string;
    };
    workTimePayRules: PayrollSettings['workTimePayRules'];
    leave: PayrollSettings['leave'];
    mission: MissionSettings;
    specialCommitments: {
      selected: string[];
      uploadedSamples: string[];
    };
    attachments: {
      requiredDocuments: Record<string, string[]>;
    };
  };
};

export const CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY = 'dastranj-contract-draft-templates-v1';
export const ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY = 'dastranj-active-contract-draft-template-v1';

function scopeStorageKey(key: string, tenantId?: string | null) {
  const scope = tenantId ?? getActiveTenantStorageId();
  return scope ? `${key}:${scope}` : key;
}

export function getContractDraftTemplatesStorageKey(tenantId?: string | null) {
  return scopeStorageKey(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY, tenantId);
}

export function getActiveContractDraftTemplateStorageKey(tenantId?: string | null) {
  return scopeStorageKey(ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY, tenantId);
}

export const ATTENDANCE_TEMPLATE_STEPS: Array<{ id: ContractDraftTemplateStepId; title: string; detail: string }> = [
  { id: 'attendanceBase', title: 'اطلاعات پایه تردد', detail: 'سقف‌ها، سهمیه‌ها و انتقال استحقاقی' },
  { id: 'classification', title: 'نوع قرارداد و محل کار', detail: 'طبقه‌بندی همکاری و محل کار' },
  { id: 'workTimePayRules', title: 'پرداخت زمان کاری', detail: 'اضافه‌کاری، شیفت شب و ضرایب تردد' },
  { id: 'leave', title: 'مرخصی', detail: 'انتقال و تسویه استحقاقی سالانه' },
  { id: 'specialCommitments', title: 'تعهدات خاص قرارداد', detail: 'بندهای پیشنهادی حقوقی' },
  { id: 'attachments', title: 'پیوست‌ها و مدارک', detail: 'الزامی برای عقد قرارداد' },
];

export const PAYROLL_TEMPLATE_STEPS: Array<{ id: ContractDraftTemplateStepId; title: string; detail: string }> = [
  { id: 'classification', title: 'نوع قرارداد و محل کار', detail: 'طبقه‌بندی همکاری و محل کار' },
  { id: 'payrollBase', title: 'اطلاعات پایه حقوقی', detail: 'مزد، موظفی، بیمه و مالیات' },
  { id: 'benefits', title: 'مزایا', detail: 'مزایای ماهانه و پایان سال' },
  { id: 'variablePayments', title: 'پرداخت‌های متغیر', detail: 'اضافات و کسورات اختیاری' },
  { id: 'paymentType', title: 'نوع پرداخت حقوق', detail: 'چرخه و روش دستمزد' },
  { id: 'workTimePayRules', title: 'پرداخت زمان کاری', detail: 'ضرایب و بازه‌های تردد' },
  { id: 'leave', title: 'مرخصی', detail: 'انتقال، تسویه و تنظیمات استحقاقی' },
  { id: 'mission', title: 'ماموریت', detail: 'قوانین پرداخت ماموریت' },
  { id: 'specialCommitments', title: 'تعهدات خاص قرارداد', detail: 'بندهای پیشنهادی حقوقی' },
  { id: 'attachments', title: 'پیوست‌ها و مدارک', detail: 'الزامی برای عقد قرارداد' },
];

export function getTemplateSteps(usageType: ContractDraftTemplateUsageType) {
  return usageType === 'attendance_only' ? ATTENDANCE_TEMPLATE_STEPS : PAYROLL_TEMPLATE_STEPS;
}

export function createInitialTemplateProgress(usageType: ContractDraftTemplateUsageType): ContractDraftTemplateProgress {
  const firstStep = getTemplateSteps(usageType)[0].id;
  return {
    openedStepIds: [firstStep],
    completedStepIds: [],
    currentStepId: firstStep,
    dirtyStepIds: [],
    savedStepIds: [],
  };
}

export function createContractDraftTemplate({
  name,
  usageType,
  baseSettingsYear,
  baseSettings,
}: {
  name: string;
  usageType: ContractDraftTemplateUsageType;
  baseSettingsYear: number;
  baseSettings: PayrollSettings;
}): ContractDraftTemplate {
  const now = new Date().toISOString();
  return {
    id: `contract-template-${Date.now()}`,
    name,
    usageType,
    baseSettingsYear,
    baseSettingsId: `year-${baseSettingsYear}`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    stepsProgress: createInitialTemplateProgress(usageType),
    data: {
      classification: {
        contractType: '',
        contractSubType: '',
        workLocationCategories: [],
        workLocationSubCategory: '',
      },
      attendanceBase: {
        monthlyOvertimeLimitHours: baseSettings.workTimePayRules.overtime.dailyLimitHours * 28,
        monthlyLeaveQuotaHours: baseSettings.leave.monthlyQuotaHours,
        annualLeaveTransfer: {
          enabled: baseSettings.leave.transferPolicy.mode === 'carry_forward' && baseSettings.leave.transferPolicy.limits.annual.enabled,
          hours: baseSettings.leave.transferPolicy.mode === 'carry_forward' ? baseSettings.leave.transferPolicy.limits.annual.maxHours : null,
        },
      },
      payrollBase: {
        dailyRequiredMinutes: baseSettings.financial.dailyRequiredMinutes,
        dailyBaseSalary: baseSettings.financial.dailyBaseSalary,
        insuranceEnabled: baseSettings.deductions.employeeInsurancePercent > 0,
        employerInsurancePercent: baseSettings.deductions.employerInsurancePercent,
        employeeInsurancePercent: baseSettings.deductions.employeeInsurancePercent,
        taxEnabled: baseSettings.deductions.taxBrackets.length > 0,
        taxPayer: 'employee',
      },
      benefits: {
        workerAllowance: { enabled: true, amount: baseSettings.benefits.workerAllowance, calculationRules: { ...(baseSettings.benefitRules?.workerAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
        housingAllowance: { enabled: true, amount: baseSettings.benefits.housingAllowance, calculationRules: { ...(baseSettings.benefitRules?.housingAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
        childAllowance: { enabled: true, amount: baseSettings.benefits.childAllowance, calculationRules: { ...(baseSettings.benefitRules?.childAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
        marriageAllowance: { enabled: true, amount: baseSettings.benefits.marriageAllowance, calculationRules: { ...(baseSettings.benefitRules?.marriageAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
        seniorityAllowance: { enabled: true, amount: baseSettings.benefits.seniorityAllowance, calculationRules: { ...(baseSettings.benefitRules?.seniorityAllowance ?? DEFAULT_FIXED_BENEFIT_RULES) } },
        eidBonus: { enabled: true, amount: baseSettings.benefits.eidBonus, calculationRules: { ...(baseSettings.benefitRules?.eidBonus ?? DEFAULT_FIXED_BENEFIT_RULES) } },
        severancePaymentMethod: 'end_of_work',
        finalSettlementEnabled: true,
      },
      variablePayments: {
        enabled: false,
        additions: [],
        deductions: [],
      },
      paymentSchedule: { ...DEFAULT_PAYMENT_SCHEDULE },
      paymentType: {
        type: 'پرداخت بر اساس دوره‌های زمانی',
      },
      workTimePayRules: normalizeWorkTimePayRules(baseSettings.workTimePayRules, baseSettings.workTimePayRules),
      leave: baseSettings.leave,
      mission: normalizeMissionSettings(baseSettings.mission, DEFAULT_MISSION_SETTINGS),
      specialCommitments: {
        selected: [],
        uploadedSamples: [],
      },
      attachments: {
        requiredDocuments: {},
      },
    },
  };
}

export function normalizeContractDraftTemplate(value: unknown): ContractDraftTemplate | null {
  if (!value || typeof value !== 'object') return null;
  const template = value as ContractDraftTemplate;
  if (!template.id || !template.name || !template.usageType) return null;
  const defaults = createContractDraftTemplate({
    name: template.name,
    usageType: template.usageType,
    baseSettingsYear: template.baseSettingsYear,
    baseSettings: DEFAULT_PAYROLL_SETTINGS,
  }).data;

  // Normalize benefit calculationRules with safe defaults
  const normalizeBenefit = (raw: unknown, defaultRules: CalculationRules): BenefitTemplateItem => {
    const src = raw && typeof raw === 'object' ? raw as Partial<BenefitTemplateItem> : {};
    return {
      enabled: typeof src.enabled === 'boolean' ? src.enabled : true,
      amount: Number.isFinite(src.amount) ? Number(src.amount) : 0,
      calculationRules: normalizeCalculationRules(src.calculationRules, defaultRules),
    };
  };

  const normalizeVariableItem = (raw: unknown): VariableTemplateItem | null => {
    if (!raw || typeof raw !== 'object') return null;
    const src = raw as Partial<VariableTemplateItem>;
    if (!src.id) return null;
    const type = src.type === 'deduction' ? 'deduction' : 'addition';
    return {
      id: src.id,
      title: src.title ?? '',
      type,
      method: src.method === 'percentage' ? 'percentage' : 'fixed',
      amount: Number.isFinite(src.amount) ? Number(src.amount) : 0,
      percent: Number.isFinite(src.percent) ? Number(src.percent) : 0,
      base: src.base === 'grossPay' ? 'grossPay' : 'baseSalary',
      calculationRules: normalizeCalculationRules(
        src.calculationRules,
        type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES,
      ),
    };
  };

  const rawBenefits = template.data?.benefits as Record<string, unknown> | undefined;
  const normalizedBenefits = {
    workerAllowance: normalizeBenefit(rawBenefits?.workerAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    housingAllowance: normalizeBenefit(rawBenefits?.housingAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    childAllowance: normalizeBenefit(rawBenefits?.childAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    marriageAllowance: normalizeBenefit(rawBenefits?.marriageAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    seniorityAllowance: normalizeBenefit(rawBenefits?.seniorityAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    eidBonus: normalizeBenefit(rawBenefits?.eidBonus, DEFAULT_FIXED_BENEFIT_RULES),
    severancePaymentMethod: (rawBenefits?.severancePaymentMethod as 'end_of_work' | 'periodic') ?? 'end_of_work',
    finalSettlementEnabled: typeof rawBenefits?.finalSettlementEnabled === 'boolean' ? rawBenefits.finalSettlementEnabled : true,
  };

  const rawVP = template.data?.variablePayments as { enabled?: boolean; additions?: unknown[]; deductions?: unknown[] } | undefined;
  const normalizedVariablePayments = {
    enabled: typeof rawVP?.enabled === 'boolean' ? rawVP.enabled : false,
    additions: Array.isArray(rawVP?.additions) ? rawVP.additions.map(normalizeVariableItem).filter(Boolean) as VariableTemplateItem[] : [],
    deductions: Array.isArray(rawVP?.deductions) ? rawVP.deductions.map(normalizeVariableItem).filter(Boolean) as VariableTemplateItem[] : [],
  };
  const paymentSchedule = normalizePaymentSchedule(
    template.data?.paymentSchedule ?? (template.data as { paymentType?: unknown } | undefined)?.paymentType,
    DEFAULT_PAYMENT_SCHEDULE,
  );
  const workTimePayRules = normalizeWorkTimePayRules(
    template.data?.workTimePayRules,
    defaults.workTimePayRules,
  );

  return {
    ...template,
    status: 'draft',
    stepsProgress: template.stepsProgress ?? createInitialTemplateProgress(template.usageType),
    data: {
      ...defaults,
      ...template.data,
      classification: {
        ...defaults.classification,
        ...template.data?.classification,
      },
      payrollBase: {
        ...defaults.payrollBase,
        ...template.data?.payrollBase,
      },
      benefits: normalizedBenefits,
      variablePayments: normalizedVariablePayments,
      paymentSchedule,
      leave: normalizeLeaveSettings(template.data?.leave, defaults.leave),
      workTimePayRules,
      paymentType: {
        type:
          paymentSchedule.type === 'job_activity'
            ? 'پرداخت بر اساس نوع شغل و فعالیت'
            : paymentSchedule.type === 'hybrid_special'
              ? 'پرداخت ترکیبی و روش‌های خاص'
              : 'پرداخت بر اساس دوره‌های زمانی',
      },
      mission: normalizeMissionSettings(template.data?.mission, defaults.mission),
    },
  };
}
