export type JalaliDateParts = { year: number; month: number; day: number };
export type ExpectedDueInterval = { months?: number; days?: number };
export type ActualDueInterval = { months: number; days: number; label: string };

export function parseInstallmentWindow(value: string): ExpectedDueInterval | null {
  const normalized = normalizePersianText(value);
  if (normalized.includes('یک ماه')) return { months: 1 };
  if (normalized.includes('ماهانه')) return { months: 1 };
  if (normalized.includes('دو ماه')) return { months: 2 };
  if (normalized.includes('دوماهه')) return { months: 2 };
  if (normalized.includes('سه ماه')) return { months: 3 };
  if (normalized.includes('سه‌ماهه') || normalized.includes('سه ماهه')) return { months: 3 };
  if (normalized.includes('شش ماه')) return { months: 6 };
  if (normalized.includes('شش‌ماهه') || normalized.includes('شش ماهه')) return { months: 6 };
  if (normalized.includes('سالانه')) return { months: 12 };
  if (normalized.includes('یک هفته')) return { days: 7 };
  if (normalized.includes('دو هفته')) return { days: 14 };
  if (normalized.includes('دوهفته')) return { days: 14 };
  if (normalized.includes('چهل و پنج روز')) return { days: 45 };
  return null;
}

export function parseJalaliDate(value: string): JalaliDateParts | null {
  const normalized = normalizeDigits(value);
  const match = normalized.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function describeDueInterval(start: JalaliDateParts, end: JalaliDateParts): ActualDueInterval {
  const months = Math.max(0, (end.year - start.year) * 12 + (end.month - start.month));
  const days = end.day - start.day;
  const parts = [
    months ? `${months.toLocaleString('fa-IR')} ماه` : '',
    days ? `${Math.abs(days).toLocaleString('fa-IR')} روز ${days > 0 ? 'بیشتر' : 'کمتر'}` : '',
  ].filter(Boolean);
  return { months, days, label: parts.length ? parts.join(' و ') : 'بدون فاصله' };
}

export function isDueIntervalAligned(actual: ActualDueInterval, expected: ExpectedDueInterval) {
  if (expected.months !== undefined) return actual.months === expected.months && Math.abs(actual.days) <= 3;
  if (expected.days !== undefined) return Math.abs(toApproximateDays(actual) - expected.days) <= 2;
  return true;
}

export function compareJalaliDate(a: JalaliDateParts, b: JalaliDateParts) {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

function toApproximateDays(interval: ActualDueInterval) {
  return interval.months * 30 + interval.days;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function normalizePersianText(value: string) {
  return value.replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
}
