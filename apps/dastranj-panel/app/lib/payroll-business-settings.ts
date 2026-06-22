export type PayrollStepId =
  | 'financial'
  | 'deductions'
  | 'benefits'
  | 'variableAmounts'
  | 'paymentType'
  | 'overtime'
  | 'leave'
  | 'mission';

export type PayrollSettingsMode = 'admin' | 'tenant';
export type CoefficientCombinationMethod =
  | 'highest_only'
  | 'additive_percentage'
  | 'multiply_coefficients'
  | 'separate_premium_sum';
export type CoefficientExceptionMethod =
  | CoefficientCombinationMethod
  | 'fixed_final_coefficient'
  | 'include_only_selected_conditions'
  | 'exclude_selected_conditions';
export type WorkTimeConditionKey =
  | 'normal_overtime'
  | 'night_work'
  | 'weekly_rest_day_work'
  | 'official_holiday_work'
  | 'organizational_holiday_work'
  | 'mission';

export type DayTypePaymentRuleKey =
  | 'no_shift_day'
  | 'weekly_rest_day'
  | 'official_holiday'
  | 'company_holiday';

export type UnpaidAbsenceImpact = 'none' | 'full_deduction' | 'proportional_by_minutes';
export type DayTypePaymentBase = 'wageBase' | 'grossPay';

export type DayTypePaymentRule = {
  paidWithoutWork: boolean;
  paymentBase: DayTypePaymentBase;
  unpaidAbsenceImpact: UnpaidAbsenceImpact;
  workedTimeCoefficient: number;
};

export type DayTypePaymentRules = Record<DayTypePaymentRuleKey, DayTypePaymentRule>;

export type CoefficientExceptionRule = {
  id: string;
  name: string;
  conditions: WorkTimeConditionKey[];
  method: CoefficientExceptionMethod;
  fixedFinalCoefficient: number | null;
  includedConditions: WorkTimeConditionKey[];
  excludedConditions: WorkTimeConditionKey[];
  innerMethod: CoefficientCombinationMethod;
  priority: number;
  active: boolean;
  description: string;
};

export type TaxBracket = {
  id: string;
  from: number;
  to: number;
  percent: number;
};

export type VariableAmountType = 'addition' | 'deduction';
export type VariableCalculationMethod = 'fixed' | 'percentage';
export type VariableCalculationBase = 'wage_base' | 'total_earnings';
export type PaymentScheduleType = 'time_period' | 'job_activity' | 'hybrid_special';
export type PaymentSchedulePeriod = 'monthly' | 'weekly' | 'biweekly' | 'daily' | 'project' | 'seasonal';
export type PaymentSchedule = {
  type: PaymentScheduleType;
  period: PaymentSchedulePeriod;
};

export const PAYMENT_SCHEDULE_TYPE_LABELS: Record<string, PaymentScheduleType> = {
  'پرداخت بر اساس دوره‌های زمانی': 'time_period',
  'پرداخت بر اساس نوع شغل و فعالیت': 'job_activity',
  'پرداخت ترکیبی و روش‌های خاص': 'hybrid_special',
};

export function normalizePaymentScheduleType(value: unknown, fallback: PaymentScheduleType = 'time_period'): PaymentScheduleType {
  if (value === 'time_period' || value === 'job_activity' || value === 'hybrid_special') return value;
  if (typeof value === 'string' && PAYMENT_SCHEDULE_TYPE_LABELS[value]) return PAYMENT_SCHEDULE_TYPE_LABELS[value];
  return fallback;
}

export function normalizePaymentSchedulePeriod(value: unknown, fallback: PaymentSchedulePeriod = 'monthly'): PaymentSchedulePeriod {
  if (
    value === 'monthly' ||
    value === 'weekly' ||
    value === 'biweekly' ||
    value === 'daily' ||
    value === 'project' ||
    value === 'seasonal'
  ) {
    return value;
  }
  return fallback;
}

export function normalizePaymentSchedule(value: unknown, defaults: PaymentSchedule = DEFAULT_PAYMENT_SCHEDULE): PaymentSchedule {
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string') {
      return {
        type: normalizePaymentScheduleType(value, defaults.type),
        period: defaults.period,
      };
    }
    return { ...defaults };
  }
  const source = value as Partial<PaymentSchedule> & { paymentType?: unknown; paymentSchedule?: unknown };
  return {
    type: normalizePaymentScheduleType(source.type ?? source.paymentType ?? source.paymentSchedule, defaults.type),
    period: normalizePaymentSchedulePeriod(source.period, defaults.period),
  };
}
export type MissionPaymentBase = 'base_salary' | 'total_payable';

export type MissionRule = {
  id: string;
  title: string;
  coefficient: number;
  paymentBase: MissionPaymentBase;
  active: boolean;
};

export type MissionSettings = {
  enabled: boolean;
  rules: MissionRule[];
};

export type LeaveTransferPolicyMode = 'carry_forward' | 'expire_unused';
export type LeaveTransferPolicyRuleKey = 'monthly' | 'quarterly' | 'semiAnnual' | 'annual';
export type LeaveTransferPolicy = {
  mode: LeaveTransferPolicyMode;
  limits: Record<LeaveTransferPolicyRuleKey, { enabled: boolean; maxHours: number | null }>;
};

// ─── Calculation Rules ────────────────────────────────────────────────────────

export type PaymentEffect = 'earning' | 'deduction' | 'employer_cost' | 'informational';

export type CalculationRules = {
  paymentEffect: PaymentEffect;
  includedInInsuranceBase: boolean;
  includedInTaxBase: boolean;
  includedInWageBase: boolean;
  systemGenerated: boolean;
  lockedRules: boolean;
};

export const DEFAULT_FIXED_BENEFIT_RULES: CalculationRules = {
  paymentEffect: 'earning',
  includedInInsuranceBase: true,
  includedInTaxBase: true,
  includedInWageBase: false,
  systemGenerated: false,
  lockedRules: false,
};

export const DEFAULT_SENIORITY_BENEFIT_RULES: CalculationRules = {
  ...DEFAULT_FIXED_BENEFIT_RULES,
  includedInWageBase: true,
};

export const DEFAULT_OPTIONAL_ADDITION_RULES: CalculationRules = {
  paymentEffect: 'earning',
  includedInInsuranceBase: false,
  includedInTaxBase: true,
  includedInWageBase: false,
  systemGenerated: false,
  lockedRules: false,
};

export const DEFAULT_OPTIONAL_DEDUCTION_RULES: CalculationRules = {
  paymentEffect: 'deduction',
  includedInInsuranceBase: false,
  includedInTaxBase: false,
  includedInWageBase: false,
  systemGenerated: false,
  lockedRules: false,
};

export const DEFAULT_PAYMENT_SCHEDULE: PaymentSchedule = {
  type: 'time_period',
  period: 'monthly',
};

export const PAYMENT_SCHEDULE_TYPE_OPTIONS: Array<{ value: PaymentScheduleType; label: string; enabled: boolean }> = [
  { value: 'time_period', label: 'پرداخت بر اساس دوره‌های زمانی', enabled: true },
  { value: 'job_activity', label: 'پرداخت بر اساس نوع شغل و فعالیت', enabled: false },
  { value: 'hybrid_special', label: 'پرداخت ترکیبی و روش‌های خاص', enabled: false },
];

export const PAYMENT_SCHEDULE_PERIOD_OPTIONS: Array<{ value: PaymentSchedulePeriod; label: string; enabled: boolean }> = [
  { value: 'monthly', label: 'پرداخت ماهانه', enabled: true },
  { value: 'weekly', label: 'پرداخت هفتگی', enabled: false },
  { value: 'biweekly', label: 'پرداخت دو هفته یکبار', enabled: false },
  { value: 'daily', label: 'پرداخت روزانه', enabled: false },
  { value: 'project', label: 'پرداخت پروژه‌ای', enabled: false },
  { value: 'seasonal', label: 'پرداخت فصلی', enabled: false },
];

export const EMPLOYEE_INSURANCE_RULES: CalculationRules = {
  paymentEffect: 'deduction',
  includedInInsuranceBase: false,
  includedInTaxBase: false,
  includedInWageBase: false,
  systemGenerated: true,
  lockedRules: true,
};

export const EMPLOYER_INSURANCE_RULES: CalculationRules = {
  paymentEffect: 'employer_cost',
  includedInInsuranceBase: false,
  includedInTaxBase: false,
  includedInWageBase: false,
  systemGenerated: true,
  lockedRules: true,
};

export const TAX_RULES: CalculationRules = {
  paymentEffect: 'deduction',
  includedInInsuranceBase: false,
  includedInTaxBase: false,
  includedInWageBase: false,
  systemGenerated: true,
  lockedRules: true,
};

export const PAYMENT_EFFECT_LABELS: Record<PaymentEffect, string> = {
  earning: 'افزاینده دریافتی',
  deduction: 'کاهنده دریافتی',
  employer_cost: 'هزینه کارفرما',
  informational: 'فقط قراردادی',
};

export function normalizeCalculationRules(value: unknown, defaults: CalculationRules): CalculationRules {
  if (!value || typeof value !== 'object') return { ...defaults };
  const source = value as Partial<CalculationRules>;
  const paymentEffect: PaymentEffect =
    source.paymentEffect === 'earning' || source.paymentEffect === 'deduction' ||
    source.paymentEffect === 'employer_cost' || source.paymentEffect === 'informational'
      ? source.paymentEffect
      : defaults.paymentEffect;
  return {
    paymentEffect,
    includedInInsuranceBase: typeof source.includedInInsuranceBase === 'boolean' ? source.includedInInsuranceBase : defaults.includedInInsuranceBase,
    includedInTaxBase: typeof source.includedInTaxBase === 'boolean' ? source.includedInTaxBase : defaults.includedInTaxBase,
    includedInWageBase: paymentEffect === 'earning'
      ? typeof source.includedInWageBase === 'boolean'
        ? source.includedInWageBase
        : defaults.includedInWageBase
      : false,
    systemGenerated: typeof source.systemGenerated === 'boolean' ? source.systemGenerated : defaults.systemGenerated,
    lockedRules: typeof source.lockedRules === 'boolean' ? source.lockedRules : defaults.lockedRules,
  };
}

export function compareCalculationRules(base: CalculationRules, current: CalculationRules): boolean {
  return (
    base.paymentEffect !== current.paymentEffect ||
    base.includedInInsuranceBase !== current.includedInInsuranceBase ||
    base.includedInTaxBase !== current.includedInTaxBase ||
    base.includedInWageBase !== current.includedInWageBase
  );
}

// ─── Variable Amount ──────────────────────────────────────────────────────────

export type VariableAmount = {
  id: string;
  title: string;
  type: VariableAmountType;
  calculationMethod: VariableCalculationMethod;
  amount: number;
  percent: number;
  calculationBase: VariableCalculationBase;
  calculationRules: CalculationRules;
};

export type BenefitRulesMap = Record<keyof PayrollSettings['benefits'], CalculationRules>;

export type PayrollSettings = {
  financial: {
    dailyBaseSalary: number;
    dailyRequiredMinutes: number;
  };
  deductions: {
    employerInsurancePercent: number;
    employeeInsurancePercent: number;
    taxBrackets: TaxBracket[];
  };
  benefits: {
    workerAllowance: number;
    housingAllowance: number;
    childAllowance: number;
    marriageAllowance: number;
    seniorityAllowance: number;
    eidBonus: number;
  };
  benefitRules: BenefitRulesMap;
  variableAmounts: {
    additions: VariableAmount[];
    deductions: VariableAmount[];
  };
  paymentSchedule: PaymentSchedule;
  workTimePayRules: {
    overtime: {
      dailyLimitHours: number;
      normalCoefficient: number;
    };
    nightWork: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      coefficient: number;
    };
    dayTypePaymentRules: DayTypePaymentRules;
    mission: {
      coefficient: number;
    };
    coefficientCombination: {
      defaultMethod: CoefficientCombinationMethod;
      exceptionRules: CoefficientExceptionRule[];
    };
  };
  leave: {
    monthlyQuotaHours: number;
    transferPolicy: LeaveTransferPolicy;
    transferLimits: {
      monthly: { enabled: boolean; hours: number | null };
      quarterly: { enabled: boolean; hours: number | null };
      semiAnnual: { enabled: boolean; hours: number | null };
      annual: { enabled: boolean; hours: number | null };
    };
    settlementRatePerHour: number;
    finalSettlementRules: {
      dismissalDueToFault: 'cancel' | 'cash';
      noNoticeLeave: 'cancel' | 'cash';
      resignationWithNotice: 'cancel' | 'cash';
      contractEnd: 'cancel' | 'cash';
      employeeRequest: 'cancel' | 'cash';
    };
  };
  mission: MissionSettings;
};

export type CoefficientsByCondition = Record<WorkTimeConditionKey, number>;

export type CombinedCoefficientResult = {
  finalCoefficient: number;
  appliedMethod: CoefficientExceptionMethod;
  appliedRule?: CoefficientExceptionRule;
  usedConditions: WorkTimeConditionKey[];
  breakdown: Array<{ condition: WorkTimeConditionKey; coefficient: number; premiumPercent: number }>;
  formula: string;
};

export type PayrollSettingsOverrides = Partial<{
  financial: Partial<PayrollSettings['financial']>;
  deductions: Partial<PayrollSettings['deductions']>;
  benefits: Partial<PayrollSettings['benefits']>;
  benefitRules: Partial<BenefitRulesMap>;
  variableAmounts: Partial<PayrollSettings['variableAmounts']>;
  paymentSchedule: Partial<PaymentSchedule>;
  workTimePayRules: Partial<{
    overtime: Partial<PayrollSettings['workTimePayRules']['overtime']>;
    nightWork: Partial<PayrollSettings['workTimePayRules']['nightWork']>;
    dayTypePaymentRules: Partial<Record<DayTypePaymentRuleKey, Partial<DayTypePaymentRule>>>;
    mission: Partial<PayrollSettings['workTimePayRules']['mission']>;
    coefficientCombination: Partial<PayrollSettings['workTimePayRules']['coefficientCombination']>;
  }>;
  leave: {
    monthlyQuotaHours?: number;
    transferPolicy?: Partial<{
      mode: LeaveTransferPolicyMode;
      limits: Partial<{
        monthly: Partial<LeaveTransferPolicy['limits']['monthly']>;
        quarterly: Partial<LeaveTransferPolicy['limits']['quarterly']>;
        semiAnnual: Partial<LeaveTransferPolicy['limits']['semiAnnual']>;
        annual: Partial<LeaveTransferPolicy['limits']['annual']>;
      }>;
    }>;
    transferLimits?: Partial<{
      monthly: Partial<PayrollSettings['leave']['transferLimits']['monthly']>;
      quarterly: Partial<PayrollSettings['leave']['transferLimits']['quarterly']>;
      semiAnnual: Partial<PayrollSettings['leave']['transferLimits']['semiAnnual']>;
      annual: Partial<PayrollSettings['leave']['transferLimits']['annual']>;
    }>;
    settlementRatePerHour?: number;
    finalSettlementRules?: Partial<PayrollSettings['leave']['finalSettlementRules']>;
  };
  mission: Partial<PayrollSettings['mission']>;
}>;

export type PayrollDerivedValues = {
  fullWorkingDayHours: number;
  fullWorkingDayMinutes: number;
  salaryPerMinute: number;
  salaryPerHour: number;
  monthlyBaseSalary: number;
  wageBaseAmount: number;
  totalEarningAmount: number;
  totalBenefits: number;
  totalOptionalAdditions: number;
  totalOptionalDeductions: number;
  grossPay: number;
  insuranceBase: number;
  taxBase: number;
  employeeInsuranceAmount: number;
  employerInsuranceAmount: number;
  estimatedTax: number;
  totalDeductions: number;
  netPayable: number;
  employerTotalCost: number;
  weeklyOvertimeLimit: number;
  monthlyOvertimeLimit: number;
};

export const PAYROLL_SETTINGS_STORAGE_KEY = 'dastranj-business-payroll-settings-v1';
export const PAYROLL_SETTINGS_YEARS_STORAGE_KEY = 'dastranj-business-payroll-years-v1';
export const PAYROLL_STEPPER_PROGRESS_STORAGE_KEY = 'dastranj-business-payroll-stepper-progress-v1';
export const ACTIVE_TENANT_STORAGE_KEY = 'active-tenant-id';

export function getActiveTenantStorageId() {
  if (typeof window === 'undefined') return null;
  const tenantId = window.sessionStorage.getItem(ACTIVE_TENANT_STORAGE_KEY)?.trim();
  return tenantId || null;
}

function scopeStorageKey(key: string, tenantId?: string | null) {
  return tenantId ? `${key}:${tenantId}` : key;
}

export const WORK_TIME_CONDITIONS: Array<{ key: WorkTimeConditionKey; label: string; shortLabel: string }> = [
  { key: 'normal_overtime', label: 'اضافه کاری عادی', shortLabel: 'اضافه کاری' },
  { key: 'night_work', label: 'شب کاری', shortLabel: 'شب کاری' },
  { key: 'weekly_rest_day_work', label: 'تعطیل هفتگی', shortLabel: 'تعطیل هفتگی' },
  { key: 'official_holiday_work', label: 'تعطیل رسمی', shortLabel: 'تعطیل رسمی' },
  { key: 'organizational_holiday_work', label: 'تعطیل سازمانی', shortLabel: 'تعطیل سازمانی' },
  { key: 'mission', label: 'ماموریت', shortLabel: 'ماموریت' },
];

export const DAY_TYPE_PAYMENT_RULES: Array<{
  key: DayTypePaymentRuleKey;
  label: string;
  helper: string;
}> = [
  {
    key: 'no_shift_day',
    label: 'روز بدون شیفت',
    helper: 'روزهایی که برای آنها شیفت برنامه‌ریزی نشده است.',
  },
  {
    key: 'weekly_rest_day',
    label: 'تعطیل هفتگی',
    helper: 'تعطیل هفتگی از تقویم یا سیاست کاری تشخیص داده می‌شود.',
  },
  {
    key: 'official_holiday',
    label: 'تعطیل رسمی',
    helper: 'تعطیلات رسمی تقویم کشور.',
  },
  {
    key: 'company_holiday',
    label: 'تعطیل سازمانی',
    helper: 'تعطیلی‌هایی که توسط سازمان یا سیاست کاری تعیین می‌شوند.',
  },
];

export const UNPAID_ABSENCE_IMPACT_OPTIONS: Array<{
  value: UnpaidAbsenceImpact;
  label: string;
  shortLabel: string;
  tooltip: string;
}> = [
  {
    value: 'none',
    label: 'بدون اثر',
    shortLabel: 'بدون اثر',
    tooltip: 'غیبت غیرموجه در طول هفته، پرداخت این روز را تغییر نمی‌دهد.',
  },
  {
    value: 'full_deduction',
    label: 'کسر کامل با هر غیبت غیرموجه',
    shortLabel: 'کسر کامل',
    tooltip: 'اگر در طول هفته حتی یک غیبت غیرموجه ثبت شود، پرداخت این روز به صورت کامل حذف می‌شود.',
  },
  {
    value: 'proportional_by_minutes',
    label: 'کسر نسبی بر اساس دقایق غیبت',
    shortLabel: 'کسر نسبی',
    tooltip: 'مبلغ این روز به نسبت دقایق غیبت غیرموجه در طول هفته کاهش پیدا می‌کند.',
  },
];

export const DAY_TYPE_PAYMENT_BASE_OPTIONS: Array<{
  value: DayTypePaymentBase;
  label: string;
  tooltip: string;
}> = [
  {
    value: 'wageBase',
    label: 'بر اساس مزد مبنا',
    tooltip: 'مبلغ این روز بر اساس حقوق پایه و آیتم‌هایی که به عنوان «جزو مزد مبنا» مشخص شده‌اند محاسبه می‌شود.',
  },
  {
    value: 'grossPay',
    label: 'بر اساس جمع حقوق دریافتی',
    tooltip: 'مبلغ این روز بر اساس همه آیتم‌های افزاینده دریافتی کارمند محاسبه می‌شود.',
  },
];

export const VARIABLE_PAYMENT_BASE_OPTIONS: Array<{
  value: VariableCalculationBase;
  label: string;
  tooltip: string;
}> = [
  {
    value: 'wage_base',
    label: 'مزد مبنا',
    tooltip: 'مبلغ این آیتم بر اساس حقوق پایه و آیتم‌هایی که به عنوان «جزو مزد مبنا» مشخص شده‌اند محاسبه می‌شود.',
  },
  {
    value: 'total_earnings',
    label: 'جمع حقوق دریافتی',
    tooltip: 'مبلغ این آیتم بر اساس همه آیتم‌های افزاینده دریافتی محاسبه می‌شود.',
  },
];

export function normalizeVariableCalculationBase(
  value: unknown,
  fallback: VariableCalculationBase = 'wage_base',
): VariableCalculationBase {
  if (
    value === 'wage_base' ||
    value === 'baseSalary' ||
    value === 'base_salary' ||
    value === 'base_salary_monthly' ||
    value === 'monthly_base_salary' ||
    value === 'salary_base'
  ) {
    return 'wage_base';
  }
  if (
    value === 'total_earnings' ||
    value === 'grossPay' ||
    value === 'gross_earnings' ||
    value === 'total_pay' ||
    value === 'total_payable'
  ) {
    return 'total_earnings';
  }
  return fallback;
}

export function getVariableCalculationBaseLabel(base: VariableCalculationBase) {
  return base === 'total_earnings' ? 'جمع حقوق دریافتی' : 'مزد مبنا';
}

export function getDayTypePaymentBaseShortLabel(base: DayTypePaymentBase) {
  return base === 'grossPay' ? 'جمع حقوق دریافتی' : 'مزد مبنا';
}

export function getUnpaidAbsenceImpactShortLabel(impact: UnpaidAbsenceImpact) {
  return UNPAID_ABSENCE_IMPACT_OPTIONS.find((option) => option.value === impact)?.shortLabel ?? 'بدون اثر';
}

export function compareDayTypePaymentRules(a: DayTypePaymentRule, b: DayTypePaymentRule) {
  return (
    a.paidWithoutWork === b.paidWithoutWork &&
    a.paymentBase === b.paymentBase &&
    a.unpaidAbsenceImpact === b.unpaidAbsenceImpact &&
    a.workedTimeCoefficient === b.workedTimeCoefficient
  );
}
export const DEFAULT_DAY_TYPE_PAYMENT_RULES: DayTypePaymentRules = {
  no_shift_day: {
    paidWithoutWork: false,
    paymentBase: 'wageBase',
    unpaidAbsenceImpact: 'none',
    workedTimeCoefficient: 1.4,
  },
  weekly_rest_day: {
    paidWithoutWork: true,
    paymentBase: 'wageBase',
    unpaidAbsenceImpact: 'none',
    workedTimeCoefficient: 1.4,
  },
  official_holiday: {
    paidWithoutWork: true,
    paymentBase: 'wageBase',
    unpaidAbsenceImpact: 'none',
    workedTimeCoefficient: 1.96,
  },
  company_holiday: {
    paidWithoutWork: true,
    paymentBase: 'wageBase',
    unpaidAbsenceImpact: 'none',
    workedTimeCoefficient: 1.4,
  },
};

export function getDayTypePaymentRuleErrorKey(ruleKey: DayTypePaymentRuleKey, field: keyof DayTypePaymentRule) {
  return `dayTypePaymentRules.${ruleKey}.${field}`;
}

export const DEFAULT_MISSION_SETTINGS: MissionSettings = {
  enabled: true,
  rules: [
    {
      id: 'mission-with-stay',
      title: 'ماموریت با اقامتگاه',
      coefficient: 1.89,
      paymentBase: 'base_salary',
      active: true,
    },
    {
      id: 'mission-without-stay',
      title: 'ماموریت بدون اقامتگاه',
      coefficient: 1.89,
      paymentBase: 'base_salary',
      active: true,
    },
  ],
};

export const COEFFICIENT_COMBINATION_METHODS: Array<{
  value: CoefficientCombinationMethod;
  label: string;
  badge: string;
  helper: string;
  example: string;
  explanation: string;
}> = [
  {
    value: 'highest_only',
    label: 'فقط بیشترین ضریب',
    badge: 'ساده',
    helper: 'فقط بزرگ ترین ضریب اعمال می شود.',
    example: '۱.۴، ۱.۳۵، ۱.۹۶ ← ۱.۹۶',
    explanation: 'از بین همه وضعیت های هم زمان، فقط بزرگ ترین ضریب اعمال می شود.',
  },
  {
    value: 'additive_percentage',
    label: 'جمع افزایشی درصدها',
    badge: 'پیشنهادی',
    helper: 'درصد اضافه هر قانون با هم جمع می شود.',
    example: '۱ + ۰.۴ + ۰.۳۵ = ۱.۷۵',
    explanation: 'حقوق ساعتی پایه یک بار محاسبه می شود و درصد اضافه هر قانون با هم جمع می شود.',
  },
  {
    value: 'multiply_coefficients',
    label: 'ضرب ضرایب',
    badge: 'پیشرفته',
    helper: 'ضرایب فعال در هم ضرب می شوند.',
    example: '۱.۴ × ۱.۳۵ = ۱.۸۹',
    explanation: 'همه ضرایب فعال در هم ضرب می شوند و ضریب نهایی ساخته می شود.',
  },
  {
    value: 'separate_premium_sum',
    label: 'محاسبه جداگانه و جمع مبالغ',
    badge: 'گزارشی',
    helper: 'هر فوق العاده جدا محاسبه و جمع می شود.',
    example: 'پایه + اضافه کاری + شب کاری',
    explanation: 'مبلغ هر فوق العاده جداگانه محاسبه و به مبلغ پایه اضافه می شود.',
  },
];

export const COEFFICIENT_EXCEPTION_METHODS: Array<{ value: CoefficientExceptionMethod; label: string }> = [
  { value: 'highest_only', label: 'استفاده از بیشترین ضریب' },
  { value: 'additive_percentage', label: 'جمع افزایشی درصدها' },
  { value: 'multiply_coefficients', label: 'ضرب ضرایب' },
  { value: 'separate_premium_sum', label: 'محاسبه جداگانه و جمع مبالغ' },
  { value: 'fixed_final_coefficient', label: 'ضریب نهایی ثابت' },
  { value: 'include_only_selected_conditions', label: 'اعمال فقط شرایط انتخاب شده' },
  { value: 'exclude_selected_conditions', label: 'حذف شرایط انتخاب شده' },
];

export type BusinessSettingYear = {
  id: string;
  year: number;
  title: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getPayrollSettingsStorageKey(year: number, tenantId?: string | null) {
  return scopeStorageKey(`${PAYROLL_SETTINGS_STORAGE_KEY}-year-${year}`, tenantId);
}

export function getPayrollSettingsYearsStorageKey(tenantId?: string | null) {
  return scopeStorageKey(PAYROLL_SETTINGS_YEARS_STORAGE_KEY, tenantId);
}

export function getTenantPayrollSettingsStorageKey(year: number, tenantId?: string | null) {
  return scopeStorageKey(`${PAYROLL_SETTINGS_STORAGE_KEY}-tenant-year-${year}`, tenantId);
}

export function getPayrollStepperProgressStorageKey(mode: PayrollSettingsMode, year: number, tenantId?: string | null) {
  return scopeStorageKey(`${PAYROLL_STEPPER_PROGRESS_STORAGE_KEY}-${mode}-year-${year}`, tenantId);
}

export function getPayrollSettingsDraftStorageKey(mode: PayrollSettingsMode, year: number, tenantId?: string | null) {
  return scopeStorageKey(`${PAYROLL_SETTINGS_STORAGE_KEY}-draft-${mode}-year-${year}`, tenantId);
}

export type PayrollStepperProgress = {
  selectedYear: number;
  openedStepIds: PayrollStepId[];
  completedStepIds: PayrollStepId[];
  currentStepId: PayrollStepId;
  savedStepIds: PayrollStepId[];
  dirtyStepIds: PayrollStepId[];
};

export type BaseDifferenceDirection = 'higher' | 'lower' | 'changed' | 'added' | 'removed';

export type BaseDifference = {
  isDifferent: true;
  direction: BaseDifferenceDirection;
  diffAmount?: number;
  message: string;
  tooltip: string;
};

export function compareValues(
  adminValue: number | string,
  tenantValue: number | string,
  labels: {
    changed: string;
    tooltip: string;
    higher?: (difference: number) => string;
    lower?: (difference: number) => string;
  },
): BaseDifference | null {
  if (adminValue === tenantValue) return null;
  if (typeof adminValue === 'number' && typeof tenantValue === 'number' && Number.isFinite(adminValue) && Number.isFinite(tenantValue)) {
    const diffAmount = Math.abs(tenantValue - adminValue);
    if (tenantValue > adminValue && labels.higher) {
      return { isDifferent: true, direction: 'higher', diffAmount, message: labels.higher(diffAmount), tooltip: labels.tooltip };
    }
    if (tenantValue < adminValue && labels.lower) {
      return { isDifferent: true, direction: 'lower', diffAmount, message: labels.lower(diffAmount), tooltip: labels.tooltip };
    }
  }
  return { isDifferent: true, direction: 'changed', message: labels.changed, tooltip: labels.tooltip };
}

export function compareCollections<T>(
  adminValue: T,
  tenantValue: T,
  labels: { changed: string; tooltip: string },
): BaseDifference | null {
  if (JSON.stringify(adminValue) === JSON.stringify(tenantValue)) return null;
  return { isDifferent: true, direction: 'changed', message: labels.changed, tooltip: labels.tooltip };
}

function buildDifference(base: unknown, current: unknown): unknown {
  if (Array.isArray(base) || Array.isArray(current)) {
    return JSON.stringify(base) === JSON.stringify(current) ? undefined : current;
  }
  if (typeof base === 'object' && base !== null && typeof current === 'object' && current !== null) {
    const difference = Object.entries(current).reduce<Record<string, unknown>>((result, [key, value]) => {
      const next = buildDifference((base as Record<string, unknown>)[key], value);
      if (next !== undefined) result[key] = next;
      return result;
    }, {});
    return Object.keys(difference).length ? difference : undefined;
  }
  return base === current ? undefined : current;
}

function mergeOverrides(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;
  if (Array.isArray(overrides) || typeof overrides !== 'object' || overrides === null) return overrides;
  const source = typeof base === 'object' && base !== null ? base as Record<string, unknown> : {};
  return Object.entries(overrides).reduce<Record<string, unknown>>(
    (result, [key, value]) => ({ ...result, [key]: mergeOverrides(source[key], value) }),
    { ...source },
  );
}

export function buildPayrollOverrides(base: PayrollSettings, current: PayrollSettings): PayrollSettingsOverrides {
  return (buildDifference(base, current) ?? {}) as PayrollSettingsOverrides;
}

export function applyPayrollOverrides(base: PayrollSettings, overrides: PayrollSettingsOverrides): PayrollSettings {
  return mergeOverrides(base, overrides) as PayrollSettings;
}

function normalizeCombination(value: unknown, includeDefaults: boolean) {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const legacyMethod = source.method;
  const result: Record<string, unknown> = {
    ...source,
    defaultMethod: source.defaultMethod ?? legacyMethod ?? 'additive_percentage',
  };
  delete result.method;
  delete result.locked;
  if (includeDefaults || Array.isArray(source.exceptionRules)) {
    result.exceptionRules = Array.isArray(source.exceptionRules) ? source.exceptionRules : [];
  }
  return result;
}

function normalizeLeaveTransferPolicyRule(value: unknown, fallback: { enabled: boolean; maxHours: number | null }) {
  if (!value || typeof value !== 'object') {
    if (typeof value === 'number') {
      return { enabled: true, maxHours: value >= 0 ? value : fallback.maxHours };
    }
    return { ...fallback };
  }
  const source = value as { enabled?: unknown; maxHours?: unknown; hours?: unknown };
  const hours = typeof source.maxHours === 'number' && Number.isFinite(source.maxHours)
    ? source.maxHours
    : typeof source.hours === 'number' && Number.isFinite(source.hours)
      ? source.hours
      : null;
  const enabled = typeof source.enabled === 'boolean' ? source.enabled : hours !== null;
  return {
    enabled,
    maxHours: enabled ? hours : null,
  };
}

function normalizeLeaveTransferPolicy(
  value: unknown,
  defaults: LeaveTransferPolicy = {
    mode: 'carry_forward',
    limits: {
      monthly: { enabled: true, maxHours: 16 },
      quarterly: { enabled: true, maxHours: 32 },
      semiAnnual: { enabled: true, maxHours: 48 },
      annual: { enabled: true, maxHours: 64 },
    },
  },
  legacyLimits?: unknown,
): LeaveTransferPolicy {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const rawLimits = source.limits && typeof source.limits === 'object' ? source.limits as Record<string, unknown> : undefined;
  const legacySource = legacyLimits && typeof legacyLimits === 'object' ? legacyLimits as Record<string, unknown> : undefined;
  const baseLimits = rawLimits ?? legacySource ?? {};
  const mode: LeaveTransferPolicyMode = source.mode === 'expire_unused' ? 'expire_unused' : 'carry_forward';
  const carryForwardFallback = defaults.limits;
  const normalizedLimits = {
    monthly: normalizeLeaveTransferPolicyRule(baseLimits.monthly, carryForwardFallback.monthly),
    quarterly: normalizeLeaveTransferPolicyRule(baseLimits.quarterly, carryForwardFallback.quarterly),
    semiAnnual: normalizeLeaveTransferPolicyRule(baseLimits.semiAnnual, carryForwardFallback.semiAnnual),
    annual: normalizeLeaveTransferPolicyRule(baseLimits.annual, carryForwardFallback.annual),
  };
  return {
    mode,
    limits: mode === 'expire_unused'
      ? {
          monthly: { enabled: false, maxHours: null },
          quarterly: { enabled: false, maxHours: null },
          semiAnnual: { enabled: false, maxHours: null },
          annual: { enabled: false, maxHours: null },
        }
      : normalizedLimits,
  };
}

export function normalizeLeaveSettings(value: unknown, defaults: PayrollSettings['leave'] = DEFAULT_PAYROLL_SETTINGS.leave): PayrollSettings['leave'] {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const legacyLimits = source.transferLimits && typeof source.transferLimits === 'object' ? source.transferLimits : undefined;
  const policy = normalizeLeaveTransferPolicy(source.transferPolicy, defaults.transferPolicy, legacyLimits);
  const rawFinalSettlementRules = source.finalSettlementRules && typeof source.finalSettlementRules === 'object'
    ? source.finalSettlementRules as Record<string, unknown>
    : {};
  const normalizeDecision = (key: keyof PayrollSettings['leave']['finalSettlementRules']) => {
    const value = rawFinalSettlementRules[key];
    return value === 'cash' || value === 'cancel' ? value : defaults.finalSettlementRules[key];
  };
  const transferLimits = {
    monthly: { enabled: policy.limits.monthly.enabled, hours: policy.limits.monthly.maxHours },
    quarterly: { enabled: policy.limits.quarterly.enabled, hours: policy.limits.quarterly.maxHours },
    semiAnnual: { enabled: policy.limits.semiAnnual.enabled, hours: policy.limits.semiAnnual.maxHours },
    annual: { enabled: policy.limits.annual.enabled, hours: policy.limits.annual.maxHours },
  };
  return {
    monthlyQuotaHours: typeof source.monthlyQuotaHours === 'number' && Number.isFinite(source.monthlyQuotaHours)
      ? source.monthlyQuotaHours
      : defaults.monthlyQuotaHours,
    transferPolicy: policy,
    transferLimits,
    settlementRatePerHour: typeof source.settlementRatePerHour === 'number' && Number.isFinite(source.settlementRatePerHour)
      ? source.settlementRatePerHour
      : defaults.settlementRatePerHour,
    finalSettlementRules: {
      dismissalDueToFault: normalizeDecision('dismissalDueToFault'),
      noNoticeLeave: normalizeDecision('noNoticeLeave'),
      resignationWithNotice: normalizeDecision('resignationWithNotice'),
      contractEnd: normalizeDecision('contractEnd'),
      employeeRequest: normalizeDecision('employeeRequest'),
    },
  };
}

function normalizeMissionRule(value: unknown, fallback: MissionRule): MissionRule {
  const source = value && typeof value === 'object' ? (value as Partial<MissionRule>) : {};
  const rawPaymentBase = value && typeof value === 'object' ? (value as { paymentBase?: unknown }).paymentBase : undefined;
  const paymentBase =
    rawPaymentBase === 'total_payable' || rawPaymentBase === 'grossPay'
      ? 'total_payable'
      : 'base_salary';
  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : fallback.id,
    title: typeof source.title === 'string' ? source.title : fallback.title,
    coefficient: Number.isFinite(source.coefficient) ? Number(source.coefficient) : fallback.coefficient,
    paymentBase,
    active: typeof source.active === 'boolean' ? source.active : fallback.active,
  };
}

export function normalizeMissionSettings(value: unknown, defaults: MissionSettings = DEFAULT_MISSION_SETTINGS): MissionSettings {
  if (!value || typeof value !== 'object') {
    return { ...defaults, rules: defaults.rules.map((rule) => ({ ...rule })) };
  }
  const source = value as Partial<MissionSettings> & { rules?: unknown };
  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : defaults.enabled,
    rules: Array.isArray(source.rules)
      ? source.rules.map((rule, index) => normalizeMissionRule(rule, defaults.rules[index] ?? defaults.rules[0])).filter(Boolean)
      : defaults.rules.map((rule) => ({ ...rule })),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeDayTypePaymentRule(value: unknown, fallback: DayTypePaymentRule): DayTypePaymentRule {
  if (typeof value === 'number') {
    return {
      ...fallback,
      workedTimeCoefficient: Number.isFinite(value) ? value : fallback.workedTimeCoefficient,
    };
  }
  const source = asRecord(value);
  const impact = source.unpaidAbsenceImpact;
  const unpaidAbsenceImpact: UnpaidAbsenceImpact =
    impact === 'none' || impact === 'full_deduction' || impact === 'proportional_by_minutes'
      ? impact
      : fallback.unpaidAbsenceImpact;
  const workedTimeCoefficient =
    typeof source.workedTimeCoefficient === 'number' && Number.isFinite(source.workedTimeCoefficient)
      ? source.workedTimeCoefficient
      : typeof source.coefficient === 'number' && Number.isFinite(source.coefficient)
        ? source.coefficient
        : fallback.workedTimeCoefficient;
  const paymentBase =
    source.paymentBase === 'wageBase' || source.paymentBase === 'grossPay'
      ? source.paymentBase
      : fallback.paymentBase;
  return {
    paidWithoutWork: typeof source.paidWithoutWork === 'boolean' ? source.paidWithoutWork : fallback.paidWithoutWork,
    paymentBase,
    unpaidAbsenceImpact,
    workedTimeCoefficient,
  };
}

export function normalizeDayTypePaymentRules(
  value: unknown,
  defaults: DayTypePaymentRules = DEFAULT_DAY_TYPE_PAYMENT_RULES,
): DayTypePaymentRules {
  const source = asRecord(value);
  return {
    no_shift_day: normalizeDayTypePaymentRule(source.no_shift_day ?? source.noShiftDay, defaults.no_shift_day),
    weekly_rest_day: normalizeDayTypePaymentRule(
      source.weekly_rest_day ?? source.weeklyRestDay ?? source.weeklyRestDayWork,
      defaults.weekly_rest_day,
    ),
    official_holiday: normalizeDayTypePaymentRule(
      source.official_holiday ?? source.officialHoliday ?? source.officialHolidayWork,
      defaults.official_holiday,
    ),
    company_holiday: normalizeDayTypePaymentRule(
      source.company_holiday ?? source.companyHoliday ?? source.companyHolidayWork ?? source.organizationalHolidayWork,
      defaults.company_holiday,
    ),
  };
}

export function normalizeWorkTimePayRules(
  value: unknown,
  defaults: PayrollSettings['workTimePayRules'] = DEFAULT_PAYROLL_SETTINGS.workTimePayRules,
): PayrollSettings['workTimePayRules'] {
  const source = asRecord(value);
  const overtime = asRecord(source.overtime);
  const overtimeCoefficients = asRecord(overtime.coefficients);
  const nightWork = asRecord(source.nightWork);
  const dayTypeSource = asRecord(source.dayTypePaymentRules);
  const combination = asRecord(source.coefficientCombination);
  const dayTypePaymentRules = normalizeDayTypePaymentRules(
    {
      ...dayTypeSource,
      no_shift_day: dayTypeSource.no_shift_day ?? dayTypeSource.noShiftDay,
      weekly_rest_day: dayTypeSource.weekly_rest_day ?? dayTypeSource.weeklyRestDay ?? source.weeklyRestDayWork ?? source.fridayWork ?? source.fridayWorkCoefficient ?? source.fridayCoefficient,
      official_holiday: dayTypeSource.official_holiday ?? dayTypeSource.officialHoliday ?? source.officialHolidayWork ?? source.officialHolidayCoefficient ?? overtimeCoefficients.holiday,
      company_holiday: dayTypeSource.company_holiday ?? dayTypeSource.companyHoliday ?? source.organizationalHolidayWork ?? source.companyHolidayCoefficient ?? source.companyHolidayWorkCoefficient,
    },
    defaults.dayTypePaymentRules,
  );
  const missionSource = asRecord(source.mission);
  const missionCoefficient =
    typeof missionSource.coefficient === 'number' && Number.isFinite(missionSource.coefficient)
      ? missionSource.coefficient
      : typeof source.missionCoefficient === 'number' && Number.isFinite(source.missionCoefficient)
        ? source.missionCoefficient
        : defaults.mission.coefficient;
  return {
    overtime: {
      dailyLimitHours:
        typeof overtime.dailyLimitHours === 'number' && Number.isFinite(overtime.dailyLimitHours)
          ? overtime.dailyLimitHours
          : defaults.overtime.dailyLimitHours,
      normalCoefficient:
        typeof overtime.normalCoefficient === 'number' && Number.isFinite(overtime.normalCoefficient)
          ? overtime.normalCoefficient
          : defaults.overtime.normalCoefficient,
    },
    nightWork: {
      enabled: typeof nightWork.enabled === 'boolean' ? nightWork.enabled : defaults.nightWork.enabled,
      startTime: typeof nightWork.startTime === 'string' ? nightWork.startTime : defaults.nightWork.startTime,
      endTime: typeof nightWork.endTime === 'string' ? nightWork.endTime : defaults.nightWork.endTime,
      coefficient:
        typeof nightWork.coefficient === 'number' && Number.isFinite(nightWork.coefficient)
          ? nightWork.coefficient
          : defaults.nightWork.coefficient,
    },
    dayTypePaymentRules,
    mission: {
      coefficient: missionCoefficient,
    },
    coefficientCombination: {
      defaultMethod:
        combination.defaultMethod === 'highest_only' ||
        combination.defaultMethod === 'additive_percentage' ||
        combination.defaultMethod === 'multiply_coefficients' ||
        combination.defaultMethod === 'separate_premium_sum'
          ? combination.defaultMethod
          : defaults.coefficientCombination.defaultMethod,
      exceptionRules: Array.isArray(combination.exceptionRules)
        ? combination.exceptionRules as CoefficientExceptionRule[]
        : defaults.coefficientCombination.exceptionRules.map((rule) => ({ ...rule })),
    },
  };
}

type LegacyWorkTimeRules = Partial<{
  overtime: Partial<PayrollSettings['workTimePayRules']['overtime']>;
  nightWork: Partial<PayrollSettings['workTimePayRules']['nightWork']>;
  dayTypePaymentRules: Partial<Record<DayTypePaymentRuleKey, Partial<DayTypePaymentRule>>>;
  mission: Partial<PayrollSettings['workTimePayRules']['mission']>;
  coefficientCombination: Partial<PayrollSettings['workTimePayRules']['coefficientCombination']>;
}>;

function mapLegacyWorkTimeRules(source?: Record<string, unknown>): LegacyWorkTimeRules | undefined {
  if (!source) return undefined;
  const overtime = asRecord(source.overtime);
  const coefficients = asRecord(overtime.coefficients);
  const dayTypePaymentRules: Partial<Record<DayTypePaymentRuleKey, Partial<DayTypePaymentRule>>> = {};
  const weeklyRestDayValue = source.weeklyRestDayWork ?? source.fridayWork ?? source.fridayWorkCoefficient ?? source.fridayWorkNoOvertimeCoefficient ?? source.fridayCoefficient;
  const officialHolidayValue = source.officialHolidayWork ?? source.officialHolidayCoefficient ?? source.holidayWorkCoefficient ?? coefficients.holiday;
  const companyHolidayValue = source.organizationalHolidayWork ?? source.companyHolidayCoefficient ?? source.companyHolidayWorkCoefficient;
  if (typeof weeklyRestDayValue === 'number' && Number.isFinite(weeklyRestDayValue)) {
    dayTypePaymentRules.weekly_rest_day = { workedTimeCoefficient: weeklyRestDayValue };
  }
  if (typeof officialHolidayValue === 'number' && Number.isFinite(officialHolidayValue)) {
    dayTypePaymentRules.official_holiday = { workedTimeCoefficient: officialHolidayValue };
  }
  if (typeof companyHolidayValue === 'number' && Number.isFinite(companyHolidayValue)) {
    dayTypePaymentRules.company_holiday = { workedTimeCoefficient: companyHolidayValue };
  }
  return {
    overtime: {
      dailyLimitHours: typeof overtime.dailyLimitHours === 'number' ? overtime.dailyLimitHours : undefined,
      normalCoefficient:
        typeof overtime.normalCoefficient === 'number'
          ? overtime.normalCoefficient
          : typeof coefficients.normal === 'number'
            ? coefficients.normal
            : undefined,
    },
    nightWork: {
      coefficient:
        typeof source.nightWorkCoefficient === 'number'
          ? source.nightWorkCoefficient
          : typeof coefficients.night === 'number'
            ? coefficients.night
            : undefined,
    },
    dayTypePaymentRules,
    mission: {
      coefficient:
        typeof source.missionCoefficient === 'number'
          ? source.missionCoefficient
          : typeof coefficients.mission === 'number'
            ? coefficients.mission
            : undefined,
    },
  };
}

export function normalizePayrollSettings(value: unknown): PayrollSettings {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const workTimePayRules = source.workTimePayRules && typeof source.workTimePayRules === 'object'
    ? source.workTimePayRules as Record<string, unknown>
    : undefined;
  const legacyWorkTimeRules = mapLegacyWorkTimeRules(source);
  const migratedWorkTimePayRules = workTimePayRules
    ? legacyWorkTimeRules
      ? { ...legacyWorkTimeRules, ...workTimePayRules }
      : workTimePayRules
    : legacyWorkTimeRules;
  const withMigration = {
    ...source,
    workTimePayRules: migratedWorkTimePayRules,
    leave: normalizeLeaveSettings(source.leave, DEFAULT_PAYROLL_SETTINGS.leave),
    paymentSchedule: normalizePaymentSchedule(source.paymentSchedule ?? source.paymentType, DEFAULT_PAYMENT_SCHEDULE),
  };
  const merged = mergeOverrides(DEFAULT_PAYROLL_SETTINGS, withMigration) as PayrollSettings;
  merged.workTimePayRules = normalizeWorkTimePayRules(merged.workTimePayRules, DEFAULT_PAYROLL_SETTINGS.workTimePayRules);

  // Normalize benefitRules with safe defaults
  const rawBenefitRules = source.benefitRules && typeof source.benefitRules === 'object'
    ? source.benefitRules as Record<string, unknown>
    : {};
  merged.benefitRules = {
    workerAllowance: normalizeCalculationRules(rawBenefitRules.workerAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    housingAllowance: normalizeCalculationRules(rawBenefitRules.housingAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    childAllowance: normalizeCalculationRules(rawBenefitRules.childAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    marriageAllowance: normalizeCalculationRules(rawBenefitRules.marriageAllowance, DEFAULT_FIXED_BENEFIT_RULES),
    seniorityAllowance: normalizeCalculationRules(rawBenefitRules.seniorityAllowance, { ...DEFAULT_FIXED_BENEFIT_RULES, includedInWageBase: true }),
    eidBonus: normalizeCalculationRules(rawBenefitRules.eidBonus, DEFAULT_FIXED_BENEFIT_RULES),
  };

  // Normalize calculationRules on variable amounts
  const normalizeVariableRules = (items: VariableAmount[], defaultRules: CalculationRules): VariableAmount[] =>
    items.map((item) => ({
      ...item,
      calculationBase: normalizeVariableCalculationBase(item.calculationBase),
      calculationRules: normalizeCalculationRules(
        (item as unknown as Record<string, unknown>).calculationRules,
        defaultRules,
      ),
    }));
  merged.variableAmounts = {
    additions: normalizeVariableRules(merged.variableAmounts.additions, DEFAULT_OPTIONAL_ADDITION_RULES),
    deductions: normalizeVariableRules(merged.variableAmounts.deductions, DEFAULT_OPTIONAL_DEDUCTION_RULES),
  };
  merged.paymentSchedule = normalizePaymentSchedule(source.paymentSchedule ?? source.paymentType ?? merged.paymentSchedule, DEFAULT_PAYMENT_SCHEDULE);
  delete (merged as Record<string, unknown>).paymentType;
  merged.mission = normalizeMissionSettings(source.mission, DEFAULT_MISSION_SETTINGS);

  return merged;
}

export function normalizePayrollOverrides(value: unknown): PayrollSettingsOverrides {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const normalized: Record<string, unknown> = { ...source };
  const legacyWorkTimeRules = mapLegacyWorkTimeRules(source);
  if (source.workTimePayRules) {
    const workTimePayRules = source.workTimePayRules as Record<string, unknown>;
    normalized.workTimePayRules = {
      ...(legacyWorkTimeRules ?? {}),
      ...workTimePayRules,
      coefficientCombination: normalizeCombination(workTimePayRules.coefficientCombination, false),
    };
  } else if (
    [
      'overtime',
      'nightWorkCoefficient',
      'holidayWorkCoefficient',
      'weeklyRestDayWork',
      'officialHolidayWork',
      'organizationalHolidayWork',
      'fridayWork',
      'fridayWorkCoefficient',
      'fridayWorkNoOvertimeCoefficient',
      'fridayCoefficient',
      'officialHolidayCoefficient',
      'companyHolidayCoefficient',
      'companyHolidayWorkCoefficient',
      'missionCoefficient',
    ].some((key) => Object.prototype.hasOwnProperty.call(source, key))
  ) {
    normalized.workTimePayRules = legacyWorkTimeRules;
  }
  if (source.leave) {
    normalized.leave = normalizeLeaveSettings(source.leave, DEFAULT_PAYROLL_SETTINGS.leave);
  }
  if (source.paymentSchedule || source.paymentType) {
    normalized.paymentSchedule = normalizePaymentSchedule(source.paymentSchedule ?? source.paymentType, DEFAULT_PAYMENT_SCHEDULE);
  }
  delete normalized.overtime;
  delete normalized.paymentType;
  return normalized as PayrollSettingsOverrides;
}

export function combineCoefficientsAdditive(coefficients: number[]) {
  return 1 + coefficients.reduce((sum, coefficient) => sum + (coefficient - 1), 0);
}

function calculateByMethod(
  method: CoefficientCombinationMethod,
  conditions: WorkTimeConditionKey[],
  coefficientsByCondition: CoefficientsByCondition,
): Pick<CombinedCoefficientResult, 'finalCoefficient' | 'breakdown' | 'formula'> {
  const coefficients = conditions.map((condition) => coefficientsByCondition[condition]).filter((value) => Number.isFinite(value));
  const breakdown = conditions.map((condition) => ({
    condition,
    coefficient: coefficientsByCondition[condition],
    premiumPercent: coefficientsByCondition[condition] - 1,
  }));
  if (!coefficients.length) {
    return { finalCoefficient: 1, breakdown: [], formula: '۱' };
  }
  if (method === 'highest_only') {
    const finalCoefficient = Math.max(...coefficients);
    return { finalCoefficient, breakdown, formula: `max(${coefficients.join(', ')}) = ${finalCoefficient}` };
  }
  if (method === 'multiply_coefficients') {
    const finalCoefficient = coefficients.reduce((result, coefficient) => result * coefficient, 1);
    return { finalCoefficient, breakdown, formula: `${coefficients.join(' × ')} = ${finalCoefficient}` };
  }
  const finalCoefficient = combineCoefficientsAdditive(coefficients);
  return {
    finalCoefficient,
    breakdown,
    formula: `1 + ${coefficients.map((coefficient) => coefficient - 1).join(' + ')} = ${finalCoefficient}`,
  };
}

export function calculateCombinedCoefficient({
  activeConditions,
  coefficientsByCondition,
  defaultMethod,
  exceptionRules,
}: {
  activeConditions: WorkTimeConditionKey[];
  coefficientsByCondition: CoefficientsByCondition;
  defaultMethod: CoefficientCombinationMethod;
  exceptionRules: CoefficientExceptionRule[];
}): CombinedCoefficientResult {
  const matchedRule = exceptionRules
    .filter((rule) => rule.active && rule.conditions.every((condition) => activeConditions.includes(condition)))
    .sort((first, second) => first.priority - second.priority)[0];

  if (!matchedRule) {
    const result = calculateByMethod(defaultMethod, activeConditions, coefficientsByCondition);
    return { ...result, appliedMethod: defaultMethod, usedConditions: activeConditions };
  }

  if (matchedRule.method === 'fixed_final_coefficient') {
    return {
      finalCoefficient: matchedRule.fixedFinalCoefficient ?? 1,
      appliedMethod: matchedRule.method,
      appliedRule: matchedRule,
      usedConditions: activeConditions,
      breakdown: activeConditions.map((condition) => ({
        condition,
        coefficient: coefficientsByCondition[condition],
        premiumPercent: coefficientsByCondition[condition] - 1,
      })),
      formula: `ضریب ثابت = ${matchedRule.fixedFinalCoefficient ?? 1}`,
    };
  }

  const method = matchedRule.method === 'include_only_selected_conditions' || matchedRule.method === 'exclude_selected_conditions'
    ? matchedRule.innerMethod
    : matchedRule.method;
  const usedConditions = matchedRule.method === 'include_only_selected_conditions'
    ? activeConditions.filter((condition) => matchedRule.includedConditions.includes(condition))
    : matchedRule.method === 'exclude_selected_conditions'
      ? activeConditions.filter((condition) => !matchedRule.excludedConditions.includes(condition))
      : activeConditions;
  const result = calculateByMethod(method, usedConditions, coefficientsByCondition);
  return { ...result, appliedMethod: matchedRule.method, appliedRule: matchedRule, usedConditions };
}

export function getWorkTimeCoefficients(settings: PayrollSettings): CoefficientsByCondition {
  return {
    normal_overtime: settings.workTimePayRules.overtime.normalCoefficient,
    night_work: settings.workTimePayRules.nightWork.coefficient,
    weekly_rest_day_work: settings.workTimePayRules.dayTypePaymentRules.weekly_rest_day.workedTimeCoefficient,
    official_holiday_work: settings.workTimePayRules.dayTypePaymentRules.official_holiday.workedTimeCoefficient,
    organizational_holiday_work: settings.workTimePayRules.dayTypePaymentRules.company_holiday.workedTimeCoefficient,
    mission: settings.workTimePayRules.mission.coefficient,
  };
}

export const PAYROLL_STEPS: Array<{ id: PayrollStepId; title: string; detail: string }> = [
  { id: 'financial', title: 'اطلاعات مالی', detail: 'مزد پایه و زمان موظفی' },
  { id: 'deductions', title: 'کسورات دستمزد', detail: 'بیمه و مالیات' },
  { id: 'benefits', title: 'مزایا', detail: 'اضافات حقوق ثابت' },
  { id: 'variableAmounts', title: 'مبالغ متغیر', detail: 'اضافات و کسورات اختیاری' },
  { id: 'paymentType', title: 'نوع پرداخت حقوق و مزایا', detail: 'دوره‌ای و ماهانه' },
  { id: 'overtime', title: 'پرداخت زمان کاری', detail: 'ضرایب شرایط زمانی کار' },
  { id: 'leave', title: 'مرخصی', detail: 'انتقال و تسویه نهایی' },
  { id: 'mission', title: 'ماموریت', detail: 'قوانین پرداخت ماموریت' },
];

export const BENEFIT_FIELDS: Array<{
  key: keyof PayrollSettings['benefits'];
  label: string;
  helper: string;
}> = [
  { key: 'workerAllowance', label: 'بن کارگری', helper: 'مبلغ بن یا کمک هزینه معیشت که به حقوق اضافه می شود.' },
  { key: 'housingAllowance', label: 'حق مسکن', helper: 'کمک هزینه مسکن که به حقوق اضافه می شود.' },
  { key: 'childAllowance', label: 'حق اولاد', helper: 'مبلغ مربوط به فرزند، در صورت داشتن شرایط قانونی یا قراردادی.' },
  { key: 'marriageAllowance', label: 'حق تاهل', helper: 'مبلغ مربوط به کارمند متاهل.' },
  { key: 'seniorityAllowance', label: 'حق سنوات', helper: 'مزیت مربوط به سابقه کار؛ ممکن است هنگام تسویه محاسبه شود.' },
  { key: 'eidBonus', label: 'عیدی', helper: 'پرداختی مناسبتی یا سالانه که معمولاً جدا از حقوق ماهانه پرداخت می شود.' },
];

export const VARIABLE_TITLE_OTHER: Record<VariableAmountType, string> = {
  addition: 'سایر',
  deduction: 'سایر کسورات',
};

export const VARIABLE_TITLES: Record<VariableAmountType, string[]> = {
  addition: [
    'پاداش عملکرد',
    'کمک‌هزینه ایاب‌وذهاب',
    'کمک‌هزینه پوشاک',
    'کمک‌هزینه غذا',
    'حق تخصص',
    'حق سرپرستی',
    VARIABLE_TITLE_OTHER.addition,
  ],
  deduction: [
    'مالیات حقوق',
    'بیمه تامین اجتماعی',
    'بیمه تکمیلی',
    'وام و مساعده',
    'جرایم و خسارات',
    VARIABLE_TITLE_OTHER.deduction,
  ],
};

export function getVariableTitlePresets(type: VariableAmountType) {
  return VARIABLE_TITLES[type].filter((title) => title !== VARIABLE_TITLE_OTHER[type]);
}

export function isVariableTitleOther(type: VariableAmountType, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return false;
  return !getVariableTitlePresets(type).includes(trimmed);
}

export const SETTLEMENT_RULES: Array<{
  key: keyof PayrollSettings['leave']['finalSettlementRules'];
  label: string;
}> = [
  { key: 'dismissalDueToFault', label: 'اخراج به دلیل قصور' },
  { key: 'noNoticeLeave', label: 'ترک کار بدون اطلاع' },
  { key: 'resignationWithNotice', label: 'استعفا با اطلاع قبلی' },
  { key: 'contractEnd', label: 'پایان دوره قرارداد' },
  { key: 'employeeRequest', label: 'درخواست کارمند' },
];

export const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  financial: {
    dailyBaseSalary: 1793428,
    dailyRequiredMinutes: 440,
  },
  deductions: {
    employerInsurancePercent: 23,
    employeeInsurancePercent: 7,
    taxBrackets: [
      { id: 'tax-1', from: 0, to: 200000000, percent: 0 },
      { id: 'tax-2', from: 200000000, to: 400000000, percent: 5 },
    ],
  },
  benefits: {
    workerAllowance: 11000000,
    housingAllowance: 9000000,
    childAllowance: 11000000,
    marriageAllowance: 9000000,
    seniorityAllowance: 9000000,
    eidBonus: 11000000,
  },
  benefitRules: {
    workerAllowance: { ...DEFAULT_FIXED_BENEFIT_RULES },
    housingAllowance: { ...DEFAULT_FIXED_BENEFIT_RULES },
    childAllowance: { ...DEFAULT_FIXED_BENEFIT_RULES },
    marriageAllowance: { ...DEFAULT_FIXED_BENEFIT_RULES },
    seniorityAllowance: { ...DEFAULT_FIXED_BENEFIT_RULES, includedInWageBase: true },
    eidBonus: { ...DEFAULT_FIXED_BENEFIT_RULES },
  },
  variableAmounts: {
    additions: [],
    deductions: [],
  },
  paymentSchedule: { ...DEFAULT_PAYMENT_SCHEDULE },
  workTimePayRules: {
    overtime: {
      dailyLimitHours: 4,
      normalCoefficient: 1.4,
    },
    nightWork: {
      enabled: true,
      startTime: '22:00',
      endTime: '06:00',
      coefficient: 1.35,
    },
    dayTypePaymentRules: {
      no_shift_day: {
        paidWithoutWork: false,
        paymentBase: 'wageBase',
        unpaidAbsenceImpact: 'none',
        workedTimeCoefficient: 1.4,
      },
      weekly_rest_day: {
        paidWithoutWork: true,
        paymentBase: 'wageBase',
        unpaidAbsenceImpact: 'none',
        workedTimeCoefficient: 1.4,
      },
      official_holiday: {
        paidWithoutWork: true,
        paymentBase: 'wageBase',
        unpaidAbsenceImpact: 'none',
        workedTimeCoefficient: 1.96,
      },
      company_holiday: {
        paidWithoutWork: true,
        paymentBase: 'wageBase',
        unpaidAbsenceImpact: 'none',
        workedTimeCoefficient: 1.4,
      },
    },
    mission: {
      coefficient: 1.89,
    },
    coefficientCombination: {
      defaultMethod: 'additive_percentage',
      exceptionRules: [],
    },
  },
  leave: {
    monthlyQuotaHours: 50,
    transferPolicy: {
      mode: 'carry_forward',
      limits: {
        monthly: { enabled: true, maxHours: 16 },
        quarterly: { enabled: true, maxHours: 32 },
        semiAnnual: { enabled: true, maxHours: 48 },
        annual: { enabled: true, maxHours: 64 },
      },
    },
    transferLimits: {
      monthly: { enabled: true, hours: 16 },
      quarterly: { enabled: true, hours: 32 },
      semiAnnual: { enabled: true, hours: 48 },
      annual: { enabled: true, hours: 64 },
    },
    settlementRatePerHour: 352884,
    finalSettlementRules: {
      dismissalDueToFault: 'cancel',
      noNoticeLeave: 'cancel',
      resignationWithNotice: 'cash',
      contractEnd: 'cash',
      employeeRequest: 'cash',
    },
  },
  mission: {
    ...DEFAULT_MISSION_SETTINGS,
    rules: DEFAULT_MISSION_SETTINGS.rules.map((rule) => ({ ...rule })),
  },
};

export function calculateVariableAmount(item: VariableAmount, monthlyBaseSalary: number, grossPay: number) {
  if (item.calculationMethod === 'fixed') return item.amount;
  const baseAmount = item.calculationBase === 'total_earnings' ? grossPay : monthlyBaseSalary;
  return (baseAmount * item.percent) / 100;
}

export function calculateTax(grossPay: number, taxBrackets: TaxBracket[]) {
  return taxBrackets.reduce((sum, bracket) => {
    const taxableAmount = Math.max(0, Math.min(grossPay, bracket.to) - bracket.from);
    return sum + (taxableAmount * bracket.percent) / 100;
  }, 0);
}

export function calculatePayrollValues(settings: PayrollSettings): PayrollDerivedValues {
  const requiredMinutes = settings.financial.dailyRequiredMinutes || 1;
  const salaryPerMinute = settings.financial.dailyBaseSalary / requiredMinutes;
  const salaryPerHour = salaryPerMinute * 60;
  const monthlyBaseSalary = settings.financial.dailyBaseSalary * 30;

  let wageBaseAmount = monthlyBaseSalary;
  let earningBenefitsAmount = 0;

  // Benefits: only earning items are part of payroll totals
  (Object.keys(settings.benefits) as Array<keyof typeof settings.benefits>).forEach((key) => {
    const rules = settings.benefitRules?.[key] ?? DEFAULT_FIXED_BENEFIT_RULES;
    const amount = settings.benefits[key];
    if (rules.paymentEffect === 'earning') {
      earningBenefitsAmount += amount;
      if (rules.includedInWageBase) {
        wageBaseAmount += amount;
      }
    }
  });

  const initialGrossPay = monthlyBaseSalary + earningBenefitsAmount;

  // Variable additions with earning effect
  const totalOptionalAdditions = settings.variableAmounts.additions.reduce(
    (sum, item) => {
      const rules = item.calculationRules ?? DEFAULT_OPTIONAL_ADDITION_RULES;
      if (rules.paymentEffect === 'earning') {
        const amount = calculateVariableAmount(item, monthlyBaseSalary, initialGrossPay);
        if (rules.includedInWageBase) {
          wageBaseAmount += amount;
        }
        return sum + amount;
      }
      return sum;
    },
    0,
  );
  const totalEarningAmount = initialGrossPay + totalOptionalAdditions;
  const grossPay = totalEarningAmount;

  // Variable deductions with deduction effect
  const totalOptionalDeductions = settings.variableAmounts.deductions.reduce(
    (sum, item) => {
      const rules = item.calculationRules ?? DEFAULT_OPTIONAL_DEDUCTION_RULES;
      if (rules.paymentEffect === 'deduction') {
        return sum + calculateVariableAmount(item, monthlyBaseSalary, grossPay);
      }
      return sum;
    },
    0,
  );

  // Insurance base: sum of items where includedInInsuranceBase = true
  // Base salary always included
  let insuranceBase = monthlyBaseSalary;
  // Benefits
  (Object.keys(settings.benefits) as Array<keyof typeof settings.benefits>).forEach((key) => {
    const rules = settings.benefitRules?.[key] ?? DEFAULT_FIXED_BENEFIT_RULES;
    if (rules.includedInInsuranceBase && rules.paymentEffect === 'earning') {
      insuranceBase += settings.benefits[key];
    }
  });
  // Variable additions
  settings.variableAmounts.additions.forEach((item) => {
    const rules = item.calculationRules ?? DEFAULT_OPTIONAL_ADDITION_RULES;
    if (rules.includedInInsuranceBase && rules.paymentEffect === 'earning') {
        const amount = calculateVariableAmount(item, monthlyBaseSalary, grossPay);
        insuranceBase += amount;
    }
  });

  // Tax base: sum of items where includedInTaxBase = true
  let taxBase = monthlyBaseSalary;
  (Object.keys(settings.benefits) as Array<keyof typeof settings.benefits>).forEach((key) => {
    const rules = settings.benefitRules?.[key] ?? DEFAULT_FIXED_BENEFIT_RULES;
    if (rules.includedInTaxBase && rules.paymentEffect === 'earning') {
      taxBase += settings.benefits[key];
    }
  });
  settings.variableAmounts.additions.forEach((item) => {
    const rules = item.calculationRules ?? DEFAULT_OPTIONAL_ADDITION_RULES;
    if (rules.includedInTaxBase && rules.paymentEffect === 'earning') {
      taxBase += calculateVariableAmount(item, monthlyBaseSalary, grossPay);
    }
  });

  const employeeInsuranceAmount = (insuranceBase * settings.deductions.employeeInsurancePercent) / 100;
  const employerInsuranceAmount = (insuranceBase * settings.deductions.employerInsurancePercent) / 100;
  const estimatedTax = calculateTax(taxBase, settings.deductions.taxBrackets);
  const totalDeductions = employeeInsuranceAmount + estimatedTax + totalOptionalDeductions;

  // Employer costs from variable amounts
  const totalEmployerCosts = settings.variableAmounts.additions.reduce(
    (sum, item) => {
      const rules = item.calculationRules ?? DEFAULT_OPTIONAL_ADDITION_RULES;
      if (rules.paymentEffect === 'employer_cost') {
        return sum + calculateVariableAmount(item, monthlyBaseSalary, grossPay);
      }
      return sum;
    },
    0,
  );

  return {
    fullWorkingDayHours: Math.floor(settings.financial.dailyRequiredMinutes / 60),
    fullWorkingDayMinutes: settings.financial.dailyRequiredMinutes % 60,
    salaryPerMinute,
    salaryPerHour,
    monthlyBaseSalary,
    wageBaseAmount,
    totalEarningAmount,
    totalBenefits: earningBenefitsAmount,
    totalOptionalAdditions,
    totalOptionalDeductions,
    grossPay,
    insuranceBase,
    taxBase,
    employeeInsuranceAmount,
    employerInsuranceAmount,
    estimatedTax,
    totalDeductions,
    netPayable: grossPay - totalDeductions,
    employerTotalCost: grossPay + employerInsuranceAmount + totalEmployerCosts,
    weeklyOvertimeLimit: settings.workTimePayRules.overtime.dailyLimitHours * 7,
    monthlyOvertimeLimit: settings.workTimePayRules.overtime.dailyLimitHours * 28,
  };
}

export function validateTaxBracket(bracket: TaxBracket, existing: TaxBracket[]) {
  if (!Number.isFinite(bracket.from) || !Number.isFinite(bracket.to) || !Number.isFinite(bracket.percent)) {
    return 'همه فیلدهای پله مالیاتی الزامی هستند.';
  }
  if (bracket.from < 0 || bracket.to < 0) return 'مبلغ نمی تواند منفی باشد.';
  if (bracket.from >= bracket.to) return 'مقدار «از» باید کمتر از مقدار «تا» باشد.';
  if (bracket.percent < 0 || bracket.percent > 100) return 'درصد باید بین ۰ تا ۱۰۰ باشد.';
  if (existing.some((item) => item.id !== bracket.id && bracket.from < item.to && bracket.to > item.from)) {
    return 'بازه مالیاتی با بازه دیگری تداخل دارد.';
  }
  return '';
}

export function validateCoefficientExceptionRule(rule: CoefficientExceptionRule, existing: CoefficientExceptionRule[] = []) {
  const errors: Record<string, string> = {};
  if (!rule.name.trim()) errors.name = 'نام قانون الزامی است.';
  if (rule.conditions.length < 2) errors.conditions = 'حداقل دو شرط را انتخاب کنید.';
  if (!rule.method) errors.method = 'روش محاسبه الزامی است.';
  if (!Number.isFinite(rule.priority) || rule.priority <= 0) errors.priority = 'اولویت باید عددی مثبت باشد.';
  if (rule.method === 'fixed_final_coefficient') {
    if (!Number.isFinite(rule.fixedFinalCoefficient ?? Number.NaN) || (rule.fixedFinalCoefficient ?? 0) < 1) {
      errors.fixedFinalCoefficient = 'ضریب نهایی باید عددی مثبت باشد.';
    }
  }
  if (rule.method === 'include_only_selected_conditions') {
    if (!rule.includedConditions.length || rule.includedConditions.some((condition) => !rule.conditions.includes(condition))) {
      errors.includedConditions = 'شرایط انتخاب شده معتبر نیست.';
    }
  }
  if (rule.method === 'exclude_selected_conditions') {
    if (!rule.excludedConditions.length || rule.excludedConditions.some((condition) => !rule.conditions.includes(condition))) {
      errors.excludedConditions = 'شرایط انتخاب شده معتبر نیست.';
    }
  }
  const normalized = [...rule.conditions].sort().join('|');
  const hasDuplicate = existing.some(
    (item) => item.id !== rule.id && item.active && item.conditions.length === rule.conditions.length && [...item.conditions].sort().join('|') === normalized,
  );
  if (hasDuplicate) errors.duplicate = 'برای این ترکیب شرایط، قانون دیگری تعریف شده است.';
  const hasOverlap = existing.some((item) => {
    if (item.id === rule.id) return false;
    const overlap = item.conditions.filter((condition) => rule.conditions.includes(condition)).length;
    return overlap >= 2;
  });
  if (hasOverlap && !errors.duplicate) errors.overlap = 'این قانون ممکن است با قانون های دیگر هم پوشانی داشته باشد. اولویت اعمال قوانین را بررسی کنید.';
  return errors;
}

export function validatePayrollStep(stepId: PayrollStepId, settings: PayrollSettings) {
  const errors: Record<string, string> = {};
  const requiredPositive = (key: string, value: number, allowZero = false) => {
    if (!Number.isFinite(value)) errors[key] = 'این فیلد الزامی است.';
    else if (allowZero ? value < 0 : value <= 0) errors[key] = allowZero ? 'مبلغ نمی تواند منفی باشد.' : 'مقدار باید بیشتر از صفر باشد.';
  };

  if (stepId === 'financial') {
    requiredPositive('dailyBaseSalary', settings.financial.dailyBaseSalary);
    requiredPositive('dailyRequiredMinutes', settings.financial.dailyRequiredMinutes);
    if (settings.financial.dailyRequiredMinutes > 1440) {
      errors.dailyRequiredMinutes = 'دقایق موظفی روزانه نمی تواند بیشتر از ۱۴۴۰ دقیقه باشد.';
    }
  }

  if (stepId === 'deductions') {
    const validatePercent = (key: string, value: number) => {
      if (!Number.isFinite(value) || value < 0 || value > 100) errors[key] = 'درصد باید بین ۰ تا ۱۰۰ باشد.';
    };
    validatePercent('employerInsurancePercent', settings.deductions.employerInsurancePercent);
    validatePercent('employeeInsurancePercent', settings.deductions.employeeInsurancePercent);
    settings.deductions.taxBrackets.forEach((bracket) => {
      const error = validateTaxBracket(bracket, settings.deductions.taxBrackets);
      if (error) errors[`tax-${bracket.id}`] = error;
    });
  }

  if (stepId === 'benefits') {
    BENEFIT_FIELDS.forEach((field) => requiredPositive(field.key, settings.benefits[field.key], true));
  }

  if (stepId === 'paymentType') {
    if (!settings.paymentSchedule?.type) errors.paymentScheduleType = 'نوع پرداخت را انتخاب کنید';
    if (settings.paymentSchedule?.type === 'time_period' && !settings.paymentSchedule?.period) errors.paymentSchedulePeriod = 'دوره پرداخت را انتخاب کنید';
  }

  if (stepId === 'overtime') {
    const rules = settings.workTimePayRules;
    const validateCoefficient = (key: string, value: number) => {
      if (!Number.isFinite(value)) errors[key] = 'این فیلد الزامی است.';
      else if (value <= 0) errors[key] = 'ضریب باید عددی مثبت باشد.';
      else if (value < 1) errors[key] = 'ضریب باید حداقل ۱ باشد.';
    };
    const validateDayTypeRule = (ruleKey: DayTypePaymentRuleKey, rule: DayTypePaymentRule) => {
      const fieldBase = `dayTypePaymentRules.${ruleKey}`;
      if (rule.paidWithoutWork) {
        if (rule.paymentBase !== 'wageBase' && rule.paymentBase !== 'grossPay') {
          errors[`${fieldBase}.paymentBase`] = 'مبنای پرداخت را انتخاب کنید';
        }
        if (
          rule.unpaidAbsenceImpact !== 'none' &&
          rule.unpaidAbsenceImpact !== 'full_deduction' &&
          rule.unpaidAbsenceImpact !== 'proportional_by_minutes'
        ) {
          errors[`${fieldBase}.unpaidAbsenceImpact`] = 'اثر غیبت غیرموجه را انتخاب کنید';
        }
        if (!Number.isFinite(rule.workedTimeCoefficient)) {
          errors[`${fieldBase}.workedTimeCoefficient`] = 'ضریب پرداخت را وارد کنید';
        } else if (rule.workedTimeCoefficient <= 0) {
          errors[`${fieldBase}.workedTimeCoefficient`] = 'ضریب باید عددی مثبت باشد';
        }
      }
    };
    if (!Number.isFinite(rules.overtime.dailyLimitHours)) errors.dailyLimitHours = 'این فیلد الزامی است.';
    else if (rules.overtime.dailyLimitHours <= 0) errors.dailyLimitHours = 'سقف اضافه کاری باید عددی مثبت باشد.';
    if (rules.overtime.dailyLimitHours > 24) errors.dailyLimitHours = 'سقف ساعات روزانه نمی تواند بیشتر از ۲۴ باشد.';
    validateCoefficient('normalCoefficient', rules.overtime.normalCoefficient);
    validateCoefficient('nightCoefficient', rules.nightWork.coefficient);
    validateDayTypeRule('no_shift_day', rules.dayTypePaymentRules.no_shift_day);
    validateDayTypeRule('weekly_rest_day', rules.dayTypePaymentRules.weekly_rest_day);
    validateDayTypeRule('official_holiday', rules.dayTypePaymentRules.official_holiday);
    validateDayTypeRule('company_holiday', rules.dayTypePaymentRules.company_holiday);
    validateCoefficient('missionCoefficient', rules.mission.coefficient);
    if (!rules.coefficientCombination.defaultMethod) errors.defaultCombinationMethod = 'روش محاسبه الزامی است.';
    rules.coefficientCombination.exceptionRules.forEach((rule) => {
      const ruleErrors = validateCoefficientExceptionRule(rule, rules.coefficientCombination.exceptionRules);
      if (Object.keys(ruleErrors).some((key) => key !== 'duplicate' && key !== 'overlap')) {
        errors[`combinationRule-${rule.id}`] = Object.values(ruleErrors)[0];
      }
    });
  }

  if (stepId === 'leave') {
    requiredPositive('monthlyQuotaHours', settings.leave.monthlyQuotaHours);
    requiredPositive('settlementRatePerHour', settings.leave.settlementRatePerHour, true);
    if (settings.leave.transferPolicy.mode === 'carry_forward') {
      Object.entries(settings.leave.transferPolicy.limits).forEach(([key, value]) => {
        if (value.enabled) {
          if (!Number.isFinite(value.maxHours ?? Number.NaN)) errors[key] = 'این فیلد الزامی است.';
          else if ((value.maxHours ?? 0) < 0) errors[key] = 'ساعت انتقال نمی تواند منفی باشد.';
        }
      });
    }
  }

  if (stepId === 'mission') {
    if (settings.mission.enabled) {
      const activeRules = settings.mission.rules.filter((rule) => rule.active);
      if (!activeRules.length) errors.missionRules = 'برای ماموریت فعال، حداقل یک قانون تعریف کنید';
      settings.mission.rules.forEach((rule) => {
        if (!rule.title.trim()) errors[`mission-${rule.id}-title`] = 'عنوان الزامی است';
        if (!Number.isFinite(rule.coefficient) || rule.coefficient <= 0) errors[`mission-${rule.id}-coefficient`] = 'ضریب باید عددی مثبت باشد';
        if (!rule.paymentBase) errors[`mission-${rule.id}-paymentBase`] = 'مبنای پرداخت را انتخاب کنید';
      });
    }
  }

  return errors;
}
