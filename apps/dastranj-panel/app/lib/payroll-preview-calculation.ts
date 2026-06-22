import type { EmployeeContractDraft } from './employee-contract-drafts';
import type { EmployeeCurrentContractSummary } from './employee-contracts';
import {
  BENEFIT_FIELDS,
  calculateTax,
  calculateVariableAmount,
  DEFAULT_FIXED_BENEFIT_RULES,
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  DEFAULT_PAYROLL_SETTINGS,
  type CalculationRules,
  type PayrollSettings,
} from './payroll-business-settings';
import type { WorkReportDayResult } from './work-report-calculation';

export type PayrollPreviewLineCategory = 'earning' | 'deduction' | 'employer_cost' | 'informational';

export type PayrollPreviewCalculationDetail = {
  formula: string;
  sourceDates: string[];
  sourceRequests: string[];
  contractLabel: string | null;
  policyLabel: string | null;
  components: Array<{ label: string; value: string }>;
};

export type PayrollPreviewLineItem = {
  id: string;
  label: string;
  category: PayrollPreviewLineCategory;
  amount: number;
  minutes?: number;
  hours?: number;
  days?: number;
  coefficient?: number;
  calculationBase?: string;
  includedInInsuranceBase: boolean;
  includedInTaxBase: boolean;
  includedInWageBase: boolean;
  details: PayrollPreviewCalculationDetail;
  incomplete?: boolean;
};

export type PayrollPreviewSummary = {
  mode: 'without_insurance_tax' | 'with_insurance_tax';
  modeLabel: string;
  earnings: PayrollPreviewLineItem[];
  deductions: PayrollPreviewLineItem[];
  wageBaseAmount: number;
  totalEarnings: number;
  totalDeductions: number;
  netPayable: number;
  insuranceBase: number;
  taxBase: number;
  employeeInsuranceAmount: number;
  estimatedTax: number;
  employerInsuranceAmount: number;
  warnings: string[];
  note: string | null;
  isComplete: boolean;
};

export type WorkReportSummaryForPayroll = {
  requiredMinutes: number;
  workedMinutes: number;
  payableWorkMinutes: number;
  presenceMinutes: number;
  absenceMinutes: number;
  overtimeMinutes: number;
  nightWorkMinutes: number;
  leaveMinutes: number;
  unpaidLeaveMinutes: number;
  sickLeaveMinutes: number;
  bonusLeaveMinutes: number;
  entitledLeaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  paidLeaveMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  shortageMinutes: number;
  underworkMinutes: number;
  incompleteAttendanceCount: number;
  workDays: number;
  holidayDays: number;
  loanInstallmentAmount: number;
  salaryAdvanceAmount: number;
};

function formatMinutesHours(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  return { hours: hours + rest / 60, minutes: safe };
}

function buildPayrollSettingsFromContract(
  contract: EmployeeCurrentContractSummary,
  tenantSettings: PayrollSettings,
): PayrollSettings {
  const data = contract.data as Partial<EmployeeContractDraft>;
  const benefits = { ...tenantSettings.benefits };
  const benefitRules = { ...tenantSettings.benefitRules };

  if (data.benefits) {
    (Object.keys(data.benefits) as Array<keyof typeof data.benefits>).forEach((key) => {
      const item = data.benefits?.[key];
      if (item?.enabled && Number.isFinite(item.amount)) {
        benefits[key] = item.amount;
        benefitRules[key] = item.calculationRules ?? benefitRules[key];
      }
    });
  }
  if (data.benefitsEnd?.eidBonus?.amount) {
    benefits.eidBonus = data.benefitsEnd.eidBonus.amount;
  }

  const mapTemplateItems = (
    items: EmployeeContractDraft['variablePayments'] extends { additions: infer A } ? A : never,
    type: 'addition' | 'deduction',
  ) => {
    if (!Array.isArray(items)) return [] as PayrollSettings['variableAmounts']['additions'];
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      type,
      calculationMethod: item.method,
      amount: item.amount,
      percent: item.percent,
      calculationBase: item.base,
      calculationRules: item.calculationRules,
    }));
  };

  const additions =
    data.variablePayments?.enabled && data.variablePayments.additions?.length
      ? mapTemplateItems(data.variablePayments.additions as never, 'addition')
      : tenantSettings.variableAmounts.additions;
  const deductions =
    data.variablePayments?.enabled && data.variablePayments.deductions?.length
      ? mapTemplateItems(data.variablePayments.deductions as never, 'deduction')
      : tenantSettings.variableAmounts.deductions;

  return {
    ...tenantSettings,
    financial: {
      dailyBaseSalary: contract.dailyBaseSalary ?? tenantSettings.financial.dailyBaseSalary,
      dailyRequiredMinutes: contract.dailyRequiredMinutes ?? tenantSettings.financial.dailyRequiredMinutes,
    },
    benefits,
    benefitRules,
    variableAmounts: { additions, deductions },
    workTimePayRules: data.workTimePayRules ?? tenantSettings.workTimePayRules,
    deductions: {
      ...tenantSettings.deductions,
      employeeInsurancePercent:
        data.insuranceTax?.employeeInsurancePercent ?? tenantSettings.deductions.employeeInsurancePercent,
      employerInsurancePercent:
        data.insuranceTax?.employerInsurancePercent ?? tenantSettings.deductions.employerInsurancePercent,
      taxBrackets: data.insuranceTax?.taxBrackets ?? tenantSettings.deductions.taxBrackets,
    },
  };
}

function aggregateDayPayroll(
  days: Array<Pick<WorkReportDayResult, 'payrollEffect'>>,
) {
  return days.reduce(
    (acc, day) => {
      if (!day.payrollEffect) return acc;
      acc.baseSalaryPortion += day.payrollEffect.baseSalaryPortion;
      acc.overtimePortion += day.payrollEffect.overtimePortion;
      acc.nightWorkPortion += day.payrollEffect.nightWorkPortion;
      acc.unpaidLeaveDeduction += day.payrollEffect.unpaidLeaveDeduction;
      acc.absenceDeduction += day.payrollEffect.absenceDeduction;
      acc.shortageDeduction += day.payrollEffect.shortageDeduction;
      return acc;
    },
    {
      baseSalaryPortion: 0,
      overtimePortion: 0,
      nightWorkPortion: 0,
      unpaidLeaveDeduction: 0,
      absenceDeduction: 0,
      shortageDeduction: 0,
    },
  );
}

function makeLineItem(
  id: string,
  label: string,
  category: PayrollPreviewLineCategory,
  amount: number,
  rules: CalculationRules,
  details: PayrollPreviewCalculationDetail,
  extra?: Partial<Pick<PayrollPreviewLineItem, 'minutes' | 'hours' | 'days' | 'coefficient' | 'calculationBase' | 'incomplete'>>,
): PayrollPreviewLineItem {
  return {
    id,
    label,
    category,
    amount: Math.round(amount),
    includedInInsuranceBase: rules.includedInInsuranceBase,
    includedInTaxBase: rules.includedInTaxBase,
    includedInWageBase: rules.includedInWageBase,
    details,
    ...extra,
  };
}

export function buildPayrollPreview(input: {
  contract: EmployeeCurrentContractSummary | null;
  tenantSettings: PayrollSettings;
  summary: WorkReportSummaryForPayroll;
  days: Array<Pick<WorkReportDayResult, 'date' | 'status' | 'payrollEffect' | 'overtimeMinutes' | 'nightWorkMinutes' | 'unpaidLeaveMinutes' | 'shortageMinutes' | 'payableWorkMinutes' | 'missionMinutes'>>;
  includeInsuranceTax: boolean;
  periodLabel: string;
}): PayrollPreviewSummary {
  const warnings: string[] = [];
  const mode = input.includeInsuranceTax ? 'with_insurance_tax' : 'without_insurance_tax';
  const modeLabel = input.includeInsuranceTax ? 'با بیمه و مالیات' : 'بدون بیمه و مالیات';

  if (!input.contract) {
    return {
      mode,
      modeLabel,
      earnings: [],
      deductions: [],
      wageBaseAmount: 0,
      totalEarnings: 0,
      totalDeductions: 0,
      netPayable: 0,
      insuranceBase: 0,
      taxBase: 0,
      employeeInsuranceAmount: 0,
      estimatedTax: 0,
      employerInsuranceAmount: 0,
      warnings: ['برای محاسبه پیش‌نمایش حقوق، قرارداد فعال یافت نشد.'],
      note: input.includeInsuranceTax
        ? 'محاسبه دقیق بیمه/مالیات برای این ماه نیازمند تکمیل قوانین مربوطه است.'
        : 'بیمه و مالیات در این حالت لحاظ نشده‌اند.',
      isComplete: false,
    };
  }

  const settings = buildPayrollSettingsFromContract(input.contract, input.tenantSettings);
  const data = input.contract.data as Partial<EmployeeContractDraft>;
  const insuranceEnabled = data.insuranceTax?.insuranceEnabled !== false;
  const taxEnabled = data.insuranceTax?.taxEnabled !== false;
  const contractLabel = input.contract.contractNumber ?? input.contract.templateName ?? input.contract.jobTitle;

  const dailySalary = settings.financial.dailyBaseSalary;
  const dailyMinutes = settings.financial.dailyRequiredMinutes || DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
  const salaryPerMinute = dailySalary / dailyMinutes;
  const salaryPerHour = salaryPerMinute * 60;
  const monthlyBaseSalary = dailySalary * 30;

  const dayAgg = aggregateDayPayroll(input.days);
  const workRatio =
    input.summary.requiredMinutes > 0
      ? Math.min(1, (input.summary.payableWorkMinutes + input.summary.paidLeaveMinutes) / input.summary.requiredMinutes)
      : input.summary.workDays > 0
        ? input.summary.workDays / 30
        : 0;

  // Use day-aggregated base salary when available, else proportional monthly
  const proportionalBase =
    dayAgg.baseSalaryPortion > 0
      ? dayAgg.baseSalaryPortion
      : monthlyBaseSalary * (input.summary.requiredMinutes > 0 ? input.summary.payableWorkMinutes / input.summary.requiredMinutes : workRatio);

  const earnings: PayrollPreviewLineItem[] = [];
  const deductions: PayrollPreviewLineItem[] = [];

  const overtimeCoefficient = settings.workTimePayRules.overtime.normalCoefficient;
  const nightCoefficient = settings.workTimePayRules.nightWork.coefficient;
  const overtimeAmount =
    dayAgg.overtimePortion > 0
      ? dayAgg.overtimePortion
      : (input.summary.overtimeMinutes / 60) * salaryPerHour * overtimeCoefficient;
  const nightAmount =
    dayAgg.nightWorkPortion > 0
      ? dayAgg.nightWorkPortion
      : (input.summary.nightWorkMinutes / 60) * salaryPerHour * nightCoefficient;

  const overtimeHours = formatMinutesHours(input.summary.overtimeMinutes);
  const nightHours = formatMinutesHours(input.summary.nightWorkMinutes);

  earnings.push(
    makeLineItem(
      'base-salary',
      'حقوق پایه متناسب با کارکرد',
      'earning',
      proportionalBase,
      { ...DEFAULT_FIXED_BENEFIT_RULES, includedInWageBase: true, includedInInsuranceBase: true, includedInTaxBase: true },
      {
        formula: `${Math.round(input.summary.payableWorkMinutes)} دقیقه کارکرد ÷ ${input.summary.requiredMinutes} دقیقه موظفی × ${dailySalary.toLocaleString('fa-IR')} ریال روزانه`,
        sourceDates: input.days.filter((day) => day.payableWorkMinutes > 0).map((day) => day.date),
        sourceRequests: [],
        contractLabel,
        policyLabel: null,
        components: [
          { label: 'حقوق روزانه', value: `${dailySalary.toLocaleString('fa-IR')} ریال` },
          { label: 'کارکرد قابل پرداخت', value: `${input.summary.payableWorkMinutes} دقیقه` },
        ],
      },
      { minutes: input.summary.payableWorkMinutes, calculationBase: 'مزد روزانه قرارداد' },
    ),
  );

  BENEFIT_FIELDS.forEach((field) => {
    const amount = settings.benefits[field.key];
    if (!amount || amount <= 0) return;
    const rules = settings.benefitRules?.[field.key] ?? DEFAULT_FIXED_BENEFIT_RULES;
    if (rules.paymentEffect !== 'earning') return;
    earnings.push(
      makeLineItem(
        `benefit-${field.key}`,
        field.label,
        'earning',
        amount,
        rules,
        {
          formula: `مزایای ثابت ماهانه قرارداد`,
          sourceDates: [],
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [{ label: 'مبلغ ماهانه', value: `${amount.toLocaleString('fa-IR')} ریال` }],
        },
        { calculationBase: 'مزایای ثابت قرارداد' },
      ),
    );
  });

  settings.variableAmounts.additions.forEach((item, index) => {
    const rules = item.calculationRules ?? DEFAULT_OPTIONAL_ADDITION_RULES;
    if (rules.paymentEffect !== 'earning') return;
    const grossEstimate = proportionalBase + settings.benefits.workerAllowance + settings.benefits.housingAllowance;
    const amount = calculateVariableAmount(item, monthlyBaseSalary, grossEstimate);
    if (amount <= 0) return;
    earnings.push(
      makeLineItem(
        `var-add-${index}`,
        item.title || 'پرداخت متغیر افزاینده',
        'earning',
        amount,
        rules,
        {
          formula: item.calculationMethod === 'fixed' ? 'مبلغ ثابت' : `${item.percent}٪ از مبنا`,
          sourceDates: [],
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [{ label: 'روش محاسبه', value: item.calculationMethod === 'fixed' ? 'ثابت' : 'درصدی' }],
        },
      ),
    );
  });

  if (overtimeAmount > 0) {
    earnings.push(
      makeLineItem(
        'overtime',
        'اضافه‌کاری',
        'earning',
        overtimeAmount,
        DEFAULT_OPTIONAL_ADDITION_RULES,
        {
          formula: `${overtimeHours.hours.toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ساعت × نرخ ساعتی مزد مبنا × ضریب ${overtimeCoefficient}`,
          sourceDates: input.days.filter((day) => day.overtimeMinutes > 0).map((day) => day.date),
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [
            { label: 'نرخ ساعتی', value: `${Math.round(salaryPerHour).toLocaleString('fa-IR')} ریال` },
            { label: 'ضریب', value: String(overtimeCoefficient) },
          ],
        },
        { minutes: input.summary.overtimeMinutes, hours: overtimeHours.hours, coefficient: overtimeCoefficient, calculationBase: 'مزد مبنا' },
      ),
    );
  }

  if (nightAmount > 0) {
    earnings.push(
      makeLineItem(
        'night-work',
        'شب‌کاری',
        'earning',
        nightAmount,
        DEFAULT_OPTIONAL_ADDITION_RULES,
        {
          formula: `${nightHours.hours.toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ساعت شب‌کاری بر اساس سیاست کاری × نرخ مبنا × ضریب ${nightCoefficient}`,
          sourceDates: input.days.filter((day) => day.nightWorkMinutes > 0).map((day) => day.date),
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [
            { label: 'منبع بازه شب‌کاری', value: 'سیاست کاری کارمند' },
            { label: 'ضریب', value: String(nightCoefficient) },
          ],
        },
        { minutes: input.summary.nightWorkMinutes, hours: nightHours.hours, coefficient: nightCoefficient, calculationBase: 'مزد مبنا' },
      ),
    );
  }

  if (input.summary.missionMinutes > 0) {
    const missionHours = formatMinutesHours(input.summary.missionMinutes);
    const missionCoefficient = settings.workTimePayRules.mission.coefficient;
    const missionAmount = missionHours.hours * salaryPerHour * missionCoefficient;
    earnings.push(
      makeLineItem(
        'mission',
        'مأموریت',
        'earning',
        missionAmount,
        DEFAULT_OPTIONAL_ADDITION_RULES,
        {
          formula: `${missionHours.hours.toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ساعت × نرخ ساعتی × ضریب ${missionCoefficient}`,
          sourceDates: input.days.filter((day) => day.missionMinutes > 0).map((day) => day.date),
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [{ label: 'ضریب مأموریت', value: String(missionCoefficient) }],
        },
        { minutes: input.summary.missionMinutes, hours: missionHours.hours, coefficient: missionCoefficient },
      ),
    );
  }

  const unpaidDeduction =
    dayAgg.unpaidLeaveDeduction > 0
      ? dayAgg.unpaidLeaveDeduction
      : (input.summary.unpaidLeaveMinutes / 60) * salaryPerHour;
  if (unpaidDeduction > 0) {
    deductions.push(
      makeLineItem(
        'unpaid-leave',
        'مرخصی بدون حقوق',
        'deduction',
        unpaidDeduction,
        DEFAULT_OPTIONAL_DEDUCTION_RULES,
        {
          formula: `${formatMinutesHours(input.summary.unpaidLeaveMinutes).hours.toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ساعت × نرخ ساعتی کسر از حقوق`,
          sourceDates: input.days.filter((day) => day.unpaidLeaveMinutes > 0).map((day) => day.date),
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [{ label: 'نرخ ساعتی', value: `${Math.round(salaryPerHour).toLocaleString('fa-IR')} ریال` }],
        },
        { minutes: input.summary.unpaidLeaveMinutes },
      ),
    );
  }

  const absenceDeduction =
    dayAgg.absenceDeduction > 0 ? dayAgg.absenceDeduction : (input.summary.absenceMinutes / 60) * salaryPerHour;
  if (absenceDeduction > 0) {
    deductions.push(
      makeLineItem(
        'absence',
        'غیبت غیرموجه',
        'deduction',
        absenceDeduction,
        DEFAULT_OPTIONAL_DEDUCTION_RULES,
        {
          formula: `${input.days.filter((day) => day.status === 'غیبت').length} روز کاری بدون تردد معتبر یا درخواست تأییدشده`,
          sourceDates: input.days.filter((day) => day.status === 'غیبت').map((day) => day.date),
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [],
        },
        { days: input.days.filter((day) => day.status === 'غیبت').length },
      ),
    );
  }

  const shortageDeduction =
    dayAgg.shortageDeduction > 0 ? dayAgg.shortageDeduction : (input.summary.shortageMinutes / 60) * salaryPerHour;
  if (shortageDeduction > 0) {
    deductions.push(
      makeLineItem(
        'shortage',
        'کسرکار',
        'deduction',
        shortageDeduction,
        DEFAULT_OPTIONAL_DEDUCTION_RULES,
        {
          formula: `${formatMinutesHours(input.summary.shortageMinutes).hours.toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ساعت کسرکار`,
          sourceDates: input.days.filter((day) => day.shortageMinutes > 0).map((day) => day.date),
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [],
        },
        { minutes: input.summary.shortageMinutes },
      ),
    );
  }

  settings.variableAmounts.deductions.forEach((item, index) => {
    const rules = item.calculationRules ?? DEFAULT_OPTIONAL_DEDUCTION_RULES;
    if (rules.paymentEffect !== 'deduction') return;
    const grossEstimate = earnings.reduce((sum, line) => sum + line.amount, 0);
    const amount = calculateVariableAmount(item, monthlyBaseSalary, grossEstimate);
    if (amount <= 0) return;
    deductions.push(
      makeLineItem(
        `var-ded-${index}`,
        item.title || 'کسورات اختیاری',
        'deduction',
        amount,
        rules,
        {
          formula: item.calculationMethod === 'fixed' ? 'مبلغ ثابت' : `${item.percent}٪ از مبنا`,
          sourceDates: [],
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [],
        },
      ),
    );
  });

  if (input.summary.loanInstallmentAmount > 0) {
    deductions.push(
      makeLineItem(
        'loan',
        'اقساط وام',
        'deduction',
        input.summary.loanInstallmentAmount,
        DEFAULT_OPTIONAL_DEDUCTION_RULES,
        {
          formula: 'اقساط وام ثبت‌شده در درخواست‌های تأییدشده',
          sourceDates: [],
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [],
        },
      ),
    );
  }

  if (input.summary.salaryAdvanceAmount > 0) {
    deductions.push(
      makeLineItem(
        'salary-advance',
        'مساعده',
        'deduction',
        input.summary.salaryAdvanceAmount,
        DEFAULT_OPTIONAL_DEDUCTION_RULES,
        {
          formula: 'مساعده ثبت‌شده در درخواست‌های تأییدشده',
          sourceDates: [],
          sourceRequests: [],
          contractLabel,
          policyLabel: null,
          components: [],
        },
      ),
    );
  }

  let wageBaseAmount = proportionalBase;
  let totalEarnings = 0;
  let insuranceBase = proportionalBase;
  let taxBase = proportionalBase;

  earnings.forEach((item) => {
    totalEarnings += item.amount;
    if (item.includedInWageBase) wageBaseAmount += item.amount;
    if (item.includedInInsuranceBase) insuranceBase += item.amount;
    if (item.includedInTaxBase) taxBase += item.amount;
  });

  let employeeInsuranceAmount = 0;
  let estimatedTax = 0;
  let employerInsuranceAmount = 0;
  let note: string | null = input.includeInsuranceTax ? null : 'بیمه و مالیات در این حالت لحاظ نشده‌اند.';

  if (input.includeInsuranceTax) {
    if (!insuranceEnabled && !taxEnabled) {
      warnings.push('محاسبه دقیق بیمه/مالیات برای این ماه نیازمند تکمیل قوانین مربوطه است.');
      note = 'محاسبه دقیق بیمه/مالیات برای این ماه نیازمند تکمیل قوانین مربوطه است.';
    } else {
      if (insuranceEnabled) {
        employeeInsuranceAmount = (insuranceBase * settings.deductions.employeeInsurancePercent) / 100;
        employerInsuranceAmount = (insuranceBase * settings.deductions.employerInsurancePercent) / 100;
        deductions.push(
          makeLineItem(
            'employee-insurance',
            'بیمه سهم کارمند',
            'deduction',
            employeeInsuranceAmount,
            DEFAULT_OPTIONAL_DEDUCTION_RULES,
            {
              formula: `${insuranceBase.toLocaleString('fa-IR')} ریال مبنای بیمه × ${settings.deductions.employeeInsurancePercent}٪`,
              sourceDates: [],
              sourceRequests: [],
              contractLabel,
              policyLabel: null,
              components: [{ label: 'مبنای بیمه', value: `${insuranceBase.toLocaleString('fa-IR')} ریال` }],
            },
            { calculationBase: 'مبنای بیمه' },
          ),
        );
      }
      if (taxEnabled) {
        estimatedTax = calculateTax(taxBase, settings.deductions.taxBrackets);
        if (estimatedTax > 0) {
          deductions.push(
            makeLineItem(
              'tax',
              'مالیات',
              'deduction',
              estimatedTax,
              DEFAULT_OPTIONAL_DEDUCTION_RULES,
              {
                formula: `محاسبه پلکانی بر مبنای ${taxBase.toLocaleString('fa-IR')} ریال`,
                sourceDates: [],
                sourceRequests: [],
                contractLabel,
                policyLabel: null,
                components: [],
              },
              { calculationBase: 'مبنای مالیات' },
            ),
          );
        }
      }
    }
  }

  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPayable = totalEarnings - totalDeductions;

  if (input.summary.incompleteAttendanceCount > 0) {
    warnings.push(`${input.summary.incompleteAttendanceCount} روز با تردد ناقص در این ماه ثبت شده است.`);
  }
  if (!dailySalary || dailySalary <= 0) {
    warnings.push('حقوق پایه قرارداد برای محاسبه مالی کافی نیست.');
  }

  return {
    mode,
    modeLabel,
    earnings,
    deductions,
    wageBaseAmount: Math.round(wageBaseAmount),
    totalEarnings: Math.round(totalEarnings),
    totalDeductions: Math.round(totalDeductions),
    netPayable: Math.round(netPayable),
    insuranceBase: Math.round(insuranceBase),
    taxBase: Math.round(taxBase),
    employeeInsuranceAmount: Math.round(employeeInsuranceAmount),
    estimatedTax: Math.round(estimatedTax),
    employerInsuranceAmount: Math.round(employerInsuranceAmount),
    warnings,
    note,
    isComplete: Boolean(input.contract?.dailyBaseSalary),
  };
}

export function buildDualPayrollPreviews(input: {
  contract: EmployeeCurrentContractSummary | null;
  tenantSettings: PayrollSettings;
  summary: WorkReportSummaryForPayroll;
  days: Array<Pick<WorkReportDayResult, 'date' | 'status' | 'payrollEffect' | 'overtimeMinutes' | 'nightWorkMinutes' | 'unpaidLeaveMinutes' | 'shortageMinutes' | 'payableWorkMinutes' | 'missionMinutes'>>;
  periodLabel: string;
}) {
  return {
    payrollPreviewWithoutInsuranceTax: buildPayrollPreview({ ...input, includeInsuranceTax: false }),
    payrollPreviewWithInsuranceTax: buildPayrollPreview({ ...input, includeInsuranceTax: true }),
  };
}
