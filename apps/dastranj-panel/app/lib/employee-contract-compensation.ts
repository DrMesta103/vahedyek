import type { ContractDraftTemplate } from './contract-draft-templates';
import {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_PAYMENT_SCHEDULE,
  normalizeLeaveSettings,
  normalizePaymentSchedule,
  normalizeWorkTimePayRules,
  type PayrollSettings,
  type PaymentSchedule,
} from './payroll-business-settings';
import {
  buildTemplateSnapshot,
  type EmployeeContractDraft,
  type EmployeePaymentCycle,
} from './employee-contract-drafts';
import type { VariableTemplateItem } from './contract-draft-templates';

export const DEFAULT_EMPLOYEE_PAYMENT_TYPE = 'پرداخت بر اساس دوره‌های زمانی';

export type ResolvedEmployeeDraftCompensation = {
  draft: EmployeeContractDraft;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  benefitsEnd: NonNullable<EmployeeContractDraft['benefitsEnd']>;
  variablePayments: NonNullable<EmployeeContractDraft['variablePayments']>;
  paymentSchedule: PaymentSchedule;
  paymentType: NonNullable<EmployeeContractDraft['paymentType']>;
  workTimePayRules: PayrollSettings['workTimePayRules'];
  leave: PayrollSettings['leave'];
  mission: EmployeeContractDraft['mission'];
  specialCommitments: NonNullable<EmployeeContractDraft['specialCommitments']>;
  attachments: NonNullable<EmployeeContractDraft['attachments']>;
};

export function buildEmployeeDraftCompensationDefaults(
  snapshot: EmployeeContractDraft['templateSnapshot'],
  tenantSettings: PayrollSettings,
): Omit<ResolvedEmployeeDraftCompensation, 'draft' | 'templateSnapshot'> {
  const eidBonusAmount = snapshot?.benefitsEnd?.eidBonus.amount ?? tenantSettings.benefits.eidBonus;
  return {
    benefitsEnd: {
      eidBonus: {
        amount: eidBonusAmount,
        period: snapshot?.benefitsEnd?.eidBonus.period ?? (eidBonusAmount > 0 ? 'annual' : 'none'),
      },
      endOfService: {
        enabled: snapshot?.benefitsEnd?.endOfService.enabled ?? true,
        severancePaymentMethod: snapshot?.benefitsEnd?.endOfService.severancePaymentMethod ?? 'end_of_work',
        finalSettlementEnabled: snapshot?.benefitsEnd?.endOfService.finalSettlementEnabled ?? true,
      },
    },
    variablePayments: {
      enabled: snapshot?.variablePayments?.enabled ?? false,
      additions: snapshot?.variablePayments?.additions ?? [],
      deductions: snapshot?.variablePayments?.deductions ?? [],
    },
    paymentSchedule: normalizePaymentSchedule(snapshot?.paymentSchedule ?? snapshot?.paymentType, DEFAULT_PAYMENT_SCHEDULE),
    paymentType: {
      type: snapshot?.paymentType?.type ?? DEFAULT_EMPLOYEE_PAYMENT_TYPE,
      period: snapshot?.paymentType?.period ?? 'monthly',
    },
    workTimePayRules: normalizeWorkTimePayRules(snapshot?.workTimePayRules ?? tenantSettings.workTimePayRules, tenantSettings.workTimePayRules),
    leave: normalizeLeaveSettings(snapshot?.leave ?? tenantSettings.leave, tenantSettings.leave),
    mission: snapshot?.mission ?? {
      enabled: true,
      rules: [
        {
          id: 'mission-with-stay',
          title: 'ماموریت با اقامتگاه',
          coefficient: tenantSettings.workTimePayRules.mission.coefficient,
          paymentBase: 'base_salary',
          active: true,
        },
        {
          id: 'mission-without-stay',
          title: 'ماموریت بدون اقامتگاه',
          coefficient: tenantSettings.workTimePayRules.mission.coefficient,
          paymentBase: 'base_salary',
          active: true,
        },
      ],
    },
    specialCommitments: snapshot?.specialCommitments ?? { selected: [], attachments: [] },
    attachments: snapshot?.attachments ?? { requiredDocuments: {}, files: [] },
  };
}

export function buildTemplateComparisonPayrollSettings(
  tenantSettings: PayrollSettings,
  snapshot: NonNullable<EmployeeContractDraft['templateSnapshot']>,
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

export function syncNightWorkTimesFromTenant(
  rules: PayrollSettings['workTimePayRules'],
  tenantSettings: PayrollSettings,
): PayrollSettings['workTimePayRules'] {
  return {
    ...rules,
    nightWork: {
      ...rules.nightWork,
      startTime: tenantSettings.workTimePayRules.nightWork.startTime,
      endTime: tenantSettings.workTimePayRules.nightWork.endTime,
    },
  };
}

export function resolveEmployeeDraftCompensation(
  draft: EmployeeContractDraft,
  tenantSettings: PayrollSettings,
  template: ContractDraftTemplate | null | undefined,
): ResolvedEmployeeDraftCompensation {
  const templateSnapshot = draft.templateSnapshot ?? (template ? buildTemplateSnapshot(template, tenantSettings) : null);
  const defaults = buildEmployeeDraftCompensationDefaults(templateSnapshot, tenantSettings);
  const nextTemplateSnapshot = templateSnapshot
    ? {
        ...templateSnapshot,
        benefitsEnd: templateSnapshot.benefitsEnd ?? defaults.benefitsEnd,
        variablePayments: templateSnapshot.variablePayments ?? defaults.variablePayments,
        paymentType: templateSnapshot.paymentType ?? defaults.paymentType,
        workTimePayRules: templateSnapshot.workTimePayRules ?? defaults.workTimePayRules,
        leave: normalizeLeaveSettings(templateSnapshot.leave ?? defaults.leave, tenantSettings.leave),
        mission: templateSnapshot.mission ?? defaults.mission,
        specialCommitments: templateSnapshot.specialCommitments ?? defaults.specialCommitments,
        attachments: templateSnapshot.attachments ?? defaults.attachments,
      }
    : null;

  const benefitsEnd = draft.benefitsEnd ?? defaults.benefitsEnd;
  const variablePayments = draft.variablePayments ?? defaults.variablePayments;
  const paymentSchedule = draft.paymentSchedule ?? defaults.paymentSchedule;
  const paymentType = draft.paymentType ?? defaults.paymentType;
  const workTimePayRules = draft.workTimePayRules ?? defaults.workTimePayRules;
  const leave = normalizeLeaveSettings(draft.leave ?? defaults.leave, tenantSettings.leave);
  const mission = draft.mission ?? defaults.mission;
  const specialCommitments = draft.specialCommitments ?? defaults.specialCommitments;
  const attachments = draft.attachments ?? defaults.attachments;

  return {
    draft: {
      ...draft,
      templateSnapshot: nextTemplateSnapshot,
      benefitsEnd,
      variablePayments,
      paymentSchedule,
      paymentType,
      workTimePayRules,
      leave,
      mission,
      specialCommitments,
      attachments,
    },
    templateSnapshot: nextTemplateSnapshot,
    benefitsEnd,
    variablePayments,
    paymentSchedule,
    paymentType,
    workTimePayRules,
    leave,
    mission,
    specialCommitments,
    attachments,
  };
}

export function buildPayrollSettingsForDraftStep(
  tenantSettings: PayrollSettings,
  financial: EmployeeContractDraft['financial'],
  partial: Pick<PayrollSettings, 'workTimePayRules' | 'leave'> | Pick<PayrollSettings, 'workTimePayRules'> | Pick<PayrollSettings, 'leave'>,
): PayrollSettings {
  return {
    ...tenantSettings,
    financial: {
      dailyBaseSalary: financial.dailyBaseSalary,
      dailyRequiredMinutes: financial.dailyRequiredMinutes,
    },
    ...partial,
  };
}

/** Stable serialization for detecting whether compensation backfill must be persisted. */
export type EmployeeDraftPaymentSchedule = PaymentSchedule;

export function mergeEmployeeDraftPaymentSchedule(
  draft: EmployeeContractDraft,
  fallback: EmployeeDraftPaymentSchedule,
  patch: Partial<EmployeeDraftPaymentSchedule>,
): EmployeeDraftPaymentSchedule {
  const base = draft.paymentSchedule ?? fallback;
  return {
    type: patch.type ?? base.type ?? fallback.type,
    period: patch.period ?? base.period ?? fallback.period,
  };
}

export function mergeEmployeeDraftPaymentType(
  draft: EmployeeContractDraft,
  fallback: { type: string; period: EmployeePaymentCycle },
  patch: Partial<{ type: string; period: EmployeePaymentCycle }>,
) {
  const next = mergeEmployeeDraftPaymentSchedule(
    draft,
    {
      type:
        fallback.type === 'پرداخت بر اساس نوع شغل و فعالیت'
          ? 'job_activity'
          : fallback.type === 'پرداخت ترکیبی و روش‌های خاص'
            ? 'hybrid_special'
            : 'time_period',
      period: fallback.period,
    },
    patch as Partial<EmployeeDraftPaymentSchedule>,
  );
  return {
    type:
      next.type === 'job_activity'
        ? 'پرداخت بر اساس نوع شغل و فعالیت'
        : next.type === 'hybrid_special'
          ? 'پرداخت ترکیبی و روش‌های خاص'
          : 'پرداخت بر اساس دوره‌های زمانی',
    period: next.period,
  };
}

export function getDraftCompensationFingerprint(draft: EmployeeContractDraft): string {
  return JSON.stringify({
    templateSnapshot: draft.templateSnapshot,
    benefitsEnd: draft.benefitsEnd,
    variablePayments: draft.variablePayments,
    paymentType: draft.paymentType,
    paymentSchedule: draft.paymentSchedule,
    workTimePayRules: draft.workTimePayRules,
    leave: draft.leave,
    mission: draft.mission,
    specialCommitments: draft.specialCommitments,
    attachments: draft.attachments,
  });
}

export function hasWorkTimePayRulesTemplateDiff(
  current: PayrollSettings['workTimePayRules'],
  template: PayrollSettings['workTimePayRules'],
  tenantSettings: PayrollSettings,
) {
  const normalizedCurrent = normalizeWorkTimePayRules(current, tenantSettings.workTimePayRules);
  const normalizedTemplate = normalizeWorkTimePayRules(template, tenantSettings.workTimePayRules);
  return (
    JSON.stringify(syncNightWorkTimesFromTenant(normalizedCurrent, tenantSettings)) !==
    JSON.stringify(syncNightWorkTimesFromTenant(normalizedTemplate, tenantSettings))
  );
}
