import {
  formatPersianYmd,
  getPersianMonthLength,
  getPersianWeekdayIndex,
  getPersianWeekdayName,
  isPersianYmdInRange,
  PERSIAN_WEEKDAY_NAMES,
  type PersianYmd,
} from './calendar-dates';
import { isCalendarHolidayEvent, normalizePersianDateInput, type CalendarStoredEvent } from './calendar-events';
import { summarizeShiftForDayPanel, type CalendarDayShiftDetails } from './calendar-shift-display';
import type { CalendarShiftType, StoredCalendarShift } from './calendar-shifts';

export type { CalendarDayShiftDetails };

export type CalendarDayCell = {
  day: number | null;
  weekdayIndex: number | null;
  weekdayName: string | null;
  isHoliday: boolean;
  isWeekend: boolean;
  hasOtherEvent: boolean;
  shiftTypes: CalendarShiftType[];
  date: string | null;
};

export type CalendarDayEvent = {
  id: string;
  title: string;
  description: string;
  tone: 'holiday' | 'weekend' | 'other';
};

export type CalendarDayShift = CalendarDayShiftDetails;

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeWeekdayName(name: string) {
  return name.replace(/\s+/g, ' ').trim();
}

function getShiftWorkingDays(shift: StoredCalendarShift): string[] {
  const config = shift.config;

  switch (shift.shiftType) {
    case 'fixed':
      return stringArray(config.workingDays);
    case 'float-day':
      return stringArray(config.floatDayWorkingDays ?? config.workingDays);
    case 'float-abs':
      return stringArray(config.floatAbsWorkingDays ?? config.workingDays);
    case 'split':
      return stringArray(config.splitWorkingDays ?? config.workingDays);
    case 'rotate': {
      const items = Array.isArray(config.rotatingItems) ? config.rotatingItems : [];
      if (items.length === 0) return [];
      return [...PERSIAN_WEEKDAY_NAMES];
    }
    default:
      return [];
  }
}

function shiftIncludedDates(shift: StoredCalendarShift) {
  return stringArray(shift.config.includedDates).map((item) => normalizePersianDateInput(item));
}

function shiftAppliesOnWeekday(
  shift: StoredCalendarShift,
  weekdayName: string,
  isHoliday: boolean,
  date: string,
  excludedDates: Set<string>,
) {
  const normalizedDate = normalizePersianDateInput(date);
  if (isHoliday || excludedDates.has(normalizedDate)) return false;

  const includedDates = shiftIncludedDates(shift);
  if (includedDates.length > 0) {
    return includedDates.includes(normalizedDate);
  }

  if (shift.shiftType === 'rotate') {
    const items = Array.isArray(shift.config.rotatingItems) ? shift.config.rotatingItems : [];
    return items.some((item) => item && typeof item === 'object' && (item as { kind?: string }).kind !== 'off');
  }

  const workingDays = getShiftWorkingDays(shift).map(normalizeWeekdayName);
  return workingDays.includes(normalizeWeekdayName(weekdayName));
}

function isWeekendDay(weekdayName: string, weekends: string[]) {
  const normalizedWeekends = weekends.map(normalizeWeekdayName);
  return normalizedWeekends.includes(normalizeWeekdayName(weekdayName));
}

function findEventsForDate(date: string, events: CalendarStoredEvent[]) {
  return events.filter((item) => item.date === date);
}

function findHolidayEvent(date: string, events: CalendarStoredEvent[]) {
  return findEventsForDate(date, events).find((item) => isCalendarHolidayEvent(item)) ?? null;
}

function dayHasOtherEvent(date: string, events: CalendarStoredEvent[]) {
  return findEventsForDate(date, events).some((item) => !isCalendarHolidayEvent(item));
}

export function buildMonthCells(input: {
  year: number;
  month: number;
  bounds: { start: PersianYmd; end: PersianYmd };
  weekends: string[];
  singleHolidays: CalendarStoredEvent[];
  shifts: StoredCalendarShift[];
  excludedShiftDates?: string[];
}): CalendarDayCell[] {
  const excludedDates = new Set((input.excludedShiftDates ?? []).map((item) => item.trim()));
  const daysInMonth = getPersianMonthLength(input.year, input.month);
  const startWeekday = getPersianWeekdayIndex({ year: input.year, month: input.month, day: 1 });
  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push({
      day: null,
      weekdayIndex: null,
      weekdayName: null,
      isHoliday: false,
      isWeekend: false,
      hasOtherEvent: false,
      shiftTypes: [],
      date: null,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const parts: PersianYmd = { year: input.year, month: input.month, day };
    const date = formatPersianYmd(parts);
    const weekdayName = getPersianWeekdayName(parts);
    const weekdayIndex = getPersianWeekdayIndex(parts);
    const inRange = isPersianYmdInRange(parts, input.bounds.start, input.bounds.end);
    const holidayEvent = findHolidayEvent(date, input.singleHolidays);
    const isWeekend = inRange && isWeekendDay(weekdayName, input.weekends);
    const isHoliday = inRange && (Boolean(holidayEvent) || isWeekend);
    const hasOtherEvent = inRange && dayHasOtherEvent(date, input.singleHolidays);
    const applicableShifts = inRange
      ? input.shifts.filter((shift) => shiftAppliesOnWeekday(shift, weekdayName, isHoliday, date, excludedDates))
      : [];
    const shiftTypes = [...new Set(applicableShifts.map((shift) => shift.shiftType))];

    cells.push({
      day,
      weekdayIndex,
      weekdayName,
      isHoliday,
      isWeekend,
      hasOtherEvent,
      shiftTypes,
      date,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      day: null,
      weekdayIndex: null,
      weekdayName: null,
      isHoliday: false,
      isWeekend: false,
      hasOtherEvent: false,
      shiftTypes: [],
      date: null,
    });
  }

  return cells;
}

export function getDayDetails(input: {
  date: string;
  weekends: string[];
  singleHolidays: CalendarStoredEvent[];
  shifts: StoredCalendarShift[];
  excludedShiftDates?: string[];
}): { isHoliday: boolean; shifts: CalendarDayShift[]; events: CalendarDayEvent[] } {
  const excludedDates = new Set((input.excludedShiftDates ?? []).map((item) => item.trim()));
  const parts = input.date.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!parts) {
    return { isHoliday: false, shifts: [], events: [] };
  }

  const ymd: PersianYmd = {
    year: Number(parts[1]),
    month: Number(parts[2]),
    day: Number(parts[3]),
  };
  const weekdayName = getPersianWeekdayName(ymd);
  const dayEvents = findEventsForDate(input.date, input.singleHolidays);
  const holidayEvent = dayEvents.find((item) => isCalendarHolidayEvent(item));
  const isWeekend = isWeekendDay(weekdayName, input.weekends);
  const isHoliday = Boolean(holidayEvent) || isWeekend;

  const events: CalendarDayEvent[] = dayEvents.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description?.trim() ? item.description : 'ثبت نشده است',
    tone: isCalendarHolidayEvent(item) ? 'holiday' : 'other',
  }));

  if (isWeekend && !holidayEvent) {
    events.push({
      id: `weekend-${weekdayName}`,
      title: `تعطیل هفتگی (${weekdayName})`,
      description: 'ثبت نشده است',
      tone: 'weekend',
    });
  }

  const shifts = isHoliday
    ? []
    : input.shifts
        .filter((shift) => shiftAppliesOnWeekday(shift, weekdayName, isHoliday, input.date, excludedDates))
        .map((shift) => summarizeShiftForDayPanel(shift));

  return { isHoliday, shifts, events };
}
