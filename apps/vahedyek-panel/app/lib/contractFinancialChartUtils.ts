import { toJalaali } from 'jalaali-js';
import type { RegisteredReceiptRecord } from './contractReceipts';
import { toComparableDateFromDueString } from './financialUtils';

export type ChartTone = 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan';

export type InstallmentChartDatum = {
  key: 'paid' | 'future' | 'overdue' | 'partial';
  label: string;
  count: number;
  tone: ChartTone;
};

export type PaymentTrendPoint = {
  key: string;
  label: string;
  amountRial: number;
  sortTime: number;
};

function resolveTrendLabel(date: Date) {
  return new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function resolveJalaliMonthBucket(date: Date) {
  const jalali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const key = `${jalali.jy}-${String(jalali.jm).padStart(2, '0')}`;
  const sortTime = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  return { key, sortTime };
}

export function resolveReceiptTimelineDate(receipt: Pick<RegisteredReceiptRecord, 'depositDate' | 'createdAt'>): Date | null {
  const fromDepositDate =
    typeof receipt.depositDate === 'string' && receipt.depositDate.trim()
      ? toComparableDateFromDueString(receipt.depositDate.trim())
      : null;

  if (fromDepositDate) return fromDepositDate;

  if (typeof receipt.createdAt === 'string' && receipt.createdAt.trim()) {
    const parsed = new Date(receipt.createdAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

export function buildApprovedReceiptTrend(receipts: RegisteredReceiptRecord[]) {
  const approvedReceipts = receipts.filter((receipt) => receipt.reviewStatus === 'approved');
  const buckets = new Map<string, PaymentTrendPoint>();
  let missingTimelineCount = 0;

  for (const receipt of approvedReceipts) {
    const timelineDate = resolveReceiptTimelineDate(receipt);
    if (!timelineDate) {
      missingTimelineCount += 1;
      continue;
    }

    const { key, sortTime } = resolveJalaliMonthBucket(timelineDate);
    const existing = buckets.get(key);

    if (existing) {
      existing.amountRial += Math.max(0, Number(receipt.paidAmountRial ?? 0));
      continue;
    }

    buckets.set(key, {
      key,
      label: resolveTrendLabel(timelineDate),
      amountRial: Math.max(0, Number(receipt.paidAmountRial ?? 0)),
      sortTime,
    });
  }

  return {
    approvedReceiptCount: approvedReceipts.length,
    missingTimelineCount,
    points: Array.from(buckets.values()).sort((a, b) => a.sortTime - b.sortTime),
  };
}

export function buildInstallmentStatusItems(
  rows: Array<{ paidRial: number; remainingRial: number; dueDate: string | null | undefined }>,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = {
    paid: 0,
    future: 0,
    overdue: 0,
    partial: 0,
  };

  for (const row of rows) {
    const paidRial = Math.max(0, Number(row.paidRial ?? 0));
    const remainingRial = Math.max(0, Number(row.remainingRial ?? 0));
    const dueDate = row.dueDate ? toComparableDateFromDueString(row.dueDate) : null;
    const overdue = Boolean(dueDate && dueDate < today && remainingRial > 0);

    if (remainingRial <= 0) counts.paid += 1;
    else if (paidRial > 0) counts.partial += 1;
    else if (overdue) counts.overdue += 1;
    else counts.future += 1;
  }

  const items: InstallmentChartDatum[] = [
    { key: 'paid', label: 'پرداخت‌شده', count: counts.paid, tone: 'emerald' },
    { key: 'future', label: 'آینده', count: counts.future, tone: 'cyan' },
    { key: 'overdue', label: 'معوق', count: counts.overdue, tone: 'rose' },
    { key: 'partial', label: 'ناقص', count: counts.partial, tone: 'amber' },
  ];

  return {
    totalCount: rows.length,
    items,
  };
}
