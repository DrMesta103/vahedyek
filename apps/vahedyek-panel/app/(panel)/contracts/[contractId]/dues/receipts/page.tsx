'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ClipboardList, Eye, ReceiptText, Wallet, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../../components/PanelLayout';
import type { DueRegisterReceiptPayload } from '../../../../../components/contracts/DueMonthAccordionList';
import { RegisterReceiptDialog } from '../../../../../components/contracts/RegisterReceiptDialog';
import { buildReceiptAllocation, type DueReceiptAllocationSummary } from '../../../../../lib/contractReceiptAllocation';
import { getReceiptsStorageKey, normalizeReceiptRecords, type RegisteredReceiptRecord } from '../../../../../lib/contractReceipts';
import { getContractDetails } from '../../../../../lib/contractDraftClient';
import { buildPaymentHistoryMonthBuckets } from '../../../../../lib/contractPaymentMonthBuckets';

type ReceiptDetailsState = {
  payload: DueRegisterReceiptPayload;
  receipts: RegisteredReceiptRecord[];
  summary?: DueReceiptAllocationSummary;
} | null;

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

function transferKindLabel(kind: RegisteredReceiptRecord['transferKind']) {
  switch (kind) {
    case 'card_to_card':
      return 'کارت به کارت';
    case 'account_transfer':
      return 'حساب به حساب';
    case 'remittance':
      return 'حواله';
    case 'cheque':
      return 'چک';
    case 'cash':
      return 'نقد';
    default:
      return 'پرداخت';
  }
}

export default function CustomerReceiptsPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [registeredReceipts, setRegisteredReceipts] = useState<RegisteredReceiptRecord[]>([]);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetailsState>(null);
  const [autoReceiptOpen, setAutoReceiptOpen] = useState(false);

  const listQuery = searchParams?.toString();
  const duesHref = contractId ? `/contracts/${contractId}/dues${listQuery ? `?${listQuery}` : ''}` : '/contracts';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        setError('');
        const data = await getContractDetails(String(contractId));
        if (mounted) setContract(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'دریافت اطلاعات انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [contractId]);

  useEffect(() => {
    if (!contractId || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(getReceiptsStorageKey(String(contractId)));
      setRegisteredReceipts(normalizeReceiptRecords(raw ? JSON.parse(raw) : []));
    } catch {
      setRegisteredReceipts([]);
    }
  }, [contractId]);

  const financialCategories = Array.isArray(contract?.data?.financial?.categories)
    ? contract.data.financial.categories
    : [];
  const financialDueItems = Array.isArray(contract?.data?.financial?.dueItems)
    ? contract.data.financial.dueItems
    : [];

  const categoryTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of financialCategories as { id?: string; name?: string }[]) {
      m.set(String(c.id ?? ''), String(c.name ?? c.id ?? ''));
    }
    return m;
  }, [financialCategories]);

  const paymentMonthBuckets = useMemo(
    () => buildPaymentHistoryMonthBuckets({ dueItems: financialDueItems, categoryById: categoryTitleById }),
    [financialDueItems, categoryTitleById],
  );

  const receiptAllocation = useMemo(
    () => buildReceiptAllocation({ buckets: paymentMonthBuckets, receipts: registeredReceipts }),
    [paymentMonthBuckets, registeredReceipts],
  );

  const handleRegisteredReceipt = (receipt: RegisteredReceiptRecord) => {
    setRegisteredReceipts((current) => {
      const next = [receipt, ...current];
      if (contractId && typeof window !== 'undefined') {
        window.localStorage.setItem(getReceiptsStorageKey(String(contractId)), JSON.stringify(next));
      }
      return next;
    });
  };

  const openDueReceipts = (dueRowId: string) => {
    const summary = receiptAllocation.dueById[dueRowId];
    if (!summary) return;
    setReceiptDetails({
      payload: { bucketKey: '', monthHeading: '', row: summary.row },
      receipts: summary.receipts,
      summary,
    });
  };

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0" dir="rtl" lang="fa">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(duesHref)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
          >
            بازگشت به سررسیدها
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
            در حال بارگذاری...
          </section>
        ) : error || !contractId ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
            {error || 'شناسه قرارداد نامعتبر است.'}
          </section>
        ) : (
          <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-5 text-right shadow-sm md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[17px] font-black text-slate-900">
                  <ClipboardList className="h-5 w-5 text-[color-mix(in_srgb,var(--dark-teal)_86%,black)]" aria-hidden />
                  مدیریت فیش‌های مشتری
                </div>
                <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">
                  فیش‌ها به سررسید FK نمی‌شوند؛ تخصیص پرداخت در همین گزارش بر اساس تاریخ و مبلغ محاسبه می‌شود.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAutoReceiptOpen(true)}
                  className="rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_92%,black),color-mix(in_srgb,var(--dark-teal)_78%,#0f766e))] px-4 py-2 text-[12px] font-black text-white shadow-sm transition hover:brightness-105"
                >
                  ثبت فیش اتوماتیک
                </button>
                <button
                  type="button"
                  onClick={() => router.push(duesHref)}
                  className="rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_25%,#cbd5e1)] bg-white px-4 py-2 text-[12px] font-black text-[color-mix(in_srgb,var(--dark-teal)_88%,black)] transition hover:bg-slate-50"
                >
                  ثبت مستقیم از سررسیدها
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <ReceiptSummaryCard label="جمع فیش‌ها" value={formatMoneyRial(receiptAllocation.totalPaidRial)} tone="teal" />
              <ReceiptSummaryCard label="تخصیص به سررسیدها" value={formatMoneyRial(receiptAllocation.totalAllocatedRial)} />
              <ReceiptSummaryCard label="مانده سررسیدها" value={formatMoneyRial(receiptAllocation.totalRemainingRial)} />
              <ReceiptSummaryCard label="اعتبار کیف پول" value={formatMoneyRial(receiptAllocation.walletCreditRial)} tone="wallet" />
              <ReceiptSummaryCard label="تعداد فیش‌ها" value={`${registeredReceipts.length.toLocaleString('fa-IR')} فیش`} />
            </div>

            {registeredReceipts.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
                <ReceiptText className="mx-auto h-7 w-7 text-slate-400" aria-hidden />
                <div className="mt-3 text-[13px] font-black text-slate-700">هنوز فیشی ثبت نشده است.</div>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">برای ثبت مستقیم از صفحه سررسیدها یا برای ثبت اتوماتیک از دکمه همین صفحه استفاده کنید.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {receiptAllocation.receiptSummaries.map((summary) => {
                  const receipt = summary.receipt;
                  return (
                    <article key={receipt.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-black text-slate-900">
                              {receipt.allocationMode === 'auto' ? 'فیش اتوماتیک' : receipt.dueTitle || 'فیش مستقیم'}
                            </span>
                            <span className="rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] px-2 py-0.5 text-[10px] font-black text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">
                              {transferKindLabel(receipt.transferKind)}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
                              {receipt.allocationMode === 'auto' ? 'اتوماتیک' : 'مستقیم'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500">
                            <span>تاریخ تخصیص: {receipt.allocationDate || '-'}</span>
                            <span>·</span>
                            <span>واریزکننده: {receipt.depositorName || '-'}</span>
                            <span>·</span>
                            <span>تاریخ واریز: {receipt.depositDate || '-'}</span>
                            {receipt.depositTime ? <span>ساعت {receipt.depositTime}</span> : null}
                          </div>
                        </div>
                        <div className="shrink-0 text-right lg:text-left">
                          <div className="text-[10px] font-bold text-slate-500">مبلغ فیش</div>
                          <div className="mt-0.5 text-[15px] font-black text-emerald-700">{formatMoneyRial(receipt.paidAmountRial)}</div>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">تخصیص‌یافته: {formatMoneyRial(summary.allocatedAmountRial)}</div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">کیف پول: {formatMoneyRial(summary.walletAmountRial)}</div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">مدارک: {receipt.documents.reduce((sum, doc) => sum + doc.files.length, 0).toLocaleString('fa-IR')} فایل</div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <div className="text-[11px] font-black text-slate-700">تقسیم روی سررسیدها</div>
                        {summary.allocations.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {summary.allocations.map((allocation) => (
                              <button
                                key={`${allocation.receiptId}-${allocation.dueRowId}`}
                                type="button"
                                onClick={() => openDueReceipts(allocation.dueRowId)}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-700 transition hover:bg-slate-50"
                              >
                                <Eye className="h-3.5 w-3.5" aria-hidden />
                                {allocation.due.title}: {formatMoneyRial(allocation.amountRial)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <Wallet className="h-3.5 w-3.5" aria-hidden />
                            کل مبلغ این فیش به کیف پول منتقل شده است.
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <RegisterReceiptDialog
          open={autoReceiptOpen}
          context={null}
          contractId={contractId ? String(contractId) : undefined}
          allocationMode="auto"
          onClose={() => setAutoReceiptOpen(false)}
          onSubmitted={handleRegisteredReceipt}
        />

        <ReceiptDetailsDialog state={receiptDetails} onClose={() => setReceiptDetails(null)} />
      </main>
    </PanelLayout>
  );
}

function ReceiptSummaryCard({ label, value, tone }: { label: string; value: string; tone?: 'teal' | 'wallet' }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 shadow-sm ${
        tone === 'teal'
          ? 'border-[color-mix(in_srgb,var(--dark-teal)_22%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)]'
          : tone === 'wallet'
            ? 'border-amber-200 bg-amber-50/80'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function ReceiptDetailsDialog({ state, onClose }: { state: ReceiptDetailsState; onClose: () => void }) {
  if (!state) return null;
  const allocatedPaid = state.summary?.paidAmountRial ?? 0;
  const remaining = state.summary?.remainingAmountRial ?? Math.max(0, Number(state.payload.row.amount || 0) - allocatedPaid);

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" dir="rtl" role="dialog" aria-modal="true">
      <div className="flex max-h-[min(860px,calc(100vh-42px))] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/75 bg-white shadow-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-[15px] font-black text-slate-900">جزئیات فیش‌های سررسید</div>
            <div className="mt-1 text-[12px] font-semibold text-slate-500">
              {state.payload.row.title} · سررسید {state.payload.row.dueDate}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="بستن">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <ReceiptSummaryCard label="مبلغ سررسید" value={formatMoneyRial(state.payload.row.amount)} />
            <ReceiptSummaryCard label="پرداختی تخصیص‌یافته" value={formatMoneyRial(allocatedPaid)} tone="teal" />
            <ReceiptSummaryCard label="مانده" value={formatMoneyRial(remaining)} />
          </div>
          <div className="mt-4 space-y-3">
            {state.receipts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
                <div className="text-[13px] font-black text-slate-700">برای این سررسید هنوز فیشی تخصیص داده نشده است.</div>
              </div>
            ) : state.receipts.map((receipt, index) => {
              const allocatedToDue = state.summary?.allocations
                .filter((allocation) => allocation.receiptId === receipt.id)
                .reduce((sum, allocation) => sum + allocation.amountRial, 0) ?? 0;
              return (
                <article key={receipt.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-black text-slate-900">
                        فیش {Number(index + 1).toLocaleString('fa-IR')} · {transferKindLabel(receipt.transferKind)}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold text-slate-500">
                        تخصیص به این سررسید: {formatMoneyRial(allocatedToDue)} · واریز: {receipt.depositDate || '-'}
                      </div>
                    </div>
                    <div className="text-[15px] font-black text-emerald-700">{formatMoneyRial(allocatedToDue)}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
