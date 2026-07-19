import {
  addPersianDays,
  formatPersianYmd,
  getPersianPartsFromDate,
  getPersianWeekdayIndex,
  getPersianWeekdayName,
  persianToDate,
} from './calendar-dates';
import { getDayDetails } from './calendar-grid';
import { parseCalendarStoredEvents, normalizePersianDateInput, type CalendarStoredEvent } from './calendar-events';
import { parsePersianYmd, type PersianYmd } from './calendar-dates';
import { listCalendarShifts, listExcludedShiftDates, listWeekendOverrideDates, type StoredCalendarShift } from './calendar-shifts';
import { summarizeShiftForDayPanel } from './calendar-shift-display';
import { calculateTimeRangeDurationMinutes } from './time-range-validation';
import { DEFAULT_PAYROLL_SETTINGS, type PayrollSettings } from './payroll-business-settings';
import { getPolicySectionValues } from './policy-workspaces';
import { parseRemoteWorkPolicy } from './remote-work-policy';
import type { EmployeeCurrentContractSummary } from './employee-contracts';
import {
  analyzeAttendanceForShiftWindow,
  buildShiftContextForDate,
  parseAttendanceTimestamp,
  parseTimeToMinutes,
  readAttendancePolicyBundle,
  type AttendanceDayAnalysis,
  type AttendanceInterval,
  type AttendancePolicyBundle,
  type AttendanceRequestLike,
  type AttendanceTimestamp,
  type ShiftSegment,
} from './attendance-calculation';

export type WorkReportRequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
export type WorkReportRequestType =
  | 'daily_leave'
  | 'hourly_leave'
  | 'reward_leave'
  | 'unpaid_leave'
  | 'sick_leave'
  | 'overtime'
  | 'attendance'
  | 'remote_work'
  | 'mission'
  | 'salary_advance'
  | 'loan';
export type WorkReportRangeType = 'full_day' | 'multi_day' | 'hourly' | 'range' | 'point' | null;

export type WorkReportRawRequest = {
  id: string;
  requestType: WorkReportRequestType;
  status: WorkReportRequestStatus;
  rangeType: WorkReportRangeType;
  attendanceActionType: 'check_in' | 'check_out' | 'correction' | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  calculatedDurationMinutes: number | null;
  calculationMeta: unknown;
  description: string | null;
  reason: { title: string } | null;
  loan: { title: string } | null;
};

export type WorkReportCalendarContext = {
  id: string;
  title: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  bounds: { start: PersianYmd; end: PersianYmd } | null;
  weekends: string[];
  shiftConfig: StoredCalendarShift[];
  singleHolidays: CalendarStoredEvent[];
  excludedShiftDates: string[];
  weekendOverrideDates: string[];
};

export type WorkReportPolicyContext = {
  id: string;
  title: string;
  sectionValues: Record<string, unknown>;
};

export type WorkReportWorkGroupContext = {
  id: string;
  title: string;
  policy: WorkReportPolicyContext | null;
  calendar: WorkReportCalendarContext | null;
};

export type WorkReportShiftBreak = {
  id: string;
  type: 'fixed' | 'floating';
  typeLabel: string;
  timeRange: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  deductFromWork: boolean;
};

export type WorkReportShift = {
  id: string;
  title: string;
  shiftType: string;
  shiftTypeLabel: string;
  description: string;
  timeRange: string;
  breakCount: number;
  breakSummaries: string[];
  breaks: WorkReportShiftBreak[];
  startTime: string | null;
  endTime: string | null;
  requiredMinutes: number | null;
};

export type WorkReportDayPayrollEffect = {
  baseSalaryPortion: number;
  overtimePortion: number;
  nightWorkPortion: number;
  unpaidLeaveDeduction: number;
  absenceDeduction: number;
  shortageDeduction: number;
};

export type WorkReportDayResult = {
  date: string;
  jalaliDate: string;
  weekday: string;
  weekdayIndex: number;
  isToday: boolean;
  isHoliday: boolean;
  isRestDay: boolean;
  isWorkDay: boolean;
  contractId: string | null;
  contractLabel: string | null;
  workGroupId: string | null;
  workGroupLabel: string | null;
  policyId: string | null;
  policyLabel: string | null;
  calendarId: string | null;
  shiftType: string | null;
  expectedShift: WorkReportShift | null;
  expectedShifts: WorkReportShift[];
  expectedShiftWindows: string[];
  requiredMinutes: number;
  deductedBreakMinutes: number;
  attendanceTimestamps: string[];
  attendanceIntervals: AttendanceInterval[];
  isIncompleteAttendance: boolean;
  incompleteSegments: string[];
  workedMinutes: number;
  payableWorkMinutes: number;
  attendanceMinutes: number;
  absenceMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  shortageMinutes: number;
  overtimeMinutes: number;
  nightWorkMinutes: number;
  leaveMinutes: number;
  paidLeaveMinutes: number;
  unpaidLeaveMinutes: number;
  sickLeaveMinutes: number;
  bonusLeaveMinutes: number;
  entitledLeaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  underworkMinutes: number;
  status:
    | 'حضور'
    | 'غیبت'
    | 'مرخصی'
    | 'اضافه‌کاری'
    | 'تردد ناقص'
    | 'مأموریت'
    | 'دورکاری'
    | 'تعطیل مجاز'
    | 'تأخیر مجاز'
    | 'کسرکار';
  statusBadges: Array<{ key: string; label: string; tone: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' }>;
  warnings: string[];
  payrollEffect: WorkReportDayPayrollEffect | null;
  segmentAnalyses?: AttendanceDayAnalysis['segmentAnalyses'];
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function normalizeDateDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632));
}

export function toPlainDate(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeDateDigits(value.trim());
  const plainValue = normalized.slice(0, 10);
  const persianMatch = plainValue.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (persianMatch) {
    const year = Number(persianMatch[1]);
    const month = Number(persianMatch[2]);
    const day = Number(persianMatch[3]);
    if (!year || !month || !day) return null;
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  }
  const isoMatch = plainValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!year || !month || !day) return null;
    try {
      const gregorianDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      return formatPersianYmd(getPersianPartsFromDate(gregorianDate));
    } catch {
      return null;
    }
  }
  return null;
}

function formatTime(value?: string | null) {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return null;
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

type ShiftRestRecord = {
  id: string;
  type: string;
  start?: string;
  end?: string;
  endsNextDay?: boolean;
  deductFromWork?: boolean;
  duration?: number;
  unit?: string;
};

function listShiftRests(shift: StoredCalendarShift) {
  const config = asObject(shift.config);
  switch (shift.shiftType) {
    case 'float-day': {
      const floatDay = asObject(config.floatingShiftStartOfDay);
      return (Array.isArray(config.floatDayRests) ? config.floatDayRests : Array.isArray(floatDay.rests) ? floatDay.rests : []) as ShiftRestRecord[];
    }
    case 'float-abs': {
      const floatAbs = asObject(config.absoluteFloatingShift);
      return (Array.isArray(config.floatAbsRests) ? config.floatAbsRests : Array.isArray(floatAbs.rests) ? floatAbs.rests : []) as ShiftRestRecord[];
    }
    case 'split': {
      const split = asObject(config.splitShift);
      return [
        ...(Array.isArray(split.segment1Breaks) ? split.segment1Breaks : []),
        ...(Array.isArray(split.segment2Breaks) ? split.segment2Breaks : []),
      ] as ShiftRestRecord[];
    }
    default:
      return (Array.isArray(config.rests) ? config.rests : []) as ShiftRestRecord[];
  }
}

function restDurationMinutes(rest: ShiftRestRecord) {
  if (rest.type === 'fixed') {
    const start = parseTimeToMinutes(rest.start);
    const end = parseTimeToMinutes(rest.end);
    if (start == null || end == null) return 0;
    const wraps = Boolean(rest.endsNextDay) || end <= start;
    return Math.max(end - start + (wraps ? 24 * 60 : 0), 0);
  }
  const duration = Number(rest.duration ?? 0) || 0;
  return rest.unit === 'hours' ? duration * 60 : duration;
}

function formatRestTimeRange(rest: ShiftRestRecord) {
  if (rest.type !== 'fixed') {
    const duration = restDurationMinutes(rest);
    return duration > 0 ? `${duration} دقیقه` : 'بدون مدت ثبت شده';
  }
  const start = formatTime(rest.start);
  const end = formatTime(rest.end);
  if (!start || !end) return 'بازه نامشخص';
  return `${start} تا ${end}${rest.endsNextDay ? ' (روز بعد)' : ''}`;
}

function buildShiftBreakSummary(rest: ShiftRestRecord): WorkReportShiftBreak {
  const type = rest.type === 'floating' ? 'floating' : 'fixed';
  return {
    id: rest.id,
    type,
    typeLabel: type === 'floating' ? 'شناور' : 'ثابت',
    timeRange: formatRestTimeRange(rest),
    startTime: type === 'fixed' ? formatTime(rest.start) : null,
    endTime: type === 'fixed' ? formatTime(rest.end) : null,
    durationMinutes: restDurationMinutes(rest),
    deductFromWork: rest.deductFromWork !== false,
  };
}

function resolveShiftWindow(shift: StoredCalendarShift, fallbackRequiredMinutes: number) {
  const config = asObject(shift.config);
  const source = asObject(config.fixedShift ?? config);

  if (shift.shiftType === 'fixed') {
    const startTime = formatTime(String(source.startTime ?? config.startTime ?? '')) ?? null;
    const endTime = formatTime(String(source.endTime ?? config.endTime ?? '')) ?? null;
    const nextDay = Boolean(source.endsNextDay ?? config.nextDay);
    const grossMinutes = startTime && endTime ? Math.max(0, calculateTimeRangeDurationMinutes(startTime, endTime, nextDay)) : 0;
    const deductedRestMinutes = listShiftRests(shift).reduce(
      (sum, rest) => sum + (rest.deductFromWork === false ? 0 : restDurationMinutes(rest)),
      0,
    );
    const explicitRequiredMinutes = Number(source.requiredMinutes ?? config.requiredMinutes ?? 0) || 0;
    return {
      startTime,
      endTime,
      requiredMinutes: grossMinutes > 0 ? Math.max(grossMinutes - deductedRestMinutes, 0) : explicitRequiredMinutes || fallbackRequiredMinutes,
    };
  }

  if (shift.shiftType === 'float-day') {
    const floatDay = asObject(config.floatingShiftStartOfDay ?? config);
    return {
      startTime: formatTime(String(floatDay.bandwidthStart ?? config.workStartWindow ?? '')) ?? null,
      endTime: formatTime(String(floatDay.bandwidthEnd ?? config.workEndWindow ?? '')) ?? null,
      requiredMinutes: Number(floatDay.requiredMinutes ?? config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
    };
  }

  if (shift.shiftType === 'float-abs') {
    const abs = asObject(config.absoluteFloatingShift ?? config);
    return {
      startTime: formatTime(String(abs.startTime ?? config.startTime ?? '')) ?? null,
      endTime: formatTime(String(abs.endTime ?? config.endTime ?? '')) ?? null,
      requiredMinutes: Number(abs.requiredMinutes ?? config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
    };
  }

  if (shift.shiftType === 'split') {
    const split = asObject(config.splitShift ?? config);
    return {
      startTime: formatTime(String(split.segment1Start ?? config.startTime ?? '')) ?? null,
      endTime: formatTime(String(split.segment2End ?? config.endTime ?? '')) ?? null,
      requiredMinutes: Number(split.requiredMinutes ?? config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
    };
  }

  return { startTime: null, endTime: null, requiredMinutes: Number(config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes };
}

export function mapShiftForDay(
  rawShift: StoredCalendarShift,
  summary: ReturnType<typeof summarizeShiftForDayPanel>,
  fallbackRequiredMinutes: number,
): WorkReportShift {
  const window = resolveShiftWindow(rawShift, fallbackRequiredMinutes);
  const breaks = listShiftRests(rawShift).map(buildShiftBreakSummary);
  return {
    id: rawShift.id,
    title: summary.title,
    shiftType: summary.shiftType,
    shiftTypeLabel: summary.shiftTypeLabel,
    description: summary.description,
    timeRange: summary.timeRange,
    breakCount: summary.breakCount,
    breakSummaries: summary.breakSummaries,
    breaks,
    startTime: window.startTime,
    endTime: window.endTime,
    requiredMinutes: window.requiredMinutes,
  };
}

export function requestMetaObject(request: WorkReportRawRequest) {
  return request.calculationMeta && typeof request.calculationMeta === 'object' && !Array.isArray(request.calculationMeta)
    ? (request.calculationMeta as Record<string, unknown>)
    : {};
}

export function requestLeaveType(request: WorkReportRawRequest) {
  const meta = requestMetaObject(request);
  if (typeof meta.leaveType === 'string') return meta.leaveType;
  if (request.requestType === 'daily_leave' || request.requestType === 'hourly_leave') return 'entitlement';
  if (request.requestType === 'reward_leave') return 'bonus';
  if (request.requestType === 'unpaid_leave') return 'unpaid';
  if (request.requestType === 'sick_leave') return 'sick';
  return null;
}

export function requestIsLeave(request: WorkReportRawRequest) {
  return requestLeaveType(request) != null;
}

export function requestDeductsEntitlement(request: WorkReportRawRequest) {
  const meta = requestMetaObject(request);
  if (typeof meta.deductsFromEntitlementBalance === 'boolean') return meta.deductsFromEntitlementBalance;
  return request.requestType === 'daily_leave' || request.requestType === 'hourly_leave';
}

export function requestIsPaidLeave(request: WorkReportRawRequest) {
  const meta = requestMetaObject(request);
  if (typeof meta.paid === 'boolean') return meta.paid;
  return request.requestType !== 'unpaid_leave';
}

export function requestFamily(type: WorkReportRequestType) {
  if (['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'].includes(type)) return 'leave';
  if (type === 'overtime') return 'overtime';
  if (type === 'remote_work') return 'remote';
  if (type === 'mission') return 'mission';
  if (type === 'attendance') return 'attendance';
  return 'other';
}

export function requestDays(request: WorkReportRawRequest) {
  const start = toPlainDate(request.startDate);
  const end = toPlainDate(request.endDate);
  const single = toPlainDate(request.dateTime);
  if (start && end) {
    const days: string[] = [];
    let cursor = start;
    while (cursor <= end) {
      days.push(cursor);
      const parts = cursor.split('/').map(Number);
      const next = addPersianDays({ year: parts[0], month: parts[1], day: parts[2] }, 1);
      cursor = formatPersianYmd(next);
    }
    return days;
  }
  if (start) return [start];
  if (single) return [single];
  return [];
}

export function requestMatchesDate(request: WorkReportRawRequest, date: string) {
  const days = requestDays(request);
  return days.includes(date);
}

export function resolveDailyRequiredMinutes(contract: EmployeeCurrentContractSummary | null, policy: WorkReportPolicyContext | null) {
  const policyValues = policy?.sectionValues ?? {};
  const requiredFromPolicy = Number(policyValues.requiredMinutes);
  if (Number.isFinite(requiredFromPolicy) && requiredFromPolicy > 0) return requiredFromPolicy;
  if (contract?.dailyRequiredMinutes && contract.dailyRequiredMinutes > 0) return contract.dailyRequiredMinutes;
  return DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
}

export function requestDurationForDate(
  request: WorkReportRawRequest,
  date: string,
  dailyRequiredMinutes: number,
  onlyApproved = true,
) {
  if (onlyApproved && request.status !== 'approved') return 0;
  if (request.requestType === 'attendance') return 0;
  if (!requestMatchesDate(request, date)) return 0;

  const dayMinutes = dailyRequiredMinutes > 0 ? dailyRequiredMinutes : DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;

  if (request.rangeType === 'hourly') {
    const start = parseTimeToMinutes(request.startTime);
    const end = parseTimeToMinutes(request.endTime);
    if (start != null && end != null) return Math.max(0, end - start);
    if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) return request.calculatedDurationMinutes;
    return 0;
  }

  if (request.rangeType === 'multi_day') {
    const spanDays = requestDays(request).length;
    if (spanDays <= 0) return 0;
    if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) {
      return Math.round(request.calculatedDurationMinutes / spanDays);
    }
    return dayMinutes;
  }

  if (request.rangeType === 'full_day' || requestIsLeave(request)) {
    if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) return request.calculatedDurationMinutes;
    return dayMinutes;
  }

  if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) return request.calculatedDurationMinutes;
  return dayMinutes;
}

function timestampForPersianDateTime(dateKey: string, time: string) {
  const [year, month, day] = dateKey.split('/').map(Number);
  if (!year || !month || !day) return null;
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return null;
  try {
    const date = persianToDate({ year, month, day });
    date.setUTCHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    return date.getTime();
  } catch {
    return null;
  }
}

function overlapMinutes(startA: number, endA: number, startB: number, endB: number) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB)) / 60000;
}

function calculateDeductedBreakMinutes(
  dateKey: string,
  expectedShifts: WorkReportShift[],
  intervals: AttendanceInterval[],
) {
  const completeIntervals = intervals.filter((item) => item.isComplete && item.status === 'approved');
  if (completeIntervals.length === 0 || expectedShifts.length === 0) return 0;

  let deducted = 0;
  for (const shift of expectedShifts) {
    for (const rest of shift.breaks) {
      if (!rest.deductFromWork || rest.durationMinutes <= 0) continue;
      if (rest.type === 'floating') {
        deducted += rest.durationMinutes;
        continue;
      }
      if (!rest.startTime || !rest.endTime) continue;
      const restStart = timestampForPersianDateTime(dateKey, rest.startTime);
      if (restStart == null) continue;
      let restEnd = timestampForPersianDateTime(dateKey, rest.endTime);
      if (restEnd == null) continue;
      if (restEnd <= restStart) restEnd += 24 * 60 * 60 * 1000;
      const overlap = completeIntervals.reduce((sum, interval) => {
        if (!interval.endTimeLabel) return sum;
        const startTs = timestampForPersianDateTime(dateKey, interval.startTimeLabel);
        let endTs = timestampForPersianDateTime(dateKey, interval.endTimeLabel);
        if (startTs == null || endTs == null) return sum;
        if (endTs <= startTs) endTs += 24 * 60 * 60 * 1000;
        return sum + overlapMinutes(startTs, endTs, restStart, restEnd);
      }, 0);
      deducted += Math.min(rest.durationMinutes, Math.round(overlap));
    }
  }
  return Math.max(0, Math.round(deducted));
}

function resolveAttendanceDateKeys(segments: ShiftSegment[], dateKey: string) {
  const keys = [dateKey];
  if (segments.some((segment) => segment.endsNextDay)) {
    const [year, month, day] = dateKey.split('/').map(Number);
    if (year && month && day) keys.push(formatPersianYmd(addPersianDays({ year, month, day }, 1)));
  }
  return keys;
}

function collectDayAttendanceTimestamps(
  requests: AttendanceRequestLike[],
  dateKeys: string[],
  options: { includePending: boolean },
): AttendanceTimestamp[] {
  return requests
    .filter((request) => request.status === 'approved' || (options.includePending && request.status === 'pending'))
    .map((request) => {
      const parsed = parseAttendanceTimestamp(request);
      if (!parsed) return null;
      const dateKey = toPlainDate(request.startDate ?? request.dateTime);
      if (!dateKey || !dateKeys.includes(dateKey)) return null;
      return parsed;
    })
    .filter((item): item is AttendanceTimestamp => Boolean(item))
    .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
}

function resolvePolicyConfig(policy: WorkReportPolicyContext | null) {
  const values = policy?.sectionValues ?? {};
  const remotePolicy = parseRemoteWorkPolicy(values);
  const bundle = readAttendancePolicyBundle(values);
  return {
    allowRemote: remotePolicy.enabled,
    bundle,
    maxDelayMinutes: bundle.maxDelayMinutes,
  };
}

function calcDayStatus(input: {
  isHoliday: boolean;
  hasExpectedShift: boolean;
  hasApprovedLeave: boolean;
  hasAttendance: boolean;
  isIncompleteAttendance: boolean;
  delayMinutes: number;
  overtimeMinutes: number;
  leaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  shortageMinutes: number;
  requiredMinutes: number;
  maxDelayMinutes: number;
  workedMinutes: number;
}): WorkReportDayResult['status'] {
  if (input.isHoliday) return 'تعطیل مجاز';
  if (!input.hasExpectedShift) {
    if (input.hasAttendance || input.workedMinutes > 0) return 'حضور';
    if (input.leaveMinutes > 0) return 'مرخصی';
    if (input.missionMinutes > 0) return 'مأموریت';
    if (input.remoteWorkMinutes > 0) return 'دورکاری';
    return 'تعطیل مجاز';
  }
  if (input.missionMinutes > 0) return 'مأموریت';
  if (input.remoteWorkMinutes > 0) return 'دورکاری';
  if (input.leaveMinutes > 0) return 'مرخصی';
  if (input.isIncompleteAttendance) return 'تردد ناقص';
  if (input.hasAttendance && input.delayMinutes > 0 && input.delayMinutes <= input.maxDelayMinutes) return 'تأخیر مجاز';
  if (input.hasAttendance && input.overtimeMinutes > 0 && input.shortageMinutes === 0) return 'اضافه‌کاری';
  if (input.hasAttendance && input.shortageMinutes === 0) return 'حضور';
  if (input.requiredMinutes > 0 && input.shortageMinutes > 0 && !input.hasAttendance && !input.hasApprovedLeave) return 'غیبت';
  if (input.shortageMinutes > 0) return 'کسرکار';
  if (input.requiredMinutes > 0) return 'غیبت';
  return 'تعطیل مجاز';
}

function badgeTone(status: WorkReportDayResult['status']): 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' {
  switch (status) {
    case 'غیبت':
    case 'تردد ناقص':
      return 'red';
    case 'مرخصی':
    case 'تأخیر مجاز':
    case 'کسرکار':
      return 'amber';
    case 'اضافه‌کاری':
      return 'green';
    case 'مأموریت':
      return 'violet';
    case 'دورکاری':
      return 'blue';
    default:
      return 'neutral';
  }
}

function estimateDayPayrollEffect(input: {
  contract: EmployeeCurrentContractSummary | null;
  requiredMinutes: number;
  payableWorkMinutes: number;
  overtimeMinutes: number;
  nightWorkMinutes: number;
  unpaidLeaveMinutes: number;
  absenceMinutes: number;
  shortageMinutes: number;
  nightCoefficient: number;
  overtimeCoefficient: number;
}): WorkReportDayPayrollEffect | null {
  if (!input.contract?.dailyBaseSalary || input.contract.dailyBaseSalary <= 0) return null;
  const dailyMinutes =
    input.contract.dailyRequiredMinutes > 0
      ? input.contract.dailyRequiredMinutes
      : DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
  const salaryPerMinute = input.contract.dailyBaseSalary / dailyMinutes;
  const salaryPerHour = salaryPerMinute * 60;
  const workRatio = input.requiredMinutes > 0 ? Math.min(1, input.payableWorkMinutes / input.requiredMinutes) : 0;
  const baseSalaryPortion = input.requiredMinutes > 0 ? input.contract.dailyBaseSalary * workRatio : 0;
  const overtimePortion = (input.overtimeMinutes / 60) * salaryPerHour * input.overtimeCoefficient;
  const nightWorkPortion = (input.nightWorkMinutes / 60) * salaryPerHour * input.nightCoefficient;
  const unpaidLeaveDeduction = (input.unpaidLeaveMinutes / 60) * salaryPerHour;
  const absenceDeduction = input.absenceMinutes > 0 && input.requiredMinutes > 0 ? input.contract.dailyBaseSalary : 0;
  const shortageDeduction = (input.shortageMinutes / 60) * salaryPerHour;
  return {
    baseSalaryPortion: Math.round(baseSalaryPortion),
    overtimePortion: Math.round(overtimePortion),
    nightWorkPortion: Math.round(nightWorkPortion),
    unpaidLeaveDeduction: Math.round(unpaidLeaveDeduction),
    absenceDeduction: Math.round(absenceDeduction),
    shortageDeduction: Math.round(shortageDeduction),
  };
}

export function calculateWorkReportDay(input: {
  date: string;
  isToday: boolean;
  contract: EmployeeCurrentContractSummary | null;
  workGroup: WorkReportWorkGroupContext | null;
  isWorkGroupMemberOnDate?: boolean;
  attendanceRequests: AttendanceRequestLike[];
  dayRequests: WorkReportRawRequest[];
  tenantPayrollSettings: PayrollSettings;
  currentDate?: string;
}): WorkReportDayResult {
  const ymdParts = input.date.split('/').map(Number);
  const ymd = { year: ymdParts[0], month: ymdParts[1], day: ymdParts[2] };
  const weekdayIndex = getPersianWeekdayIndex(ymd);
  const weekday = getPersianWeekdayName(ymd);
  const policy = input.workGroup?.policy ?? null;
  const calendar = input.workGroup?.calendar ?? null;
  const isWorkGroupMemberOnDate = input.isWorkGroupMemberOnDate ?? Boolean(input.workGroup);
  const policyConfig = resolvePolicyConfig(policy);
  const requiredMinutesBase = resolveDailyRequiredMinutes(input.contract, policy);
  const rawShifts = calendar?.shiftConfig ?? [];

  const dayRequestsForStatus = input.dayRequests.filter((request) => request.requestType !== 'attendance');
  const approvedRequests = dayRequestsForStatus.filter((request) => request.status === 'approved');

  const dayDetails = calendar
    ? getDayDetails({
        date: input.date,
        weekends: calendar.weekends,
        singleHolidays: calendar.singleHolidays,
        shifts: rawShifts,
        excludedShiftDates: calendar.excludedShiftDates,
        weekendOverrideDates: calendar.weekendOverrideDates,
      })
    : { isHoliday: false, shifts: [], events: [] };

  const expectedShifts = dayDetails.shifts.flatMap((summaryShift) => {
    const rawShift = rawShifts.find((shift) => shift.id === summaryShift.id);
    return rawShift ? [mapShiftForDay(rawShift, summaryShift, requiredMinutesBase)] : [];
  });
  const expectedShift = expectedShifts[0] ?? null;
  const hasExpectedShift = expectedShifts.length > 0;
  const isHoliday = Boolean(dayDetails.isHoliday);
  const isRestDay = Boolean(calendar && dayDetails.isHoliday && !dayDetails.events.some((event) => event.tone === 'holiday'));

  const shiftContext = buildShiftContextForDate({
    persianDateKey: input.date,
    calendar: calendar
      ? {
          weekends: calendar.weekends,
          singleHolidays: calendar.singleHolidays,
          shiftConfig: calendar.shiftConfig,
          excludedShiftDates: calendar.excludedShiftDates,
          weekendOverrideDates: calendar.weekendOverrideDates,
        }
      : null,
    fallbackRequiredMinutes: requiredMinutesBase,
    policySectionValues: policy?.sectionValues,
    policyFallback: policyConfig.bundle,
  });

  const dateKeys = resolveAttendanceDateKeys(shiftContext.segments, input.date);
  const approvedTimestamps = collectDayAttendanceTimestamps(input.attendanceRequests, dateKeys, { includePending: false });
  const pendingTimestamps = collectDayAttendanceTimestamps(input.attendanceRequests, dateKeys, { includePending: true }).filter(
    (item) => item.status === 'pending',
  );
  const allTimestamps = [...approvedTimestamps, ...pendingTimestamps.filter((p) => !approvedTimestamps.some((a) => a.id === p.id))];

  const nightWorkRule = input.tenantPayrollSettings.workTimePayRules.nightWork;
  const attendanceAnalysis = analyzeAttendanceForShiftWindow({
    timestamps: allTimestamps,
    segments: shiftContext.segments,
    dateKey: input.date,
    policy: policyConfig.bundle,
    onlyApprovedForTotals: true,
  });

  const approvedIntervals = attendanceAnalysis.intervals.filter((item) => item.status === 'approved');
  const attendanceMinutes = approvedIntervals.filter((item) => item.isComplete).reduce((sum, item) => sum + item.minutes, 0);
  const deductedBreakMinutes = calculateDeductedBreakMinutes(input.date, expectedShifts, approvedIntervals);
  const attendanceWorkedMinutes = Math.max(0, attendanceAnalysis.workedMinutes - deductedBreakMinutes);

  const leaveMinutes = approvedRequests
    .filter((request) => requestIsLeave(request))
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const entitledLeaveMinutes = approvedRequests
    .filter((request) => requestDeductsEntitlement(request))
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const paidLeaveMinutes = approvedRequests
    .filter((request) => requestIsLeave(request) && requestIsPaidLeave(request))
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const unpaidLeaveMinutes = approvedRequests
    .filter((request) => requestIsLeave(request) && !requestIsPaidLeave(request))
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const sickLeaveMinutes = approvedRequests
    .filter((request) => requestLeaveType(request) === 'sick')
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const bonusLeaveMinutes = approvedRequests
    .filter((request) => requestLeaveType(request) === 'bonus')
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const missionMinutes = approvedRequests
    .filter((request) => request.requestType === 'mission')
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const remoteWorkMinutes = approvedRequests
    .filter((request) => request.requestType === 'remote_work')
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);
  const approvedOvertimeMinutes = approvedRequests
    .filter((request) => request.requestType === 'overtime')
    .reduce((sum, request) => sum + requestDurationForDate(request, input.date, requiredMinutesBase), 0);

  const remoteCountsAsWork = policyConfig.allowRemote;
  const workedMinutes =
    attendanceWorkedMinutes + (remoteCountsAsWork ? remoteWorkMinutes : 0) + missionMinutes + paidLeaveMinutes;
  const requiredMinutes =
    !isWorkGroupMemberOnDate || isHoliday || !hasExpectedShift ? 0 : expectedShift?.requiredMinutes ?? requiredMinutesBase;
  const coveredMinutes = Math.min(requiredMinutes, leaveMinutes + attendanceWorkedMinutes + (remoteCountsAsWork ? remoteWorkMinutes : 0) + missionMinutes);
  const shortageMinutes = Math.max(0, requiredMinutes - coveredMinutes);
  const delayMinutes = attendanceAnalysis.delayMinutes;
  const earlyLeaveMinutes = attendanceAnalysis.earlyLeaveMinutes;
  const overtimeMinutes =
    policyConfig.bundle.overtimeRule === 'disabled'
      ? 0
      : policyConfig.bundle.overtimeRule === 'manager_approval'
        ? approvedOvertimeMinutes
        : Math.max(approvedOvertimeMinutes, attendanceAnalysis.overtimeMinutes);
  const nightWorkMinutes = attendanceAnalysis.nightWorkMinutes;
  const isIncompleteAttendance = attendanceAnalysis.incomplete;
  const incompleteSegments = attendanceAnalysis.incompleteSegmentLabels ?? [];
  const hasAttendance = approvedIntervals.some((item) => item.isComplete);
  const absenceMinutes = requiredMinutes > 0 && !hasAttendance && leaveMinutes === 0 && missionMinutes === 0 && remoteWorkMinutes === 0
    ? requiredMinutes
    : shortageMinutes;

  const payableWorkMinutes = Math.min(requiredMinutes > 0 ? requiredMinutes : workedMinutes, workedMinutes);

  const overtimeRules = input.contract
    ? ((input.contract.data as { workTimePayRules?: PayrollSettings['workTimePayRules'] })?.workTimePayRules ??
      input.tenantPayrollSettings.workTimePayRules)
    : input.tenantPayrollSettings.workTimePayRules;

  const status = !isWorkGroupMemberOnDate
    ? 'تعطیل مجاز'
    : calcDayStatus({
        isHoliday,
        hasExpectedShift,
        hasApprovedLeave: leaveMinutes > 0,
        hasAttendance,
        isIncompleteAttendance,
        delayMinutes,
        overtimeMinutes,
        leaveMinutes,
        missionMinutes,
        remoteWorkMinutes,
        shortageMinutes,
        requiredMinutes,
        maxDelayMinutes: policyConfig.maxDelayMinutes,
        workedMinutes,
      });

  const warnings: string[] = [];
  if (!input.contract) warnings.push('برای این روز قرارداد فعالی یافت نشد.');
  if (!isWorkGroupMemberOnDate && input.workGroup) {
    warnings.push('کارمند در این تاریخ عضو گروه کاری نبوده است؛ شیفت‌ها صرفاً از تقویم سیاست کاری نمایش داده می‌شوند.');
  }
  if (!input.workGroup) warnings.push('این کارمند هنوز به گروه کاری متصل نشده است.');
  if (input.workGroup && !policy) warnings.push('برای گروه کاری این کارمند، سیاست کاری تعریف نشده است.');
  if (policy && !calendar) warnings.push('برای سیاست کاری این کارمند، تقویم کاری تعریف نشده است.');
  if (isWorkGroupMemberOnDate && !hasExpectedShift && !isHoliday) {
    warnings.push('شیفت کاری برای این روز تعریف نشده است.');
  }
  const primaryRequests = dayRequestsForStatus.filter((request) =>
    ['leave', 'mission', 'remote', 'attendance'].includes(requestFamily(request.requestType)),
  );
  if (primaryRequests.length > 1) warnings.push('در این روز چند درخواست هم‌پوشان ثبت شده است.');
  if (attendanceAnalysis.correctionRequired) warnings.push('تردد این روز کامل نیست و ثبت درخواست اصلاح تردد لازم است.');
  else if (attendanceAnalysis.hasMissingPunch) warnings.push('تردد این روز کامل نیست؛ این مورد طبق سیاست فقط به‌صورت هشدار ثبت شده است.');
  if (shortageMinutes > 0) warnings.push('این روز کمتر از موظفی محاسبه شده است.');

  const statusBadges: WorkReportDayResult['statusBadges'] = [{ key: `${input.date}-status`, label: status, tone: badgeTone(status) }];
  if (leaveMinutes > 0) statusBadges.push({ key: `${input.date}-leave`, label: 'مرخصی', tone: 'amber' });
  if (overtimeMinutes > 0) statusBadges.push({ key: `${input.date}-overtime`, label: 'اضافه‌کاری', tone: 'green' });
  if (missionMinutes > 0) statusBadges.push({ key: `${input.date}-mission`, label: 'مأموریت', tone: 'violet' });
  if (remoteWorkMinutes > 0) statusBadges.push({ key: `${input.date}-remote`, label: 'دورکاری', tone: 'blue' });
  if (nightWorkMinutes > 0) statusBadges.push({ key: `${input.date}-night`, label: 'شب‌کاری', tone: 'blue' });
  if (delayMinutes > 0 && delayMinutes <= policyConfig.maxDelayMinutes) {
    statusBadges.push({ key: `${input.date}-delay`, label: 'تأخیر مجاز', tone: 'amber' });
  }
  if (isIncompleteAttendance) statusBadges.push({ key: `${input.date}-missing`, label: 'تردد ناقص', tone: 'red' });

  const contractLabel = input.contract
    ? input.contract.contractNumber ?? input.contract.templateName ?? input.contract.jobTitle ?? 'قرارداد فعال'
    : null;

  const payrollEffect = estimateDayPayrollEffect({
    contract: input.contract,
    requiredMinutes,
    payableWorkMinutes,
    overtimeMinutes,
    nightWorkMinutes,
    unpaidLeaveMinutes,
    absenceMinutes,
    shortageMinutes,
    nightCoefficient: nightWorkRule.coefficient,
    overtimeCoefficient: overtimeRules.overtime.normalCoefficient,
  });

  return {
    date: input.date,
    jalaliDate: input.date,
    weekday,
    weekdayIndex,
    isToday: input.isToday,
    isHoliday,
    isRestDay,
    isWorkDay: isWorkGroupMemberOnDate && hasExpectedShift && !isHoliday,
    contractId: input.contract?.id ?? null,
    contractLabel,
    workGroupId: input.workGroup?.id ?? null,
    workGroupLabel: input.workGroup?.title ?? null,
    policyId: policy?.id ?? null,
    policyLabel: policy?.title ?? null,
    calendarId: calendar?.id ?? null,
    shiftType: shiftContext.shiftTypeLabel,
    expectedShift,
    expectedShifts,
    expectedShiftWindows: shiftContext.segments.map((segment) => segment.label),
    requiredMinutes,
    deductedBreakMinutes,
    attendanceTimestamps: allTimestamps.map((item) => item.timeLabel),
    attendanceIntervals: attendanceAnalysis.intervals,
    isIncompleteAttendance,
    incompleteSegments,
    workedMinutes,
    payableWorkMinutes,
    attendanceMinutes,
    absenceMinutes,
    delayMinutes,
    earlyLeaveMinutes,
    shortageMinutes,
    overtimeMinutes,
    nightWorkMinutes,
    leaveMinutes,
    paidLeaveMinutes,
    unpaidLeaveMinutes,
    sickLeaveMinutes,
    bonusLeaveMinutes,
    entitledLeaveMinutes,
    missionMinutes,
    remoteWorkMinutes,
    underworkMinutes: shortageMinutes,
    status,
    statusBadges,
    warnings,
    payrollEffect,
    segmentAnalyses: attendanceAnalysis.segmentAnalyses,
  };
}

export function buildCalendarContextFromRow(calendarRow: {
  id: string;
  title: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: unknown;
  shiftConfig: unknown;
  singleHolidays: unknown;
}): WorkReportCalendarContext {
  const shiftConfig = listCalendarShifts(calendarRow.shiftConfig);
  const start = parsePersianYmd(normalizePersianDateInput(calendarRow.startDate));
  const end = parsePersianYmd(normalizePersianDateInput(calendarRow.endDate));
  return {
    id: calendarRow.id,
    title: calendarRow.title,
    yearLabel: calendarRow.yearLabel,
    startDate: calendarRow.startDate,
    endDate: calendarRow.endDate,
    bounds: start && end ? { start, end } : null,
    weekends: Array.isArray(calendarRow.weekends) ? calendarRow.weekends.filter((item): item is string => typeof item === 'string') : [],
    shiftConfig,
    singleHolidays: parseCalendarStoredEvents(calendarRow.singleHolidays),
    excludedShiftDates: listExcludedShiftDates(calendarRow.shiftConfig).map((date) => normalizePersianDateInput(date)),
    weekendOverrideDates: listWeekendOverrideDates(calendarRow.shiftConfig).map((date) => normalizePersianDateInput(date)),
  };
}

export function buildPolicyContextFromRow(policyRow: {
  id: string;
  title: string;
  sectionValues?: unknown;
}): WorkReportPolicyContext {
  return {
    id: policyRow.id,
    title: policyRow.title,
    sectionValues: getPolicySectionValues({ sectionValues: policyRow.sectionValues ?? {} }),
  };
}
