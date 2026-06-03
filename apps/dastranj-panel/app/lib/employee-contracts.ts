import { DEFAULT_PAYROLL_SETTINGS } from './payroll-business-settings';
import { getEmployeeDraftSteps, type EmployeeContractDraft } from './employee-contract-drafts';

export type EmployeeCurrentContractSummary = {
  id: string;
  employeeId: string;
  status: 'draft' | 'active' | 'ended' | 'canceled';
  isCurrent: boolean;
  startDate: string | null;
  endDate: string | null;
  contractNumber: string | null;
  templateId: string | null;
  templateName: string | null;
  jobTitle: string;
  dailyBaseSalary: number | null;
  dailyRequiredMinutes: number;
  finalizedAt: string | null;
  data: EmployeeContractDraft | Record<string, unknown>;
};

export function getContractLeaveBalanceInputs(
  contract: EmployeeCurrentContractSummary | null,
  options: { fallbackToDefaults?: boolean } = { fallbackToDefaults: true },
) {
  const fallbackToDefaults = options.fallbackToDefaults ?? true;
  const data = contract?.data as Partial<EmployeeContractDraft> | undefined;
  const leave = data?.leave;
  const annualMinutes = Number.isFinite(leave?.monthlyQuotaHours)
    ? Number(leave?.monthlyQuotaHours) * 12 * 60
    : fallbackToDefaults
      ? DEFAULT_PAYROLL_SETTINGS.leave.monthlyQuotaHours * 12 * 60
      : null;
  return {
    annualMinutes,
    dailyRequiredMinutes: contract?.dailyRequiredMinutes ?? (fallbackToDefaults ? DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes : null),
  };
}

export function getContractOvertimeRules(contract: EmployeeCurrentContractSummary | null) {
  const data = contract?.data as Partial<EmployeeContractDraft> | undefined;
  return data?.workTimePayRules ?? DEFAULT_PAYROLL_SETTINGS.workTimePayRules;
}

export type EmployeeContractProfileProgress = {
  hasContract: boolean;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  missingSections: number;
  daysSinceContractStart: number;
};

function daysSinceDate(value: string | null | undefined) {
  if (!value?.trim()) return 0;
  const anchor = new Date(value);
  if (Number.isNaN(anchor.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - anchor.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getEmployeeContractProfileProgress(contract: EmployeeCurrentContractSummary | null): EmployeeContractProfileProgress {
  if (!contract) {
    return {
      hasContract: false,
      completionPercent: 0,
      completedSteps: 0,
      totalSteps: 0,
      missingSections: 0,
      daysSinceContractStart: 0,
    };
  }

  const data = contract.data as Partial<EmployeeContractDraft>;
  const usageType = data.usageType ?? 'payroll_attendance';
  const steps = getEmployeeDraftSteps(usageType).filter((step) => step.implemented);
  const progress = data.progress ?? {};
  let completedSteps = steps.filter((step) => progress[step.id]?.completed).length;
  const totalSteps = steps.length;

  if (contract.status === 'active' && contract.finalizedAt && completedSteps < totalSteps) {
    completedSteps = totalSteps;
  }

  const completionPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const startAnchor = contract.startDate ?? data.timing?.startDate ?? contract.finalizedAt;

  return {
    hasContract: true,
    completionPercent,
    completedSteps,
    totalSteps,
    missingSections: Math.max(0, totalSteps - completedSteps),
    daysSinceContractStart: daysSinceDate(startAnchor),
  };
}
