import type { PolicyWorkspaceSectionValues } from './policy-workspaces';

export type RemoteWorkModeKey = 'daily' | 'hourly' | 'multi_day';

export type RemoteWorkAttendanceEffect =
  | 'valid_work_without_punch'
  | 'valid_work_with_punch'
  | 'physical_presence_exempt_only';

export type RemoteWorkPaymentEffect = 'paid_as_work' | 'requires_work_confirmation';

export type RemoteWorkMonthlyLimitType = 'days' | 'hours';

export type RemoteWorkPolicyRules = {
  enabled: boolean;
  requestModes: {
    daily: boolean;
    hourly: boolean;
    multiDay: boolean;
  };
  attendanceEffect: RemoteWorkAttendanceEffect;
  paymentEffect: RemoteWorkPaymentEffect;
  requireReason: boolean;
  requireAttachment: boolean;
  pastDaysEnabled: boolean;
  maxPastDays: number;
  monthlyLimit: {
    type: RemoteWorkMonthlyLimitType;
    value: number | null;
  };
  allowHolidays: boolean;
};

export type RemoteWorkEffect = {
  status: 'approved' | 'pending';
  mode: RemoteWorkModeKey;
  durationMinutes: number;
  attendanceEffect: RemoteWorkAttendanceEffect;
  paymentEffect: RemoteWorkPaymentEffect;
  requiresPunch: boolean;
  preventsAbsence: boolean;
  countsAsWork: boolean;
  payableMinutes: number;
  unpaidMinutes: number;
};

export type RemoteWorkPreviewResult = {
  bases: {
    activeContractLabel: string | null;
    workGroupTitle: string | null;
    workPolicyTitle: string | null;
    shiftTypeLabel: string | null;
    shiftWindowLabel: string | null;
    calendarTitle: string | null;
    workingDayLabel: string | null;
  };
  mode: RemoteWorkModeKey | null;
  requestedDurationMinutes: number | null;
  attendanceEffectLabel: string;
  paymentEffectLabel: string;
  preventsAbsence: boolean;
  requiresPunch: boolean;
  countsAsWork: boolean;
  payableMinutes: number | null;
  unpaidMinutes: number | null;
  monthlyLimitLabel: string | null;
  monthlyUsedLabel: string | null;
  monthlyRemainingLabel: string | null;
  effect: RemoteWorkEffect | null;
  outcomeMessages: string[];
  warnings: string[];
  blockingErrors: string[];
};

export const REMOTE_WORK_MODE_LABELS: Record<RemoteWorkModeKey, string> = {
  daily: 'دورکاری روزانه',
  hourly: 'دورکاری ساعتی',
  multi_day: 'چند روز متوالی',
};

export const REMOTE_WORK_ATTENDANCE_EFFECT_LABELS: Record<RemoteWorkAttendanceEffect, string> = {
  valid_work_without_punch: 'حضور معتبر بدون نیاز به تردد',
  valid_work_with_punch: 'حضور معتبر با الزام ثبت تردد',
  physical_presence_exempt_only: 'فقط مجوز عدم حضور فیزیکی',
};

export const REMOTE_WORK_PAYMENT_EFFECT_LABELS: Record<RemoteWorkPaymentEffect, string> = {
  paid_as_work: 'با حقوق و معادل حضور',
  requires_work_confirmation: 'نیازمند تأیید کارکرد برای پرداخت',
};

export const DEFAULT_REMOTE_WORK_POLICY: RemoteWorkPolicyRules = {
  enabled: true,
  requestModes: {
    daily: true,
    hourly: true,
    multiDay: true,
  },
  attendanceEffect: 'valid_work_without_punch',
  paymentEffect: 'paid_as_work',
  requireReason: true,
  requireAttachment: false,
  pastDaysEnabled: false,
  maxPastDays: 0,
  monthlyLimit: {
    type: 'days',
    value: null,
  },
  allowHolidays: false,
};

function objectValue(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function boolOrDefault(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function numberOrZero(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function numberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function attendanceEffectValue(value: unknown): RemoteWorkAttendanceEffect {
  if (value === 'valid_work_with_punch' || value === 'physical_presence_exempt_only') return value;
  return 'valid_work_without_punch';
}

function paymentEffectValue(value: unknown): RemoteWorkPaymentEffect {
  return value === 'requires_work_confirmation' ? 'requires_work_confirmation' : 'paid_as_work';
}

export function mapRangeTypeToRemoteWorkMode(rangeType?: string | null): RemoteWorkModeKey | null {
  if (rangeType === 'full_day') return 'daily';
  if (rangeType === 'hourly') return 'hourly';
  if (rangeType === 'multi_day') return 'multi_day';
  if (rangeType === 'range') return 'hourly';
  return null;
}

export function mapRemoteWorkModeToRangeType(mode: RemoteWorkModeKey) {
  if (mode === 'daily') return 'full_day' as const;
  if (mode === 'hourly') return 'hourly' as const;
  return 'multi_day' as const;
}

export function remotePolicyAllowsMode(policy: RemoteWorkPolicyRules, mode: RemoteWorkModeKey) {
  if (mode === 'daily') return policy.requestModes.daily;
  if (mode === 'hourly') return policy.requestModes.hourly;
  return policy.requestModes.multiDay;
}

export function parseRemoteWorkPolicy(sectionValues: PolicyWorkspaceSectionValues | Record<string, unknown>): RemoteWorkPolicyRules {
  const rawPolicy = objectValue(sectionValues.remoteWorkPolicy);
  const requestModes = objectValue(rawPolicy.requestModes);
  const monthlyLimit = objectValue(rawPolicy.monthlyLimit);
  const legacyEnabled =
    typeof sectionValues.allowRemote === 'boolean' ? sectionValues.allowRemote : DEFAULT_REMOTE_WORK_POLICY.enabled;

  return {
    enabled: boolOrDefault(rawPolicy.enabled ?? sectionValues.remoteWorkEnabled, legacyEnabled),
    requestModes: {
      daily: boolOrDefault(requestModes.daily ?? sectionValues.remoteDailyModeEnabled, DEFAULT_REMOTE_WORK_POLICY.requestModes.daily),
      hourly: boolOrDefault(requestModes.hourly ?? sectionValues.remoteHourlyModeEnabled, DEFAULT_REMOTE_WORK_POLICY.requestModes.hourly),
      multiDay: boolOrDefault(
        requestModes.multiDay ?? sectionValues.remoteMultiDayModeEnabled,
        DEFAULT_REMOTE_WORK_POLICY.requestModes.multiDay,
      ),
    },
    attendanceEffect: attendanceEffectValue(rawPolicy.attendanceEffect ?? sectionValues.remoteAttendanceEffect),
    paymentEffect: paymentEffectValue(rawPolicy.paymentEffect ?? sectionValues.remotePaymentEffect),
    requireReason: boolOrDefault(rawPolicy.requireReason ?? sectionValues.remoteRequireReason, DEFAULT_REMOTE_WORK_POLICY.requireReason),
    requireAttachment: boolOrDefault(
      rawPolicy.requireAttachment ?? sectionValues.remoteRequireAttachment,
      DEFAULT_REMOTE_WORK_POLICY.requireAttachment,
    ),
    pastDaysEnabled: boolOrDefault(
      rawPolicy.pastDaysEnabled ?? sectionValues.remotePastDaysEnabled,
      DEFAULT_REMOTE_WORK_POLICY.pastDaysEnabled,
    ),
    maxPastDays: numberOrZero(rawPolicy.maxPastDays ?? sectionValues.remoteMaxPastDays, DEFAULT_REMOTE_WORK_POLICY.maxPastDays),
    monthlyLimit: {
      type: monthlyLimit.type === 'hours' || sectionValues.remoteMonthlyLimitType === 'hours' ? 'hours' : 'days',
      value: numberOrNull(monthlyLimit.value ?? sectionValues.remoteMonthlyLimitValue),
    },
    allowHolidays: boolOrDefault(rawPolicy.allowHolidays ?? sectionValues.remoteAllowHolidays, DEFAULT_REMOTE_WORK_POLICY.allowHolidays),
  };
}

export function buildRemoteWorkPolicyPayload(formData: FormData, previousSectionValues: Record<string, unknown>) {
  const previous = parseRemoteWorkPolicy(previousSectionValues);
  const boolValue = (name: string, fallback: boolean) => {
    const raw = formData.get(name);
    if (raw == null) return fallback;
    return raw === 'on' || raw === 'true' || raw === '1';
  };
  const monthlyLimitType = formData.get('remoteMonthlyLimitType')?.toString() === 'hours' ? 'hours' : 'days';
  const monthlyLimitValue = numberOrNull(formData.get('remoteMonthlyLimitValue')?.toString() ?? '');
  const policy: RemoteWorkPolicyRules = {
    enabled: boolValue('remoteWorkEnabled', previous.enabled),
    requestModes: {
      daily: boolValue('remoteDailyModeEnabled', previous.requestModes.daily),
      hourly: boolValue('remoteHourlyModeEnabled', previous.requestModes.hourly),
      multiDay: boolValue('remoteMultiDayModeEnabled', previous.requestModes.multiDay),
    },
    attendanceEffect: attendanceEffectValue(formData.get('remoteAttendanceEffect')?.toString() ?? previous.attendanceEffect),
    paymentEffect: paymentEffectValue(formData.get('remotePaymentEffect')?.toString() ?? previous.paymentEffect),
    requireReason: boolValue('remoteRequireReason', previous.requireReason),
    requireAttachment: boolValue('remoteRequireAttachment', previous.requireAttachment),
    pastDaysEnabled: boolValue('remotePastDaysEnabled', previous.pastDaysEnabled),
    maxPastDays: numberOrZero(formData.get('remoteMaxPastDays')?.toString(), previous.maxPastDays),
    monthlyLimit: {
      type: monthlyLimitType,
      value: monthlyLimitValue,
    },
    allowHolidays: boolValue('remoteAllowHolidays', previous.allowHolidays),
  };

  return {
    remoteWorkPolicy: policy,
    allowRemote: policy.enabled,
    remoteWorkEnabled: policy.enabled,
    remoteDailyModeEnabled: policy.requestModes.daily,
    remoteHourlyModeEnabled: policy.requestModes.hourly,
    remoteMultiDayModeEnabled: policy.requestModes.multiDay,
    remoteAttendanceEffect: policy.attendanceEffect,
    remotePaymentEffect: policy.paymentEffect,
    remoteRequireReason: policy.requireReason,
    remoteRequireAttachment: policy.requireAttachment,
    remotePastDaysEnabled: policy.pastDaysEnabled,
    remoteMaxPastDays: policy.maxPastDays,
    remoteMonthlyLimitType: policy.monthlyLimit.type,
    remoteMonthlyLimitValue: policy.monthlyLimit.value,
    remoteAllowHolidays: policy.allowHolidays,
  };
}

export function deriveRemoteWorkEffect(input: {
  policy: RemoteWorkPolicyRules;
  mode: RemoteWorkModeKey;
  durationMinutes: number;
  submissionMode: 'approved' | 'pending';
}): RemoteWorkEffect {
  const requiresPunch = input.policy.attendanceEffect === 'valid_work_with_punch';
  const preventsAbsence =
    input.policy.attendanceEffect === 'valid_work_without_punch' ||
    input.policy.attendanceEffect === 'valid_work_with_punch' ||
    input.policy.attendanceEffect === 'physical_presence_exempt_only';
  const countsAsWork = input.policy.attendanceEffect !== 'physical_presence_exempt_only';
  const payableMinutes =
    input.submissionMode === 'approved' && input.policy.paymentEffect === 'paid_as_work' ? input.durationMinutes : 0;
  const unpaidMinutes =
    input.submissionMode === 'approved' && input.policy.paymentEffect === 'requires_work_confirmation'
      ? input.durationMinutes
      : 0;

  return {
    status: input.submissionMode === 'approved' ? 'approved' : 'pending',
    mode: input.mode,
    durationMinutes: input.durationMinutes,
    attendanceEffect: input.policy.attendanceEffect,
    paymentEffect: input.policy.paymentEffect,
    requiresPunch,
    preventsAbsence,
    countsAsWork,
    payableMinutes,
    unpaidMinutes,
  };
}

export function formatRemoteMonthlyLimitLabel(policy: RemoteWorkPolicyRules) {
  if (!policy.monthlyLimit.value) return null;
  const unit = policy.monthlyLimit.type === 'hours' ? 'ساعت' : 'روز';
  return `${policy.monthlyLimit.value.toLocaleString('fa-IR')} ${unit}`;
}
