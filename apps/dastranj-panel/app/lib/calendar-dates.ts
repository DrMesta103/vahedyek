export const PERSIAN_WEEKDAY_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;
export const PERSIAN_WEEKDAY_NAMES = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'] as const;

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export type PersianYmd = {
  year: number;
  month: number;
  day: number;
};

export function getPersianPartsFromDate(date = new Date()): PersianYmd {
  const parts = new Intl.DateTimeFormat('en-u-nu-latn', {
    calendar: 'persian',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
  };
}

export function parsePersianYmd(value: string): PersianYmd | null {
  const match = value.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function formatPersianYmd({ year, month, day }: PersianYmd): string {
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

export function comparePersianYmd(a: PersianYmd, b: PersianYmd): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function isPersianYmdInRange(date: PersianYmd, start: PersianYmd, end: PersianYmd): boolean {
  return comparePersianYmd(date, start) >= 0 && comparePersianYmd(date, end) <= 0;
}

export function isPersianLeapYear(year: number): boolean {
  const mod = year % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(mod);
}

export function getPersianMonthLength(year: number, month: number): number {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  return isPersianLeapYear(year) ? 30 : 29;
}

export function persianToDate(parts: PersianYmd): Date {
  const anchor = new Date(Date.UTC(parts.year + 621, 2, 20));

  for (let offset = -90; offset <= 430; offset += 1) {
    const candidate = new Date(anchor);
    candidate.setUTCDate(anchor.getUTCDate() + offset);
    const persian = getPersianPartsFromDate(candidate);
    if (persian.year === parts.year && persian.month === parts.month && persian.day === parts.day) {
      return candidate;
    }
  }

  throw new Error(`Invalid persian date: ${formatPersianYmd(parts)}`);
}

export function getPersianWeekdayIndex(parts: PersianYmd): number {
  const date = persianToDate(parts);
  return (date.getDay() + 1) % 7;
}

export function getPersianWeekdayName(parts: PersianYmd): (typeof PERSIAN_WEEKDAY_NAMES)[number] {
  return PERSIAN_WEEKDAY_NAMES[getPersianWeekdayIndex(parts)];
}

export function addPersianDays(parts: PersianYmd, delta: number): PersianYmd {
  const date = persianToDate(parts);
  date.setUTCDate(date.getUTCDate() + delta);
  return getPersianPartsFromDate(date);
}

export function addPersianMonths({ year, month }: Pick<PersianYmd, 'year' | 'month'>, delta: number) {
  let nextMonth = month + delta;
  let nextYear = year;

  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }

  while (nextMonth < 1) {
    nextMonth += 12;
    nextYear -= 1;
  }

  return { year: nextYear, month: nextMonth };
}

export function clampPersianMonth(
  year: number,
  month: number,
  bounds: { start: PersianYmd; end: PersianYmd },
): { year: number; month: number } {
  const candidate = { year, month, day: 1 };
  const startMonth = { year: bounds.start.year, month: bounds.start.month, day: 1 };
  const endMonth = { year: bounds.end.year, month: bounds.end.month, day: 1 };

  if (comparePersianYmd(candidate, startMonth) < 0) {
    return { year: bounds.start.year, month: bounds.start.month };
  }

  if (comparePersianYmd(candidate, endMonth) > 0) {
    return { year: bounds.end.year, month: bounds.end.month };
  }

  return { year, month };
}

export function resolveDefaultViewMonth(
  bounds: { start: PersianYmd; end: PersianYmd },
  today: PersianYmd,
): { year: number; month: number } {
  if (isPersianYmdInRange(today, bounds.start, bounds.end)) {
    return { year: today.year, month: today.month };
  }

  if (comparePersianYmd(today, bounds.start) < 0) {
    return { year: bounds.start.year, month: bounds.start.month };
  }

  return { year: bounds.end.year, month: bounds.end.month };
}
