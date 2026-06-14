import { buildExpectedShiftSegments } from './attendance-calculation';
import { formatPersianYmd, getPersianPartsFromDate } from './calendar-dates';
import { getDayDetails } from './calendar-grid';
import type { StoredCalendarShift } from './calendar-shifts';
import type { RemoteWorkModeKey } from './remote-work-policy';

export type RemoteWorkDayContext = {
  weekends: string[];
  singleHolidays: ReturnType<typeof import('./calendar-events').parseCalendarStoredEvents>;
  shifts: StoredCalendarShift[];
  excludedShiftDates: string[];
  weekendOverrideDates: string[];
  policySectionValues?: Record<string, unknown>;
};

function isoDateToPersianYmd(value: string) {
  const trimmed = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [year, month, day] = trimmed.split('-').map(Number);
  if (!year || !month || !day) return null;
  return formatPersianYmd(getPersianPartsFromDate(new Date(Date.UTC(year, month - 1, day, 12, 0, 0))));
}

function inclusiveIsoDateRange(startDate?: string | null, endDate?: string | null) {
  const startIso = startDate?.trim().slice(0, 10);
  const endIso = (endDate ?? startDate)?.trim().slice(0, 10);
  if (!startIso || !endIso || !/^\d{4}-\d{2}-\d{2}$/.test(startIso) || !/^\d{4}-\d{2}-\d{2}$/.test(endIso)) return [];
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

function timeToMinutes(value?: string | null) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

export function getRemoteWorkDayDetails(context: RemoteWorkDayContext, isoDate: string) {
  const persianDate = isoDateToPersianYmd(isoDate);
  if (!persianDate) return null;
  return getDayDetails({
    date: persianDate,
    weekends: context.weekends,
    singleHolidays: context.singleHolidays,
    shifts: context.shifts,
    excludedShiftDates: context.excludedShiftDates,
    weekendOverrideDates: context.weekendOverrideDates,
  });
}

export function isRemoteWorkBlockedDay(context: RemoteWorkDayContext, isoDate: string, allowHolidays: boolean) {
  if (allowHolidays) return false;
  const details = getRemoteWorkDayDetails(context, isoDate);
  if (!details) return false;
  return details.isHoliday || details.shifts.length === 0;
}

export function expectedWorkMinutesForIsoDate(
  context: RemoteWorkDayContext,
  isoDate: string,
  fallbackRequiredMinutes: number,
) {
  const details = getRemoteWorkDayDetails(context, isoDate);
  if (!details || details.shifts.length === 0) return 0;
  const summaryShift = details.shifts[0];
  const rawShift = context.shifts.find((item) => item.id === summaryShift.id);
  if (!rawShift) return fallbackRequiredMinutes;
  const segments = buildExpectedShiftSegments(rawShift, fallbackRequiredMinutes, context.policySectionValues);
  return segments.reduce((sum, segment) => sum + Math.max(0, segment.requiredMinutes), 0);
}

export function calculateRemoteWorkDurationMinutes(input: {
  mode: RemoteWorkModeKey;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  context: RemoteWorkDayContext;
  fallbackRequiredMinutes: number;
  allowHolidays: boolean;
}) {
  if (input.mode === 'hourly') {
    const start = timeToMinutes(input.startTime);
    const end = timeToMinutes(input.endTime);
    if (start == null || end == null || end <= start) return 0;
    return end - start;
  }

  if (input.mode === 'daily') {
    const isoDate = input.startDate?.trim().slice(0, 10);
    if (!isoDate) return 0;
    if (isRemoteWorkBlockedDay(input.context, isoDate, input.allowHolidays)) return 0;
    return expectedWorkMinutesForIsoDate(input.context, isoDate, input.fallbackRequiredMinutes);
  }

  const dates = inclusiveIsoDateRange(input.startDate, input.endDate);
  return dates.reduce((sum, isoDate) => {
    if (isRemoteWorkBlockedDay(input.context, isoDate, input.allowHolidays)) return sum;
    return sum + expectedWorkMinutesForIsoDate(input.context, isoDate, input.fallbackRequiredMinutes);
  }, 0);
}
