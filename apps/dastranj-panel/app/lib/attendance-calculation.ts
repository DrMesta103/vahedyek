import { addPersianDays, formatPersianYmd, getPersianPartsFromDate, persianToDate } from './calendar-dates';
import { getDayDetails } from './calendar-grid';
import { parseCalendarStoredEvents } from './calendar-events';
import { listCalendarShifts, listExcludedShiftDates, listWeekendOverrideDates, type StoredCalendarShift } from './calendar-shifts';
import { summarizeShiftForDayPanel } from './calendar-shift-display';
import { listClientStorageStates } from './client-storage-persistence';
import { parseSplitShiftSegmentRules } from './split-shift-policy';
import { calculateTimeRangeDurationMinutes } from './time-range-validation';
import {
  applyPayrollOverrides,
  DEFAULT_PAYROLL_SETTINGS,
  getActiveTenantStorageId,
  getPayrollSettingsStorageKey,
  getTenantPayrollSettingsStorageKey,
  normalizePayrollOverrides,
  normalizePayrollSettings,
  type PayrollSettings,
} from './payroll-business-settings';

export { formatMinutesLabel } from './attendance-format';

export type AttendanceRequestLike = {
  id: string;
  status: string;
  startDate?: string | null;
  startTime?: string | null;
  dateTime?: string | null;
};

export type AttendanceTimestamp = {
  id: string;
  requestId: string;
  timestamp: number;
  timeLabel: string;
  status: 'approved' | 'pending';
};

export type AttendanceInterval = {
  id: string;
  startTimeLabel: string;
  endTimeLabel: string | null;
  minutes: number;
  isComplete: boolean;
  status: 'approved' | 'pending';
};

export type ShiftSegment = {
  id: string;
  label: string;
  shiftType: 'fixed' | 'split' | 'float-day' | 'float-abs';
  startTime: string | null;
  endTime: string | null;
  requiredMinutes: number;
  entryWindowStart: string | null;
  entryWindowEnd: string | null;
  endsNextDay: boolean;
  entryGraceMinutes?: number;
  exitGraceMinutes?: number;
  maxDelayBeforeAbsenceMinutes?: number;
  delayCalculationMode?: 'lenient' | 'strict';
  earlyLeaveCalculationMode?: 'lenient' | 'strict';
};

export type SegmentAttendanceAnalysis = {
  segmentId: string;
  label: string;
  windowLabel: string;
  timestamps: string[];
  intervals: AttendanceInterval[];
  incomplete: boolean;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  workedMinutes: number;
  status: string;
};

export type AttendancePolicyBundle = {
  manualEntryEnabled: boolean;
  manualRequireReason: boolean;
  manualRequireAttachment: boolean;
  manualPastDaysEnabled: boolean;
  manualMaxPastDays: number;
  manualMonthlyCapPerUser: number;
  requireGeofence: boolean;
  faceRecognitionInFlow: boolean;
  consecutiveAbsenceWarning: boolean;
  maxConsecutiveAbsenceDays: number;
  nightPolicyEnabled: boolean;
  nightStart: string | null;
  nightEnd: string | null;
  entryGraceMinutes: number;
  exitGraceMinutes: number;
  maxDelayMinutes: number;
  maxEarlyLeaveMinutes: number;
  delayCalculationMode: 'lenient' | 'strict';
  earlyLeaveCalculationMode: 'lenient' | 'strict';
};

export type AttendanceDayAnalysis = {
  status: string;
  incomplete: boolean;
  intervals: AttendanceInterval[];
  timestamps: AttendanceTimestamp[];
  workedMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  nightWorkMinutes: number;
  shortageMinutes: number;
  incompleteSegmentLabels: string[];
  outsideShiftWindow: boolean;
  segmentAnalyses?: SegmentAttendanceAnalysis[];
  unassignedTimestampLabels?: string[];
};

export type AttendancePreviewResult = {
  bases: {
    workGroupTitle: string | null;
    policyTitle: string | null;
    shiftTypeLabel: string | null;
    shiftWindowLabel: string | null;
    nightPolicyEnabled: boolean;
    tenantNightWorkStart: string | null;
    tenantNightWorkEnd: string | null;
    tenantNightWorkCoefficient: number | null;
  };
  currentTimestamps: string[];
  proposedTimestamp: string | null;
  proposedSegmentLabel: string | null;
  proposedOutsideSegments: boolean;
  before: AttendanceDayAnalysis;
  after: AttendanceDayAnalysis;
  afterIfApproved: AttendanceDayAnalysis | null;
  outcomeMessages: string[];
  warnings: string[];
  blockingErrors: string[];
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function boolValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseTimeToMinutes(value?: string | null) {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function formatTimeLabel(value?: string | null) {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return null;
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

function normalizeDateDigits(value?: string | null) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return trimmed.replace(/\//g, '/');
}

function toPlainPersianDate(value?: string | null) {
  const normalized = normalizeDateDigits(value);
  if (!normalized) return null;
  const iso = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return formatPersianYmd(getPersianPartsFromDate(new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0))));
  }
  const persian = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!persian) return null;
  return `${persian[1]}/${String(Number(persian[2])).padStart(2, '0')}/${String(Number(persian[3])).padStart(2, '0')}`;
}

export function parseAttendanceTimestamp(request: AttendanceRequestLike): AttendanceTimestamp | null {
  const rawDateTime = request.dateTime?.trim();
  const rawDate = request.startDate?.trim();
  const rawTime = request.startTime?.trim();
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
  let timestamp: number | null = null;
  if (isoDate) {
    timestamp = Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]), hour, minute, 0, 0);
  } else {
    const persianDate = normalizedDate.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!persianDate) return null;
    try {
      const date = persianToDate({
        year: Number(persianDate[1]),
        month: Number(persianDate[2]),
        day: Number(persianDate[3]),
      });
      date.setUTCHours(hour, minute, 0, 0);
      timestamp = date.getTime();
    } catch {
      return null;
    }
  }

  const timeLabel = formatTimeLabel(timePart) ?? timePart;
  const status = request.status === 'approved' ? 'approved' : 'pending';
  return { id: request.id, requestId: request.id, timestamp, timeLabel, status };
}

export function pairAttendanceTimestamps(points: AttendanceTimestamp[]): AttendanceInterval[] {
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
  const intervals: AttendanceInterval[] = [];
  let open: AttendanceTimestamp | null = null;

  for (const point of sorted) {
    if (!open) {
      open = point;
      continue;
    }
    const minutes = Math.max(0, Math.round((point.timestamp - open.timestamp) / 60000));
    intervals.push({
      id: `${open.id}:${point.id}`,
      startTimeLabel: open.timeLabel,
      endTimeLabel: point.timeLabel,
      minutes,
      isComplete: true,
      status: open.status === 'approved' && point.status === 'approved' ? 'approved' : 'pending',
    });
    open = null;
  }

  if (open) {
    intervals.push({
      id: `${open.id}:open`,
      startTimeLabel: open.timeLabel,
      endTimeLabel: null,
      minutes: 0,
      isComplete: false,
      status: open.status,
    });
  }

  return intervals;
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

export function readAttendancePolicyBundle(sectionValues: Record<string, unknown>): AttendancePolicyBundle {
  return {
    manualEntryEnabled: boolValue(sectionValues.manualEntryEnabled),
    manualRequireReason: boolValue(sectionValues.manualRequireReason),
    manualRequireAttachment: boolValue(sectionValues.requireAttachment),
    manualPastDaysEnabled: boolValue(sectionValues.manualPastDaysEnabled),
    manualMaxPastDays: numberValue(sectionValues.manualMaxPastDays, 0),
    manualMonthlyCapPerUser: numberValue(sectionValues.manualMonthlyCapPerUser, 0),
    requireGeofence: boolValue(sectionValues.requireGeofence),
    faceRecognitionInFlow: boolValue(sectionValues.faceRecognitionInFlow),
    consecutiveAbsenceWarning: boolValue(sectionValues.consecutiveAbsenceWarning),
    maxConsecutiveAbsenceDays: numberValue(sectionValues.maxConsecutiveAbsenceDays, 0),
    nightPolicyEnabled: boolValue(sectionValues.nightEnabled),
    nightStart: typeof sectionValues.nightStart === 'string' && sectionValues.nightStart ? sectionValues.nightStart : null,
    nightEnd: typeof sectionValues.nightEnd === 'string' && sectionValues.nightEnd ? sectionValues.nightEnd : null,
    entryGraceMinutes: numberValue(sectionValues.entryGraceMinutes, 0),
    exitGraceMinutes: numberValue(sectionValues.exitGraceMinutes, 0),
    maxDelayMinutes: numberValue(sectionValues.maxDelayMinutes, 0),
    maxEarlyLeaveMinutes: numberValue(sectionValues.maxEarlyLeaveMinutes, 0),
    delayCalculationMode: sectionValues.delayCalculationMode === 'strict' ? 'strict' : 'lenient',
    earlyLeaveCalculationMode: sectionValues.earlyLeaveCalculationMode === 'strict' ? 'strict' : 'lenient',
  };
}

export async function loadTenantPayrollSettingsForYear(tenantId: string, year: number): Promise<PayrollSettings> {
  const storageStates = await listClientStorageStates(tenantId);
  const getStorageValue = (storageKey: string) => storageStates.find((item) => item.storageKey === storageKey)?.value ?? null;
  const rawAdminBase = getStorageValue(getPayrollSettingsStorageKey(year));
  const adminBase = rawAdminBase ? normalizePayrollSettings(JSON.parse(rawAdminBase)) : DEFAULT_PAYROLL_SETTINGS;
  const storageTenantId = getActiveTenantStorageId() ?? tenantId;
  const rawTenantOverrides = getStorageValue(getTenantPayrollSettingsStorageKey(year, storageTenantId));
  if (rawTenantOverrides) {
    return normalizePayrollSettings(
      applyPayrollOverrides(adminBase, normalizePayrollOverrides(JSON.parse(rawTenantOverrides))),
    );
  }
  const rawLegacyTenantSettings = getStorageValue(getPayrollSettingsStorageKey(year, storageTenantId));
  return rawLegacyTenantSettings ? normalizePayrollSettings(JSON.parse(rawLegacyTenantSettings)) : adminBase;
}

function applySplitPolicyRules(
  segments: ShiftSegment[],
  policySectionValues?: Record<string, unknown>,
  policyFallback?: AttendancePolicyBundle,
): ShiftSegment[] {
  const rules = policySectionValues ? parseSplitShiftSegmentRules(policySectionValues) : [];
  return segments.map((segment, index) => {
    const rule = rules[index];
    const fallbackGrace = policyFallback?.entryGraceMinutes ?? 0;
    const fallbackExit = policyFallback?.exitGraceMinutes ?? 0;
    const fallbackMaxDelay = policyFallback?.maxDelayMinutes ?? 0;
    const fallbackDelayMode = policyFallback?.delayCalculationMode ?? 'lenient';
    const fallbackEarlyMode = policyFallback?.earlyLeaveCalculationMode ?? 'lenient';
    return {
      ...segment,
      label: rule?.title ?? segment.label,
      entryGraceMinutes: rule?.entryGraceMinutes ?? segment.entryGraceMinutes ?? fallbackGrace,
      exitGraceMinutes: rule?.exitGraceMinutes ?? segment.exitGraceMinutes ?? fallbackExit,
      maxDelayBeforeAbsenceMinutes:
        rule?.maxDelayBeforeAbsenceMinutes ?? segment.maxDelayBeforeAbsenceMinutes ?? fallbackMaxDelay,
      delayCalculationMode: rule?.delayCalculationMode ?? segment.delayCalculationMode ?? fallbackDelayMode,
      earlyLeaveCalculationMode:
        rule?.earlyLeaveCalculationMode ?? segment.earlyLeaveCalculationMode ?? fallbackEarlyMode,
    };
  });
}

export function buildExpectedShiftSegments(
  rawShift: StoredCalendarShift,
  fallbackRequiredMinutes: number,
  policySectionValues?: Record<string, unknown>,
  policyFallback?: AttendancePolicyBundle,
): ShiftSegment[] {
  const config = asObject(rawShift.config);
  const shiftType = rawShift.shiftType;

  if (shiftType === 'split') {
    const split = asObject(config.splitShift);
    const calendarSegments: ShiftSegment[] = [
      {
        id: `${rawShift.id}-seg-1`,
        label: 'بخش اول',
        shiftType: 'split',
        startTime: formatTimeLabel(String(split.segment1Start ?? '08:00')),
        endTime: formatTimeLabel(String(split.segment1End ?? '12:00')),
        requiredMinutes: numberValue(split.segment1RequiredMinutes, 0) || fallbackRequiredMinutes / 2,
        entryWindowStart: null,
        entryWindowEnd: null,
        endsNextDay: false,
      },
      {
        id: `${rawShift.id}-seg-2`,
        label: 'بخش دوم',
        shiftType: 'split',
        startTime: formatTimeLabel(String(split.segment2Start ?? '16:00')),
        endTime: formatTimeLabel(String(split.segment2End ?? '20:00')),
        requiredMinutes: numberValue(split.segment2RequiredMinutes, 0) || fallbackRequiredMinutes / 2,
        entryWindowStart: null,
        entryWindowEnd: null,
        endsNextDay: false,
      },
    ];
    return applySplitPolicyRules(calendarSegments, policySectionValues, policyFallback);
  }

  if (shiftType === 'float-day') {
    const floatDay = asObject(config.floatingShiftStartOfDay);
    return [
      {
        id: `${rawShift.id}-float-day`,
        label: 'شیفت شناور شروع روز',
        shiftType: 'float-day',
        startTime: null,
        endTime: null,
        requiredMinutes: numberValue(floatDay.requiredMinutes ?? config.requiredMinutes, fallbackRequiredMinutes),
        entryWindowStart: formatTimeLabel(String(floatDay.bandwidthStart ?? config.workStartWindow ?? '')),
        entryWindowEnd: formatTimeLabel(String(floatDay.bandwidthEnd ?? config.workEndWindow ?? '')),
        endsNextDay: false,
      },
    ];
  }

  if (shiftType === 'float-abs') {
    const abs = asObject(config.absoluteFloatingShift);
    return [
      {
        id: `${rawShift.id}-float-abs`,
        label: 'شیفت شناور مطلق',
        shiftType: 'float-abs',
        startTime: null,
        endTime: null,
        requiredMinutes: numberValue(abs.requiredMinutes ?? config.requiredMinutes, fallbackRequiredMinutes),
        entryWindowStart: null,
        entryWindowEnd: null,
        endsNextDay: false,
      },
    ];
  }

  const fixed = asObject(config.fixedShift);
  const source = Object.keys(fixed).length ? fixed : config;
  const startTime = formatTimeLabel(String(source.startTime ?? config.startTime ?? ''));
  const endTime = formatTimeLabel(String(source.endTime ?? config.endTime ?? ''));
  const endsNextDay = boolValue(source.endsNextDay ?? config.nextDay);
  const grossMinutes =
    startTime && endTime ? Math.max(0, calculateTimeRangeDurationMinutes(startTime, endTime, endsNextDay)) : 0;
  return [
    {
      id: `${rawShift.id}-fixed`,
      label: 'شیفت ثابت',
      shiftType: 'fixed',
      startTime,
      endTime,
      requiredMinutes: grossMinutes > 0 ? grossMinutes : numberValue(source.requiredMinutes ?? config.requiredMinutes, fallbackRequiredMinutes),
      entryWindowStart: null,
      entryWindowEnd: null,
      endsNextDay,
    },
  ];
}

export function assignTimestampToSplitSegment(
  timestamp: AttendanceTimestamp,
  segments: ShiftSegment[],
): { segmentId: string | null; outsideWindow: boolean } {
  const minutes = parseTimeToMinutes(timestamp.timeLabel);
  if (minutes == null) return { segmentId: null, outsideWindow: true };

  for (const segment of segments) {
    const start = parseTimeToMinutes(segment.startTime);
    const end = parseTimeToMinutes(segment.endTime);
    if (start == null || end == null) continue;
    const entryGrace = segment.entryGraceMinutes ?? 0;
    const exitGrace = segment.exitGraceMinutes ?? 0;
    const windowStart = start - entryGrace;
    const windowEnd = end + exitGrace;
    if (minutes >= windowStart && minutes <= windowEnd) {
      return { segmentId: segment.id, outsideWindow: false };
    }
  }

  return { segmentId: null, outsideWindow: true };
}

function assignSplitTimestampsToSegments(timestamps: AttendanceTimestamp[], segments: ShiftSegment[]) {
  const assignments = new Map<string, string | null>();
  const unassignedLabels: string[] = [];
  for (const point of timestamps) {
    const { segmentId, outsideWindow } = assignTimestampToSplitSegment(point, segments);
    assignments.set(point.id, segmentId);
    if (outsideWindow) unassignedLabels.push(point.timeLabel);
  }
  return { assignments, unassignedLabels };
}

function segmentWindowLabel(segment: ShiftSegment) {
  if (segment.startTime && segment.endTime) return `${segment.startTime} تا ${segment.endTime}`;
  return '—';
}

function analyzeSingleSplitSegment(
  segment: ShiftSegment,
  segmentPoints: AttendanceTimestamp[],
): SegmentAttendanceAnalysis {
  const intervals = pairAttendanceTimestamps(segmentPoints);
  const completeIntervals = intervals.filter((item) => item.isComplete);
  const workedMinutes = completeIntervals.reduce((sum, item) => sum + item.minutes, 0);
  const incomplete = segmentPoints.length % 2 === 1;
  const firstPoint = segmentPoints[0]?.timeLabel ?? null;
  const lastComplete = completeIntervals[completeIntervals.length - 1];
  const lastTime = lastComplete?.endTimeLabel ?? segmentPoints[segmentPoints.length - 1]?.timeLabel ?? null;
  const entryGrace = segment.entryGraceMinutes ?? 0;
  const exitGrace = segment.exitGraceMinutes ?? 0;
  const delayMode = segment.delayCalculationMode ?? 'lenient';
  const earlyMode = segment.earlyLeaveCalculationMode ?? 'lenient';
  const delayMinutes = calculateDelayMinutes(firstPoint, segment.startTime, entryGrace, delayMode);
  const earlyLeaveMinutes = calculateEarlyLeaveMinutes(lastTime, segment.endTime, exitGrace, earlyMode);

  let status = 'بدون تردد';
  if (incomplete) status = 'تردد ناقص';
  else if (workedMinutes > 0) status = 'حضور';
  if (
    segment.maxDelayBeforeAbsenceMinutes != null &&
    segment.maxDelayBeforeAbsenceMinutes > 0 &&
    delayMinutes > segment.maxDelayBeforeAbsenceMinutes
  ) {
    status = 'غیبت';
  }

  return {
    segmentId: segment.id,
    label: segment.label,
    windowLabel: segmentWindowLabel(segment),
    timestamps: segmentPoints.map((item) => item.timeLabel),
    intervals,
    incomplete,
    delayMinutes,
    earlyLeaveMinutes,
    workedMinutes,
    status,
  };
}

function analyzeSplitShiftAttendance(input: {
  timestamps: AttendanceTimestamp[];
  segments: ShiftSegment[];
  dateKey: string;
  policy: AttendancePolicyBundle;
  onlyApprovedForTotals?: boolean;
}): AttendanceDayAnalysis {
  const effectivePoints = input.timestamps.filter((point) =>
    input.onlyApprovedForTotals ? point.status === 'approved' : true,
  );
  const splitSegments = input.segments.filter((segment) => segment.shiftType === 'split');
  const { assignments, unassignedLabels } = assignSplitTimestampsToSegments(effectivePoints, splitSegments);

  const segmentAnalyses = splitSegments.map((segment) => {
    const segmentPoints = effectivePoints.filter((point) => assignments.get(point.id) === segment.id);
    return analyzeSingleSplitSegment(segment, segmentPoints);
  });

  const incompleteSegmentLabels = segmentAnalyses.filter((item) => item.incomplete).map((item) => item.label);
  const intervals = segmentAnalyses.flatMap((item) => item.intervals);
  const completeIntervals = intervals.filter((item) => item.isComplete && item.status === 'approved');
  const workedMinutes = segmentAnalyses.reduce((sum, item) => sum + item.workedMinutes, 0);
  const delayMinutes = segmentAnalyses.reduce((sum, item) => sum + item.delayMinutes, 0);
  const earlyLeaveMinutes = segmentAnalyses.reduce((sum, item) => sum + item.earlyLeaveMinutes, 0);
  const requiredMinutes = splitSegments.reduce((sum, item) => sum + item.requiredMinutes, 0);
  const shortageMinutes = Math.max(0, requiredMinutes - workedMinutes);
  const overtimeMinutes = Math.max(0, workedMinutes - requiredMinutes);
  const incomplete = incompleteSegmentLabels.length > 0;
  const nightWorkMinutes = calculateNightWorkMinutes(
    completeIntervals,
    input.dateKey,
    input.policy.nightStart ?? '',
    input.policy.nightEnd ?? '',
    input.policy.nightPolicyEnabled,
  );

  let status = 'بدون تردد';
  if (unassignedLabels.length > 0) status = 'تردد خارج از بازه';
  else if (incomplete) status = 'تردد ناقص';
  else if (workedMinutes > 0 && shortageMinutes === 0) status = 'تردد کامل';
  else if (workedMinutes > 0) status = 'حضور';
  else if (effectivePoints.length > 0) status = 'تردد ناقص';

  return {
    status,
    incomplete: incomplete || unassignedLabels.length > 0,
    intervals,
    timestamps: effectivePoints,
    workedMinutes,
    delayMinutes,
    earlyLeaveMinutes,
    overtimeMinutes,
    nightWorkMinutes,
    shortageMinutes,
    incompleteSegmentLabels,
    outsideShiftWindow: unassignedLabels.length > 0,
    segmentAnalyses,
    unassignedTimestampLabels: unassignedLabels,
  };
}

function calculateDelayMinutes(
  firstTime: string | null,
  expectedStart: string | null,
  graceMinutes: number,
  mode: 'lenient' | 'strict',
) {
  const first = parseTimeToMinutes(firstTime);
  const expected = parseTimeToMinutes(expectedStart);
  if (first == null || expected == null) return 0;
  const rawDelay = first - expected;
  if (rawDelay <= 0) return 0;
  if (mode === 'lenient') return Math.max(0, rawDelay - graceMinutes);
  return rawDelay;
}

function calculateEarlyLeaveMinutes(
  lastTime: string | null,
  expectedEnd: string | null,
  graceMinutes: number,
  mode: 'lenient' | 'strict',
) {
  const last = parseTimeToMinutes(lastTime);
  const expected = parseTimeToMinutes(expectedEnd);
  if (last == null || expected == null) return 0;
  const rawEarly = expected - last;
  if (rawEarly <= 0) return 0;
  if (mode === 'lenient') return Math.max(0, rawEarly - graceMinutes);
  return rawEarly;
}

export function calculateNightWorkMinutes(
  intervals: AttendanceInterval[],
  dateKey: string,
  nightStart: string,
  nightEnd: string,
  nightPolicyEnabled: boolean,
) {
  if (!nightPolicyEnabled) return 0;
  const nightStartTs = timestampForPersianDateTime(dateKey, nightStart);
  if (nightStartTs == null) return 0;
  let nightEndTs = timestampForPersianDateTime(dateKey, nightEnd);
  if (nightEndTs == null) return 0;
  if (nightEndTs <= nightStartTs) nightEndTs += 24 * 60 * 60 * 1000;

  return Math.round(
    intervals.reduce((sum, interval) => {
      if (!interval.isComplete || !interval.endTimeLabel) return sum;
      const startTs = timestampForPersianDateTime(dateKey, interval.startTimeLabel);
      let endTs = timestampForPersianDateTime(dateKey, interval.endTimeLabel);
      if (startTs == null || endTs == null) return sum;
      if (endTs <= startTs) endTs += 24 * 60 * 60 * 1000;
      return sum + overlapMinutes(startTs, endTs, nightStartTs, nightEndTs);
    }, 0),
  );
}

function resolveExpectedEndForFloatingDay(firstTime: string | null, requiredMinutes: number) {
  const first = parseTimeToMinutes(firstTime);
  if (first == null) return null;
  const endMinutes = first + requiredMinutes;
  const hour = String(Math.floor((endMinutes % (24 * 60)) / 60)).padStart(2, '0');
  const minute = String(endMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function analyzeAttendanceForShiftWindow(input: {
  timestamps: AttendanceTimestamp[];
  segments: ShiftSegment[];
  dateKey: string;
  policy: AttendancePolicyBundle;
  onlyApprovedForTotals?: boolean;
}): AttendanceDayAnalysis {
  if (input.segments.some((segment) => segment.shiftType === 'split')) {
    return analyzeSplitShiftAttendance(input);
  }

  const effectivePoints = input.timestamps.filter((point) =>
    input.onlyApprovedForTotals ? point.status === 'approved' : true,
  );
  const intervals = pairAttendanceTimestamps(effectivePoints);
  const completeIntervals = intervals.filter((item) => item.isComplete && item.status === 'approved');
  const workedMinutes = completeIntervals.reduce((sum, item) => sum + item.minutes, 0);
  const incomplete = intervals.some((item) => !item.isComplete);
  const incompleteSegmentLabels: string[] = [];

  const primarySegment = input.segments[0] ?? null;
  const firstPoint = effectivePoints[0]?.timeLabel ?? null;
  const lastComplete = completeIntervals[completeIntervals.length - 1];
  const lastTime = lastComplete?.endTimeLabel ?? effectivePoints[effectivePoints.length - 1]?.timeLabel ?? null;

  let expectedStart = primarySegment?.startTime ?? null;
  let expectedEnd = primarySegment?.endTime ?? null;
  let requiredMinutes = primarySegment?.requiredMinutes ?? 0;

  if (primarySegment?.shiftType === 'float-day') {
    expectedStart = primarySegment.entryWindowStart;
    expectedEnd = resolveExpectedEndForFloatingDay(firstPoint, primarySegment.requiredMinutes);
    if (firstPoint && primarySegment.entryWindowStart && primarySegment.entryWindowEnd) {
      const firstMinutes = parseTimeToMinutes(firstPoint);
      const windowStart = parseTimeToMinutes(primarySegment.entryWindowStart);
      const windowEnd = parseTimeToMinutes(primarySegment.entryWindowEnd);
      if (firstMinutes != null && windowStart != null && windowEnd != null && (firstMinutes < windowStart || firstMinutes > windowEnd)) {
        // outside window handled via delay/warning downstream
      }
    }
  }

  const delayMinutes =
    primarySegment?.shiftType === 'float-abs'
      ? 0
      : calculateDelayMinutes(firstPoint, expectedStart, input.policy.entryGraceMinutes, input.policy.delayCalculationMode);
  const earlyLeaveMinutes =
    primarySegment?.shiftType === 'float-abs'
      ? 0
      : calculateEarlyLeaveMinutes(lastTime, expectedEnd, input.policy.exitGraceMinutes, input.policy.earlyLeaveCalculationMode);
  const shortageMinutes =
    primarySegment?.shiftType === 'float-abs' ? Math.max(0, requiredMinutes - workedMinutes) : Math.max(0, requiredMinutes - workedMinutes);
  const overtimeMinutes = primarySegment?.shiftType === 'float-abs' ? 0 : Math.max(0, workedMinutes - requiredMinutes);
  const nightWorkMinutes = calculateNightWorkMinutes(
    completeIntervals,
    input.dateKey,
    input.policy.nightStart ?? '',
    input.policy.nightEnd ?? '',
    input.policy.nightPolicyEnabled,
  );

  let outsideShiftWindow = false;
  if (firstPoint && expectedStart && expectedEnd && primarySegment?.shiftType === 'fixed') {
    const firstMinutes = parseTimeToMinutes(firstPoint);
    const startMinutes = parseTimeToMinutes(expectedStart);
    let endMinutes = parseTimeToMinutes(expectedEnd);
    if (firstMinutes != null && startMinutes != null && endMinutes != null) {
      if (primarySegment.endsNextDay && endMinutes <= startMinutes) endMinutes += 24 * 60;
      let compareMinutes = firstMinutes;
      if (primarySegment.endsNextDay && compareMinutes < startMinutes) compareMinutes += 24 * 60;
      outsideShiftWindow = compareMinutes < startMinutes - input.policy.entryGraceMinutes || compareMinutes > endMinutes + input.policy.exitGraceMinutes;
    }
  }

  let status = 'بدون تردد';
  if (incomplete || incompleteSegmentLabels.length > 0) status = 'تردد ناقص';
  else if (workedMinutes > 0 && shortageMinutes === 0) status = 'تردد کامل';
  else if (workedMinutes > 0) status = 'حضور';
  else if (effectivePoints.length > 0) status = 'تردد ناقص';

  return {
    status,
    incomplete: incomplete || incompleteSegmentLabels.length > 0,
    intervals,
    timestamps: effectivePoints,
    workedMinutes,
    delayMinutes,
    earlyLeaveMinutes,
    overtimeMinutes,
    nightWorkMinutes,
    shortageMinutes,
    incompleteSegmentLabels,
    outsideShiftWindow,
  };
}

function collectAttendanceTimestamps(
  requests: AttendanceRequestLike[],
  dateKeys: string[],
  options: { excludeId?: string; includePending: boolean },
) {
  return requests
    .filter((request) => request.id !== options.excludeId)
    .filter((request) => request.status === 'approved' || (options.includePending && request.status === 'pending'))
    .map((request) => {
      const parsed = parseAttendanceTimestamp(request);
      if (!parsed) return null;
      const dateKey = toPlainPersianDate(request.startDate ?? request.dateTime);
      if (!dateKey || !dateKeys.includes(dateKey)) return null;
      return parsed;
    })
    .filter((item): item is AttendanceTimestamp => Boolean(item));
}

function daysBetweenPersianDates(fromDateKey: string, toDateKey: string) {
  const [fy, fm, fd] = fromDateKey.split('/').map(Number);
  const [ty, tm, td] = toDateKey.split('/').map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return Number.POSITIVE_INFINITY;
  const from = persianToDate({ year: fy, month: fm, day: fd }).getTime();
  const to = persianToDate({ year: ty, month: tm, day: td }).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function previewAttendanceCorrection(input: {
  persianDateKey: string;
  proposedTime: string;
  proposedStatus: 'approved' | 'pending';
  proposedId?: string;
  existingRequests: AttendanceRequestLike[];
  segments: ShiftSegment[];
  shiftTypeLabel: string | null;
  shiftWindowLabel: string | null;
  workGroupTitle: string | null;
  policyTitle: string | null;
  policy: AttendancePolicyBundle;
  tenantPayrollSettings: PayrollSettings;
  reasonId?: string | null;
  attachmentCount?: number;
  submissionMode: 'approved' | 'pending';
  isAdmin?: boolean;
  hasGeolocation?: boolean;
  hasFaceVerification?: boolean;
  monthlyManualCount?: number;
}): AttendancePreviewResult {
  const warnings: string[] = [];
  const blockingErrors: string[] = [];
  const outcomeMessages: string[] = [];

  const nightWork = input.tenantPayrollSettings.workTimePayRules.nightWork;
  const dateKeys = [input.persianDateKey];
  const primarySegment = input.segments[0];
  if (primarySegment?.endsNextDay) {
    const [year, month, day] = input.persianDateKey.split('/').map(Number);
    if (year && month && day) {
      dateKeys.push(formatPersianYmd(addPersianDays({ year, month, day }, 1)));
    }
  }

  const currentTimestamps = collectAttendanceTimestamps(input.existingRequests, dateKeys, {
    excludeId: input.proposedId,
    includePending: true,
  });

  const proposedTimestamp = parseAttendanceTimestamp({
    id: input.proposedId ?? 'proposed',
    status: input.proposedStatus,
    startDate: input.persianDateKey,
    startTime: input.proposedTime,
    dateTime: `${input.persianDateKey} ${input.proposedTime}`,
  });

  if (!input.proposedTime) blockingErrors.push('ساعت تردد نامعتبر است.');
  if (!proposedTimestamp) blockingErrors.push('تاریخ یا ساعت تردد نامعتبر است.');

  const before = analyzeAttendanceForShiftWindow({
    timestamps: currentTimestamps,
    segments: input.segments,
    dateKey: input.persianDateKey,
    policy: input.policy,
    onlyApprovedForTotals: true,
  });

  const afterTimestamps = proposedTimestamp
    ? [...currentTimestamps, proposedTimestamp].sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id))
    : currentTimestamps;

  const afterIfApproved = proposedTimestamp
    ? analyzeAttendanceForShiftWindow({
        timestamps: afterTimestamps.map((point) =>
          point.id === proposedTimestamp.id ? { ...point, status: 'approved' as const } : point,
        ),
        segments: input.segments,
        dateKey: input.persianDateKey,
        policy: input.policy,
        onlyApprovedForTotals: true,
      })
    : null;

  const after = analyzeAttendanceForShiftWindow({
    timestamps:
      input.submissionMode === 'approved' && proposedTimestamp
        ? afterTimestamps.map((point) => (point.id === proposedTimestamp.id ? { ...point, status: 'approved' as const } : point))
        : afterTimestamps,
    segments: input.segments,
    dateKey: input.persianDateKey,
    policy: input.policy,
    onlyApprovedForTotals: input.submissionMode === 'approved',
  });

  if (!input.policy.manualEntryEnabled && !input.isAdmin) {
    blockingErrors.push('ثبت تردد دستی در سیاست کاری غیرفعال است.');
  } else if (!input.policy.manualEntryEnabled && input.isAdmin) {
    warnings.push('در سیاست کاری، ثبت تردد دستی غیرفعال است؛ این ثبت توسط ادمین انجام می‌شود.');
  }

  if (input.policy.manualRequireReason && !input.reasonId) {
    blockingErrors.push('ثبت دلیل برای تردد دستی الزامی است.');
  }

  if (input.policy.manualRequireAttachment && !(input.attachmentCount ?? 0)) {
    blockingErrors.push('پیوست برای تردد دستی الزامی است.');
  }

  const todayKey = formatPersianYmd(getPersianPartsFromDate(new Date()));
  const dayDiff = daysBetweenPersianDates(input.persianDateKey, todayKey);
  if (dayDiff > 0) {
    if (!input.policy.manualPastDaysEnabled) {
      blockingErrors.push('ثبت برای روزهای گذشته در سیاست کاری مجاز نیست.');
    } else if (input.policy.manualMaxPastDays > 0 && dayDiff > input.policy.manualMaxPastDays) {
      blockingErrors.push(`ثبت برای بیش از ${input.policy.manualMaxPastDays.toLocaleString('fa-IR')} روز گذشته مجاز نیست.`);
    }
  }

  if (
    input.policy.manualMonthlyCapPerUser > 0 &&
    (input.monthlyManualCount ?? 0) >= input.policy.manualMonthlyCapPerUser
  ) {
    if (input.isAdmin) {
      warnings.push('سقف ماهانه ثبت دستی برای این کارمند پر شده است.');
    } else {
      blockingErrors.push('سقف ماهانه ثبت دستی برای این کارمند تکمیل شده است.');
    }
  }

  if (input.policy.requireGeofence && !input.hasGeolocation) {
    warnings.push('ثبت دستی بدون موقعیت مکانی');
  }
  if (input.policy.faceRecognitionInFlow && !input.hasFaceVerification) {
    warnings.push('ثبت دستی بدون تشخیص چهره');
  }

  if (before.incomplete) outcomeMessages.push(`وضعیت قبل: ${before.status}`);
  else outcomeMessages.push(`وضعیت قبل: ${before.status}`);

  if (after.incomplete) outcomeMessages.push('پس از ثبت، تعداد ترددها همچنان فرد است و تردد ناقص باقی می‌ماند.');
  else if (!before.incomplete && after.workedMinutes > before.workedMinutes) outcomeMessages.push('تردد کامل می‌شود.');
  else if (!after.incomplete && after.workedMinutes > 0) outcomeMessages.push('تردد کامل می‌شود.');

  if (after.outsideShiftWindow) warnings.push('ثبت خارج از بازه شیفت است.');
  if (before.delayMinutes > 0 && after.delayMinutes < before.delayMinutes) outcomeMessages.push('ثبت باعث رفع تأخیر می‌شود.');
  if (before.earlyLeaveMinutes > 0 && after.earlyLeaveMinutes < before.earlyLeaveMinutes) outcomeMessages.push('ثبت باعث رفع تعجیل می‌شود.');
  if (after.overtimeMinutes > before.overtimeMinutes) outcomeMessages.push('ثبت باعث ایجاد/افزایش اضافه‌کاری می‌شود.');
  if (after.nightWorkMinutes > before.nightWorkMinutes) outcomeMessages.push('ثبت در بازه شب‌کاری قرار دارد.');

  let proposedSegmentLabel: string | null = null;
  let proposedOutsideSegments = false;
  if (proposedTimestamp && input.segments.some((segment) => segment.shiftType === 'split')) {
    const assignment = assignTimestampToSplitSegment(proposedTimestamp, input.segments);
    proposedOutsideSegments = assignment.outsideWindow;
    proposedSegmentLabel =
      assignment.segmentId != null
        ? (input.segments.find((segment) => segment.id === assignment.segmentId)?.label ?? null)
        : null;
    if (assignment.outsideWindow) {
      warnings.push('این تردد خارج از بازه‌های تعریف‌شده شیفت دوتکه است.');
    } else if (proposedSegmentLabel) {
      outcomeMessages.push(`تردد پیشنهادی مربوط به ${proposedSegmentLabel} است.`);
      const beforeSegment = before.segmentAnalyses?.find((item) => item.label === proposedSegmentLabel);
      const afterSegment = after.segmentAnalyses?.find((item) => item.label === proposedSegmentLabel);
      if (beforeSegment && afterSegment) {
        outcomeMessages.push(`${proposedSegmentLabel} قبل: ${beforeSegment.status} · بعد: ${afterSegment.status}`);
      }
    }
  }

  if (after.incompleteSegmentLabels.length) {
    warnings.push(`بخش ناقص: ${after.incompleteSegmentLabels.join('، ')}`);
  }

  if (input.submissionMode === 'pending') {
    warnings.push('در حالت «در انتظار تأیید»، این تردد در محاسبات نهایی اعمال نمی‌شود.');
  }

  return {
    bases: {
      workGroupTitle: input.workGroupTitle,
      policyTitle: input.policyTitle,
      shiftTypeLabel: input.shiftTypeLabel,
      shiftWindowLabel: input.shiftWindowLabel,
      nightPolicyEnabled: input.policy.nightPolicyEnabled,
      tenantNightWorkStart: input.policy.nightPolicyEnabled ? input.policy.nightStart : null,
      tenantNightWorkEnd: input.policy.nightPolicyEnabled ? input.policy.nightEnd : null,
      tenantNightWorkCoefficient: input.policy.nightPolicyEnabled ? nightWork.coefficient : null,
    },
    currentTimestamps: currentTimestamps.map((item) => item.timeLabel),
    proposedTimestamp: proposedTimestamp?.timeLabel ?? null,
    proposedSegmentLabel,
    proposedOutsideSegments,
    before,
    after,
    afterIfApproved,
    outcomeMessages,
    warnings,
    blockingErrors,
  };
}

export function buildShiftContextForDate(input: {
  persianDateKey: string;
  calendar: {
    weekends: string[];
    singleHolidays: ReturnType<typeof parseCalendarStoredEvents>;
    shiftConfig: unknown;
    excludedShiftDates: string[];
    weekendOverrideDates: string[];
  } | null;
  fallbackRequiredMinutes: number;
  policySectionValues?: Record<string, unknown>;
  policyFallback?: AttendancePolicyBundle;
}) {
  if (!input.calendar) {
    return { segments: [] as ShiftSegment[], shiftTypeLabel: null, shiftWindowLabel: null, rawShift: null as StoredCalendarShift | null };
  }
  const shifts = listCalendarShifts(input.calendar.shiftConfig);
  const dayDetails = getDayDetails({
    date: input.persianDateKey,
    weekends: input.calendar.weekends,
    singleHolidays: input.calendar.singleHolidays,
    shifts,
    excludedShiftDates: input.calendar.excludedShiftDates,
    weekendOverrideDates: input.calendar.weekendOverrideDates,
  });
  const summaryShift = dayDetails.shifts[0] ?? null;
  const rawShift = summaryShift ? shifts.find((item) => item.id === summaryShift.id) ?? null : null;
  if (!rawShift) {
    return { segments: [] as ShiftSegment[], shiftTypeLabel: null, shiftWindowLabel: null, rawShift: null };
  }
  const summary = summarizeShiftForDayPanel(rawShift);
  return {
    segments: buildExpectedShiftSegments(
      rawShift,
      input.fallbackRequiredMinutes,
      input.policySectionValues,
      input.policyFallback,
    ),
    shiftTypeLabel: summary.shiftTypeLabel,
    shiftWindowLabel: summary.timeRange,
    rawShift,
  };
}
