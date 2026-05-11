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
};

export function buildPaymentHistoryMonthBuckets(params: {
  dueItems: unknown[];
  categoryById: Map<string, string>;
}): PaymentHistoryMonthBucket[] {
  const { dueItems, categoryById } = params;

  type Acc = {
    jalaliYear: number;
    jalaliMonth: number;
    sortKey: number;
    items: PaymentHistoryDueRow[];
    totalRial: number;
    overdueRial: number;
  };

  const byKey = new Map<string, Acc>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const raw of dueItems) {
    if (!raw || typeof raw !== 'object') continue;

    const amountNum = Number((raw as any).amount ?? 0);
    const amount = Number.isFinite(amountNum) ? Math.round(amountNum) : 0;

    const dueDateRaw = String((raw as any).dueDate ?? '').trim();
    const parsedYm = dueDateRaw ? parseDueDateFlexible(dueDateRaw) : null;

    const key = parsedYm
      ? `${parsedYm.year}-${String(parsedYm.month).padStart(2, '0')}`
      : PAYMENT_HISTORY_UNKNOWN_MONTH_KEY;

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
          }
        : {
            jalaliYear: 0,
            jalaliMonth: 0,
            sortKey: 9_999_999,
            items: [],
            totalRial: 0,
            overdueRial: 0,
          };
      byKey.set(key, acc);
    }

    acc.totalRial += amount;
    if (isOverdue) acc.overdueRial += Math.max(amount, 0);

    acc.items.push({
      id: String((raw as any).id ?? ''),
      categoryId: String((raw as any).categoryId ?? ''),
      categoryTitle: categoryById.get(String((raw as any).categoryId ?? '')) ?? String((raw as any).categoryId ?? '—'),
      title: String((raw as any).title ?? '').trim() || '—',
      amount,
      dueDate: dueDateRaw || '—',
      isOverdueUnpaid: isOverdue,
    });
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
      return da - db;
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
    };
  });
}

/** Resolve UI payload for «ثبت فیش مستقیم» when editing a receipt that has `dueRowId`. */
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
