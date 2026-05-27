export type PayrollStepId =
  | 'financial'
  | 'deductions'
  | 'benefits'
  | 'variableAmounts'
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
export type VariableCalculationBase = 'baseSalary' | 'grossPay';

export type VariableAmount = {
  id: string;
  title: string;
  type: VariableAmountType;
  calculationMethod: VariableCalculationMethod;
  amount: number;
  percent: number;
  calculationBase: VariableCalculationBase;
};

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
  variableAmounts: {
    additions: VariableAmount[];
    deductions: VariableAmount[];
  };
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
    weeklyRestDayWork: {
      coefficient: number;
    };
    officialHolidayWork: {
      coefficient: number;
    };
    organizationalHolidayWork: {
      coefficient: number;
    };
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
  mission: {
    status: 'coming_soon';
    readonly: true;
  };
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
  variableAmounts: Partial<PayrollSettings['variableAmounts']>;
  workTimePayRules: Partial<{
    overtime: Partial<PayrollSettings['workTimePayRules']['overtime']>;
    nightWork: Partial<PayrollSettings['workTimePayRules']['nightWork']>;
    weeklyRestDayWork: Partial<PayrollSettings['workTimePayRules']['weeklyRestDayWork']>;
    officialHolidayWork: Partial<PayrollSettings['workTimePayRules']['officialHolidayWork']>;
    organizationalHolidayWork: Partial<PayrollSettings['workTimePayRules']['organizationalHolidayWork']>;
    mission: Partial<PayrollSettings['workTimePayRules']['mission']>;
    coefficientCombination: Partial<PayrollSettings['workTimePayRules']['coefficientCombination']>;
  }>;
  leave: {
    monthlyQuotaHours?: number;
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
  totalBenefits: number;
  totalOptionalAdditions: number;
  totalOptionalDeductions: number;
  grossPay: number;
  employeeInsuranceAmount: number;
  employerInsuranceAmount: number;
  estimatedTax: number;
  totalDeductions: number;
  netPayable: number;
  weeklyOvertimeLimit: number;
  monthlyOvertimeLimit: number;
};

export const PAYROLL_SETTINGS_STORAGE_KEY = 'dastranj-business-payroll-settings-v1';
export const PAYROLL_SETTINGS_YEARS_STORAGE_KEY = 'dastranj-business-payroll-years-v1';
export const PAYROLL_STEPPER_PROGRESS_STORAGE_KEY = 'dastranj-business-payroll-stepper-progress-v1';

export const WORK_TIME_CONDITIONS: Array<{ key: WorkTimeConditionKey; label: string; shortLabel: string }> = [
  { key: 'normal_overtime', label: 'اضافه کاری عادی', shortLabel: 'اضافه کاری' },
  { key: 'night_work', label: 'شب کاری', shortLabel: 'شب کاری' },
  { key: 'weekly_rest_day_work', label: 'جمعه کاری / تعطیل هفتگی', shortLabel: 'جمعه کاری' },
  { key: 'official_holiday_work', label: 'تعطیل کاری رسمی', shortLabel: 'تعطیل رسمی' },
  { key: 'organizational_holiday_work', label: 'تعطیل کاری سازمانی', shortLabel: 'تعطیل سازمانی' },
  { key: 'mission', label: 'ماموریت', shortLabel: 'ماموریت' },
];

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

export function getPayrollSettingsStorageKey(year: number) {
  return `${PAYROLL_SETTINGS_STORAGE_KEY}-year-${year}`;
}

export function getTenantPayrollSettingsStorageKey(year: number) {
  return `${PAYROLL_SETTINGS_STORAGE_KEY}-tenant-year-${year}`;
}

export function getPayrollStepperProgressStorageKey(mode: PayrollSettingsMode, year: number) {
  return `${PAYROLL_STEPPER_PROGRESS_STORAGE_KEY}-${mode}-year-${year}`;
}

export function getPayrollSettingsDraftStorageKey(mode: PayrollSettingsMode, year: number) {
  return `${PAYROLL_SETTINGS_STORAGE_KEY}-draft-${mode}-year-${year}`;
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

function normalizeTransferLimit(value: unknown, fallbackHours: number) {
  if (value && typeof value === 'object') {
    const source = value as { enabled?: unknown; hours?: unknown };
    const hours = typeof source.hours === 'number' && Number.isFinite(source.hours) ? source.hours : null;
    const enabled = typeof source.enabled === 'boolean' ? source.enabled : hours !== null;
    return {
      enabled,
      hours: enabled ? hours : null,
    };
  }
  if (typeof value === 'number') {
    return { enabled: true, hours: value };
  }
  if (value === null || value === undefined) {
    return { enabled: false, hours: null };
  }
  return { enabled: true, hours: fallbackHours };
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

function normalizeLeaveTransferLimits(value: unknown, includeDefaults: boolean) {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const defaults = {
    monthly: 16,
    quarterly: 32,
    semiAnnual: 48,
    annual: 64,
  };
  return {
    monthly: normalizeTransferLimit(source.monthly, includeDefaults ? defaults.monthly : 0),
    quarterly: normalizeTransferLimit(source.quarterly, includeDefaults ? defaults.quarterly : 0),
    semiAnnual: normalizeTransferLimit(source.semiAnnual, includeDefaults ? defaults.semiAnnual : 0),
    annual: normalizeTransferLimit(source.annual, includeDefaults ? defaults.annual : 0),
  };
}

type LegacyOvertime = {
  dailyLimitHours?: number;
  coefficients?: Partial<{ normal: number; night: number; holiday: number; mission: number }>;
};

function mapLegacyOvertime(overtime?: LegacyOvertime) {
  if (!overtime) return undefined;
  return {
    overtime: {
      dailyLimitHours: overtime.dailyLimitHours,
      normalCoefficient: overtime.coefficients?.normal,
    },
    nightWork: {
      coefficient: overtime.coefficients?.night,
    },
    officialHolidayWork: {
      coefficient: overtime.coefficients?.holiday,
    },
    mission: {
      coefficient: overtime.coefficients?.mission,
    },
  };
}

export function normalizePayrollSettings(value: unknown): PayrollSettings {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const workTimePayRules = source.workTimePayRules && typeof source.workTimePayRules === 'object'
    ? source.workTimePayRules as Record<string, unknown>
    : undefined;
  const legacyWorkTimeRules = mapLegacyOvertime(source.overtime as LegacyOvertime | undefined);
  const withMigration = {
    ...source,
    workTimePayRules: workTimePayRules
      ? { ...workTimePayRules, coefficientCombination: normalizeCombination(workTimePayRules.coefficientCombination, true) }
      : legacyWorkTimeRules,
    leave: {
      ...(source.leave && typeof source.leave === 'object' ? source.leave as Record<string, unknown> : {}),
      transferLimits: normalizeLeaveTransferLimits(source.leave && typeof source.leave === 'object' ? (source.leave as Record<string, unknown>).transferLimits : undefined, true),
    },
  };
  return mergeOverrides(DEFAULT_PAYROLL_SETTINGS, withMigration) as PayrollSettings;
}

export function normalizePayrollOverrides(value: unknown): PayrollSettingsOverrides {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const normalized: Record<string, unknown> = { ...source };
  if (source.workTimePayRules) {
    const workTimePayRules = source.workTimePayRules as Record<string, unknown>;
    normalized.workTimePayRules = {
      ...workTimePayRules,
      coefficientCombination: normalizeCombination(workTimePayRules.coefficientCombination, false),
    };
  } else if (source.overtime) {
    normalized.workTimePayRules = mapLegacyOvertime(source.overtime as LegacyOvertime);
  }
  if (source.leave) {
    const leave = source.leave as Record<string, unknown>;
    normalized.leave = {
      ...leave,
      transferLimits: normalizeLeaveTransferLimits(leave.transferLimits, false),
    };
  }
  delete normalized.overtime;
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
    weekly_rest_day_work: settings.workTimePayRules.weeklyRestDayWork.coefficient,
    official_holiday_work: settings.workTimePayRules.officialHolidayWork.coefficient,
    organizational_holiday_work: settings.workTimePayRules.organizationalHolidayWork.coefficient,
    mission: settings.workTimePayRules.mission.coefficient,
  };
}

export const PAYROLL_STEPS: Array<{ id: PayrollStepId; title: string; detail: string }> = [
  { id: 'financial', title: 'اطلاعات مالی', detail: 'مزد پایه و زمان موظفی' },
  { id: 'deductions', title: 'کسورات دستمزد', detail: 'بیمه و مالیات' },
  { id: 'benefits', title: 'مزایا', detail: 'اضافات حقوق ثابت' },
  { id: 'variableAmounts', title: 'مبالغ متغیر', detail: 'اضافات و کسورات اختیاری' },
  { id: 'overtime', title: 'پرداخت زمان کاری', detail: 'ضرایب شرایط زمانی کار' },
  { id: 'leave', title: 'مرخصی', detail: 'انتقال و تسویه نهایی' },
  { id: 'mission', title: 'ماموریت', detail: 'در حال توسعه' },
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

export const VARIABLE_TITLES: Record<VariableAmountType, string[]> = {
  addition: ['پاداش عملکرد', 'کمک هزینه ایاب و ذهاب', 'کمک هزینه پوشاک', 'کمک هزینه غذا', 'حق تخصص', 'حق سرویس', 'سایر'],
  deduction: ['مالیات حقوق سفارشی', 'بیمه تامین اجتماعی سفارشی', 'بیمه تکمیلی', 'وام و مساعده', 'جریمه و خسارت', 'سایر کسورات'],
};

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
  variableAmounts: {
    additions: [],
    deductions: [],
  },
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
    weeklyRestDayWork: {
      coefficient: 1.4,
    },
    officialHolidayWork: {
      coefficient: 1.96,
    },
    organizationalHolidayWork: {
      coefficient: 1.4,
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
    status: 'coming_soon',
    readonly: true,
  },
};

export function calculateVariableAmount(item: VariableAmount, monthlyBaseSalary: number, grossPay: number) {
  if (item.calculationMethod === 'fixed') return item.amount;
  const baseAmount = item.calculationBase === 'baseSalary' ? monthlyBaseSalary : grossPay;
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
  const totalBenefits = Object.values(settings.benefits).reduce((sum, amount) => sum + amount, 0);
  const initialGrossPay = monthlyBaseSalary + totalBenefits;
  const totalOptionalAdditions = settings.variableAmounts.additions.reduce(
    (sum, item) => sum + calculateVariableAmount(item, monthlyBaseSalary, initialGrossPay),
    0,
  );
  const grossPay = initialGrossPay + totalOptionalAdditions;
  const totalOptionalDeductions = settings.variableAmounts.deductions.reduce(
    (sum, item) => sum + calculateVariableAmount(item, monthlyBaseSalary, grossPay),
    0,
  );
  const employeeInsuranceAmount = (grossPay * settings.deductions.employeeInsurancePercent) / 100;
  const employerInsuranceAmount = (grossPay * settings.deductions.employerInsurancePercent) / 100;
  const estimatedTax = calculateTax(grossPay, settings.deductions.taxBrackets);
  const totalDeductions = employeeInsuranceAmount + estimatedTax + totalOptionalDeductions;

  return {
    fullWorkingDayHours: Math.floor(settings.financial.dailyRequiredMinutes / 60),
    fullWorkingDayMinutes: settings.financial.dailyRequiredMinutes % 60,
    salaryPerMinute,
    salaryPerHour,
    monthlyBaseSalary,
    totalBenefits,
    totalOptionalAdditions,
    totalOptionalDeductions,
    grossPay,
    employeeInsuranceAmount,
    employerInsuranceAmount,
    estimatedTax,
    totalDeductions,
    netPayable: grossPay - totalDeductions,
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

  if (stepId === 'overtime') {
    const rules = settings.workTimePayRules;
    const validateCoefficient = (key: string, value: number) => {
      if (!Number.isFinite(value)) errors[key] = 'این فیلد الزامی است.';
      else if (value <= 0) errors[key] = 'ضریب باید عددی مثبت باشد.';
      else if (value < 1) errors[key] = 'ضریب باید حداقل ۱ باشد.';
    };
    if (!Number.isFinite(rules.overtime.dailyLimitHours)) errors.dailyLimitHours = 'این فیلد الزامی است.';
    else if (rules.overtime.dailyLimitHours <= 0) errors.dailyLimitHours = 'سقف اضافه کاری باید عددی مثبت باشد.';
    if (rules.overtime.dailyLimitHours > 24) errors.dailyLimitHours = 'سقف ساعات روزانه نمی تواند بیشتر از ۲۴ باشد.';
    validateCoefficient('normalCoefficient', rules.overtime.normalCoefficient);
    validateCoefficient('nightCoefficient', rules.nightWork.coefficient);
    validateCoefficient('weeklyRestDayWorkCoefficient', rules.weeklyRestDayWork.coefficient);
    validateCoefficient('officialHolidayWorkCoefficient', rules.officialHolidayWork.coefficient);
    validateCoefficient('organizationalHolidayWorkCoefficient', rules.organizationalHolidayWork.coefficient);
    validateCoefficient('missionCoefficient', rules.mission.coefficient);
    if (!rules.coefficientCombination.defaultMethod) errors.defaultCombinationMethod = 'روش محاسبه الزامی است.';
    rules.coefficientCombination.exceptionRules.forEach((rule) => {
      const ruleErrors = validateCoefficientExceptionRule(rule, rules.coefficientCombination.exceptionRules);
      if (Object.keys(ruleErrors).some((key) => key !== 'duplicate' && key !== 'overlap')) {
        errors[`combinationRule-${rule.id}`] = Object.values(ruleErrors)[0];
      }
    });
    if (rules.nightWork.enabled) {
      const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!rules.nightWork.startTime) errors.nightStartTime = 'این فیلد الزامی است.';
      else if (!validTime.test(rules.nightWork.startTime)) errors.nightStartTime = 'ساعت وارد شده معتبر نیست.';
      if (!rules.nightWork.endTime) errors.nightEndTime = 'این فیلد الزامی است.';
      else if (!validTime.test(rules.nightWork.endTime)) errors.nightEndTime = 'ساعت وارد شده معتبر نیست.';
    }
  }

  if (stepId === 'leave') {
    requiredPositive('monthlyQuotaHours', settings.leave.monthlyQuotaHours);
    requiredPositive('settlementRatePerHour', settings.leave.settlementRatePerHour, true);
    Object.entries(settings.leave.transferLimits).forEach(([key, value]) => {
      if (value.enabled) {
        if (!Number.isFinite(value.hours ?? Number.NaN)) errors[key] = 'این فیلد الزامی است.';
        else if ((value.hours ?? 0) < 0) errors[key] = 'ساعت انتقال نمی تواند منفی باشد.';
        else if ((value.hours ?? 0) <= 0) errors[key] = 'مقدار باید عددی مثبت باشد.';
      }
    });
  }

  return errors;
}
