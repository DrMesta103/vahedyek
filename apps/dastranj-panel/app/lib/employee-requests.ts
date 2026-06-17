import { redirect } from 'next/navigation';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from './prisma';
import { getSessionContext } from './auth';
import { ensureTenantDefaultRequestReasons } from './request-reason-defaults';
import { DEFAULT_PAYROLL_SETTINGS } from './payroll-business-settings';
import {
  buildShiftContextForDate,
  formatMinutesLabel,
  loadTenantPayrollSettingsForYear,
  previewAttendanceCorrection,
  readAttendancePolicyBundle,
  type AttendancePreviewResult,
} from './attendance-calculation';
import { getContractLeaveBalanceInputs, getContractOvertimeRules } from './employee-contracts';
import { getCurrentEmployeeContract, getEmployeeContractForDate } from './employee-contracts.server';
import { getPersianPartsFromDate, formatPersianYmd } from './calendar-dates';
import { parseCalendarStoredEvents } from './calendar-events';
import { getDayDetails } from './calendar-grid';
import { listCalendarShifts, listExcludedShiftDates, listWeekendOverrideDates } from './calendar-shifts';
import {
  cloneLeavePolicy,
  DEFAULT_LEAVE_POLICY,
  type LeavePolicyRules,
  type LeaveTypeKey,
  mapRequestTypeToLeaveIdentity,
  mergeLeavePolicyRules,
  parseLeavePolicyRules,
  parseVariantLeaveRule,
  ruleAllowsMode,
} from './leave-policy';
import {
  calculateRemoteWorkDurationMinutes,
  getRemoteWorkDayDetails,
  isRemoteWorkBlockedDay,
  type RemoteWorkDayContext,
} from './remote-work-duration';
import {
  deriveRemoteWorkEffect,
  formatRemoteMonthlyLimitLabel,
  mapRangeTypeToRemoteWorkMode,
  parseRemoteWorkPolicy,
  DEFAULT_REMOTE_WORK_POLICY,
  REMOTE_WORK_ATTENDANCE_EFFECT_LABELS,
  REMOTE_WORK_MODE_LABELS,
  REMOTE_WORK_PAYMENT_EFFECT_LABELS,
  remotePolicyAllowsMode,
  type RemoteWorkModeKey,
  type RemoteWorkPreviewResult,
  type RemoteWorkPolicyRules,
} from './remote-work-policy';
import { summarizeShiftForDayPanel } from './calendar-shift-display';
import type { RequestReasonCategoryKey } from './constants';

export type EmployeeRequestType = RequestReasonCategoryKey;
export type EmployeeRequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
export type EmployeeRequestSubmissionMode = 'approved' | 'pending';
export type EmployeeRequestRangeType = 'full_day' | 'multi_day' | 'hourly' | 'range' | 'point';
// Legacy compatibility for older attendance records and future imports.
export type AttendanceActionType = 'check_in' | 'check_out' | 'correction';

export type AttachmentDraft = {
  id: string;
  ownerType?: string;
  ownerId?: string;
  categoryId?: string | null;
  categoryName: string;
  titleId?: string | null;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  issuedAt?: string | null;
  description?: string | null;
  uploadedAt?: string;
};

export type CompanyLoanItem = {
  id: string;
  title: string;
  guarantorCount: number;
  minAmount: number;
  maxAmount: number;
  minInstallments: number;
  maxInstallments: number;
  feeRate: number;
  interestRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRequestItem = {
  id: string;
  employeeId: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  submissionMode: EmployeeRequestSubmissionMode;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  rangeType: EmployeeRequestRangeType | null;
  attendanceActionType: AttendanceActionType | null;
  amount: number | null;
  loanId: string | null;
  loanTitle: string | null;
  installments: number | null;
  reasonId: string | null;
  reasonTitle: string | null;
  description: string | null;
  calculatedDurationMinutes: number | null;
  calculationMeta: Record<string, unknown>;
  attachmentCount: number;
  attachments: AttachmentDraft[];
  createdBy: string | null;
  approvedBy: string | null;
  rejectedBy: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRequestsEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  personnelCode: string | null;
  jobTitle: string;
  organizationUnitTitle: string;
  workGroupTitle: string;
  hasActiveContract: boolean;
  currentContractId?: string | null;
  overtimeRules?: ReturnType<typeof getContractOvertimeRules> | null;
};

export type RequestReasonOption = {
  id: string;
  title: string;
  description: string | null;
  category: EmployeeRequestType;
};

export type LeaveBalanceSummary = {
  annualMinutes: number | null;
  usedMinutes: number;
  remainingMinutes: number | null;
  dailyRequiredMinutes: number | null;
};

export type EmployeeLeaveRulePresentation = {
  leaveType: LeaveTypeKey;
  enabled: boolean;
  paid: boolean;
  deductsFromEntitlementBalance: boolean;
  requiresAttachment: boolean;
  requestModes: LeavePolicyRules[LeaveTypeKey]['requestModes'];
};

export type EmployeeLeaveRequestContext = {
  hasWorkGroup: boolean;
  hasWorkPolicy: boolean;
  policyId: string | null;
  policyTitle: string | null;
  leaveRules: LeavePolicyRules;
  ruleCards: EmployeeLeaveRulePresentation[];
};

export type EmployeeRemoteWorkRequestContext = {
  hasWorkGroup: boolean;
  hasWorkPolicy: boolean;
  policyId: string | null;
  policyTitle: string | null;
  remotePolicy: RemoteWorkPolicyRules;
};

export type EmployeeRequestPreview = {
  activeContractId: string | null;
  activeContractLabel: string | null;
  workGroupId: string | null;
  workGroupTitle: string | null;
  workPolicyId: string | null;
  workPolicyTitle: string | null;
  calendarId: string | null;
  calendarTitle: string | null;
  shiftLabel: string | null;
  requestedDurationMinutes: number | null;
  payableDurationMinutes: number | null;
  unpaidDurationMinutes: number | null;
  balanceEffectMinutes: number | null;
  estimatedPayTitle: string | null;
  attendanceEffectTitle: string | null;
  warnings: string[];
  blockingErrors: string[];
  leaveBalanceRemainingMinutes: number | null;
  leaveBalanceAfterApprovalMinutes: number | null;
  leaveRule: EmployeeLeaveRulePresentation | null;
  overtime: {
    requestedMinutes: number | null;
    validMinutes: number | null;
    beforeShiftMinutes: number | null;
    afterShiftMinutes: number | null;
    invalidMinutes: number | null;
    dailyLimitMinutes: number | null;
    coefficient: number | null;
    requiresAttachment: boolean;
    beforeShiftAllowed: boolean;
    afterShiftAllowed: boolean;
  } | null;
  attendance: AttendancePreviewResult | null;
  remoteWork: RemoteWorkPreviewResult | null;
};

export type EmployeeRequestFormPayload = {
  id?: string;
  employeeId: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  submissionMode: EmployeeRequestSubmissionMode;
  rangeType?: EmployeeRequestRangeType | null;
  attendanceActionType?: AttendanceActionType | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  dateTime?: string | null;
  amount?: number | null;
  loanId?: string | null;
  installments?: number | null;
  reasonId?: string | null;
  description?: string | null;
  attachments?: AttachmentDraft[];
};

type RawEmployeeRequestRow = {
  id: string;
  employeeId: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  submissionMode: EmployeeRequestSubmissionMode;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  rangeType: EmployeeRequestRangeType | null;
  attendanceActionType: AttendanceActionType | null;
  amount: Decimal | number | string | null;
  loanId: string | null;
  loanTitle: string | null;
  installments: number | null;
  reasonId: string | null;
  reasonTitle: string | null;
  description: string | null;
  calculatedDurationMinutes: number | null;
  calculationMeta: unknown;
  attachmentCount: bigint | number;
  createdBy: string | null;
  approvedBy: string | null;
  rejectedBy: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawAttachmentRow = {
  id: string;
  ownerType: string;
  ownerId: string;
  categoryId: string | null;
  categoryName: string;
  titleId: string | null;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  issuedAt: string | null;
  description: string | null;
  uploadedAt: Date;
};

async function requireTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return { tenantId: session.tenantId, userName: session.user?.fullName ?? session.user?.email ?? 'مدیر سیستم' };
}

function numberValue(value: Decimal | number | string | null | undefined) {
  if (value == null) return null;
  return typeof value === 'number' ? value : Number(value.toString());
}

function dateValue(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function timeToMinutes(value?: string | null) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function positiveDuration(startTime?: string | null, endTime?: string | null) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start == null || end == null) return null;
  return Math.max(0, end - start);
}

function toIsoDate(value?: string | null) {
  const trimmed = value?.trim().slice(0, 10) ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function isoDateToPersianYmd(value?: string | null) {
  const isoDate = toIsoDate(value);
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return formatPersianYmd(getPersianPartsFromDate(new Date(Date.UTC(year, month - 1, day, 12, 0, 0))));
}

function inclusiveIsoDateRange(startDate?: string | null, endDate?: string | null) {
  const startIso = toIsoDate(startDate);
  const endIso = toIsoDate(endDate ?? startDate);
  if (!startIso || !endIso) return [];
  const start = new Date(`${startIso}T12:00:00Z`);
  const end = new Date(`${endIso}T12:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];

  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function requestAnchorDates(payload: EmployeeRequestFormPayload) {
  if (payload.requestType === 'salary_advance' || payload.requestType === 'loan') return [] as string[];
  if (payload.requestType === 'attendance') return payload.startDate ? [payload.startDate] : [];
  if (payload.rangeType === 'multi_day') return inclusiveIsoDateRange(payload.startDate, payload.endDate);
  if (payload.rangeType === 'range') return inclusiveIsoDateRange(payload.startDate, payload.endDate);
  return payload.startDate ? [payload.startDate] : [];
}

function contractLabel(contract: Awaited<ReturnType<typeof getEmployeeContractForDate>>) {
  if (!contract) return null;
  return contract.contractNumber || contract.templateName || contract.jobTitle || contract.id;
}

function daysBetweenIsoDates(fromDate?: string | null, toDate?: string | null) {
  const fromIso = toIsoDate(fromDate);
  const toIso = toIsoDate(toDate);
  if (!fromIso || !toIso) return Number.POSITIVE_INFINITY;
  const from = new Date(`${fromIso}T12:00:00Z`).getTime();
  const to = new Date(`${toIso}T12:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

function remoteWorkDayContext(context: ResolvedLeaveContext): RemoteWorkDayContext {
  return {
    weekends: context.weekends,
    singleHolidays: context.singleHolidays,
    shifts: context.shifts,
    excludedShiftDates: context.excludedShiftDates,
    weekendOverrideDates: context.weekendOverrideDates,
    policySectionValues: context.policySectionValues,
  };
}

function isHourlyOutsideShiftWindow(startTime?: string | null, endTime?: string | null, shiftWindowLabel?: string | null) {
  if (!shiftWindowLabel || !startTime || !endTime) return false;
  const [shiftStart, shiftEnd] = shiftWindowLabel.split(' تا ');
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const windowStart = timeToMinutes(shiftStart);
  const windowEnd = timeToMinutes(shiftEnd);
  if (start == null || end == null || windowStart == null || windowEnd == null) return false;
  return start < windowStart || end > windowEnd;
}

function countRemoteWorkMonthlyUsage(
  requests: Array<{
    calculatedDurationMinutes: number | null;
    rangeType: EmployeeRequestRangeType | null;
    startDate: string | null;
    endDate: string | null;
    calculationMeta: unknown;
  }>,
  limitType: 'days' | 'hours',
) {
  if (limitType === 'hours') {
    return requests.reduce((sum, request) => sum + Math.max(0, Number(request.calculatedDurationMinutes ?? 0)), 0) / 60;
  }
  return requests.reduce((sum, request) => {
    const mode = mapRangeTypeToRemoteWorkMode(request.rangeType);
    if (mode === 'daily') return sum + 1;
    if (mode === 'hourly') return sum + 1;
    const dates = inclusiveIsoDateRange(request.startDate, request.endDate);
    return sum + dates.length;
  }, 0);
}

function membershipAnchorDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function getPolicyCalendarId(
  policy:
    | {
        calendarId?: string | null;
        sectionValues?: unknown;
      }
    | null
    | undefined,
) {
  if (policy?.calendarId) return policy.calendarId;
  const sectionValues =
    policy?.sectionValues && typeof policy.sectionValues === 'object' && !Array.isArray(policy.sectionValues)
      ? (policy.sectionValues as Record<string, unknown>)
      : {};
  const embeddedCalendarId =
    typeof sectionValues.calendarId === 'string'
      ? sectionValues.calendarId
      : typeof sectionValues.selectedCalendarId === 'string'
        ? sectionValues.selectedCalendarId
        : null;
  return embeddedCalendarId?.trim() ? embeddedCalendarId : null;
}

type ResolvedLeaveContext = {
  workGroupId: string | null;
  workGroupTitle: string | null;
  hasWorkGroup: boolean;
  hasWorkPolicy: boolean;
  workPolicyId: string | null;
  workPolicyTitle: string | null;
  calendarId: string | null;
  calendarTitle: string | null;
  leaveRules: LeavePolicyRules;
  remoteWorkPolicy: RemoteWorkPolicyRules;
  policySectionValues: Record<string, unknown>;
  weekends: string[];
  singleHolidays: ReturnType<typeof parseCalendarStoredEvents>;
  shifts: ReturnType<typeof listCalendarShifts>;
  excludedShiftDates: string[];
  weekendOverrideDates: string[];
};

type ResolvedRequestContext = ResolvedLeaveContext & {
  overtimePolicy: {
    requireAttachment: boolean;
    fromAttendance: boolean;
    beforeShift: boolean;
    afterShift: boolean;
  };
};

function isWorkingDay(leaveContext: ResolvedLeaveContext | null, isoDate: string) {
  if (!leaveContext) return true;
  const persianDate = isoDateToPersianYmd(isoDate);
  if (!persianDate) return true;
  const dayDetails = getDayDetails({
    date: persianDate,
    weekends: leaveContext.weekends,
    singleHolidays: leaveContext.singleHolidays,
    shifts: leaveContext.shifts,
    excludedShiftDates: leaveContext.excludedShiftDates,
    weekendOverrideDates: leaveContext.weekendOverrideDates,
  });
  return !dayDetails.isHoliday && dayDetails.shifts.length > 0;
}

function calculateDuration(
  payload: EmployeeRequestFormPayload,
  dailyRequiredMinutes: number,
  leaveContext?: ResolvedLeaveContext | null,
) {
  if (payload.requestType === 'attendance') return null;
  if (payload.requestType === 'salary_advance' || payload.requestType === 'loan') return null;
  if (payload.requestType === 'remote_work') {
    const mode = mapRangeTypeToRemoteWorkMode(payload.rangeType);
    if (!mode || !leaveContext) return null;
    return calculateRemoteWorkDurationMinutes({
      mode,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      context: remoteWorkDayContext(leaveContext),
      fallbackRequiredMinutes: dailyRequiredMinutes,
      allowHolidays: leaveContext.remoteWorkPolicy.allowHolidays,
    });
  }
  if (payload.rangeType === 'hourly') return positiveDuration(payload.startTime, payload.endTime);
  if (payload.rangeType === 'full_day') {
    if (payload.requestType && mapRequestTypeToLeaveIdentity(payload.requestType, payload.rangeType)) {
      return payload.startDate && isWorkingDay(leaveContext ?? null, payload.startDate) ? dailyRequiredMinutes : 0;
    }
    return dailyRequiredMinutes;
  }
  if (payload.rangeType === 'multi_day') {
    const dates = inclusiveIsoDateRange(payload.startDate, payload.endDate);
    if (!dates.length) return 0;
    if (payload.requestType && mapRequestTypeToLeaveIdentity(payload.requestType, payload.rangeType)) {
      return dates.filter((date) => isWorkingDay(leaveContext ?? null, date)).length * dailyRequiredMinutes;
    }
    return dates.length * dailyRequiredMinutes;
  }
  return positiveDuration(payload.startTime, payload.endTime) ?? dailyRequiredMinutes;
}

function calculationMeta(
  payload: EmployeeRequestFormPayload,
  duration: number | null,
  overtimeRules = DEFAULT_PAYROLL_SETTINGS.workTimePayRules,
  hasActiveContract = true,
  remoteWorkPolicy: RemoteWorkPolicyRules = DEFAULT_REMOTE_WORK_POLICY,
) {
  if (payload.requestType === 'overtime') {
    const warnings: string[] = [];
    const limitMinutes = Math.max(0, Number(overtimeRules.overtime.dailyLimitHours) * 60);
    if (!hasActiveContract) warnings.push('برای محاسبه اضافه‌کاری، قرارداد فعال وجود ندارد.');
    if (duration && limitMinutes && duration > limitMinutes) warnings.push('مدت اضافه‌کاری از سقف قرارداد جاری بیشتر است.');
    return {
      requestedDurationMinutes: duration,
      validOvertimeDurationMinutes: limitMinutes ? Math.min(duration ?? 0, limitMinutes) : duration,
      overtimeCoefficient: overtimeRules.overtime.normalCoefficient,
      dailyLimitMinutes: limitMinutes,
      outsideNormalWorkTime: true,
      nightWorkOverlapMinutes: 0,
      weeklyRestDayOverlapMinutes: 0,
      holidayOverlapMinutes: 0,
      warnings,
    };
  }
  if (payload.requestType === 'remote_work') {
    const mode = mapRangeTypeToRemoteWorkMode(payload.rangeType);
    const effect =
      mode && typeof duration === 'number'
        ? deriveRemoteWorkEffect({
            policy: remoteWorkPolicy,
            mode,
            durationMinutes: duration,
            submissionMode: payload.submissionMode,
          })
        : null;
    return {
      requestedDurationMinutes: duration,
      remoteWorkMode: mode,
      remoteWorkEffect: effect,
      attendanceEffect: effect?.attendanceEffect ?? null,
      paymentEffect: effect?.paymentEffect ?? null,
      requiresPunch: effect?.requiresPunch ?? false,
      preventsAbsence: effect?.preventsAbsence ?? false,
      countsAsWork: effect?.countsAsWork ?? false,
      payableMinutes: effect?.payableMinutes ?? 0,
      unpaidMinutes: effect?.unpaidMinutes ?? 0,
    };
  }
  return {};
}

async function resolveDailyRequiredMinutes(tenantId: string) {
  const rows = await prisma.workPolicy.findMany({
    where: { tenantId, isDefault: true },
    select: { sectionValues: true },
    take: 1,
  });
  const values = rows[0]?.sectionValues;
  if (values && typeof values === 'object' && !Array.isArray(values)) {
    const requiredMinutes = (values as Record<string, unknown>).requiredMinutes;
    if (typeof requiredMinutes === 'number' && requiredMinutes > 0) return requiredMinutes;
  }
  return DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
}

async function resolveLeaveAnnualMinutes(tenantId: string) {
  const rows = await prisma.workPolicy.findMany({
    where: { tenantId },
    select: { sectionValues: true },
  });
  const leavePolicy = rows
    .map((row) => row.sectionValues)
    .find((values) => values && typeof values === 'object' && !Array.isArray(values) && (values as Record<string, unknown>).familyKey === 'leave');
  if (leavePolicy && typeof leavePolicy === 'object' && !Array.isArray(leavePolicy)) {
    const monthlyLimit = (leavePolicy as Record<string, unknown>).monthlyLimit;
    if (typeof monthlyLimit === 'number' && monthlyLimit > 0) return monthlyLimit * 12 * 60;
  }
  return DEFAULT_PAYROLL_SETTINGS.leave.monthlyQuotaHours * 12 * 60;
}

function mapAttachment(row: RawAttachmentRow): AttachmentDraft {
  return {
    id: row.id,
    ownerType: row.ownerType,
    ownerId: row.ownerId,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    titleId: row.titleId,
    title: row.title,
    fileUrl: row.fileUrl,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSize: row.fileSize,
    issuedAt: row.issuedAt,
    description: row.description,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

function mapRequest(row: RawEmployeeRequestRow, attachments: AttachmentDraft[]): EmployeeRequestItem {
  return {
    id: row.id,
    employeeId: row.employeeId,
    requestType: row.requestType,
    status: row.status,
    submissionMode: row.submissionMode,
    startDate: row.startDate,
    endDate: row.endDate,
    startTime: row.startTime,
    endTime: row.endTime,
    dateTime: row.dateTime,
    rangeType: row.rangeType,
    attendanceActionType: row.attendanceActionType,
    amount: numberValue(row.amount),
    loanId: row.loanId,
    loanTitle: row.loanTitle,
    installments: row.installments,
    reasonId: row.reasonId,
    reasonTitle: row.reasonTitle,
    description: row.description,
    calculatedDurationMinutes: row.calculatedDurationMinutes,
    calculationMeta: row.calculationMeta && typeof row.calculationMeta === 'object' ? row.calculationMeta as Record<string, unknown> : {},
    attachmentCount: Number(row.attachmentCount ?? 0),
    attachments,
    createdBy: row.createdBy,
    approvedBy: row.approvedBy,
    rejectedBy: row.rejectedBy,
    approvedAt: dateValue(row.approvedAt),
    rejectedAt: dateValue(row.rejectedAt),
    canceledAt: dateValue(row.canceledAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function leaveRuleCards(leaveRules: LeavePolicyRules): EmployeeLeaveRulePresentation[] {
  return (['entitlement', 'sick', 'unpaid', 'bonus'] as LeaveTypeKey[]).map((leaveType) => ({
    leaveType,
    enabled: leaveRules[leaveType].enabled,
    paid: leaveRules[leaveType].paid,
    deductsFromEntitlementBalance: leaveRules[leaveType].deductsFromEntitlementBalance,
    requiresAttachment: leaveRules[leaveType].requiresAttachment,
    requestModes: leaveRules[leaveType].requestModes,
  }));
}

async function resolveEmployeeLeaveContext(employeeId: string, tenantId: string, dateIso?: string | null): Promise<ResolvedRequestContext> {
  const membership = await prisma.workGroupMember.findFirst({
    where: {
      employeeId,
      workGroup: { tenantId },
      ...(dateIso
        ? {
            joinedAt: { lte: membershipAnchorDate(dateIso) },
            OR: [{ leftAt: null }, { leftAt: { gte: membershipAnchorDate(dateIso) } }],
          }
        : { isCurrent: true }),
    },
    orderBy: { joinedAt: 'desc' },
    include: {
      workGroup: {
        include: {
          policy: {
            include: { calendar: true },
          },
        },
      },
    },
  });

  const workGroup = membership?.workGroup ?? null;
  const policy = workGroup?.policy ?? null;

  const tenantLeavePolicies = await prisma.workPolicy.findMany({
    where: { tenantId },
    select: { sectionValues: true },
  });

  let leaveRules = cloneLeavePolicy(DEFAULT_LEAVE_POLICY);
  for (const policyRow of tenantLeavePolicies) {
    const sectionValues =
      policyRow.sectionValues && typeof policyRow.sectionValues === 'object' && !Array.isArray(policyRow.sectionValues)
        ? (policyRow.sectionValues as Record<string, unknown>)
        : {};

    const embeddedPolicy = parseLeavePolicyRules(sectionValues.leavePolicy);
    if (embeddedPolicy) {
      leaveRules = mergeLeavePolicyRules(leaveRules, embeddedPolicy);
    }

    const variantRule = parseVariantLeaveRule(sectionValues);
    if (variantRule) {
      leaveRules = mergeLeavePolicyRules(leaveRules, { [variantRule.leaveType]: variantRule.rule } as Partial<LeavePolicyRules>);
    }
  }

  const policySectionValues =
    policy?.sectionValues && typeof policy.sectionValues === 'object' && !Array.isArray(policy.sectionValues)
      ? (policy.sectionValues as Record<string, unknown>)
      : {};
  const resolvedCalendarId = getPolicyCalendarId(policy);
  const resolvedCalendar =
    policy?.calendar && (!resolvedCalendarId || policy.calendar.id === resolvedCalendarId)
      ? policy.calendar
      : resolvedCalendarId
        ? await prisma.calendar.findFirst({
            where: { id: resolvedCalendarId, tenantId },
            select: {
              id: true,
              title: true,
              weekends: true,
              singleHolidays: true,
              shiftConfig: true,
            },
          })
        : null;
  const workPolicyLeaveRules = parseLeavePolicyRules(policySectionValues.leavePolicy);
  if (workPolicyLeaveRules) {
    leaveRules = mergeLeavePolicyRules(leaveRules, workPolicyLeaveRules);
  }

  return {
    workGroupId: workGroup?.id ?? null,
    workGroupTitle: workGroup?.title ?? null,
    hasWorkGroup: Boolean(workGroup),
    hasWorkPolicy: Boolean(policy),
    workPolicyId: policy?.id ?? null,
    workPolicyTitle: policy?.title ?? null,
    calendarId: resolvedCalendar?.id ?? resolvedCalendarId,
    calendarTitle: resolvedCalendar?.title ?? null,
    leaveRules,
    remoteWorkPolicy: parseRemoteWorkPolicy(policySectionValues),
    policySectionValues,
    weekends: Array.isArray(resolvedCalendar?.weekends)
      ? resolvedCalendar.weekends.filter((item): item is string => typeof item === 'string')
      : [],
    singleHolidays: resolvedCalendar ? parseCalendarStoredEvents(resolvedCalendar.singleHolidays) : [],
    shifts: resolvedCalendar ? listCalendarShifts(resolvedCalendar.shiftConfig) : [],
    excludedShiftDates: resolvedCalendar ? listExcludedShiftDates(resolvedCalendar.shiftConfig) : [],
    weekendOverrideDates: resolvedCalendar ? listWeekendOverrideDates(resolvedCalendar.shiftConfig) : [],
    overtimePolicy: {
      requireAttachment: Boolean(policySectionValues.overtimeRequireAttachment ?? policySectionValues.requireAttachment),
      fromAttendance: Boolean(policySectionValues.overtimeFromAttendance),
      beforeShift: Boolean(policySectionValues.overtimeBeforeShift),
      afterShift: Boolean(policySectionValues.overtimeAfterShift),
    },
  };
}

async function getEmployeeRequestLeaveContext(employeeId: string, tenantId: string) {
  const leaveContext = await resolveEmployeeLeaveContext(employeeId, tenantId);
  return {
    hasWorkGroup: leaveContext.hasWorkGroup,
    hasWorkPolicy: leaveContext.hasWorkPolicy,
    policyId: leaveContext.workPolicyId,
    policyTitle: leaveContext.workPolicyTitle,
    leaveRules: leaveContext.leaveRules,
    ruleCards: leaveRuleCards(leaveContext.leaveRules),
  } satisfies EmployeeLeaveRequestContext;
}

async function getEmployeeRemoteWorkRequestContext(employeeId: string, tenantId: string) {
  const context = await resolveEmployeeLeaveContext(employeeId, tenantId);
  return {
    hasWorkGroup: context.hasWorkGroup,
    hasWorkPolicy: context.hasWorkPolicy,
    policyId: context.workPolicyId,
    policyTitle: context.workPolicyTitle,
    remotePolicy: context.remoteWorkPolicy,
  } satisfies EmployeeRemoteWorkRequestContext;
}

function shiftLabelForDate(context: ResolvedRequestContext | null, isoDate?: string | null) {
  if (!context || !isoDate) return null;
  const persianDate = isoDateToPersianYmd(isoDate);
  if (!persianDate) return null;
  const dayDetails = getDayDetails({
    date: persianDate,
    weekends: context.weekends,
    singleHolidays: context.singleHolidays,
    shifts: context.shifts,
    excludedShiftDates: context.excludedShiftDates,
    weekendOverrideDates: context.weekendOverrideDates,
  });
  const firstShift = dayDetails.shifts[0];
  return firstShift ? firstShift.timeRange ?? firstShift.title ?? null : null;
}

export async function previewEmployeeRequest(payload: EmployeeRequestFormPayload, tenantId: string): Promise<EmployeeRequestPreview> {
  const requestDates = requestAnchorDates(payload);
  const previewDate = requestDates[0] ?? payload.startDate ?? null;
  const blockingErrors: string[] = [];
  const warnings: string[] = [];

  const activeContract = previewDate ? await getEmployeeContractForDate(payload.employeeId, previewDate, tenantId) : null;
  const requestContext = previewDate ? await resolveEmployeeLeaveContext(payload.employeeId, tenantId, previewDate) : await resolveEmployeeLeaveContext(payload.employeeId, tenantId);
  const leaveIdentity = mapRequestTypeToLeaveIdentity(payload.requestType, payload.rangeType);
  const leaveRule = leaveIdentity ? requestContext.leaveRules[leaveIdentity.leaveType] : null;
  const leaveBalance = leaveIdentity && previewDate ? await getEmployeeLeaveBalanceSummary(payload.employeeId, tenantId, previewDate) : null;

  if (requestDates.length > 1) {
    const contracts = await Promise.all(requestDates.map((date) => getEmployeeContractForDate(payload.employeeId, date, tenantId)));
    const contractIds = [...new Set(contracts.map((item) => item?.id).filter((item): item is string => Boolean(item)))];
    if (contractIds.length > 1) {
      blockingErrors.push('بازه درخواست با بیش از یک قرارداد هم‌پوشانی دارد. لطفاً بازه را به دوره‌های جداگانه تقسیم کنید.');
    }
  }

  if (previewDate && !activeContract && ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave', 'overtime', 'attendance', 'remote_work', 'mission'].includes(payload.requestType)) {
    blockingErrors.push('برای تاریخ انتخاب‌شده، قرارداد فعالی برای این کارمند وجود ندارد.');
  }
  if (previewDate && !requestContext.hasWorkGroup && ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave', 'overtime', 'attendance', 'remote_work', 'mission'].includes(payload.requestType)) {
    const message =
      payload.requestType === 'remote_work'
        ? 'برای محاسبه دورکاری، گروه کاری برای کارمند مشخص نشده است.'
        : 'برای تاریخ انتخاب‌شده، گروه کاری فعالی برای این کارمند مشخص نشده است.';
    if (payload.requestType === 'attendance' || payload.requestType === 'remote_work') blockingErrors.push(message);
    else warnings.push(message);
  }
  if (previewDate && !requestContext.hasWorkPolicy && ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave', 'overtime', 'attendance', 'remote_work', 'mission'].includes(payload.requestType)) {
    const message =
      payload.requestType === 'remote_work'
        ? 'برای محاسبه دورکاری، سیاست کاری برای گروه کاری مشخص نشده است.'
        : 'برای تاریخ انتخاب‌شده، سیاست کاری فعالی برای گروه کاری کارمند مشخص نشده است.';
    if (payload.requestType === 'attendance' || payload.requestType === 'remote_work') blockingErrors.push(message);
    else warnings.push(message);
  }

  const dailyRequiredMinutes =
    activeContract?.dailyRequiredMinutes ??
    getContractLeaveBalanceInputs(activeContract, { fallbackToDefaults: true }).dailyRequiredMinutes ??
    DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
  const calculatedDuration = calculateDuration(payload, dailyRequiredMinutes, requestContext);

  let payableDurationMinutes = calculatedDuration;
  let unpaidDurationMinutes = 0;
  let balanceEffectMinutes = 0;
  let estimatedPayTitle: string | null = null;
  let attendanceEffectTitle: string | null = null;
  let overtimePreview: EmployeeRequestPreview['overtime'] = null;

  if (leaveIdentity && leaveRule) {
    payableDurationMinutes = leaveRule.paid ? calculatedDuration : 0;
    unpaidDurationMinutes = leaveRule.paid ? 0 : calculatedDuration ?? 0;
    balanceEffectMinutes = leaveRule.deductsFromEntitlementBalance ? calculatedDuration ?? 0 : 0;
    estimatedPayTitle = leaveRule.paid ? 'با حقوق' : 'بدون حقوق';
    attendanceEffectTitle = 'مرخصی';
    if (!leaveRule.enabled || !ruleAllowsMode(leaveRule, leaveIdentity.leaveMode)) {
      blockingErrors.push('این نوع مرخصی در سیاست کاری کارمند فعال نیست.');
    }
    if (leaveRule.requiresAttachment && !(payload.attachments ?? []).length) {
      blockingErrors.push('برای این نوع مرخصی، پیوست الزامی است.');
    }
    if (leaveRule.deductsFromEntitlementBalance && leaveBalance?.remainingMinutes != null && (calculatedDuration ?? 0) > leaveBalance.remainingMinutes) {
      blockingErrors.push('مانده مرخصی استحقاقی برای این درخواست کافی نیست.');
    }
  }

  if (payload.requestType === 'overtime') {
    const overtimeRules = getContractOvertimeRules(activeContract);
    const requestedMinutes = calculatedDuration ?? positiveDuration(payload.startTime, payload.endTime);
    const shiftLabel = shiftLabelForDate(requestContext, payload.startDate);
    const shiftStart = shiftLabel?.split(' تا ')[0] ?? null;
    const shiftEnd = shiftLabel?.split(' تا ')[1] ?? null;
    const requestStart = timeToMinutes(payload.startTime);
    const requestEnd = timeToMinutes(payload.endTime);
    const shiftStartMinutes = timeToMinutes(shiftStart);
    const shiftEndMinutes = timeToMinutes(shiftEnd);
    const beforeShiftMinutes =
      requestStart != null && requestEnd != null && shiftStartMinutes != null ? Math.max(0, Math.min(requestEnd, shiftStartMinutes) - requestStart) : 0;
    const afterShiftMinutes =
      requestStart != null && requestEnd != null && shiftEndMinutes != null ? Math.max(0, requestEnd - Math.max(requestStart, shiftEndMinutes)) : 0;
    let invalidMinutes = 0;
    if (!requestContext.overtimePolicy.beforeShift) invalidMinutes += beforeShiftMinutes;
    if (!requestContext.overtimePolicy.afterShift) invalidMinutes += afterShiftMinutes;
    const validMinutes = Math.max(0, (requestedMinutes ?? 0) - invalidMinutes);
    const dailyLimitMinutes = Math.max(0, Number(overtimeRules.overtime.dailyLimitHours) * 60);
    if (requestContext.overtimePolicy.requireAttachment && !(payload.attachments ?? []).length) {
      blockingErrors.push('برای این نوع اضافه‌کاری، پیوست الزامی است.');
    }
    if (beforeShiftMinutes > 0 && !requestContext.overtimePolicy.beforeShift) {
      blockingErrors.push('اضافه‌کاری قبل از شیفت در سیاست کاری مجاز نیست.');
    }
    if (afterShiftMinutes > 0 && !requestContext.overtimePolicy.afterShift) {
      blockingErrors.push('اضافه‌کاری بعد از شیفت در سیاست کاری مجاز نیست.');
    }
    if (dailyLimitMinutes > 0 && validMinutes > dailyLimitMinutes) {
      warnings.push('مدت اضافه‌کاری از سقف روزانه قرارداد بیشتر است.');
    }
    payableDurationMinutes = validMinutes;
    unpaidDurationMinutes = 0;
    balanceEffectMinutes = 0;
    estimatedPayTitle = 'اضافه‌کاری قابل پرداخت';
    attendanceEffectTitle = 'اضافه‌کاری';
    overtimePreview = {
      requestedMinutes,
      validMinutes,
      beforeShiftMinutes,
      afterShiftMinutes,
      invalidMinutes,
      dailyLimitMinutes,
      coefficient: overtimeRules.overtime.normalCoefficient,
      requiresAttachment: requestContext.overtimePolicy.requireAttachment,
      beforeShiftAllowed: requestContext.overtimePolicy.beforeShift,
      afterShiftAllowed: requestContext.overtimePolicy.afterShift,
    };
  }

  let attendancePreview: AttendancePreviewResult | null = null;
  let remoteWorkPreview: RemoteWorkPreviewResult | null = null;

  if (payload.requestType === 'attendance') {
    estimatedPayTitle = null;
    attendanceEffectTitle = 'اصلاح تردد';

    const persianDateKey = isoDateToPersianYmd(previewDate);
    if (persianDateKey && payload.startTime) {
      const policyRow = await prisma.workPolicy.findFirst({
        where: { id: requestContext.workPolicyId ?? undefined, tenantId },
        select: { sectionValues: true },
      });
      const sectionValues =
        policyRow?.sectionValues && typeof policyRow.sectionValues === 'object' && !Array.isArray(policyRow.sectionValues)
          ? (policyRow.sectionValues as Record<string, unknown>)
          : {};
      const policyBundle = readAttendancePolicyBundle(sectionValues);
      const dailyRequiredMinutes =
        activeContract?.dailyRequiredMinutes ??
        getContractLeaveBalanceInputs(activeContract, { fallbackToDefaults: true }).dailyRequiredMinutes ??
        DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
      const calendarRecord = requestContext.calendarId
        ? await prisma.calendar.findFirst({
            where: { id: requestContext.calendarId, tenantId },
            select: { weekends: true, singleHolidays: true, shiftConfig: true },
          })
        : null;
      const calendar = calendarRecord
        ? {
            weekends: Array.isArray(calendarRecord.weekends)
              ? calendarRecord.weekends.filter((item): item is string => typeof item === 'string')
              : [],
            singleHolidays: parseCalendarStoredEvents(calendarRecord.singleHolidays),
            shiftConfig: calendarRecord.shiftConfig,
            excludedShiftDates: listExcludedShiftDates(calendarRecord.shiftConfig),
            weekendOverrideDates: listWeekendOverrideDates(calendarRecord.shiftConfig),
          }
        : null;
      const shiftContext = buildShiftContextForDate({
        persianDateKey,
        calendar,
        fallbackRequiredMinutes: dailyRequiredMinutes,
        policySectionValues: sectionValues,
        policyFallback: policyBundle,
      });
      if (!shiftContext.segments.length) {
        blockingErrors.push('برای این تاریخ، شیفت کاری تعریف نشده است.');
      }

      const monthStart = startOfMonthIso(previewDate);
      const monthEnd = endOfMonthIso(previewDate);
      const [attendanceRequests, monthlyManualCount] = await Promise.all([
        prisma.employeeRequest.findMany({
          where: {
            tenantId,
            employeeId: payload.employeeId,
            requestType: 'attendance',
            status: { in: ['pending', 'approved'] },
            id: payload.id ? { not: payload.id } : undefined,
          },
          select: { id: true, status: true, startDate: true, startTime: true, dateTime: true },
        }),
        monthStart && monthEnd
          ? prisma.employeeRequest.count({
              where: {
                tenantId,
                employeeId: payload.employeeId,
                requestType: 'attendance',
                status: { in: ['pending', 'approved'] },
                startDate: { gte: monthStart, lte: monthEnd },
                id: payload.id ? { not: payload.id } : undefined,
              },
            })
          : Promise.resolve(0),
      ]);

      const year = previewDate ? Number(previewDate.slice(0, 4)) : new Date().getFullYear();
      const persianYear = persianDateKey.split('/')[0] ? Number(persianDateKey.split('/')[0]) : year;
      const tenantPayrollSettings = await loadTenantPayrollSettingsForYear(tenantId, persianYear);

      attendancePreview = previewAttendanceCorrection({
        persianDateKey,
        proposedTime: payload.startTime,
        proposedStatus: payload.submissionMode === 'approved' ? 'approved' : 'pending',
        proposedId: payload.id,
        existingRequests: attendanceRequests,
        segments: shiftContext.segments,
        shiftTypeLabel: shiftContext.shiftTypeLabel,
        shiftWindowLabel: shiftContext.shiftWindowLabel,
        workGroupTitle: requestContext.workGroupTitle,
        policyTitle: requestContext.workPolicyTitle,
        policy: policyBundle,
        tenantPayrollSettings,
        reasonId: payload.reasonId,
        attachmentCount: payload.attachments?.length ?? 0,
        submissionMode: payload.submissionMode,
        isAdmin: true,
        monthlyManualCount,
      });

      blockingErrors.push(...attendancePreview.blockingErrors);
      warnings.push(...attendancePreview.warnings);
    }
  }

  if (payload.requestType === 'remote_work') {
    const remotePolicy = requestContext.remoteWorkPolicy;
    const remoteMode = mapRangeTypeToRemoteWorkMode(payload.rangeType);
    const remoteWarnings: string[] = [];
    const remoteBlocking: string[] = [];
    const remoteOutcome: string[] = [];
    const shiftWindowLabel = shiftLabelForDate(requestContext, previewDate);
    const dayDetails = previewDate ? getRemoteWorkDayDetails(remoteWorkDayContext(requestContext), previewDate) : null;
    const firstShift = dayDetails?.shifts[0];
    const rawShift = firstShift ? requestContext.shifts.find((item) => item.id === firstShift.id) : null;
    const shiftSummary = rawShift ? summarizeShiftForDayPanel(rawShift) : null;

    if (!remotePolicy.enabled) {
      remoteBlocking.push('دورکاری در سیاست کاری این کارمند فعال نیست.');
    }
    if (remoteMode && !remotePolicyAllowsMode(remotePolicy, remoteMode)) {
      remoteBlocking.push('این نوع دورکاری در سیاست کاری کارمند فعال نیست.');
    }
    if (remotePolicy.requireReason && !payload.reasonId) {
      remoteBlocking.push('ثبت دلیل برای دورکاری الزامی است.');
    }
    if (remotePolicy.requireAttachment && !(payload.attachments ?? []).length) {
      remoteBlocking.push('پیوست برای دورکاری الزامی است.');
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const dayDiff = daysBetweenIsoDates(previewDate, todayIso);
    if (dayDiff > 0) {
      if (!remotePolicy.pastDaysEnabled) {
        remoteBlocking.push('ثبت برای روزهای گذشته در سیاست دورکاری مجاز نیست.');
      } else if (remotePolicy.maxPastDays > 0 && dayDiff > remotePolicy.maxPastDays) {
        remoteBlocking.push(`ثبت برای بیش از ${remotePolicy.maxPastDays.toLocaleString('fa-IR')} روز گذشته مجاز نیست.`);
      }
    }

    if (remoteMode === 'hourly' && payload.startDate === payload.endDate && payload.startTime && payload.endTime && payload.endTime <= payload.startTime) {
      remoteBlocking.push('ساعت پایان باید بعد از ساعت شروع باشد.');
    }

    const anchorDates =
      remoteMode === 'multi_day'
        ? inclusiveIsoDateRange(payload.startDate, payload.endDate)
        : previewDate
          ? [previewDate]
          : [];
    for (const isoDate of anchorDates) {
      if (isRemoteWorkBlockedDay(remoteWorkDayContext(requestContext), isoDate, remotePolicy.allowHolidays)) {
        remoteBlocking.push('ثبت دورکاری برای روز تعطیل یا بدون شیفت مجاز نیست.');
        break;
      }
    }

    if (
      remoteMode === 'hourly' &&
      isHourlyOutsideShiftWindow(payload.startTime, payload.endTime, shiftWindowLabel)
    ) {
      remoteWarnings.push('بازه دورکاری خارج از بازه شیفت انتخاب شده است.');
    }

    let monthlyUsedLabel: string | null = null;
    let monthlyRemainingLabel: string | null = null;
    const monthlyLimitLabel = formatRemoteMonthlyLimitLabel(remotePolicy);
    if (monthlyLimitLabel && previewDate) {
      const monthStart = startOfMonthIso(previewDate);
      const monthEnd = endOfMonthIso(previewDate);
      if (monthStart && monthEnd) {
        const monthlyRequests = await prisma.employeeRequest.findMany({
          where: {
            tenantId,
            employeeId: payload.employeeId,
            requestType: 'remote_work',
            status: { in: ['pending', 'approved'] },
            startDate: { gte: monthStart, lte: monthEnd },
            id: payload.id ? { not: payload.id } : undefined,
          },
          select: {
            calculatedDurationMinutes: true,
            rangeType: true,
            startDate: true,
            endDate: true,
            calculationMeta: true,
          },
        });
        const used = countRemoteWorkMonthlyUsage(monthlyRequests, remotePolicy.monthlyLimit.type);
        const projected =
          remotePolicy.monthlyLimit.type === 'hours'
            ? used + Math.max(0, (calculatedDuration ?? 0) / 60)
            : used + (remoteMode === 'multi_day' ? inclusiveIsoDateRange(payload.startDate, payload.endDate).length : 1);
        monthlyUsedLabel =
          remotePolicy.monthlyLimit.type === 'hours'
            ? `${used.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} ساعت`
            : `${used.toLocaleString('fa-IR')} روز`;
        if (remotePolicy.monthlyLimit.value != null) {
          const remaining = Math.max(0, remotePolicy.monthlyLimit.value - projected);
          monthlyRemainingLabel =
            remotePolicy.monthlyLimit.type === 'hours'
              ? `${remaining.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} ساعت`
              : `${remaining.toLocaleString('fa-IR')} روز`;
          if (projected > remotePolicy.monthlyLimit.value) {
            remoteBlocking.push('سقف ماهانه دورکاری برای این کارمند تکمیل شده است.');
          }
        }
      }
    }

    const effect =
      remoteMode && calculatedDuration != null
        ? deriveRemoteWorkEffect({
            policy: remotePolicy,
            mode: remoteMode,
            durationMinutes: calculatedDuration,
            submissionMode: payload.submissionMode,
          })
        : null;

    payableDurationMinutes = effect?.payableMinutes ?? 0;
    unpaidDurationMinutes = effect?.unpaidMinutes ?? 0;
    balanceEffectMinutes = 0;
    estimatedPayTitle = REMOTE_WORK_PAYMENT_EFFECT_LABELS[remotePolicy.paymentEffect];
    attendanceEffectTitle = REMOTE_WORK_ATTENDANCE_EFFECT_LABELS[remotePolicy.attendanceEffect];

    if (payload.submissionMode === 'pending') {
      remoteWarnings.push('در حالت «در انتظار تأیید»، این دورکاری در محاسبات نهایی اعمال نمی‌شود.');
    } else if (effect) {
      remoteOutcome.push('دورکاری تأییدشده بلافاصله در اثر محاسبه لحاظ می‌شود.');
    }
    if (effect?.requiresPunch) remoteOutcome.push('ثبت تردد برای این دورکاری الزامی است.');
    if (effect?.preventsAbsence) remoteOutcome.push('این دورکاری از ثبت غیبت فیزیکی جلوگیری می‌کند.');

    blockingErrors.push(...remoteBlocking);
    warnings.push(...remoteWarnings);

    remoteWorkPreview = {
      bases: {
        activeContractLabel: contractLabel(activeContract),
        workGroupTitle: requestContext.workGroupTitle,
        workPolicyTitle: requestContext.workPolicyTitle,
        shiftTypeLabel: shiftSummary?.shiftTypeLabel ?? null,
        shiftWindowLabel: shiftSummary?.timeRange ?? shiftWindowLabel,
        calendarTitle: requestContext.calendarTitle,
        workingDayLabel: dayDetails?.isHoliday ? 'تعطیل' : dayDetails?.shifts.length ? 'روز کاری' : 'بدون شیفت',
      },
      mode: remoteMode,
      requestedDurationMinutes: calculatedDuration,
      attendanceEffectLabel: REMOTE_WORK_ATTENDANCE_EFFECT_LABELS[remotePolicy.attendanceEffect],
      paymentEffectLabel: REMOTE_WORK_PAYMENT_EFFECT_LABELS[remotePolicy.paymentEffect],
      preventsAbsence: effect?.preventsAbsence ?? false,
      requiresPunch: effect?.requiresPunch ?? false,
      countsAsWork: effect?.countsAsWork ?? false,
      payableMinutes: effect?.payableMinutes ?? null,
      unpaidMinutes: effect?.unpaidMinutes ?? null,
      monthlyLimitLabel,
      monthlyUsedLabel,
      monthlyRemainingLabel,
      effect,
      outcomeMessages: remoteOutcome,
      warnings: remoteWarnings,
      blockingErrors: remoteBlocking,
    };
  }

  if (payload.requestType === 'mission') {
    estimatedPayTitle = 'بر اساس قوانین مأموریت';
    attendanceEffectTitle = 'مأموریت';
  }

  return {
    activeContractId: activeContract?.id ?? null,
    activeContractLabel: contractLabel(activeContract),
    workGroupId: requestContext.workGroupId,
    workGroupTitle: requestContext.workGroupTitle,
    workPolicyId: requestContext.workPolicyId,
    workPolicyTitle: requestContext.workPolicyTitle,
    calendarId: requestContext.calendarId,
    calendarTitle: requestContext.calendarTitle,
    shiftLabel: shiftLabelForDate(requestContext, previewDate),
    requestedDurationMinutes: calculatedDuration,
    payableDurationMinutes,
    unpaidDurationMinutes,
    balanceEffectMinutes,
    estimatedPayTitle,
    attendanceEffectTitle,
    warnings,
    blockingErrors,
    leaveBalanceRemainingMinutes: leaveBalance?.remainingMinutes ?? null,
    leaveBalanceAfterApprovalMinutes:
      leaveBalance?.remainingMinutes != null && balanceEffectMinutes
        ? Math.max(0, leaveBalance.remainingMinutes - balanceEffectMinutes)
        : leaveBalance?.remainingMinutes ?? null,
    leaveRule: leaveIdentity && leaveRule
      ? {
          leaveType: leaveIdentity.leaveType,
          enabled: leaveRule.enabled,
          paid: leaveRule.paid,
          deductsFromEntitlementBalance: leaveRule.deductsFromEntitlementBalance,
          requiresAttachment: leaveRule.requiresAttachment,
          requestModes: leaveRule.requestModes,
        }
      : null,
    overtime: overtimePreview,
    attendance: attendancePreview,
    remoteWork: remoteWorkPreview,
  };
}

export async function listCompanyLoans(): Promise<CompanyLoanItem[]> {
  const { tenantId } = await requireTenantId();
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    guarantorCount: number;
    minAmount: Decimal;
    maxAmount: Decimal;
    minInstallments: number;
    maxInstallments: number;
    feeRate: Decimal;
    interestRate: Decimal;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>>`
    SELECT * FROM "CompanyLoan"
    WHERE "tenantId" = ${tenantId}
    ORDER BY "updatedAt" DESC
  `;
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    guarantorCount: row.guarantorCount,
    minAmount: Number(row.minAmount),
    maxAmount: Number(row.maxAmount),
    minInstallments: row.minInstallments,
    maxInstallments: row.maxInstallments,
    feeRate: Number(row.feeRate),
    interestRate: Number(row.interestRate),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getEmployeeLeaveBalanceSummary(employeeId: string, tenantId: string, dateIso?: string | null) {
  const activeContract = dateIso ? await getEmployeeContractForDate(employeeId, dateIso, tenantId) : await getCurrentEmployeeContract(employeeId, tenantId);
  const contractLeave = getContractLeaveBalanceInputs(activeContract, { fallbackToDefaults: false });
  const contractStart = activeContract?.startDate ?? null;
  const contractEnd = activeContract?.endDate ?? null;
  const usedRequests = await prisma.employeeRequest.findMany({
    where: {
      tenantId,
      employeeId,
      status: 'approved',
      ...(contractStart ? { startDate: { gte: contractStart } } : {}),
      ...(contractEnd ? { startDate: { ...(contractStart ? { gte: contractStart } : {}), lte: contractEnd } } : {}),
      requestType: {
        in: ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'],
      },
    },
    select: {
      calculatedDurationMinutes: true,
      requestType: true,
      rangeType: true,
      calculationMeta: true,
    },
  });
  const usedMinutes = usedRequests.reduce((sum, request) => {
    const meta =
      request.calculationMeta && typeof request.calculationMeta === 'object' && !Array.isArray(request.calculationMeta)
        ? (request.calculationMeta as Record<string, unknown>)
        : {};
    const deducts =
      typeof meta.deductsFromEntitlementBalance === 'boolean'
        ? meta.deductsFromEntitlementBalance
        : mapRequestTypeToLeaveIdentity(request.requestType, request.rangeType)?.leaveType === 'entitlement';
    if (!deducts) return sum;
    return sum + Math.max(0, Number(request.calculatedDurationMinutes ?? 0));
  }, 0);
  return {
    annualMinutes: activeContract ? contractLeave.annualMinutes : null,
    usedMinutes,
    remainingMinutes:
      activeContract && contractLeave.annualMinutes != null ? Math.max(0, contractLeave.annualMinutes - usedMinutes) : null,
    dailyRequiredMinutes: activeContract ? contractLeave.dailyRequiredMinutes : null,
  } satisfies LeaveBalanceSummary;
}

export async function getEmployeeRequestsPageData(employeeId: string) {
  const { tenantId } = await requireTenantId();
  await ensureTenantDefaultRequestReasons(prisma, tenantId);
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId },
    include: {
      organizationUnits: { include: { organizationUnit: true } },
      workGroupMemberships: { where: { isCurrent: true }, include: { workGroup: true } },
    },
  });
  if (!employee) return null;

  const currentContract = await getCurrentEmployeeContract(employeeId, tenantId);
  const overtimeRules = getContractOvertimeRules(currentContract);

  const [requests, attachmentRows, reasons, loans, leaveBalance, leaveRequestContext, remoteWorkRequestContext] = await Promise.all([
    prisma.$queryRaw<RawEmployeeRequestRow[]>`
      SELECT
        er.*,
        rr."title" AS "reasonTitle",
        cl."title" AS "loanTitle",
        COUNT(att."id") AS "attachmentCount"
      FROM "EmployeeRequest" er
      LEFT JOIN "RequestReason" rr ON rr."id" = er."reasonId"
      LEFT JOIN "CompanyLoan" cl ON cl."id" = er."loanId"
      LEFT JOIN "Attachment" att ON att."ownerType" = 'employee_request' AND att."ownerId" = er."id"
      WHERE er."tenantId" = ${tenantId} AND er."employeeId" = ${employeeId}
      GROUP BY er."id", rr."title", cl."title"
      ORDER BY er."createdAt" DESC
    `,
    prisma.$queryRaw<RawAttachmentRow[]>`
      SELECT att.*
      FROM "Attachment" att
      INNER JOIN "EmployeeRequest" er ON er."id" = att."ownerId"
      WHERE att."tenantId" = ${tenantId}
        AND att."ownerType" = 'employee_request'
        AND er."employeeId" = ${employeeId}
      ORDER BY att."uploadedAt" ASC
    `,
    prisma.requestReason.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, description: true, category: true },
    }),
    listCompanyLoans(),
    getEmployeeLeaveBalanceSummary(employeeId, tenantId),
    getEmployeeRequestLeaveContext(employeeId, tenantId),
    getEmployeeRemoteWorkRequestContext(employeeId, tenantId),
  ]);

  const attachmentsByRequest = new Map<string, AttachmentDraft[]>();
  attachmentRows.forEach((row) => {
    const list = attachmentsByRequest.get(row.ownerId) ?? [];
    list.push(mapAttachment(row));
    attachmentsByRequest.set(row.ownerId, list);
  });

  const employeeData: EmployeeRequestsEmployee = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    avatarUrl: employee.avatarUrl,
    personnelCode: employee.personnelCode,
    organizationUnitTitle: employee.organizationUnits.map((item) => item.organizationUnit.title).join('، '),
    workGroupTitle: employee.workGroupMemberships.map((item) => item.workGroup.title).join('، '),
    jobTitle: currentContract?.jobTitle ?? '',
    hasActiveContract: Boolean(currentContract),
    currentContractId: currentContract?.id ?? null,
    overtimeRules,
  };

  return {
    employee: employeeData,
    requests: requests.map((row) => mapRequest(row, attachmentsByRequest.get(row.id) ?? [])),
    reasons: reasons.map((reason) => ({
      id: reason.id,
      title: reason.title,
      description: reason.description,
      category: reason.category as EmployeeRequestType,
    })) satisfies RequestReasonOption[],
    loans,
    leaveBalance,
    leaveRequestContext,
    remoteWorkRequestContext,
  };
}

async function replaceAttachments(tenantId: string, ownerId: string, attachments: AttachmentDraft[]) {
  await prisma.$executeRaw`
    DELETE FROM "Attachment"
    WHERE "tenantId" = ${tenantId}
      AND "ownerType" = 'employee_request'
      AND "ownerId" = ${ownerId}
  `;
  for (const attachment of attachments) {
    await prisma.$executeRaw`
      INSERT INTO "Attachment" (
        "id", "tenantId", "ownerType", "ownerId", "categoryId", "categoryName",
        "titleId", "title", "fileUrl", "fileName", "fileType", "fileSize", "issuedAt", "description", "uploadedAt"
      )
      VALUES (
        ${attachment.id || crypto.randomUUID()}, ${tenantId}, 'employee_request', ${ownerId},
        ${attachment.categoryId ?? null}, ${attachment.categoryName}, ${attachment.titleId ?? null}, ${attachment.title},
        ${attachment.fileUrl}, ${attachment.fileName}, ${attachment.fileType ?? null}, ${attachment.fileSize ?? null},
        ${attachment.issuedAt ?? null}, ${attachment.description ?? null}, NOW()
      )
    `;
  }
}

function startOfMonthIso(value?: string | null) {
  const isoDate = toIsoDate(value);
  return isoDate ? `${isoDate.slice(0, 7)}-01` : null;
}

function endOfMonthIso(value?: string | null) {
  const isoDate = toIsoDate(value);
  if (!isoDate) return null;
  const [year, month] = isoDate.split('-').map(Number);
  if (!year || !month) return null;
  const nextMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0));
  nextMonth.setUTCDate(nextMonth.getUTCDate() - 1);
  return nextMonth.toISOString().slice(0, 10);
}

export async function upsertEmployeeRequest(payload: EmployeeRequestFormPayload) {
  const { tenantId, userName } = await requireTenantId();
  const employee = await prisma.employee.findFirst({ where: { id: payload.employeeId, tenantId }, select: { id: true } });
  if (!employee) throw new Error('Employee not found for active tenant.');
  if (!payload.reasonId && payload.requestType !== 'mission' && payload.requestType !== 'remote_work') throw new Error('Reason is required.');
  if (payload.rangeType === 'multi_day' && (!payload.startDate || !payload.endDate || payload.endDate < payload.startDate)) {
    throw new Error('Invalid leave date range.');
  }
  if (payload.rangeType === 'hourly' && (!payload.startTime || !payload.endTime || payload.endTime <= payload.startTime)) {
    throw new Error('Invalid hourly range.');
  }
  if (payload.requestType === 'remote_work') {
    const mode = mapRangeTypeToRemoteWorkMode(payload.rangeType);
    if (!mode) throw new Error('نوع دورکاری نامعتبر است.');
    if (mode === 'daily' && !payload.startDate) throw new Error('تاریخ دورکاری الزامی است.');
    if (mode === 'hourly' && (!payload.startDate || !payload.startTime || !payload.endTime)) throw new Error('تاریخ و بازه ساعتی دورکاری الزامی است.');
    if (mode === 'multi_day' && (!payload.startDate || !payload.endDate || payload.endDate < payload.startDate)) throw new Error('بازه چندروزه دورکاری نامعتبر است.');
    if (mode === 'hourly' && payload.startTime && payload.endTime && payload.endTime <= payload.startTime) throw new Error('ساعت پایان باید بعد از ساعت شروع باشد.');
  }
  if (['overtime'].includes(payload.requestType) && (!payload.startDate || !payload.endDate || payload.endDate < payload.startDate || !payload.startTime || !payload.endTime)) {
    throw new Error('Invalid request date range.');
  }
  if (['overtime'].includes(payload.requestType) && payload.startDate === payload.endDate && payload.endTime! <= payload.startTime!) {
    throw new Error('Invalid request time range.');
  }
  const preview = await previewEmployeeRequest(payload, tenantId);
  if (preview.blockingErrors.length) throw new Error(preview.blockingErrors[0] ?? 'Request preview failed.');
  const previewDate = requestAnchorDates(payload)[0] ?? payload.startDate ?? null;
  const activeContract = previewDate ? await getEmployeeContractForDate(payload.employeeId, previewDate, tenantId) : await getCurrentEmployeeContract(payload.employeeId, tenantId);
  const contractLeave = getContractLeaveBalanceInputs(activeContract, { fallbackToDefaults: false });
  const leaveIdentity = mapRequestTypeToLeaveIdentity(payload.requestType, payload.rangeType);
  const requestContext = previewDate ? await resolveEmployeeLeaveContext(payload.employeeId, tenantId, previewDate) : await resolveEmployeeLeaveContext(payload.employeeId, tenantId);
  const currentContract = activeContract;
  const leaveContext = requestContext;

  if (leaveIdentity && !currentContract) {
    throw new Error('برای محاسبه مرخصی، قرارداد فعال وجود ندارد.');
  }
  if (leaveIdentity && leaveContext && !leaveContext.hasWorkGroup) {
    throw new Error('برای محاسبه مرخصی، گروه کاری برای کارمند مشخص نشده است.');
  }
  if (leaveIdentity && leaveContext && !leaveContext.hasWorkPolicy) {
    throw new Error('برای محاسبه مرخصی، سیاست کاری برای گروه کاری مشخص نشده است.');
  }

  const leaveRule = leaveIdentity ? leaveContext?.leaveRules[leaveIdentity.leaveType] ?? null : null;
  if (leaveIdentity && (!leaveRule || !leaveRule.enabled || !ruleAllowsMode(leaveRule, leaveIdentity.leaveMode))) {
    throw new Error('این نوع مرخصی در سیاست کاری کارمند فعال نیست.');
  }
  if (leaveRule?.requiresAttachment && !(payload.attachments ?? []).length) {
    throw new Error('برای این نوع مرخصی، پیوست الزامی است.');
  }

  const dailyRequiredMinutes =
    currentContract?.dailyRequiredMinutes ?? contractLeave.dailyRequiredMinutes ?? DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
  const calculatedDuration = calculateDuration(payload, dailyRequiredMinutes, leaveContext);
  if (!['attendance', 'salary_advance', 'loan'].includes(payload.requestType) && (!calculatedDuration || calculatedDuration <= 0)) {
    throw new Error('Duration must be positive.');
  }

  if (leaveRule?.maxUsageHours != null && calculatedDuration != null && calculatedDuration > leaveRule.maxUsageHours * 60) {
    throw new Error('مدت این درخواست از سقف مجاز برای این نوع مرخصی بیشتر است.');
  }

  if (leaveIdentity && leaveRule?.monthlyUsageCapHours != null) {
    const monthStart = startOfMonthIso(payload.startDate);
    const monthEnd = endOfMonthIso(payload.startDate);
    if (monthStart && monthEnd) {
      const monthlyRequests = await prisma.employeeRequest.findMany({
        where: {
          tenantId,
          employeeId: payload.employeeId,
          status: { in: ['pending', 'approved'] },
          id: payload.id ? { not: payload.id } : undefined,
          startDate: { gte: monthStart, lte: monthEnd },
          requestType: {
            in: ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'],
          },
        },
        select: {
          calculatedDurationMinutes: true,
          requestType: true,
          rangeType: true,
          calculationMeta: true,
        },
      });
      const alreadyUsed = monthlyRequests.reduce((sum, request) => {
        const meta =
          request.calculationMeta && typeof request.calculationMeta === 'object' && !Array.isArray(request.calculationMeta)
            ? (request.calculationMeta as Record<string, unknown>)
            : {};
        const sameLeaveType =
          typeof meta.leaveType === 'string'
            ? meta.leaveType === leaveIdentity.leaveType
            : mapRequestTypeToLeaveIdentity(request.requestType, request.rangeType)?.leaveType === leaveIdentity.leaveType;
        if (!sameLeaveType) return sum;
        return sum + Math.max(0, Number(request.calculatedDurationMinutes ?? 0));
      }, 0);
      if (alreadyUsed + calculatedDuration > leaveRule.monthlyUsageCapHours * 60) {
        throw new Error('سقف مصرف ماهانه برای این نوع مرخصی کافی نیست.');
      }
    }
  }

  const leaveBalance = leaveIdentity ? await getEmployeeLeaveBalanceSummary(payload.employeeId, tenantId, previewDate) : null;
  if (leaveRule?.deductsFromEntitlementBalance && leaveBalance && leaveBalance.remainingMinutes != null && calculatedDuration != null) {
    if (calculatedDuration > leaveBalance.remainingMinutes) {
      throw new Error('مانده مرخصی استحقاقی برای این درخواست کافی نیست.');
    }
  }

  const status = payload.submissionMode === 'approved' ? 'approved' : payload.status;
  const approvedBy = status === 'approved' ? userName : null;
  const approvedAt = status === 'approved' ? new Date() : null;
  const baseMeta = calculationMeta(
    payload,
    calculatedDuration,
    getContractOvertimeRules(currentContract),
    Boolean(currentContract),
    requestContext.remoteWorkPolicy,
  );
  const meta = leaveIdentity
    ? {
        ...baseMeta,
        leaveType: leaveIdentity.leaveType,
        leaveMode: leaveIdentity.leaveMode,
        paid: leaveRule?.paid ?? false,
        deductsFromEntitlementBalance: leaveRule?.deductsFromEntitlementBalance ?? false,
        requiresAttachmentAtCreation: leaveRule?.requiresAttachment ?? false,
        activeContractId: activeContract?.id ?? null,
        activeContractSnapshot: activeContract
          ? {
              contractNumber: activeContract.contractNumber,
              startDate: activeContract.startDate,
              endDate: activeContract.endDate,
              dailyRequiredMinutes: activeContract.dailyRequiredMinutes,
            }
          : null,
        workGroupId: preview.workGroupId,
        workGroupTitle: preview.workGroupTitle,
        policyId: leaveContext?.workPolicyId ?? null,
        workPolicyId: preview.workPolicyId,
        workPolicyTitle: preview.workPolicyTitle,
        calendarId: preview.calendarId,
        calendarTitle: preview.calendarTitle,
        payableMinutes: preview.payableDurationMinutes,
        unpaidMinutes: preview.unpaidDurationMinutes,
        balanceEffectMinutes: preview.balanceEffectMinutes,
        calculationWarnings: preview.warnings,
        policySnapshot: leaveRule
          ? {
              leaveType: leaveIdentity.leaveType,
              leaveMode: leaveIdentity.leaveMode,
              ...leaveRule,
            }
          : null,
      }
    : {
        ...baseMeta,
        activeContractId: activeContract?.id ?? null,
        activeContractSnapshot: activeContract
          ? {
              contractNumber: activeContract.contractNumber,
              startDate: activeContract.startDate,
              endDate: activeContract.endDate,
              dailyRequiredMinutes: activeContract.dailyRequiredMinutes,
            }
          : null,
        workGroupId: preview.workGroupId,
        workGroupTitle: preview.workGroupTitle,
        workPolicyId: preview.workPolicyId,
        workPolicyTitle: preview.workPolicyTitle,
        calendarId: preview.calendarId,
        calendarTitle: preview.calendarTitle,
        payableMinutes: preview.payableDurationMinutes,
        unpaidMinutes: preview.unpaidDurationMinutes,
        balanceEffectMinutes: preview.balanceEffectMinutes,
        calculationWarnings: preview.warnings,
        ...(payload.requestType === 'remote_work'
          ? { policySnapshot: leaveContext?.remoteWorkPolicy ?? null }
          : {}),
      };
  const attendanceActionType = payload.requestType === 'attendance' ? null : payload.attendanceActionType ?? null;

  let requestId = payload.id;
  if (requestId) {
    const current = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "EmployeeRequest"
      WHERE "id" = ${requestId} AND "tenantId" = ${tenantId} AND "employeeId" = ${payload.employeeId}
      LIMIT 1
    `;
    if (!current.length) throw new Error('Request not found for active tenant.');
    await prisma.$executeRaw`
      UPDATE "EmployeeRequest"
      SET
        "requestType" = ${payload.requestType}::"EmployeeRequestType",
        "status" = ${status}::"EmployeeRequestStatus",
        "submissionMode" = ${payload.submissionMode}::"EmployeeRequestSubmissionMode",
        "startDate" = ${payload.startDate ?? null},
        "endDate" = ${payload.endDate ?? null},
        "startTime" = ${payload.startTime ?? null},
        "endTime" = ${payload.endTime ?? null},
        "dateTime" = ${payload.dateTime ?? null},
        "rangeType" = ${payload.rangeType ?? null}::"EmployeeRequestRangeType",
        "attendanceActionType" = ${attendanceActionType}::"AttendanceActionType",
        "amount" = ${payload.amount ?? null},
        "loanId" = ${payload.loanId ?? null},
        "installments" = ${payload.installments ?? null},
        "reasonId" = ${payload.reasonId ?? null},
        "description" = ${payload.description?.trim() || null},
        "calculatedDurationMinutes" = ${calculatedDuration},
        "calculationMeta" = ${JSON.stringify(meta)}::jsonb,
        "approvedBy" = ${approvedBy},
        "approvedAt" = ${approvedAt},
        "rejectedBy" = NULL,
        "rejectedAt" = NULL,
        "canceledAt" = CASE WHEN ${status} = 'canceled' THEN NOW() ELSE NULL END,
        "updatedAt" = NOW()
      WHERE "id" = ${requestId}
    `;
  } else {
    requestId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "EmployeeRequest" (
        "id", "tenantId", "employeeId", "requestType", "status", "submissionMode",
        "startDate", "endDate", "startTime", "endTime", "dateTime", "rangeType", "attendanceActionType",
        "amount", "loanId", "installments", "reasonId", "description", "calculatedDurationMinutes", "calculationMeta",
        "createdBy", "approvedBy", "approvedAt", "canceledAt", "createdAt", "updatedAt"
      )
      VALUES (
        ${requestId}, ${tenantId}, ${payload.employeeId}, ${payload.requestType}::"EmployeeRequestType",
        ${status}::"EmployeeRequestStatus", ${payload.submissionMode}::"EmployeeRequestSubmissionMode",
        ${payload.startDate ?? null}, ${payload.endDate ?? null}, ${payload.startTime ?? null}, ${payload.endTime ?? null},
        ${payload.dateTime ?? null}, ${payload.rangeType ?? null}::"EmployeeRequestRangeType",
        ${attendanceActionType}::"AttendanceActionType", ${payload.amount ?? null}, ${payload.loanId ?? null},
        ${payload.installments ?? null}, ${payload.reasonId ?? null}, ${payload.description?.trim() || null},
        ${calculatedDuration}, ${JSON.stringify(meta)}::jsonb, ${userName}, ${approvedBy}, ${approvedAt},
        CASE WHEN ${status} = 'canceled' THEN NOW() ELSE NULL END, NOW(), NOW()
      )
    `;
  }
  await replaceAttachments(tenantId, requestId, payload.attachments ?? []);
  return { ok: true as const, id: requestId };
}

export async function updateEmployeeRequestStatus(id: string, status: EmployeeRequestStatus) {
  const { tenantId, userName } = await requireTenantId();
  await prisma.$executeRaw`
    UPDATE "EmployeeRequest"
    SET
      "status" = ${status}::"EmployeeRequestStatus",
      "approvedBy" = CASE WHEN ${status} = 'approved' THEN ${userName} ELSE "approvedBy" END,
      "approvedAt" = CASE WHEN ${status} = 'approved' THEN NOW() WHEN ${status} = 'pending' THEN NULL ELSE "approvedAt" END,
      "rejectedBy" = CASE WHEN ${status} = 'rejected' THEN ${userName} ELSE NULL END,
      "rejectedAt" = CASE WHEN ${status} = 'rejected' THEN NOW() ELSE NULL END,
      "canceledAt" = CASE WHEN ${status} = 'canceled' THEN NOW() ELSE NULL END,
      "updatedAt" = NOW()
    WHERE "id" = ${id} AND "tenantId" = ${tenantId}
  `;
  return { ok: true as const };
}

export async function deleteEmployeeRequest(id: string) {
  const { tenantId } = await requireTenantId();
  await prisma.$transaction([
    prisma.$executeRaw`DELETE FROM "Attachment" WHERE "tenantId" = ${tenantId} AND "ownerType" = 'employee_request' AND "ownerId" = ${id}`,
    prisma.$executeRaw`DELETE FROM "EmployeeRequest" WHERE "id" = ${id} AND "tenantId" = ${tenantId}`,
  ]);
  return { ok: true as const };
}

export async function upsertCompanyLoan(input: Omit<CompanyLoanItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { tenantId } = await requireTenantId();
  const id = input.id || crypto.randomUUID();
  if (input.id) {
    await prisma.$executeRaw`
      UPDATE "CompanyLoan"
      SET "title" = ${input.title}, "guarantorCount" = ${input.guarantorCount}, "minAmount" = ${input.minAmount},
        "maxAmount" = ${input.maxAmount}, "minInstallments" = ${input.minInstallments}, "maxInstallments" = ${input.maxInstallments},
        "feeRate" = ${input.feeRate}, "interestRate" = ${input.interestRate}, "isActive" = ${input.isActive}, "updatedAt" = NOW()
      WHERE "id" = ${input.id} AND "tenantId" = ${tenantId}
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "CompanyLoan" (
        "id", "tenantId", "title", "guarantorCount", "minAmount", "maxAmount",
        "minInstallments", "maxInstallments", "feeRate", "interestRate", "isActive", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${tenantId}, ${input.title}, ${input.guarantorCount}, ${input.minAmount}, ${input.maxAmount},
        ${input.minInstallments}, ${input.maxInstallments}, ${input.feeRate}, ${input.interestRate}, ${input.isActive}, NOW(), NOW()
      )
    `;
  }
  return { ok: true as const, id };
}

export async function deleteCompanyLoan(id: string) {
  const { tenantId } = await requireTenantId();
  await prisma.$executeRaw`DELETE FROM "CompanyLoan" WHERE "id" = ${id} AND "tenantId" = ${tenantId}`;
  return { ok: true as const };
}
