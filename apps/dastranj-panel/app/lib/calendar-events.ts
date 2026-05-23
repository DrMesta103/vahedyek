import {
  addPersianDays,
  comparePersianYmd,
  formatPersianYmd,
  getPersianMonthLength,
  getPersianPartsFromDate,
  getPersianWeekdayName,
  isPersianYmdInRange,
  parsePersianYmd,
  type PersianYmd,
} from './calendar-dates';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export const CALENDAR_EVENT_PRESETS = [
  'تعطیلات سازمانی',
  'تعطیلات رسمی',
  'رویداد ویژه',
  'فورس ماژور',
] as const;

export type CalendarStoredEvent = {
  id: string;
  title: string;
  date: string;
  description?: string;
  category?: string;
  isHoliday?: boolean;
};

export function normalizePersianDateInput(value: string): string {
  const normalizedDigits = value.replace(/[۰-۹]/g, (char) => {
    const index = PERSIAN_DIGITS.indexOf(char);
    return index >= 0 ? String(index) : char;
  });

  const compact = normalizedDigits.replace(/\s+/g, '');
  const slashMatch = compact.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slashMatch) {
    return formatPersianYmd({
      year: Number(slashMatch[1]),
      month: Number(slashMatch[2]),
      day: Number(slashMatch[3]),
    });
  }

  return normalizedDigits.replace(/\s*\/\s*/g, '/').trim();
}

export function parseCalendarStoredEvents(value: unknown): CalendarStoredEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is CalendarStoredEvent => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: String((item as CalendarStoredEvent).id ?? ''),
      title: String((item as CalendarStoredEvent).title ?? ''),
      date: normalizePersianDateInput(String((item as CalendarStoredEvent).date ?? '')),
      description:
        typeof (item as CalendarStoredEvent).description === 'string'
          ? (item as CalendarStoredEvent).description
          : undefined,
      category:
        typeof (item as CalendarStoredEvent).category === 'string'
          ? (item as CalendarStoredEvent).category
          : undefined,
      isHoliday:
        typeof (item as CalendarStoredEvent).isHoliday === 'boolean'
          ? (item as CalendarStoredEvent).isHoliday
          : true,
    }))
    .filter((item) => item.id && item.title && item.date);
}

export function isCalendarHolidayEvent(event: CalendarStoredEvent) {
  return event.isHoliday !== false;
}

export function expandCalendarEventDates(input: {
  startDate: string;
  endDate: string;
  weekdays: string[];
  bounds?: { start: PersianYmd; end: PersianYmd };
}): string[] {
  const start = parsePersianYmd(normalizePersianDateInput(input.startDate));
  const end = parsePersianYmd(normalizePersianDateInput(input.endDate));
  if (!start || !end || comparePersianYmd(start, end) > 0) return [];

  const weekdayFilter = input.weekdays.map((day) => day.replace(/\s+/g, ' ').trim());
  const dates: string[] = [];
  let cursor = start;

  while (comparePersianYmd(cursor, end) <= 0) {
    if (input.bounds && !isDateInBounds(cursor, input.bounds)) {
      cursor = addPersianDays(cursor, 1);
      continue;
    }

    const weekdayName = getPersianWeekdayName(cursor);
    if (weekdayFilter.length === 0 || weekdayFilter.includes(weekdayName)) {
      dates.push(formatPersianYmd(cursor));
    }

    cursor = addPersianDays(cursor, 1);
  }

  return dates;
}

function isDateInBounds(date: PersianYmd, bounds: { start: PersianYmd; end: PersianYmd }) {
  return isPersianYmdInRange(date, bounds.start, bounds.end);
}

export function buildPersianDatePreset(
  preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end',
  anchor?: PersianYmd,
) {
  const base = anchor ?? getPersianPartsFromDate();

  switch (preset) {
    case 'today':
      return formatPersianYmd(base);
    case 'month-start':
      return formatPersianYmd({ year: base.year, month: base.month, day: 1 });
    case 'month-end':
      return formatPersianYmd({
        year: base.year,
        month: base.month,
        day: getPersianMonthLength(base.year, base.month),
      });
    case 'year-start':
      return formatPersianYmd({ year: base.year, month: 1, day: 1 });
    case 'year-end':
      return formatPersianYmd({
        year: base.year,
        month: 12,
        day: getPersianMonthLength(base.year, 12),
      });
    default:
      return formatPersianYmd(base);
  }
}

