import { jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js';

export type DueFrequency = 'monthly' | 'daily';

export type NormalizedFinancialCategory = {
  id: string;
  name: string;
  capAmount: number;
  dueAmount: number;
  noDueAmount: number;
  system: boolean;
  requiresDue: boolean;
};

export type NormalizedFinancialDueItem = {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  dueDate: string;
};

export function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

export function parseJalaliDate(value: string) {
  const [year, month, day] = normalizeDigits(value).split('/').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function toDateFromJalali(value: string) {
  const parsed = parseJalaliDate(value);
  if (!parsed) return null;
  const gregorian = toGregorian(parsed.year, parsed.month, parsed.day);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
}

export function formatJalaliDate(date: Date) {
  const jalali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const year = String(jalali.jy);
  const month = String(jalali.jm).padStart(2, '0');
  const day = String(jalali.jd).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function addIntervalToDate(value: string, offset: number, frequency: DueFrequency, period = 1) {
  const normalizedPeriod = Math.max(period, 1);

  if (frequency === 'monthly') {
    const parsed = parseJalaliDate(value);
    if (!parsed) return '';

    const totalMonths = (parsed.month - 1) + offset * normalizedPeriod;
    const nextYear = parsed.year + Math.floor(totalMonths / 12);
    const nextMonth = (totalMonths % 12 + 12) % 12 + 1;
    const nextDay = Math.min(parsed.day, jalaaliMonthLength(nextYear, nextMonth));
    const gregorian = toGregorian(nextYear, nextMonth, nextDay);

    return formatJalaliDate(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
  }

  const baseDate = toDateFromJalali(value);
  if (!baseDate) return '';

  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + offset * normalizedPeriod);
  return formatJalaliDate(nextDate);
}

export function distributeAmount(total: number, count: number) {
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, index) => base + (index === count - 1 ? remainder : 0));
}

export function buildRegularDueItems(input: {
  activeTab: string;
  title: string;
  totalAmount: number;
  count: number;
  startDate: string;
  frequency: DueFrequency;
  period?: number;
  idPrefix?: string;
}) {
  const { activeTab, title, totalAmount, count, startDate, frequency, period = 1, idPrefix = `due-${Date.now()}` } = input;
  const distributedAmounts = distributeAmount(totalAmount, count);

  return distributedAmounts.map((amount, index) => ({
    id: `${idPrefix}-${index}`,
    categoryId: activeTab,
    title: `${title.trim()} ${index + 1}`,
    amount,
    dueDate: addIntervalToDate(startDate, index, frequency, period),
  }));
}

export function normalizeFinancialCategories(categories: any[]): NormalizedFinancialCategory[] {
  const seen = new Set<string>();

  return (categories ?? [])
    .filter((item) => item && typeof item.id === 'string' && item.id.trim() && typeof item.name === 'string' && item.name.trim())
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => {
      const capAmount = toNumber(item.capAmount);
      const requiresDue = item.requiresDue !== false;
      return {
        id: item.id,
        name: item.name.trim(),
        capAmount,
        dueAmount: requiresDue ? capAmount : 0,
        noDueAmount: requiresDue ? 0 : capAmount,
        system: Boolean(item.system),
        requiresDue,
      };
    });
}

export function normalizeFinancialDueItems(dueItems: any[], validCategoryIds: Set<string>): NormalizedFinancialDueItem[] {
  return (dueItems ?? [])
    .filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        item.id.trim() &&
        typeof item.categoryId === 'string' &&
        validCategoryIds.has(item.categoryId) &&
        typeof item.title === 'string' &&
        item.title.trim() &&
        typeof item.dueDate === 'string' &&
        item.dueDate.trim(),
    )
    .map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      title: item.title.trim(),
      amount: toNumber(item.amount),
      dueDate: item.dueDate.trim(),
    }))
    .filter((item) => item.amount > 0);
}
