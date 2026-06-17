import type { PolicyWorkspaceSectionValues } from './policy-workspaces';

export type LeaveTypeKey = 'entitlement' | 'sick' | 'unpaid' | 'bonus';
export type LeaveModeKey = 'daily' | 'hourly' | 'multi_day';

export type LeaveRule = {
  enabled: boolean;
  paid: boolean;
  deductsFromEntitlementBalance: boolean;
  requiresAttachment: boolean;
  requestModes: {
    daily: boolean;
    hourly: boolean;
    multiDay: boolean;
  };
  monthlyUsageCapHours: number | null;
  maxUsageHours: number | null;
};

export type LeavePolicyRules = Record<LeaveTypeKey, LeaveRule>;

export type LeaveRequestIdentity = {
  leaveType: LeaveTypeKey;
  leaveMode: LeaveModeKey;
};

const EMPTY_RULE: LeaveRule = {
  enabled: false,
  paid: false,
  deductsFromEntitlementBalance: false,
  requiresAttachment: false,
  requestModes: {
    daily: false,
    hourly: false,
    multiDay: false,
  },
  monthlyUsageCapHours: null,
  maxUsageHours: null,
};

export const DEFAULT_LEAVE_POLICY: LeavePolicyRules = {
  entitlement: {
    enabled: true,
    paid: true,
    deductsFromEntitlementBalance: true,
    requiresAttachment: false,
    requestModes: {
      daily: true,
      hourly: true,
      multiDay: true,
    },
    monthlyUsageCapHours: null,
    maxUsageHours: null,
  },
  sick: {
    enabled: true,
    paid: true,
    deductsFromEntitlementBalance: false,
    requiresAttachment: true,
    requestModes: {
      daily: true,
      hourly: true,
      multiDay: true,
    },
    monthlyUsageCapHours: null,
    maxUsageHours: null,
  },
  unpaid: {
    enabled: true,
    paid: false,
    deductsFromEntitlementBalance: false,
    requiresAttachment: false,
    requestModes: {
      daily: true,
      hourly: true,
      multiDay: true,
    },
    monthlyUsageCapHours: null,
    maxUsageHours: null,
  },
  bonus: {
    enabled: true,
    paid: true,
    deductsFromEntitlementBalance: false,
    requiresAttachment: false,
    requestModes: {
      daily: true,
      hourly: true,
      multiDay: true,
    },
    monthlyUsageCapHours: null,
    maxUsageHours: null,
  },
};

export const LEAVE_VARIANT_TO_TYPE: Record<string, LeaveTypeKey> = {
  annual: 'entitlement',
  sick: 'sick',
  unpaid: 'unpaid',
  bonus: 'bonus',
};

export const LEAVE_TYPE_LABELS: Record<LeaveTypeKey, string> = {
  entitlement: 'استحقاقی',
  sick: 'استعلاجی',
  unpaid: 'بدون حقوق',
  bonus: 'تشویقی',
};

export const LEAVE_TYPE_DESCRIPTIONS: Record<LeaveTypeKey, string> = {
  entitlement: 'مرخصی روزانه و مرخصی ساعتی از سهمیه مرخصی استحقاقی کارمند کم می‌شوند.',
  sick: 'برای مرخصی استعلاجی معمولاً گواهی یا مدرک پزشکی لازم است.',
  unpaid: 'مرخصی بدون حقوق از سهمیه استحقاقی کم نمی‌شود و در بازه تأییدشده پرداخت حقوق ندارد.',
  bonus: 'مرخصی تشویقی با حقوق است و از سهمیه استحقاقی کم نمی‌شود.',
};

export const LEAVE_MODE_LABELS: Record<LeaveModeKey, string> = {
  daily: 'مرخصی روزانه',
  hourly: 'مرخصی ساعتی',
  multi_day: 'چند روز متوالی',
};

export const LEAVE_MODE_TOOLTIPS: Record<'daily' | 'hourly', string> = {
  daily: 'از سهمیه مرخصی استحقاقی کم می‌شود و کل شیفت‌های کاری روز انتخاب‌شده را پوشش می‌دهد.',
  hourly: 'از سهمیه مرخصی استحقاقی کم می‌شود و فقط بازه زمانی انتخاب‌شده را پوشش می‌دهد.',
};

export const LEAVE_TYPE_MODE_TOOLTIPS: Record<LeaveTypeKey, Record<'daily' | 'hourly', string>> = {
  entitlement: {
    daily: LEAVE_MODE_TOOLTIPS.daily,
    hourly: LEAVE_MODE_TOOLTIPS.hourly,
  },
  sick: {
    daily: 'مرخصی استعلاجی برای کل شیفت‌های کاری روز انتخاب‌شده ثبت می‌شود.',
    hourly: 'مرخصی استعلاجی فقط برای بازه زمانی انتخاب‌شده ثبت می‌شود.',
  },
  unpaid: {
    daily: 'برای کل روز کاری ثبت می‌شود و در بازه تأییدشده پرداخت حقوق ندارد.',
    hourly: 'برای بخشی از روز ثبت می‌شود و همان بازه از پرداخت حقوق کسر می‌شود.',
  },
  bonus: {
    daily: 'مرخصی تشویقی برای کل روز کاری ثبت می‌شود و از مانده استحقاقی کم نمی‌شود.',
    hourly: 'مرخصی تشویقی فقط برای بازه زمانی انتخاب‌شده ثبت می‌شود و از مانده استحقاقی کم نمی‌شود.',
  },
};

function numberOrNull(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function boolOrDefault(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function objectValue(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function cloneLeaveRule(rule: LeaveRule): LeaveRule {
  return {
    ...rule,
    requestModes: { ...rule.requestModes },
  };
}

export function cloneLeavePolicy(policy: LeavePolicyRules): LeavePolicyRules {
  return {
    entitlement: cloneLeaveRule(policy.entitlement),
    sick: cloneLeaveRule(policy.sick),
    unpaid: cloneLeaveRule(policy.unpaid),
    bonus: cloneLeaveRule(policy.bonus),
  };
}

export function getDefaultLeaveRule(leaveType: LeaveTypeKey): LeaveRule {
  return cloneLeaveRule(DEFAULT_LEAVE_POLICY[leaveType] ?? EMPTY_RULE);
}

export function normalizeLeaveRule(raw: unknown, leaveType: LeaveTypeKey): LeaveRule {
  const defaults = getDefaultLeaveRule(leaveType);
  const value = objectValue(raw);
  const requestModes = objectValue(value.requestModes);

  return {
    enabled: boolOrDefault(value.enabled, defaults.enabled),
    paid: boolOrDefault(value.paid, defaults.paid),
    deductsFromEntitlementBalance: boolOrDefault(
      value.deductsFromEntitlementBalance,
      defaults.deductsFromEntitlementBalance,
    ),
    requiresAttachment: boolOrDefault(value.requiresAttachment, defaults.requiresAttachment),
    requestModes: {
      daily: boolOrDefault(requestModes.daily, defaults.requestModes.daily),
      hourly: boolOrDefault(requestModes.hourly, defaults.requestModes.hourly),
      multiDay: boolOrDefault(requestModes.multiDay, defaults.requestModes.multiDay),
    },
    monthlyUsageCapHours: numberOrNull(value.monthlyUsageCapHours),
    maxUsageHours: numberOrNull(value.maxUsageHours),
  };
}

export function mergeLeavePolicyRules(base: LeavePolicyRules, overrides: Partial<LeavePolicyRules> | null | undefined): LeavePolicyRules {
  if (!overrides) return cloneLeavePolicy(base);
  return {
    entitlement: normalizeLeaveRule(overrides.entitlement ?? base.entitlement, 'entitlement'),
    sick: normalizeLeaveRule(overrides.sick ?? base.sick, 'sick'),
    unpaid: normalizeLeaveRule(overrides.unpaid ?? base.unpaid, 'unpaid'),
    bonus: normalizeLeaveRule(overrides.bonus ?? base.bonus, 'bonus'),
  };
}

export function parseLeavePolicyRules(value: unknown): LeavePolicyRules | null {
  const raw = objectValue(value);
  if (!Object.keys(raw).length) return null;
  return {
    entitlement: normalizeLeaveRule(raw.entitlement, 'entitlement'),
    sick: normalizeLeaveRule(raw.sick, 'sick'),
    unpaid: normalizeLeaveRule(raw.unpaid, 'unpaid'),
    bonus: normalizeLeaveRule(raw.bonus, 'bonus'),
  };
}

export function parseVariantLeaveRule(sectionValues: PolicyWorkspaceSectionValues): {
  leaveType: LeaveTypeKey;
  rule: LeaveRule;
} | null {
  const variant = typeof sectionValues.variant === 'string' ? sectionValues.variant : '';
  const leaveType = LEAVE_VARIANT_TO_TYPE[variant];
  if (!leaveType) return null;

  const directRule = parseLeavePolicyRules({ [leaveType]: sectionValues.rule })?.[leaveType];
  if (directRule) {
    return { leaveType, rule: directRule };
  }

  const rule = normalizeLeaveRule(
    {
      enabled: sectionValues.enabled,
      paid: sectionValues.paid,
      deductsFromEntitlementBalance: sectionValues.deductsFromEntitlementBalance,
      requiresAttachment: sectionValues.requireAttachment,
      requestModes: {
        daily: sectionValues.dailyModeEnabled,
        hourly: sectionValues.hourlyModeEnabled,
        multiDay: sectionValues.multiDayModeEnabled,
      },
      monthlyUsageCapHours: sectionValues.monthlyLimit,
      maxUsageHours: sectionValues.maxUsageHours,
    },
    leaveType,
  );
  return { leaveType, rule };
}

export function getLeavePolicyDefaultsFromSectionValues(sectionValues: PolicyWorkspaceSectionValues, variant: string): LeaveRule {
  const leaveType = LEAVE_VARIANT_TO_TYPE[variant] ?? 'entitlement';
  const embedded = parseLeavePolicyRules(sectionValues.leavePolicy)?.[leaveType];
  if (embedded) return embedded;
  const variantRule = parseVariantLeaveRule({ ...sectionValues, variant });
  if (variantRule?.leaveType === leaveType) return variantRule.rule;
  return getDefaultLeaveRule(leaveType);
}

export function applyVariantRule(
  current: LeavePolicyRules | null | undefined,
  leaveType: LeaveTypeKey,
  rule: LeaveRule,
): LeavePolicyRules {
  const base = current ? cloneLeavePolicy(current) : cloneLeavePolicy(DEFAULT_LEAVE_POLICY);
  base[leaveType] = normalizeLeaveRule(rule, leaveType);
  return base;
}

export function mapRequestTypeToLeaveIdentity(
  requestType: string,
  rangeType?: string | null,
): LeaveRequestIdentity | null {
  switch (requestType) {
    case 'daily_leave':
      return {
        leaveType: 'entitlement',
        leaveMode: rangeType === 'multi_day' ? 'multi_day' : 'daily',
      };
    case 'hourly_leave':
      return {
        leaveType: 'entitlement',
        leaveMode: 'hourly',
      };
    case 'sick_leave':
      return {
        leaveType: 'sick',
        leaveMode: rangeType === 'hourly' ? 'hourly' : rangeType === 'multi_day' ? 'multi_day' : 'daily',
      };
    case 'unpaid_leave':
      return {
        leaveType: 'unpaid',
        leaveMode: rangeType === 'hourly' ? 'hourly' : rangeType === 'multi_day' ? 'multi_day' : 'daily',
      };
    case 'reward_leave':
      return {
        leaveType: 'bonus',
        leaveMode: rangeType === 'hourly' ? 'hourly' : rangeType === 'multi_day' ? 'multi_day' : 'daily',
      };
    default:
      return null;
  }
}

export function mapLeaveSelectionToRequestType(leaveType: LeaveTypeKey, leaveMode: LeaveModeKey) {
  if (leaveType === 'entitlement') {
    return leaveMode === 'hourly' ? 'hourly_leave' : 'daily_leave';
  }
  if (leaveType === 'sick') return 'sick_leave';
  if (leaveType === 'unpaid') return 'unpaid_leave';
  return 'reward_leave';
}

export function ruleAllowsMode(rule: LeaveRule, leaveMode: LeaveModeKey) {
  if (leaveMode === 'daily') return rule.requestModes.daily;
  if (leaveMode === 'hourly') return rule.requestModes.hourly;
  return rule.requestModes.multiDay;
}
