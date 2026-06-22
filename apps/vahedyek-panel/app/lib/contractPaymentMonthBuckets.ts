import { parseDueDateFlexible, toComparableDateFromDueString } from './financialUtils';
import type { RegisteredReceiptRecord } from './contractReceipts';

export const PAYMENT_HISTORY_UNKNOWN_MONTH_KEY = '__UNKNOWN_DUE_MONTH__';

const JALALI_MONTH_NAMES_FA = [
  '',
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
];

function jalaliYearMonthHeading(year: number, month: number) {
  const name = JALALI_MONTH_NAMES_FA[month] ?? '—';
  return `${name} ${year.toLocaleString('fa-IR', { useGrouping: false })}`;
}

function paymentHistoryUnknownMonthHeading() {
  return 'بدون تاریخ سررسید قابل دسته‌بندی';
}

export type PaymentHistoryDueRow = {
  id: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  amount: number;
  dueDate: string;
  isOverdueUnpaid: boolean;
  sourceKind?: 'principal' | 'penalty';
  sourceId?: string;
  principalDueRowId?: string | null;
  penaltyRuleId?: string | null;
  penaltyTypeId?: string | null;
  forgivenRial?: number | null;
  claimableAmountRial?: number | null;
  forgivenessStatus?: 'applied' | 'pending' | 'inactive';
};

export type PaymentHistoryMonthBucket = {
  key: string;
  sortKey: number;
  jalaliYear: number;
  jalaliMonth: number;
  heading: string;
  items: PaymentHistoryDueRow[];
  totalRial: number;
  overdueRial: number;
  penaltyRial: number;
};

type BucketAcc = {
  jalaliYear: number;
  jalaliMonth: number;
  sortKey: number;
  items: PaymentHistoryDueRow[];
  totalRial: number;
  overdueRial: number;
  penaltyRial: number;
};

function buildMonthBucketsFromRows(rows: PaymentHistoryDueRow[]) {
  const byKey = new Map<string, BucketAcc>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const row of rows) {
    const amount = Math.max(0, Math.round(Number(row.claimableAmountRial ?? row.amount) || 0));
    const dueDateRaw = String(row.dueDate ?? '').trim();
    const parsedYm = dueDateRaw ? parseDueDateFlexible(dueDateRaw) : null;
    const key = parsedYm ? `${parsedYm.year}-${String(parsedYm.month).padStart(2, '0')}` : PAYMENT_HISTORY_UNKNOWN_MONTH_KEY;
    const dueEnd = dueDateRaw ? toComparableDateFromDueString(dueDateRaw) : null;
    const isOverdue = Boolean(dueEnd && dueEnd < today);

    let acc = byKey.get(key);
    if (!acc) {
      acc = parsedYm
        ? {
            jalaliYear: parsedYm.year,
            jalaliMonth: parsedYm.month,
            sortKey: parsedYm.year * 100 + parsedYm.month,
            items: [],
            totalRial: 0,
            overdueRial: 0,
            penaltyRial: 0,
          }
        : {
            jalaliYear: 0,
            jalaliMonth: 0,
            sortKey: 9_999_999,
            items: [],
            totalRial: 0,
            overdueRial: 0,
            penaltyRial: 0,
          };
      byKey.set(key, acc);
    }

    const normalizedRow: PaymentHistoryDueRow = {
      ...row,
      amount,
      dueDate: dueDateRaw || '—',
      isOverdueUnpaid: row.isOverdueUnpaid ?? isOverdue,
    };

    acc.items.push(normalizedRow);
    acc.totalRial += amount;
    if (normalizedRow.isOverdueUnpaid) acc.overdueRial += amount;
    if (normalizedRow.sourceKind === 'penalty') acc.penaltyRial += amount;
  }

  const sorted = [...byKey.entries()].sort((a, b) => {
    if (a[0] === PAYMENT_HISTORY_UNKNOWN_MONTH_KEY) return 1;
    if (b[0] === PAYMENT_HISTORY_UNKNOWN_MONTH_KEY) return -1;
    return a[1].sortKey - b[1].sortKey;
  });

  return sorted.map(([key, acc]) => {
    acc.items.sort((a, b) => {
      const da = toComparableDateFromDueString(a.dueDate)?.getTime() ?? 9e12;
      const db = toComparableDateFromDueString(b.dueDate)?.getTime() ?? 9e12;
      if (da !== db) return da - db;
      if ((a.sourceKind ?? 'principal') !== (b.sourceKind ?? 'principal')) {
        return (a.sourceKind ?? 'principal') === 'principal' ? -1 : 1;
      }
      return String(a.id).localeCompare(String(b.id));
    });

    return {
      key,
      sortKey: acc.sortKey,
      jalaliYear: acc.jalaliYear,
      jalaliMonth: acc.jalaliMonth,
      heading:
        key === PAYMENT_HISTORY_UNKNOWN_MONTH_KEY
          ? paymentHistoryUnknownMonthHeading()
          : jalaliYearMonthHeading(acc.jalaliYear, acc.jalaliMonth),
      items: acc.items,
      totalRial: acc.totalRial,
      overdueRial: acc.overdueRial,
      penaltyRial: acc.penaltyRial,
    } satisfies PaymentHistoryMonthBucket;
  });
}

export function buildPaymentHistoryMonthBuckets(params: {
  dueItems: unknown[];
  categoryById: Map<string, string>;
}) {
  const rows: PaymentHistoryDueRow[] = [];

  for (const raw of params.dueItems) {
    if (!raw || typeof raw !== 'object') continue;
    const amountNum = Number((raw as { amount?: unknown }).amount ?? 0);
    const amount = Number.isFinite(amountNum) ? Math.round(amountNum) : 0;
    const dueDateRaw = String((raw as { dueDate?: unknown }).dueDate ?? '').trim();
    const dueEnd = dueDateRaw ? toComparableDateFromDueString(dueDateRaw) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rows.push({
      id: String((raw as { id?: unknown }).id ?? ''),
      categoryId: String((raw as { categoryId?: unknown }).categoryId ?? ''),
      categoryTitle:
        params.categoryById.get(String((raw as { categoryId?: unknown }).categoryId ?? '')) ??
        String((raw as { categoryId?: unknown }).categoryId ?? '—'),
      title: String((raw as { title?: unknown }).title ?? '').trim() || '—',
      amount,
      dueDate: dueDateRaw || '—',
      isOverdueUnpaid: Boolean(dueEnd && dueEnd < today),
      sourceKind: 'principal',
      sourceId: String((raw as { id?: unknown }).id ?? ''),
      principalDueRowId: null,
      penaltyRuleId: null,
      penaltyTypeId: null,
    });
  }

  return buildMonthBucketsFromRows(rows);
}

export function buildPaymentHistoryMonthBucketsFromRows(rows: PaymentHistoryDueRow[]) {
  return buildMonthBucketsFromRows(rows);
}

export function resolveDueRegisterPayload(
  receipt: RegisteredReceiptRecord,
  buckets: PaymentHistoryMonthBucket[],
): { bucketKey: string; monthHeading: string; row: PaymentHistoryDueRow } | null {
  if (receipt.allocationMode !== 'direct') return null;
  const dueId = receipt.dueRowId?.trim();
  if (!dueId) return null;
  for (const bucket of buckets) {
    const row = bucket.items.find((item) => item.id === dueId);
    if (row) return { bucketKey: bucket.key, monthHeading: bucket.heading, row };
  }
  return null;
}
