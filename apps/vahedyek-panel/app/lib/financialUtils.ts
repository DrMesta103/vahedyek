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

/** تشخیص تاریخ سررسید برای گزارش: شمسی /، شمسی -، یا میلادی ISO — برای آرشیو یا ورود دستی خارج از فرم. */
export function parseDueDateFlexible(value: string): { year: number; month: number; day: number } | null {
  const trimmedOrig = String(value ?? '').trim();
  if (!trimmedOrig) return null;
  const trimmed = normalizeDigits(trimmedOrig).replace(/\s+/g, '').replace(/,/g, '');

  // ISO Gregorian... (میلادی)
  let m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m && Number(m[1]) >= 1800 && Number(m[1]) <= 2300) {
    const gy = Number(m[1]);
    const gm = Number(m[2]);
    const gd = Number(m[3]);
    if (gy && gm >= 1 && gm <= 12 && gd >= 1 && gd <= 31) {
      const jal = toJalaali(gy, gm, gd);
      return { year: jal.jy, month: jal.jm, day: jal.jd };
    }
  }

  // شمسی با خط تیره 1404-6-15
  m = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[^\d].*)?$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (year >= 1200 && year <= 1600 && month >= 1 && month <= 12 && day >= 1 && day <= 31)
      return { year, month, day };
    if (year >= 1800 && year <= 2300 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const jal = toJalaali(year, month, day);
      return { year: jal.jy, month: jal.jm, day: jal.jd };
    }
  }

  const slashParts = trimmed.split('/');
  if (slashParts.length >= 3) {
    const year = Number(slashParts[0]);
    const month = Number(slashParts[1]);
    const day = Number(String(slashParts[2]).replace(/[^\d].*$/, '') || '');
    if (year >= 1200 && year <= 1600 && month >= 1 && month <= 12 && day >= 1 && day <= 31)
      return { year, month, day };
    if (year >= 1800 && year <= 2300 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const jal = toJalaali(year, month, day);
      return { year: jal.jy, month: jal.jm, day: jal.jd };
    }
  }

  const lo = parseJalaliDate(trimmedOrig);
  return lo;
}

export function toComparableDateFromDueString(value: string): Date | null {
  const parsed = parseDueDateFlexible(value);
  if (!parsed) return null;
  try {
    const gregorian = toGregorian(parsed.year, parsed.month, parsed.day);
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  } catch {
    return null;
  }
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

export const FINANCIAL_LINE_PREFIX = 'fin-line-';

const PRINCIPAL_CATEGORY_ID_GLOBAL = 'principal';

const FIN_LINE_SUB_RANK: Record<string, number> = {
  advance: 0,
  installment: 1,
  loan: 2,
  handover: 3,
  document: 4,
};

/** سطر «چتری» مبلغ یک خط پرداخت اضافی (مجموعهٔ ۵ زیرردیف) — خودش در جمع سقف قرارداد شمرده نمی‌شود */
export function isFinancialLineHeaderCategoryId(categoryId: string): boolean {
  return categoryId.startsWith(FINANCIAL_LINE_PREFIX) && !categoryId.includes(':');
}

/** سررسید‌دار؛ شناسهٔ زیرمجموعهٔ خط مثل fin-line-…:advance */
export function isFinancialLineSubtreeCategoryId(categoryId: string): boolean {
  if (!categoryId.startsWith(FINANCIAL_LINE_PREFIX) || !categoryId.includes(':')) return false;
  const suffix = categoryId.slice(categoryId.lastIndexOf(':') + 1);
  return FIN_LINE_SUB_RANK[suffix] !== undefined;
}

/** ردیف تک‌سطح legacy (قبل از fin-line)؛ مبلغش بخشی از تقسیم اصل نیست و نباید با سقف قرارداد جمع شود */
export function isLegacyCustomRootCategoryId(categoryId: string): boolean {
  return categoryId.startsWith('custom-') && !categoryId.includes(':');
}

export function shouldExcludeCategoryFromContractCapTotal(categoryId: string): boolean {
  return (
    categoryId === PRINCIPAL_CATEGORY_ID_GLOBAL ||
    isFinancialLineHeaderCategoryId(categoryId) ||
    isFinancialLineSubtreeCategoryId(categoryId) ||
    isLegacyCustomRootCategoryId(categoryId)
  );
}

/** جمع مبالغ ردیفی که برای مقایسه با مبلغ قرارداد کاربرد دارد (تقسیم اصل؛ بدون principal، خطوط تکمیلی fin-line و custom قدیمی) */
export function sumFinancialCapsCountedAgainstContractTotal<T extends { id: string; capAmount?: unknown }>(
  categories: T[],
): number {
  return categories.reduce((sum, item) => {
    if (shouldExcludeCategoryFromContractCapTotal(item.id)) return sum;
    const raw = item.capAmount;
    const cap =
      typeof raw === 'string' ? Number(String(raw).replace(/,/g, '')) : Number(raw ?? 0);
    return sum + (Number.isFinite(cap) ? cap : 0);
  }, 0);
}

export function sortFinancialCategoriesForPersistence<T extends { id: string }>(categories: T[]): T[] {
  const indexMap = new Map(categories.map((item, index) => [item.id, index]));

  const rank = (id: string): [number, number, number, string] => {
    if (id === PRINCIPAL_CATEGORY_ID_GLOBAL) return [0, 0, 0, id];
    const direct = FIN_LINE_SUB_RANK[id];
    if (direct !== undefined) return [1, direct, 0, id];
    if (isFinancialLineHeaderCategoryId(id)) return [2, indexMap.get(id) ?? 0, 0, id];
    const colon = id.lastIndexOf(':');
    if (colon > 0 && id.startsWith(FINANCIAL_LINE_PREFIX)) {
      const baseId = id.slice(0, colon);
      const suffix = id.slice(colon + 1);
      const sub = FIN_LINE_SUB_RANK[suffix];
      if (sub !== undefined) {
        return [3, indexMap.get(baseId) ?? 0, sub, id];
      }
    }
    if (id.startsWith('custom-')) return [4, indexMap.get(id) ?? 0, 0, id];
    return [5, indexMap.get(id) ?? 0, 0, id];
  };

  return [...categories].sort((a, b) => {
    const ra = rank(a.id);
    const rb = rank(b.id);
    for (let i = 0; i < 3; i += 1) {
      const ai = ra[i] as number;
      const bi = rb[i] as number;
      if (ai !== bi) return ai - bi;
    }
    return ra[3].localeCompare(rb[3]);
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
