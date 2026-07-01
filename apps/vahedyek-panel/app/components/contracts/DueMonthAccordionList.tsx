'use client';

import { CalendarDays, ChevronDown, Eye, ReceiptText } from 'lucide-react';
import type { BuyerPenaltyCalculationDetail } from '../../lib/buyerPenaltyCalculation';
import type { DueReceiptAllocationSummary } from '../../lib/contractReceiptAllocation';
import type { PaymentHistoryDueRow, PaymentHistoryMonthBucket } from '../../lib/contractPaymentMonthBuckets';
import { PenaltyInfoButton } from './PenaltyDetailsDialog';

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

export type DueRegisterReceiptPayload = {
  bucketKey: string;
  monthHeading: string;
  row: PaymentHistoryDueRow;
};

function monthPenaltyTotal(
  bucket: PaymentHistoryMonthBucket,
  penaltyDetailsByPrincipalDueId?: Record<string, BuyerPenaltyCalculationDetail>,
) {
  if (!penaltyDetailsByPrincipalDueId) return bucket.penaltyRial;
  return bucket.items
    .filter((row) => (row.sourceKind ?? 'principal') !== 'penalty')
    .reduce((sum, row) => sum + (penaltyDetailsByPrincipalDueId[row.id]?.totalPenaltyRial ?? 0), 0);
}

export function DueMonthAccordionList({
  buckets,
  collapsedMonths,
  toggleMonth,
  onRegisterReceipt,
  allocationByDueId,
  onViewReceipts,
  penaltyDetailsByPrincipalDueId,
  penaltyRowsByPrincipalDueId,
  onOpenPenaltyDetails,
}: {
  buckets: PaymentHistoryMonthBucket[];
  collapsedMonths: Set<string>;
  toggleMonth: (monthKey: string) => void;
  onRegisterReceipt?: (payload: DueRegisterReceiptPayload) => void;
  allocationByDueId?: Record<string, DueReceiptAllocationSummary>;
  onViewReceipts?: (payload: DueRegisterReceiptPayload, summary: DueReceiptAllocationSummary | undefined) => void;
  penaltyDetailsByPrincipalDueId?: Record<string, BuyerPenaltyCalculationDetail>;
  penaltyRowsByPrincipalDueId?: Record<
    string,
    {
      amount?: number | null;
      forgivenRial?: number | null;
      claimableAmountRial?: number | null;
      forgivenessStatus?: 'applied' | 'pending' | 'inactive';
    }
  >;
  onOpenPenaltyDetails?: (payload: {
    mode: 'single' | 'monthly';
    monthHeading?: string;
    row?: PaymentHistoryDueRow;
    bucket?: PaymentHistoryMonthBucket;
  }) => void;
}) {
  return (
    <>
      {buckets.map((bucket) => {
        const isOpen = !collapsedMonths.has(bucket.key);
        const monthPenaltyRial = monthPenaltyTotal(bucket, penaltyDetailsByPrincipalDueId);
        const principalItems = bucket.items.filter((row) => (row.sourceKind ?? 'principal') !== 'penalty');

        return (
          <div
            key={bucket.key}
            className="overflow-hidden rounded-[8px] border border-slate-200/90 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]"
          >
            <div className="flex w-full items-start gap-3 px-4 py-3.5 text-right sm:items-center sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={() => toggleMonth(bucket.key)}
                aria-expanded={isOpen}
                className="order-1 flex min-w-0 flex-1 flex-col gap-2 text-right transition hover:opacity-90 sm:flex-row sm:items-center sm:gap-4"
              >
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
                  <span className="inline-flex items-center gap-1">
                    جریمه:{' '}
                    <span className="font-black text-slate-900">
                      {monthPenaltyRial > 0 ? formatMoneyRial(monthPenaltyRial) : '-'}
                    </span>
                  </span>
                  <span>
                    بدهی معوق:{' '}
                    <span className={`font-black ${bucket.overdueRial > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {bucket.overdueRial > 0 ? formatMoneyRial(bucket.overdueRial) : '-'}
                    </span>
                  </span>
                </div>
              </button>
              {principalItems.some((row) => penaltyDetailsByPrincipalDueId?.[row.id]) && onOpenPenaltyDetails ? (
                <PenaltyInfoButton
                  onClick={() => onOpenPenaltyDetails({ mode: 'monthly', monthHeading: bucket.heading, bucket })}
                />
              ) : null}
              <button
                type="button"
                onClick={() => toggleMonth(bucket.key)}
                aria-expanded={isOpen}
                className="order-2 rounded-[8px] p-1 text-slate-400 transition hover:bg-slate-100"
                aria-label={isOpen ? 'بستن ماه' : 'باز کردن ماه'}
              >
                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
            </div>

            {isOpen ? (
              <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-4 sm:px-5">
                <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">سررسیدها</div>
                <div className="mt-3 space-y-2.5">
                  {principalItems.map((row, rowIdx) => {
                    const summary = allocationByDueId?.[row.id];
                    const paidRial = summary?.paidAmountRial ?? 0;
                    const remainingRial = summary?.remainingAmountRial ?? Math.max(0, Number(row.amount || 0));
                    const rowReceipts = summary?.receipts ?? [];
                    const penaltyDetail = penaltyDetailsByPrincipalDueId?.[row.id];
                    const penaltyRial = penaltyDetail?.totalPenaltyRial ?? 0;
                    const penaltyRow = penaltyRowsByPrincipalDueId?.[row.id] ?? null;
                    const forgivenRial = Math.max(0, Number(penaltyRow?.forgivenRial ?? 0));
                    const claimableRial = Math.max(
                      0,
                      Number(penaltyRow?.claimableAmountRial ?? penaltyRow?.amount ?? penaltyRial),
                    );
                    const payload = { bucketKey: bucket.key, monthHeading: bucket.heading, row };

                    return (
                      <div
                        key={row.id.trim() ? row.id : `${bucket.key}-${rowIdx}-${row.dueDate}`}
                        className="rounded-[8px] border border-slate-200/90 bg-white px-3.5 py-3 shadow-sm sm:px-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-black text-slate-900">{row.title}</div>
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-500">
                              <span>{row.categoryTitle}</span>
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

                        <div className="mt-3 grid gap-2 rounded-[8px] border border-slate-100 bg-slate-50/55 px-3 py-2.5 sm:grid-cols-4">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">پرداختی</div>
                            <div className="mt-0.5 text-[12px] font-black tabular-nums text-emerald-700">{formatMoneyRial(paidRial)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">مانده</div>
                            <div className="mt-0.5 text-[12px] font-black tabular-nums text-slate-900">{formatMoneyRial(remainingRial)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500">جریمه</div>
                            <div className="mt-0.5 space-y-1 text-[12px] font-black tabular-nums text-rose-700">
                              <div className="inline-flex items-center gap-1">
                                <span>{penaltyRial > 0 ? formatMoneyRial(penaltyRial) : '—'}</span>
                                {penaltyDetail && onOpenPenaltyDetails ? (
                                  <PenaltyInfoButton onClick={() => onOpenPenaltyDetails({ mode: 'single', row })} />
                                ) : null}
                              </div>
                              <div className="rounded-[8px] bg-slate-50 px-2 py-1 text-[10px] font-semibold leading-5 text-slate-600">
                                <div className="flex items-center justify-between gap-2">
                                  <span>بخشودگی</span>
                                  <span className="tabular-nums font-black text-slate-800">
                                    {penaltyRow?.forgivenessStatus === 'pending'
                                      ? 'در انتظار تایید'
                                      : forgivenRial > 0
                                        ? formatMoneyRial(forgivenRial)
                                        : '۰ ریال'}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                  <span>قابل مطالبه</span>
                                  <span className="tabular-nums font-black text-slate-800">{formatMoneyRial(claimableRial)}</span>
                                </div>
                              </div>
                            </div>
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


