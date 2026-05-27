import {
  DEFAULT_PAYROLL_SETTINGS,
  type PayrollSettings,
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
};

export type VariableTemplateItem = {
  id: string;
  title: string;
  type: 'addition' | 'deduction';
  method: 'fixed' | 'percentage';
  amount: number;
  percent: number;
  base: 'baseSalary' | 'grossPay';
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
      workLocationCategories: string[];
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
    paymentType: {
      type: string;
    };
    workTimePayRules: PayrollSettings['workTimePayRules'];
    leave: PayrollSettings['leave'];
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
        workLocationCategories: [],
      },
      attendanceBase: {
        monthlyOvertimeLimitHours: baseSettings.workTimePayRules.overtime.dailyLimitHours * 28,
        monthlyLeaveQuotaHours: baseSettings.leave.monthlyQuotaHours,
        annualLeaveTransfer: { ...baseSettings.leave.transferLimits.annual },
      },
      payrollBase: {
        dailyRequiredMinutes: baseSettings.financial.dailyRequiredMinutes,
        dailyBaseSalary: baseSettings.financial.dailyBaseSalary,
        insuranceEnabled: baseSettings.deductions.employeeInsurancePercent > 0,
        taxEnabled: baseSettings.deductions.taxBrackets.length > 0,
        taxPayer: 'employee',
      },
      benefits: {
        workerAllowance: { enabled: true, amount: baseSettings.benefits.workerAllowance },
        housingAllowance: { enabled: true, amount: baseSettings.benefits.housingAllowance },
        childAllowance: { enabled: true, amount: baseSettings.benefits.childAllowance },
        marriageAllowance: { enabled: true, amount: baseSettings.benefits.marriageAllowance },
        seniorityAllowance: { enabled: true, amount: baseSettings.benefits.seniorityAllowance },
        eidBonus: { enabled: true, amount: baseSettings.benefits.eidBonus },
        severancePaymentMethod: 'end_of_work',
        finalSettlementEnabled: true,
      },
      variablePayments: {
        enabled: false,
        additions: [],
        deductions: [],
      },
      paymentType: {
        type: '',
      },
      workTimePayRules: baseSettings.workTimePayRules,
      leave: baseSettings.leave,
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
  return {
    ...template,
    status: 'draft',
    stepsProgress: template.stepsProgress ?? createInitialTemplateProgress(template.usageType),
    data: {
      ...createContractDraftTemplate({
        name: template.name,
        usageType: template.usageType,
        baseSettingsYear: template.baseSettingsYear,
        baseSettings: DEFAULT_PAYROLL_SETTINGS,
      }).data,
      ...template.data,
    },
  };
}
