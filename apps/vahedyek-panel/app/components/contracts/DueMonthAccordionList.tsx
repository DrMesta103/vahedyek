'use client';

import { CalendarDays, ChevronDown, Eye, ReceiptText } from 'lucide-react';
import type { DueReceiptAllocationSummary } from '../../lib/contractReceiptAllocation';
import type { PaymentHistoryDueRow, PaymentHistoryMonthBucket } from '../../lib/contractPaymentMonthBuckets';

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

export type DueRegisterReceiptPayload = {
  bucketKey: string;
  monthHeading: string;
  row: PaymentHistoryDueRow;
};

export function DueMonthAccordionList({
  buckets,
  collapsedMonths,
  toggleMonth,
  onRegisterReceipt,
  allocationByDueId,
  onViewReceipts,
}: {
  buckets: PaymentHistoryMonthBucket[];
  collapsedMonths: Set<string>;
  toggleMonth: (monthKey: string) => void;
  onRegisterReceipt?: (payload: DueRegisterReceiptPayload) => void;
  allocationByDueId?: Record<string, DueReceiptAllocationSummary>;
  onViewReceipts?: (payload: DueRegisterReceiptPayload, summary: DueReceiptAllocationSummary | undefined) => void;
}) {
  return (
    <>
      {buckets.map((bucket) => {
        const isOpen = !collapsedMonths.has(bucket.key);
        return (
          <div
            key={bucket.key}
            className="overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]"
          >
            <button
              type="button"
              onClick={() => toggleMonth(bucket.key)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-right transition hover:bg-slate-50/80 sm:items-center sm:px-5 sm:py-4"
            >
              <div className="order-1 flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex shrink-0 items-center gap-2">
                  <CalendarDays
                    className="h-5 w-5 shrink-0 text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]"
                    aria-hidden
                  />
                  <span className="text-[14px] font-black text-slate-900 sm:text-[15px]">{bucket.heading}</span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-slate-600 sm:gap-x-4 sm:text-[12px]">
                  <span>
                    مبلغ کل: <span className="font-black text-slate-900">{formatMoneyRial(bucket.totalRial)}</span>
                  </span>
                  <span>
                    جریمه: <span className="font-black text-slate-900">{bucket.penaltyRial > 0 ? formatMoneyRial(bucket.penaltyRial) : '-'}</span>
                  </span>
                  <span>
                    بدهی معوق:{' '}
                    <span className={`font-black ${bucket.overdueRial > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {bucket.overdueRial > 0 ? formatMoneyRial(bucket.overdueRial) : '-'}
                    </span>
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`order-2 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>

            {isOpen ? (
              <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-4 sm:px-5">
                <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">سررسیدها</div>
                <div className="mt-3 space-y-2.5">
                  {bucket.items.map((row, rowIdx) => {
                    const summary = allocationByDueId?.[row.id];
                    const paidRial = summary?.paidAmountRial ?? 0;
                    const remainingRial = summary?.remainingAmountRial ?? Math.max(0, Number(row.amount || 0));
                    const rowReceipts = summary?.receipts ?? [];
                    const payload = { bucketKey: bucket.key, monthHeading: bucket.heading, row };

                    return (
                      <div
                        key={row.id.trim() ? row.id : `${bucket.key}-${rowIdx}-${row.dueDate}`}
                        className="rounded-2xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-sm sm:px-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-black text-slate-900">{row.title}</div>
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-500">
                              <span>{row.categoryTitle}</span>
                              {row.sourceKind === 'penalty' ? (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="font-bold text-rose-600">جریمه</span>
                                </>
                              ) : null}
                              <span className="text-slate-300">·</span>
                              <span>سررسید: {row.dueDate}</span>
                              {row.isOverdueUnpaid ? (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="font-bold text-rose-600">سررسید گذشته</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                          <div className="shrink-0 text-left sm:text-right">
                            <div className="text-[10px] font-bold text-slate-500">مبلغ سررسید</div>
                            <div className="mt-0.5 text-[14px] font-black tabular-nums text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]">
                              {formatMoneyRial(row.amount)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/55 px-3 py-2.5 sm:grid-cols-3">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">پرداختی</div>
                            <div className="mt-0.5 text-[12px] font-black tabular-nums text-emerald-700">{formatMoneyRial(paidRial)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">مانده</div>
                            <div className="mt-0.5 text-[12px] font-black tabular-nums text-slate-900">{formatMoneyRial(remainingRial)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">فیش‌های تخصیص‌یافته</div>
                            <div className="mt-0.5 text-[12px] font-black tabular-nums text-slate-900">
                              {rowReceipts.length.toLocaleString('fa-IR')} فیش
                            </div>
                          </div>
                        </div>

                        {onRegisterReceipt || onViewReceipts ? (
                          <div className="mt-2.5 flex w-full flex-wrap justify-end gap-2">
                            {onViewReceipts ? (
                              <button
                                type="button"
                                onClick={() => onViewReceipts(payload, summary)}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-[5px] text-[10px] font-black leading-none text-slate-700 shadow-sm transition hover:bg-slate-50"
                              >
                                <Eye className="h-[13px] w-[13px] shrink-0" aria-hidden />
                                مشاهده فیش‌ها
                              </button>
                            ) : null}
                            {onRegisterReceipt ? (
                              <button
                                type="button"
                                onClick={() => onRegisterReceipt(payload)}
                                title="ثبت فیش واریزی برای همین سررسید"
                                className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_92%,black),color-mix(in_srgb,var(--dark-teal)_78%,#0f766e))] px-2.5 py-[5px] text-[10px] font-black leading-none text-white shadow-[0_1px_3px_-1px_rgba(15,23,42,0.35)] outline-none ring-1 ring-black/10 transition hover:brightness-[1.07] active:brightness-95 focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] focus-visible:ring-offset-2"
                              >
                                <ReceiptText className="h-[13px] w-[13px] shrink-0 text-white/95" aria-hidden />
                                ثبت فیش
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
