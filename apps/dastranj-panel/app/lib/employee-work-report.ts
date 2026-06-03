import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { getSessionContext } from './auth';
import { DEFAULT_PAYROLL_SETTINGS } from './payroll-business-settings';
import { getEmployee } from './data';
import { getCurrentEmployeeContract } from './employee-contracts.server';
import { getPolicySectionValues } from './policy-workspaces';
import { getDayDetails } from './calendar-grid';
import { parseCalendarStoredEvents, type CalendarStoredEvent } from './calendar-events';
import {
  addPersianDays,
  formatPersianYmd,
  getPersianMonthLength,
  getPersianPartsFromDate,
  getPersianWeekdayIndex,
  getPersianWeekdayName,
  PERSIAN_MONTH_NAMES,
  persianToDate,
  type PersianYmd,
} from './calendar-dates';
import {
  listCalendarShifts,
  listExcludedShiftDates,
  listWeekendOverrideDates,
  type StoredCalendarShift,
} from './calendar-shifts';
import { calculateTimeRangeDurationMinutes } from './time-range-validation';
import { summarizeShiftForDayPanel } from './calendar-shift-display';
import type { EmployeeCurrentContractSummary } from './employee-contracts';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
type RequestType =
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
type RangeType = 'full_day' | 'multi_day' | 'hourly' | 'range' | 'point' | null;
type AttendanceActionType = 'check_in' | 'check_out' | 'correction' | null;

export type WorkReportPeriod = {
  year: number;
  month: number;
  label: string;
};

export type WorkReportEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  personnelCode: string | null;
  jobTitle: string;
  organizationUnits: Array<{ id: string; title: string }>;
  workGroupTitle: string | null;
};

export type WorkReportWorkGroup = {
  id: string;
  title: string;
  description: string | null;
  locationTitle: string | null;
  policyId: string | null;
  policyTitle: string | null;
  calendarId: string | null;
  calendarTitle: string | null;
};

export type WorkReportPolicy = {
  id: string;
  title: string;
  description: string | null;
  calendarId: string | null;
  calendarTitle: string | null;
  sectionValues: Record<string, unknown>;
};

export type WorkReportCalendar = {
  id: string;
  title: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  shiftCount: number;
};

export type WorkReportRequest = {
  id: string;
  requestType: RequestType;
  status: RequestStatus;
  rangeType: RangeType;
  attendanceActionType: AttendanceActionType;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  calculatedDurationMinutes: number | null;
  reasonTitle: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  canceledAt: string | null;
  loanTitle: string | null;
};

export type WorkReportAttendanceRecord = {
  id: string;
  requestId: string;
  status: RequestStatus;
  actionType: AttendanceActionType;
  date: string;
  time: string | null;
  reasonTitle: string | null;
  description: string | null;
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

export type WorkReportDay = {
  date: string;
  jalaliDate: string;
  weekday: string;
  weekdayIndex: number;
  isToday: boolean;
  isHoliday: boolean;
  isRestDay: boolean;
  isWorkDay: boolean;
  expectedShift: WorkReportShift | null;
  expectedShifts: WorkReportShift[];
  requiredMinutes: number;
  deductedBreakMinutes: number;
  attendanceRecords: WorkReportAttendanceRecord[];
  requests: WorkReportRequest[];
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
  workedMinutes: number;
  attendanceMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  leaveMinutes: number;
  unpaidLeaveMinutes: number;
  sickLeaveMinutes: number;
  encouragementLeaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  underworkMinutes: number;
  pendingRequests: WorkReportRequest[];
  approvedRequests: WorkReportRequest[];
  warnings: string[];
};

export type WorkReportSummary = {
  requiredMinutes: number;
  workedMinutes: number;
  attendanceMinutes: number;
  presenceMinutes: number;
  absenceMinutes: number;
  overtimeMinutes: number;
  leaveMinutes: number;
  unpaidLeaveMinutes: number;
  sickLeaveMinutes: number;
  encouragementLeaveMinutes: number;
  entitledLeaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  underworkMinutes: number;
  incompleteAttendanceCount: number;
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  holidayDays: number;
  workDays: number;
};

export type EmployeeWorkReportData = {
  employee: WorkReportEmployee;
  activeContract: EmployeeCurrentContractSummary | null;
  workGroup: WorkReportWorkGroup | null;
  policy: WorkReportPolicy | null;
  calendar: WorkReportCalendar | null;
  period: WorkReportPeriod;
  summary: WorkReportSummary;
  days: WorkReportDay[];
  periodRequests: WorkReportRequest[];
  warnings: string[];
};

type InternalCalendarContext = WorkReportCalendar & {
  shiftConfig: StoredCalendarShift[];
  singleHolidays: CalendarStoredEvent[];
  excludedShiftDates: string[];
  weekendOverrideDates: string[];
};

type InternalWorkGroupContext = WorkReportWorkGroup & {
  policy: WorkReportPolicy | null;
  calendar: InternalCalendarContext | null;
};

type RawRequestRow = {
  id: string;
  requestType: RequestType;
  status: RequestStatus;
  rangeType: RangeType;
  attendanceActionType: AttendanceActionType;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  calculatedDurationMinutes: number | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  canceledAt: Date | null;
  reason: { title: string } | null;
  loan: { title: string } | null;
};

function requireDigits(value: string | number) {
  return String(value).replace(/[^\d]/g, '');
}

function normalizeDateDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632));
}

function toPlainDate(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeDateDigits(value.trim());
  const plainValue = normalized.slice(0, 10);

  const persianMatch = plainValue.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (persianMatch) {
    const year = Number(persianMatch[1]);
    const month = Number(persianMatch[2]);
    const day = Number(persianMatch[3]);
    if (!year || !month || !day) return null;
    return formatPersianYmd({ year, month, day });
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

  const legacyMatch = normalized.match(/^(\d{4}\/\d{1,2}\/\d{1,2})/);
  if (!legacyMatch) return null;
  const parts = legacyMatch[1].split('/').map(Number);
  if (!parts[0] || !parts[1] || !parts[2]) return null;
  return formatPersianYmd({ year: parts[0], month: parts[1], day: parts[2] });
}

function jsonStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

type AttendancePoint = {
  id: string;
  requestId: string;
  status: RequestStatus;
  dateKey: string;
  timeLabel: string;
  timestamp: number;
  reasonTitle: string | null;
  description: string | null;
};

type AttendanceSession = {
  id: string;
  requestId: string;
  status: RequestStatus;
  dateKey: string;
  startTimestamp: number;
  endTimestamp: number | null;
  startTime: string;
  endTime: string | null;
  timeLabel: string;
  minutes: number;
  isComplete: boolean;
  requestIds: string[];
  reasonTitle: string | null;
  description: string | null;
};

function parseRequestDateTime(request: RawRequestRow) {
  const rawDateTime = request.dateTime?.trim() ?? '';
  const rawDate = request.startDate?.trim() ?? '';
  const rawTime = request.startTime?.trim() ?? '';
  const combined = rawDateTime || (rawDate ? `${rawDate}${rawTime ? ` ${rawTime}` : ''}`.trim() : '');
  if (!combined) return null;

  const [datePart, timePart = '00:00'] = combined.split(/\s+/, 2);
  const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return null;
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  const normalizedDate = normalizeDateDigits(datePart);
  const isoDate = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]), hour, minute, 0, 0);
  }

  const persianDate = normalizedDate.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!persianDate) return null;
  try {
    const date = persianToDate({
      year: Number(persianDate[1]),
      month: Number(persianDate[2]),
      day: Number(persianDate[3]),
    });
    date.setUTCHours(hour, minute, 0, 0);
    return date.getTime();
  } catch {
    return null;
  }
}

function attendancePointDateKey(request: RawRequestRow) {
  return toPlainDate(request.startDate ?? request.dateTime) ?? toPlainDate(request.dateTime) ?? toPlainDate(request.startDate) ?? null;
}

function formatAttendanceSessionTime(startTime: string | null, endTime: string | null) {
  if (!startTime) return null;
  if (!endTime) return startTime;
  return `${startTime} تا ${endTime}`;
}

function buildAttendanceSessions(requests: RawRequestRow[]) {
  const points = requests
    .filter((request) => request.requestType === 'attendance')
    .filter((request) => request.status === 'approved' || request.status === 'pending')
    .map((request) => {
      const timestamp = parseRequestDateTime(request);
      const dateKey = attendancePointDateKey(request);
      const timeLabel = formatTime(request.startTime ?? request.dateTime) ?? request.startTime ?? request.dateTime ?? 'بدون ساعت';
      if (timestamp == null || !dateKey) return null;
      return {
        id: request.id,
        requestId: request.id,
        status: request.status,
        dateKey,
        timeLabel,
        timestamp,
        reasonTitle: request.reason?.title ?? null,
        description: request.description,
      } satisfies AttendancePoint;
    })
    .filter((point): point is AttendancePoint => Boolean(point))
    .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));

  const sessions: AttendanceSession[] = [];
  let openPoint: AttendancePoint | null = null;

  for (const point of points) {
    if (!openPoint) {
      openPoint = point;
      continue;
    }

    const startTime = openPoint.timeLabel;
    const endTime = point.timeLabel;
    const minutes = Math.max(0, Math.round((point.timestamp - openPoint.timestamp) / 60000));
    sessions.push({
      id: `${openPoint.id}:${point.id}`,
      requestId: openPoint.requestId,
      status: openPoint.status === 'approved' && point.status === 'approved' ? 'approved' : 'pending',
      dateKey: openPoint.dateKey,
      startTimestamp: openPoint.timestamp,
      endTimestamp: point.timestamp,
      startTime,
      endTime,
      timeLabel: formatAttendanceSessionTime(startTime, endTime),
      minutes,
      isComplete: true,
      requestIds: [openPoint.requestId, point.requestId],
      reasonTitle: openPoint.reasonTitle ?? point.reasonTitle,
      description: openPoint.description ?? point.description,
    });
    openPoint = null;
  }

  if (openPoint) {
    sessions.push({
      id: `${openPoint.id}:pending`,
      requestId: openPoint.requestId,
      status: openPoint.status,
      dateKey: openPoint.dateKey,
      startTimestamp: openPoint.timestamp,
      endTimestamp: null,
      startTime: openPoint.timeLabel,
      endTime: null,
      timeLabel: openPoint.timeLabel,
      minutes: 0,
      isComplete: false,
      requestIds: [openPoint.requestId],
      reasonTitle: openPoint.reasonTitle,
      description: openPoint.description,
    });
  }

  return sessions;
}

function buildAttendanceSessionsByDate(requests: RawRequestRow[]) {
  const map = new Map<string, AttendanceSession[]>();
  for (const session of buildAttendanceSessions(requests)) {
    const list = map.get(session.dateKey) ?? [];
    list.push(session);
    map.set(session.dateKey, list);
  }
  return map;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
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
    case 'rotate': {
      const items = Array.isArray(config.rotatingItems) ? config.rotatingItems : [];
      return items.flatMap((item) => {
        const segment = asObject(item);
        return Array.isArray(segment.rests) ? (segment.rests as ShiftRestRecord[]) : [];
      });
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
    return duration > 0 ? formatMinutes(duration) : 'بدون مدت ثبت شده';
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

function calculateDeductedBreakMinutes(dateKey: string, expectedShifts: WorkReportShift[], attendanceSessions: AttendanceSession[]) {
  const completeSessions = attendanceSessions.filter(
    (session) => session.isComplete && session.status === 'approved' && session.startTimestamp != null && session.endTimestamp != null,
  );
  if (completeSessions.length === 0 || expectedShifts.length === 0) return 0;

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

      const overlap = completeSessions.reduce((sum, session) => {
        if (session.endTimestamp == null) return sum;
        return sum + overlapMinutes(session.startTimestamp, session.endTimestamp, restStart, restEnd);
      }, 0);
      deducted += Math.min(rest.durationMinutes, Math.round(overlap));
    }
  }

  return Math.max(0, Math.round(deducted));
}

function formatMinutes(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours <= 0 && rest <= 0) return '۰ دقیقه';
  if (hours <= 0) return `${rest.toLocaleString('fa-IR')} دقیقه`;
  if (rest <= 0) return `${hours.toLocaleString('fa-IR')} ساعت`;
  return `${hours.toLocaleString('fa-IR')} ساعت و ${rest.toLocaleString('fa-IR')} دقیقه`;
}

function parseTimeToMinutes(value?: string | null) {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function formatTime(value?: string | null) {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return null;
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

function requestTypeLabel(type: RequestType) {
  switch (type) {
    case 'daily_leave':
      return 'مرخصی روزانه';
    case 'hourly_leave':
      return 'مرخصی ساعتی';
    case 'reward_leave':
      return 'مرخصی تشویقی';
    case 'unpaid_leave':
      return 'مرخصی بدون حقوق';
    case 'sick_leave':
      return 'مرخصی استعلاجی';
    case 'overtime':
      return 'اضافه‌کاری';
    case 'attendance':
      return 'تردد';
    case 'remote_work':
      return 'دورکاری';
    case 'mission':
      return 'مأموریت';
    case 'salary_advance':
      return 'مساعده';
    case 'loan':
      return 'وام';
    default:
      return type;
  }
}

function isLeaveRequest(type: RequestType) {
  return ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'].includes(type);
}

function isEntitledLeaveRequest(type: RequestType) {
  return type === 'daily_leave' || type === 'hourly_leave';
}

function requestFamily(type: RequestType) {
  if (isLeaveRequest(type)) return 'leave';
  if (type === 'overtime') return 'overtime';
  if (type === 'remote_work') return 'remote';
  if (type === 'mission') return 'mission';
  if (type === 'attendance') return 'attendance';
  return 'other';
}

function requestMatchesDate(request: RawRequestRow, date: string) {
  const start = toPlainDate(request.startDate);
  const end = toPlainDate(request.endDate);
  const single = toPlainDate(request.dateTime);
  if (start && end) return date >= start && date <= end;
  if (start) return start === date;
  if (single) return single === date;
  return false;
}

function requestDays(request: RawRequestRow) {
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

function resolveRequestDayMinutes(dailyRequiredMinutes: number) {
  if (dailyRequiredMinutes > 0) return dailyRequiredMinutes;
  return DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
}

function requestDurationForDate(request: RawRequestRow, date: string, dailyRequiredMinutes: number) {
  if (request.status !== 'approved') return 0;
  if (request.requestType === 'attendance') return 0;
  if (!requestMatchesDate(request, date)) return 0;

  const dayMinutes = resolveRequestDayMinutes(dailyRequiredMinutes);

  if (request.rangeType === 'hourly') {
    const start = parseTimeToMinutes(request.startTime);
    const end = parseTimeToMinutes(request.endTime);
    if (start != null && end != null) return Math.max(0, end - start);
    if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) {
      return request.calculatedDurationMinutes;
    }
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

  if (request.rangeType === 'full_day' || isLeaveRequest(request.requestType)) {
    if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) {
      return request.calculatedDurationMinutes;
    }
    return dayMinutes;
  }

  if (request.calculatedDurationMinutes != null && request.calculatedDurationMinutes > 0) {
    return request.calculatedDurationMinutes;
  }

  return dayMinutes;
}

function serializeRequest(request: RawRequestRow): WorkReportRequest {
  return {
    id: request.id,
    requestType: request.requestType,
    status: request.status,
    rangeType: request.rangeType,
    attendanceActionType: request.attendanceActionType,
    startDate: request.startDate,
    endDate: request.endDate,
    startTime: request.startTime,
    endTime: request.endTime,
    dateTime: request.dateTime,
    calculatedDurationMinutes: request.calculatedDurationMinutes,
    reasonTitle: request.reason?.title ?? null,
    description: request.description,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    approvedAt: request.approvedAt?.toISOString() ?? null,
    rejectedAt: request.rejectedAt?.toISOString() ?? null,
    canceledAt: request.canceledAt?.toISOString() ?? null,
    loanTitle: request.loan?.title ?? null,
  };
}

function resolveDailyRequiredMinutes(contract: EmployeeCurrentContractSummary | null, policy: WorkReportPolicy | null) {
  const policyValues = policy?.sectionValues ?? {};
  const requiredFromPolicy = Number(policyValues.requiredMinutes);
  if (Number.isFinite(requiredFromPolicy) && requiredFromPolicy > 0) return requiredFromPolicy;
  if (contract?.dailyRequiredMinutes && contract.dailyRequiredMinutes > 0) return contract.dailyRequiredMinutes;
  return DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
}

function resolvePolicyConfig(policy: WorkReportPolicy | null) {
  const values = policy?.sectionValues ?? {};
  return {
    startTime: typeof values.startTime === 'string' ? values.startTime : '',
    endTime: typeof values.endTime === 'string' ? values.endTime : '',
    workStartWindow: typeof values.workStartWindow === 'string' ? values.workStartWindow : '',
    workEndWindow: typeof values.workEndWindow === 'string' ? values.workEndWindow : '',
    requiredMinutes: Number(values.requiredMinutes ?? 0) || 0,
    maxDelayMinutes: Number(values.maxDelayMinutes ?? 0) || 0,
    maxEarlyLeaveMinutes: Number(values.maxEarlyLeaveMinutes ?? 0) || 0,
    entryGraceMinutes: Number(values.entryGraceMinutes ?? 0) || 0,
    exitGraceMinutes: Number(values.exitGraceMinutes ?? 0) || 0,
    allowRemote: typeof values.allowRemote === 'boolean' ? values.allowRemote : true,
  };
}

function resolveShiftWindow(shift: StoredCalendarShift, fallbackRequiredMinutes: number) {
  const config = shift.config && typeof shift.config === 'object' && !Array.isArray(shift.config) ? shift.config : {};
  const source = (config.fixedShift && typeof config.fixedShift === 'object' ? config.fixedShift : config) as Record<string, unknown>;

  if (shift.shiftType === 'fixed') {
    const startTime = formatTime(String(source.startTime ?? config.startTime ?? '')) ?? null;
    const endTime = formatTime(String(source.endTime ?? config.endTime ?? '')) ?? null;
    const nextDay = Boolean(source.endsNextDay ?? config.nextDay);
    const grossMinutes =
      startTime && endTime ? Math.max(0, calculateTimeRangeDurationMinutes(startTime, endTime, nextDay)) : 0;
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
    const floatDay = (config.floatingShiftStartOfDay && typeof config.floatingShiftStartOfDay === 'object'
      ? config.floatingShiftStartOfDay
      : config) as Record<string, unknown>;
    return {
      startTime: formatTime(String(floatDay.bandwidthStart ?? config.workStartWindow ?? '')) ?? null,
      endTime: formatTime(String(floatDay.bandwidthEnd ?? config.workEndWindow ?? '')) ?? null,
      requiredMinutes: Number(floatDay.requiredMinutes ?? config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
    };
  }

  if (shift.shiftType === 'float-abs') {
    const abs = (config.absoluteFloatingShift && typeof config.absoluteFloatingShift === 'object'
      ? config.absoluteFloatingShift
      : config) as Record<string, unknown>;
    return {
      startTime: formatTime(String(abs.startTime ?? config.startTime ?? '')) ?? null,
      endTime: formatTime(String(abs.endTime ?? config.endTime ?? '')) ?? null,
      requiredMinutes: Number(abs.requiredMinutes ?? config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
    };
  }

  if (shift.shiftType === 'split') {
    const split = (config.splitShift && typeof config.splitShift === 'object' ? config.splitShift : config) as Record<string, unknown>;
    return {
      startTime: formatTime(String(split.segment1Start ?? config.startTime ?? '')) ?? null,
      endTime: formatTime(String(split.segment2End ?? config.endTime ?? '')) ?? null,
      requiredMinutes: Number(split.requiredMinutes ?? config.requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
    };
  }

  return {
    startTime: null,
    endTime: null,
    requiredMinutes: Number((config as Record<string, unknown>).requiredMinutes ?? fallbackRequiredMinutes) || fallbackRequiredMinutes,
  };
}

function mapShiftForDay(
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

async function requireTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return session.tenantId;
}

async function getCurrentWorkGroupContext(employeeId: string, tenantId: string): Promise<InternalWorkGroupContext | null> {
  const membership = await prisma.workGroupMember.findFirst({
    where: {
      employeeId,
      isCurrent: true,
      workGroup: { tenantId },
    },
    include: {
      workGroup: {
        include: {
          location: true,
          policy: {
            include: { calendar: true },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  if (!membership?.workGroup) return null;

  const policyRow = membership.workGroup.policy;
  const calendarRow = policyRow?.calendar ?? null;
  const shiftConfig = calendarRow ? listCalendarShifts(calendarRow.shiftConfig) : [];
  const excludedShiftDates = calendarRow ? listExcludedShiftDates(calendarRow.shiftConfig) : [];
  const weekendOverrideDates = calendarRow ? listWeekendOverrideDates(calendarRow.shiftConfig) : [];
  const singleHolidays = calendarRow ? parseCalendarStoredEvents(calendarRow.singleHolidays) : [];

  return {
    id: membership.workGroup.id,
    title: membership.workGroup.title,
    description: membership.workGroup.description ?? null,
    locationTitle: membership.workGroup.location?.title ?? null,
    policyId: policyRow?.id ?? null,
    policyTitle: policyRow?.title ?? null,
    calendarId: calendarRow?.id ?? null,
    calendarTitle: calendarRow?.title ?? null,
    policy: policyRow
      ? {
          id: policyRow.id,
          title: policyRow.title,
          description: policyRow.description ?? null,
          calendarId: calendarRow?.id ?? null,
          calendarTitle: calendarRow?.title ?? null,
          sectionValues: getPolicySectionValues(policyRow),
        }
      : null,
    calendar: calendarRow
      ? {
          id: calendarRow.id,
          title: calendarRow.title,
          yearLabel: calendarRow.yearLabel,
          startDate: calendarRow.startDate,
          endDate: calendarRow.endDate,
          weekends: jsonStringArray(calendarRow.weekends),
          shiftCount: shiftConfig.length,
          shiftConfig,
          singleHolidays,
          excludedShiftDates,
          weekendOverrideDates,
        }
      : null,
  };
}

function buildRequestsByDate(requests: RawRequestRow[]) {
  const map = new Map<string, RawRequestRow[]>();
  for (const request of requests) {
    for (const day of requestDays(request)) {
      const list = map.get(day) ?? [];
      list.push(request);
      map.set(day, list);
    }
  }
  return map;
}

function buildAttendanceRecords(sessionsByDate: Map<string, AttendanceSession[]>, date: string): WorkReportAttendanceRecord[] {
  return (sessionsByDate.get(date) ?? [])
    .map((session) => ({
      id: session.id,
      requestId: session.requestId,
      status: session.status,
      actionType: null,
      date,
      time: session.timeLabel,
      reasonTitle: session.reasonTitle,
      description: session.description,
    }))
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
}

function calcDayStatus(input: {
  isHoliday: boolean;
  hasExpectedShift: boolean;
  approvedRequests: RawRequestRow[];
  hasAttendance: boolean;
  hasIncompleteAttendance: boolean;
  delayMinutes: number;
  overtimeMinutes: number;
  leaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  underworkMinutes: number;
  requiredMinutes: number;
  maxDelayMinutes: number;
  workedMinutes: number;
}) {
  if (input.isHoliday) return 'تعطیل مجاز' as const;
  if (!input.hasExpectedShift) {
    if (input.hasAttendance || input.workedMinutes > 0) return 'حضور' as const;
    if (input.leaveMinutes > 0) return 'مرخصی' as const;
    if (input.missionMinutes > 0) return 'مأموریت' as const;
    if (input.remoteWorkMinutes > 0) return 'دورکاری' as const;
    return 'تعطیل مجاز' as const;
  }
  if (input.missionMinutes > 0) return 'مأموریت' as const;
  if (input.remoteWorkMinutes > 0) return 'دورکاری' as const;
  if (input.leaveMinutes > 0) return 'مرخصی' as const;
  if (input.hasIncompleteAttendance) return 'تردد ناقص' as const;
  if (input.hasAttendance && input.delayMinutes > 0 && input.delayMinutes <= input.maxDelayMinutes) return 'تأخیر مجاز' as const;
  if (input.hasAttendance && input.overtimeMinutes > 0 && input.underworkMinutes === 0) return 'اضافه‌کاری' as const;
  if (input.hasAttendance && input.underworkMinutes === 0) return 'حضور' as const;
  if (input.requiredMinutes > 0 && input.approvedRequests.length > 0) return 'غیبت' as const;
  if (input.requiredMinutes > 0) return 'غیبت' as const;
  return 'تعطیل مجاز' as const;
}

function createDayWarnings(input: {
  requests: RawRequestRow[];
  hasShift: boolean;
  hasWorkGroup: boolean;
  hasPolicy: boolean;
  hasCalendar: boolean;
  hasIncompleteAttendance: boolean;
  underworkMinutes: number;
}) {
  const warnings: string[] = [];
  const primaryRequests = input.requests.filter((request) => ['leave', 'mission', 'remote', 'attendance'].includes(requestFamily(request.requestType)));
  if (primaryRequests.length > 1) {
    warnings.push('در این روز چند درخواست هم‌پوشان ثبت شده است.');
  }
  if (input.hasIncompleteAttendance) {
    warnings.push('تردد این روز کامل نیست.');
  }
  if (input.underworkMinutes > 0) {
    warnings.push('این روز کمتر از موظفی محاسبه شده است.');
  }
  if (!input.hasWorkGroup) {
    warnings.push('این کارمند هنوز به گروه کاری متصل نشده است.');
  }
  if (!input.hasPolicy) {
    warnings.push('برای گروه کاری این کارمند، سیاست کاری تعریف نشده است.');
  }
  if (!input.hasCalendar) {
    warnings.push('برای سیاست کاری این کارمند، تقویم کاری تعریف نشده است.');
  }
  return warnings;
}

function badgeTone(status: WorkReportDay['status']): 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' {
  switch (status) {
    case 'غیبت':
    case 'تردد ناقص':
      return 'red';
    case 'مرخصی':
    case 'تأخیر مجاز':
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

export async function getEmployeeWorkReportData(
  employeeId: string,
  options?: { year?: number; month?: number },
): Promise<EmployeeWorkReportData | null> {
  const tenantId = await requireTenantId();
  const employee = await getEmployee(employeeId);
  if (!employee) return null;

  const activeContract = await getCurrentEmployeeContract(employeeId, tenantId);
  const workGroupContext = await getCurrentWorkGroupContext(employeeId, tenantId);
  const policy = workGroupContext?.policy ?? null;
  const calendar = workGroupContext?.calendar ?? null;
  const today = getPersianPartsFromDate();
  const year = Number.isFinite(options?.year ?? NaN) && (options?.year ?? 0) > 0 ? Number(options?.year) : today.year;
  const month = Number.isFinite(options?.month ?? NaN) && (options?.month ?? 0) >= 1 && (options?.month ?? 0) <= 12 ? Number(options?.month) : today.month;

  const period: WorkReportPeriod = {
    year,
    month,
    label: `${PERSIAN_MONTH_NAMES[month - 1] ?? ''} ${year.toLocaleString('fa-IR')}`,
  };

  const policyConfig = resolvePolicyConfig(policy);
  const requiredMinutesBase = resolveDailyRequiredMinutes(activeContract, policy);
  const rawShifts = calendar?.shiftConfig ?? [];
  const daysInMonth = getPersianMonthLength(year, month);
  const monthDates = Array.from({ length: daysInMonth }, (_, index) => ({ year, month, day: index + 1 } as PersianYmd));
  const currentDate = formatPersianYmd(getPersianPartsFromDate());

  const requests = (await prisma.employeeRequest.findMany({
    where: { tenantId, employeeId },
    include: {
      reason: { select: { title: true } },
      loan: { select: { title: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  })) as RawRequestRow[];

  const requestsByDate = buildRequestsByDate(requests);
  const attendanceSessionsByDate = buildAttendanceSessionsByDate(requests);
  const days: WorkReportDay[] = [];

  const summary: WorkReportSummary = {
    requiredMinutes: 0,
    workedMinutes: 0,
    attendanceMinutes: 0,
    presenceMinutes: 0,
    absenceMinutes: 0,
    overtimeMinutes: 0,
    leaveMinutes: 0,
    unpaidLeaveMinutes: 0,
    sickLeaveMinutes: 0,
    encouragementLeaveMinutes: 0,
    entitledLeaveMinutes: 0,
    missionMinutes: 0,
    remoteWorkMinutes: 0,
    delayMinutes: 0,
    earlyLeaveMinutes: 0,
    underworkMinutes: 0,
    incompleteAttendanceCount: 0,
    pendingRequestsCount: 0,
    approvedRequestsCount: 0,
    holidayDays: 0,
    workDays: 0,
  };

  for (const ymd of monthDates) {
    const date = formatPersianYmd(ymd);
    const weekdayIndex = getPersianWeekdayIndex(ymd);
    const weekday = getPersianWeekdayName(ymd);
    const dayRequests = requestsByDate.get(date) ?? [];
    const dayRequestsForStatus = dayRequests.filter((request) => request.requestType !== 'attendance');
    const approvedRequests = dayRequestsForStatus.filter((request) => request.status === 'approved');
    const pendingRequests = dayRequestsForStatus.filter((request) => request.status === 'pending');
    const attendanceSessions = attendanceSessionsByDate.get(date) ?? [];
    const attendanceRecords = buildAttendanceRecords(attendanceSessionsByDate, date);
    const completeAttendanceSessions = attendanceSessions.filter((session) => session.isComplete && session.status === 'approved');
    const hasAttendance = completeAttendanceSessions.length > 0;
    const firstAttendanceSession = completeAttendanceSessions[0] ?? null;
    const lastAttendanceSession = completeAttendanceSessions[completeAttendanceSessions.length - 1] ?? null;
    const dayDetails = calendar
      ? getDayDetails({
          date,
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
    const hasExpectedShift = expectedShifts.length > 0;
    const expectedShift = expectedShifts[0] ?? null;
    const isHoliday = Boolean(dayDetails.isHoliday);
    const isRestDay = Boolean(calendar && dayDetails.isHoliday && !dayDetails.events.some((event) => event.tone === 'holiday'));
    const deductedBreakMinutes = calculateDeductedBreakMinutes(date, expectedShifts, attendanceSessions);

    const leaveMinutes = approvedRequests
      .filter((request) => isLeaveRequest(request.requestType))
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const entitledLeaveMinutes = approvedRequests
      .filter((request) => isEntitledLeaveRequest(request.requestType))
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const unpaidLeaveMinutes = approvedRequests
      .filter((request) => request.requestType === 'unpaid_leave')
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const sickLeaveMinutes = approvedRequests
      .filter((request) => request.requestType === 'sick_leave')
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const encouragementLeaveMinutes = approvedRequests
      .filter((request) => request.requestType === 'reward_leave')
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const missionMinutes = approvedRequests
      .filter((request) => request.requestType === 'mission')
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const remoteWorkMinutes = approvedRequests
      .filter((request) => request.requestType === 'remote_work')
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);
    const approvedOvertimeMinutes = approvedRequests
      .filter((request) => request.requestType === 'overtime')
      .reduce((sum, request) => sum + requestDurationForDate(request, date, requiredMinutesBase), 0);

    const attendanceMinutes = completeAttendanceSessions.reduce((sum, session) => sum + session.minutes, 0);
    const workedMinutes = Math.max(0, attendanceMinutes - deductedBreakMinutes) + (policyConfig.allowRemote ? remoteWorkMinutes : 0) + missionMinutes;
    const requiredMinutes = isHoliday || !hasExpectedShift ? 0 : expectedShift?.requiredMinutes ?? requiredMinutesBase;
    const coveredMinutes = Math.min(requiredMinutes, leaveMinutes + workedMinutes);
    const underworkMinutes = Math.max(0, requiredMinutes - coveredMinutes);
    const delayMinutes =
      expectedShift?.startTime && firstAttendanceSession?.startTime
        ? Math.max(0, (parseTimeToMinutes(firstAttendanceSession.startTime) ?? 0) - (parseTimeToMinutes(expectedShift.startTime) ?? 0))
        : 0;
    const earlyLeaveMinutes =
      expectedShift?.endTime && lastAttendanceSession?.endTime
        ? Math.max(0, (parseTimeToMinutes(expectedShift.endTime) ?? 0) - (parseTimeToMinutes(lastAttendanceSession.endTime) ?? 0))
        : 0;
    const overtimeMinutes = approvedOvertimeMinutes > 0 ? approvedOvertimeMinutes : Math.max(0, workedMinutes - Math.max(0, requiredMinutes - leaveMinutes));
    const hasIncompleteAttendance = attendanceSessions.some((session) => !session.isComplete);
    const status = calcDayStatus({
      isHoliday,
      hasExpectedShift,
      approvedRequests,
      hasAttendance,
      hasIncompleteAttendance,
      delayMinutes,
      overtimeMinutes,
      leaveMinutes,
      missionMinutes,
      remoteWorkMinutes,
      underworkMinutes,
      requiredMinutes,
      maxDelayMinutes: policyConfig.maxDelayMinutes,
      workedMinutes,
    });

    const warnings = createDayWarnings({
      requests: dayRequestsForStatus,
      hasShift: hasExpectedShift,
      hasWorkGroup: Boolean(workGroupContext),
      hasPolicy: Boolean(policy),
      hasCalendar: Boolean(calendar),
      hasIncompleteAttendance,
      underworkMinutes,
    });

    const statusBadges: WorkReportDay['statusBadges'] = [
      { key: `${date}-status`, label: status, tone: badgeTone(status) },
    ];
    if (leaveMinutes > 0) statusBadges.push({ key: `${date}-leave`, label: 'مرخصی', tone: 'amber' });
    if (overtimeMinutes > 0) statusBadges.push({ key: `${date}-overtime`, label: 'اضافه‌کاری', tone: 'green' });
    if (missionMinutes > 0) statusBadges.push({ key: `${date}-mission`, label: 'مأموریت', tone: 'violet' });
    if (remoteWorkMinutes > 0) statusBadges.push({ key: `${date}-remote`, label: 'دورکاری', tone: 'blue' });
    if (delayMinutes > 0 && delayMinutes <= policyConfig.maxDelayMinutes) statusBadges.push({ key: `${date}-delay`, label: 'تأخیر مجاز', tone: 'amber' });
    if (hasIncompleteAttendance) statusBadges.push({ key: `${date}-missing`, label: 'تردد ناقص', tone: 'red' });

    summary.requiredMinutes += requiredMinutes;
    summary.workedMinutes += workedMinutes;
    summary.attendanceMinutes += attendanceMinutes;
    summary.presenceMinutes += hasExpectedShift ? workedMinutes : 0;
    summary.absenceMinutes += requiredMinutes > 0 ? underworkMinutes : 0;
    summary.overtimeMinutes += overtimeMinutes;
    summary.leaveMinutes += leaveMinutes;
    summary.unpaidLeaveMinutes += unpaidLeaveMinutes;
    summary.sickLeaveMinutes += sickLeaveMinutes;
    summary.encouragementLeaveMinutes += encouragementLeaveMinutes;
    summary.entitledLeaveMinutes += entitledLeaveMinutes;
    summary.missionMinutes += missionMinutes;
    summary.remoteWorkMinutes += remoteWorkMinutes;
    summary.delayMinutes += delayMinutes;
    summary.earlyLeaveMinutes += earlyLeaveMinutes;
    summary.underworkMinutes += underworkMinutes;
    summary.incompleteAttendanceCount += hasIncompleteAttendance ? 1 : 0;
    summary.pendingRequestsCount += pendingRequests.length;
    summary.approvedRequestsCount += approvedRequests.length;
    summary.holidayDays += isHoliday ? 1 : 0;
    summary.workDays += hasExpectedShift && !isHoliday ? 1 : 0;

    days.push({
      date,
      jalaliDate: date,
      weekday,
      weekdayIndex,
      isToday: date === currentDate,
      isHoliday,
      isRestDay,
      isWorkDay: hasExpectedShift && !isHoliday,
      expectedShift,
      expectedShifts,
      requiredMinutes,
      deductedBreakMinutes,
      attendanceRecords,
      requests: dayRequestsForStatus.map(serializeRequest),
      status,
      statusBadges,
      workedMinutes,
      attendanceMinutes,
      delayMinutes,
      earlyLeaveMinutes,
      overtimeMinutes,
      leaveMinutes,
      unpaidLeaveMinutes,
      sickLeaveMinutes,
      encouragementLeaveMinutes,
      missionMinutes,
      remoteWorkMinutes,
      underworkMinutes,
      pendingRequests: pendingRequests.map(serializeRequest),
      approvedRequests: approvedRequests.map(serializeRequest),
      warnings,
    });
  }

  const monthStart = formatPersianYmd({ year, month, day: 1 });
  const monthEnd = formatPersianYmd({ year, month, day: daysInMonth });
  const periodRequests = requests
    .filter((request) => {
      const days = requestDays(request);
      if (days.length > 0) return days.some((day) => day >= monthStart && day <= monthEnd);
      return false;
    })
    .map(serializeRequest);

  const warnings: string[] = [];
  if (!activeContract) warnings.push('برای محاسبه گزارش کارکرد، قرارداد فعال برای این کارمند وجود ندارد.');
  if (!workGroupContext) warnings.push('این کارمند هنوز به گروه کاری متصل نشده است.');
  if (workGroupContext && !policy) warnings.push('برای گروه کاری این کارمند، سیاست کاری تعریف نشده است.');
  if (policy && !calendar) warnings.push('برای سیاست کاری این کارمند، تقویم کاری تعریف نشده است.');
  if (!workGroupContext || !policy || !calendar) {
    warnings.push('بخشی از گزارش بر اساس داده‌های در دسترس محاسبه شده است.');
  }

  const employeeData: WorkReportEmployee = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    avatarUrl: employee.avatarUrl ?? null,
    personnelCode: employee.personnelCode ?? null,
    jobTitle: activeContract?.jobTitle ?? '',
    organizationUnits: employee.organizationUnits.map((item) => ({
      id: item.organizationUnit.id,
      title: item.organizationUnit.title,
    })),
    workGroupTitle: workGroupContext?.title ?? null,
  };

  return {
    employee: employeeData,
    activeContract,
    workGroup: workGroupContext
      ? {
          id: workGroupContext.id,
          title: workGroupContext.title,
          description: workGroupContext.description,
          locationTitle: workGroupContext.locationTitle,
          policyId: workGroupContext.policyId,
          policyTitle: workGroupContext.policyTitle,
          calendarId: workGroupContext.calendarId,
          calendarTitle: workGroupContext.calendarTitle,
        }
      : null,
    policy: policy
      ? {
          id: policy.id,
          title: policy.title,
          description: policy.description,
          calendarId: policy.calendarId,
          calendarTitle: policy.calendarTitle,
          sectionValues: policy.sectionValues,
        }
      : null,
    calendar: calendar
      ? {
          id: calendar.id,
          title: calendar.title,
          yearLabel: calendar.yearLabel,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          weekends: calendar.weekends,
          shiftCount: calendar.shiftCount,
        }
      : null,
    period,
    summary,
    days,
    periodRequests,
    warnings,
  };
}

export async function getEmployeeWorkReportPageData(employeeId: string, options?: { year?: number; month?: number }) {
  return getEmployeeWorkReportData(employeeId, options);
}
