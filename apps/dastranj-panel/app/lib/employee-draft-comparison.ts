import { formatFaNumber } from './format-fa';
import type { BaseDifference } from './payroll-business-settings';
import {
  DEFAULT_FIXED_BENEFIT_RULES,
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  DEFAULT_PAYMENT_SCHEDULE,
  DEFAULT_SENIORITY_BENEFIT_RULES,
  normalizeCalculationRules,
  normalizeLeaveSettings,
  normalizeMissionSettings,
  normalizePaymentSchedule,
  normalizePayrollSettings,
  normalizeWorkTimePayRules,
  type BusinessSettingYear,
  type PayrollSettings,
  type VariableAmount,
} from './payroll-business-settings';
import type { VariableTemplateItem } from './contract-draft-templates';
import {
  type EmployeeContractDraft,
  type EmployeeDraftTemplateSnapshot,
  EMPLOYEE_BENEFIT_KEYS,
} from './employee-contract-drafts';
import { buildEmployeeDraftCompensationDefaults, syncNightWorkTimesFromTenant } from './employee-contract-compensation';
import {
  buildCollectionCompareLabels,
  buildNumericCompareLabels,
  buildToggleCompareDifference,
  compareCollectionsForMode,
  compareNumbersForMode,
  type PayrollComparisonMode,
} from './payroll-comparison-labels';

export type EmployeeDraftComparisonBaseSnapshot = EmployeeDraftTemplateSnapshot;

export function formatComparisonBaseLabel(year: number) {
  return `مبنای ${formatFaNumber(year, { useGrouping: false })}`;
}

function variableAmountToTemplateItem(item: VariableAmount, type: 'addition' | 'deduction'): VariableTemplateItem {
  return {
    id: item.id,
    title: item.title,
    type,
    method: item.calculationMethod === 'percentage' ? 'percentage' : 'fixed',
    amount: item.amount,
    percent: item.percent,
    base: item.calculationBase === 'total_earnings' ? 'total_earnings' : 'wage_base',
    calculationRules: normalizeCalculationRules(
      item.calculationRules,
      type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES,
    ),
  };
}

export function buildComparisonBaseSnapshot(
  settings: PayrollSettings,
  yearRecord: Pick<BusinessSettingYear, 'id' | 'year' | 'title'>,
): EmployeeDraftComparisonBaseSnapshot {
  const normalized = normalizePayrollSettings(settings);
  const workTimePayRules = normalizeWorkTimePayRules(normalized.workTimePayRules, normalized.workTimePayRules);
  const variableAdditions = normalized.variableAmounts.additions.map((item) => variableAmountToTemplateItem(item, 'addition'));
  const variableDeductions = normalized.variableAmounts.deductions.map((item) => variableAmountToTemplateItem(item, 'deduction'));

  return {
    id: yearRecord.id,
    name: yearRecord.title?.trim() || formatComparisonBaseLabel(yearRecord.year),
    usageType: 'payroll_attendance',
    baseSettingsYear: yearRecord.year,
    classification: {
      contractType: '',
      locationGroup: '',
    },
    timing: {
      durationMonths: 12,
    },
    financial: {
      dailyRequiredMinutes: normalized.financial.dailyRequiredMinutes,
      dailyBaseSalary: normalized.financial.dailyBaseSalary,
    },
    insuranceTax: {
      insuranceEnabled:
        normalized.deductions.employerInsurancePercent > 0 || normalized.deductions.employeeInsurancePercent > 0,
      employerInsurancePercent: normalized.deductions.employerInsurancePercent,
      employeeInsurancePercent: normalized.deductions.employeeInsurancePercent,
      taxEnabled: normalized.deductions.taxBrackets.length > 0,
      taxPayer: 'employee',
      taxBrackets: normalized.deductions.taxBrackets.map((item) => ({ ...item })),
    },
    benefits: {
      workerAllowance: normalized.benefits.workerAllowance,
      housingAllowance: normalized.benefits.housingAllowance,
      childAllowance: normalized.benefits.childAllowance,
      marriageAllowance: normalized.benefits.marriageAllowance,
      seniorityAllowance: normalized.benefits.seniorityAllowance,
    },
    benefitRules: {
      workerAllowance: normalizeCalculationRules(normalized.benefitRules.workerAllowance, DEFAULT_FIXED_BENEFIT_RULES),
      housingAllowance: normalizeCalculationRules(normalized.benefitRules.housingAllowance, DEFAULT_FIXED_BENEFIT_RULES),
      childAllowance: normalizeCalculationRules(normalized.benefitRules.childAllowance, DEFAULT_FIXED_BENEFIT_RULES),
      marriageAllowance: normalizeCalculationRules(normalized.benefitRules.marriageAllowance, DEFAULT_FIXED_BENEFIT_RULES),
      seniorityAllowance: normalizeCalculationRules(
        normalized.benefitRules.seniorityAllowance,
        DEFAULT_SENIORITY_BENEFIT_RULES,
      ),
    },
    benefitsEnd: {
      eidBonus: {
        amount: normalized.benefits.eidBonus,
        period: normalized.benefits.eidBonus > 0 ? 'annual' : 'none',
      },
      endOfService: {
        enabled: true,
        severancePaymentMethod: 'end_of_work',
        finalSettlementEnabled: true,
      },
    },
    variablePayments: {
      enabled: variableAdditions.length > 0 || variableDeductions.length > 0,
      additions: variableAdditions,
      deductions: variableDeductions,
    },
    paymentSchedule: normalizePaymentSchedule(normalized.paymentSchedule, DEFAULT_PAYMENT_SCHEDULE),
    paymentType: {
      type:
        normalized.paymentSchedule.type === 'job_activity'
          ? 'پرداخت بر اساس نوع شغل و فعالیت'
          : normalized.paymentSchedule.type === 'hybrid_special'
            ? 'پرداخت ترکیبی و روش‌های خاص'
            : 'پرداخت بر اساس دوره‌های زمانی',
      period: normalized.paymentSchedule.period ?? 'monthly',
    },
    workTimePayRules,
    leave: normalizeLeaveSettings(normalized.leave, normalized.leave),
    mission: normalizeMissionSettings(normalized.mission, {
      enabled: true,
      rules: [
        {
          id: 'mission-with-stay',
          title: 'ماموریت با اقامتگاه',
          coefficient: workTimePayRules.mission.coefficient,
          paymentBase: 'base_salary',
          active: true,
        },
        {
          id: 'mission-without-stay',
          title: 'ماموریت بدون اقامتگاه',
          coefficient: workTimePayRules.mission.coefficient,
          paymentBase: 'base_salary',
          active: true,
        },
      ],
    }),
    specialCommitments: {
      selected: [],
      attachments: [],
    },
    attachments: {
      requiredDocuments: {},
      files: [],
    },
  };
}

export function buildComparisonBasePayrollSettings(
  tenantSettings: PayrollSettings,
  snapshot: EmployeeDraftComparisonBaseSnapshot,
): PayrollSettings {
  return {
    ...tenantSettings,
    financial: {
      dailyBaseSalary: snapshot.financial.dailyBaseSalary,
      dailyRequiredMinutes: snapshot.financial.dailyRequiredMinutes,
    },
    workTimePayRules: normalizeWorkTimePayRules(snapshot.workTimePayRules ?? tenantSettings.workTimePayRules, tenantSettings.workTimePayRules),
    leave: normalizeLeaveSettings(snapshot.leave ?? tenantSettings.leave, tenantSettings.leave),
  };
}

export function compareWithTemplateSnapshot(
  baseValue: number,
  currentValue: number,
  fieldLabel: string,
  options?: { unit?: string; formatAmount?: (value: number) => string },
): BaseDifference | null {
  return compareNumbersForMode('template', baseValue, currentValue, fieldLabel, options);
}

export function compareWithTenantBaseSnapshot(
  baseValue: number,
  currentValue: number,
  fieldLabel: string,
  baseYear: number,
  options?: { unit?: string; formatAmount?: (value: number) => string },
): BaseDifference | null {
  return compareNumbersForMode('tenant_base', baseValue, currentValue, fieldLabel, { ...options, baseYear });
}

export function compareCollectionsWithTemplate<T>(baseValue: T, currentValue: T, fieldLabel: string): BaseDifference | null {
  return compareCollectionsForMode('template', baseValue, currentValue, fieldLabel);
}

export function compareCollectionsWithTenantBase<T>(
  baseValue: T,
  currentValue: T,
  fieldLabel: string,
  baseYear: number,
): BaseDifference | null {
  return compareCollectionsForMode('tenant_base', baseValue, currentValue, fieldLabel, baseYear);
}

export function buildTemplateToggleDifference(
  enabled: boolean,
  baseEnabled: boolean,
  fieldLabel: string,
): BaseDifference | null {
  return buildToggleCompareDifference('template', enabled, baseEnabled, fieldLabel);
}

export function buildTenantBaseToggleDifference(
  enabled: boolean,
  baseEnabled: boolean,
  fieldLabel: string,
  baseYear: number,
): BaseDifference | null {
  return buildToggleCompareDifference('tenant_base', enabled, baseEnabled, fieldLabel, baseYear);
}

export function buildDualNumericDifference(
  templateValue: number | undefined,
  tenantBaseValue: number | undefined,
  currentValue: number,
  fieldLabel: string,
  tenantBaseYear: number | null | undefined,
  options?: { unit?: string; formatAmount?: (value: number) => string },
) {
  return {
    template: templateValue !== undefined ? compareWithTemplateSnapshot(templateValue, currentValue, fieldLabel, options) : null,
    tenantBase:
      tenantBaseValue !== undefined && tenantBaseYear
        ? compareWithTenantBaseSnapshot(tenantBaseValue, currentValue, fieldLabel, tenantBaseYear, options)
        : null,
  };
}

export function countSnapshotDifferences(
  draft: EmployeeContractDraft,
  snapshot: EmployeeDraftTemplateSnapshot,
  tenantSettings: PayrollSettings,
): number {
  const resolvedDefaults = buildEmployeeDraftCompensationDefaults(snapshot, tenantSettings);
  let count = 0;

  if (snapshot.classification.contractType && snapshot.classification.contractType !== draft.subject.contractType) count += 1;
  if (snapshot.classification.locationGroup && snapshot.classification.locationGroup !== draft.subject.locationGroup) count += 1;
  if (snapshot.financial.dailyRequiredMinutes !== draft.financial.dailyRequiredMinutes) count += 1;
  if (snapshot.financial.dailyBaseSalary !== draft.financial.dailyBaseSalary) count += 1;
  if (snapshot.insuranceTax.insuranceEnabled !== draft.insuranceTax.insuranceEnabled) count += 1;
  if (snapshot.insuranceTax.taxEnabled !== draft.insuranceTax.taxEnabled) count += 1;
  if (snapshot.insuranceTax.taxPayer !== draft.insuranceTax.taxPayer) count += 1;
  count += EMPLOYEE_BENEFIT_KEYS.filter((key) => {
    const current = draft.benefits[key];
    const templateEnabled = snapshot.benefits[key] > 0;
    return templateEnabled !== current.enabled || (current.enabled && snapshot.benefits[key] !== current.amount);
  }).length;
  count += draft.insuranceTax.taxBrackets.filter((bracket) => {
    const base = snapshot.insuranceTax.taxBrackets.find((item) => item.id === bracket.id);
    return !base || base.from !== bracket.from || base.to !== bracket.to || base.percent !== bracket.percent;
  }).length;

  const benefitsEndBase = snapshot.benefitsEnd ?? resolvedDefaults.benefitsEnd;
  const benefitsEnd = draft.benefitsEnd ?? benefitsEndBase;
  if (benefitsEnd.eidBonus.amount !== benefitsEndBase.eidBonus.amount) count += 1;
  if (benefitsEnd.eidBonus.period !== benefitsEndBase.eidBonus.period) count += 1;
  if (benefitsEnd.endOfService.enabled !== benefitsEndBase.endOfService.enabled) count += 1;
  if (benefitsEnd.endOfService.severancePaymentMethod !== benefitsEndBase.endOfService.severancePaymentMethod) count += 1;
  if (benefitsEnd.endOfService.finalSettlementEnabled !== benefitsEndBase.endOfService.finalSettlementEnabled) count += 1;

  const paymentSchedule = draft.paymentSchedule ?? resolvedDefaults.paymentSchedule;
  if (JSON.stringify(paymentSchedule) !== JSON.stringify(snapshot.paymentSchedule ?? snapshot.paymentType)) count += 1;

  const variablePaymentsBase = snapshot.variablePayments ?? resolvedDefaults.variablePayments;
  const variablePayments = draft.variablePayments ?? variablePaymentsBase;
  if (variablePayments.enabled !== variablePaymentsBase.enabled) count += 1;

  if (snapshot.workTimePayRules) {
    const templateRules = syncNightWorkTimesFromTenant(snapshot.workTimePayRules, tenantSettings);
    const currentRules = syncNightWorkTimesFromTenant(draft.workTimePayRules ?? resolvedDefaults.workTimePayRules, tenantSettings);
    if (JSON.stringify(currentRules) !== JSON.stringify(templateRules)) count += 1;
  }
  if (snapshot.leave) {
    const leave = draft.leave ?? resolvedDefaults.leave;
    if (JSON.stringify(leave) !== JSON.stringify(snapshot.leave)) count += 1;
  }

  const missionBase = snapshot.mission ?? resolvedDefaults.mission;
  const mission = draft.mission ?? missionBase;
  if (mission.enabled !== missionBase.enabled) count += 1;
  count += mission.rules.filter((rule) => {
    const baseRule = missionBase.rules.find((item) => item.id === rule.id);
    return !baseRule || JSON.stringify(baseRule) !== JSON.stringify(rule);
  }).length;

  return count;
}

export function countDraftComparisonDifferences(
  draft: EmployeeContractDraft,
  tenantSettings: PayrollSettings,
): number {
  let count = 0;
  if (draft.templateSnapshot) {
    count += countSnapshotDifferences(draft, draft.templateSnapshot, tenantSettings);
  }
  if (draft.comparisonBaseSettingsSnapshot && draft.comparisonBaseYear) {
    count += countSnapshotDifferences(draft, draft.comparisonBaseSettingsSnapshot, tenantSettings);
  }
  return count;
}

export function buildCustomTemplateDifference(message: string, tooltip: string): BaseDifference {
  return { isDifferent: true, direction: 'changed', message, tooltip };
}

export function buildCustomTenantBaseDifference(message: string, tooltip: string, baseYear: number): BaseDifference {
  const baseLabel = formatComparisonBaseLabel(baseYear);
  return {
    isDifferent: true,
    direction: 'changed',
    message: message.includes(baseLabel) ? message : `${message} (${baseLabel})`,
    tooltip,
  };
}

export function compareValuesForMode(
  mode: PayrollComparisonMode,
  baseValue: number,
  currentValue: number,
  fieldLabel: string,
  options?: { unit?: string; formatAmount?: (value: number) => string; baseYear?: number },
): BaseDifference | null {
  return compareNumbersForMode(mode, baseValue, currentValue, fieldLabel, options);
}

export function compareCollectionsForComparisonMode<T>(
  mode: PayrollComparisonMode,
  baseValue: T,
  currentValue: T,
  fieldLabel: string,
  baseYear?: number,
): BaseDifference | null {
  return compareCollectionsForMode(mode, baseValue, currentValue, fieldLabel, baseYear);
}
