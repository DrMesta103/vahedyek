'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, ReceiptText, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { DueMonthAccordionList, type DueRegisterReceiptPayload } from '../../../../components/contracts/DueMonthAccordionList';
import { RegisterReceiptDialog } from '../../../../components/contracts/RegisterReceiptDialog';
import { buildReceiptAllocation, type DueReceiptAllocationSummary } from '../../../../lib/contractReceiptAllocation';
import { getReceiptsStorageKey, normalizeReceiptRecords, type RegisteredReceiptRecord } from '../../../../lib/contractReceipts';
import { getContractDetails } from '../../../../lib/contractDraftClient';
import { buildPaymentHistoryMonthBuckets } from '../../../../lib/contractPaymentMonthBuckets';
import { estimateContractPenaltiesTotalRial } from '../../../../lib/estimateContractPenalties';

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

const TT_CONTRACT_BASE_EX_PENALTY =
  'سقف مالی قرارداد بر پایه مبلغ اصل ثبت‌شده یا محاسبه متراژ/مبلغ ثابت است؛ جریمه در این رقم لحاظ نشده است.';

const TT_PAID_EX_PENALTY =
  'جمع پرداخت‌های قراردادی به‌استثنای جریمه؛ پس از اتصال API از سرور خوانده می‌شود.';

const TT_PENALTY_TOTAL =
  'جمع پیشنهادی از روی قوانین فعال ذخیره‌شده برای این قرارداد؛ محاسبه قطعی روزشمار نیست.';

const TT_PENALTY_PAID =
  'مجموع پرداخت‌های مربوط به جریمه؛ پس از اتصال API از سرور بارگذاری می‌شود.';

const TT_TOTAL_DEBT =
  'جمع مانده تخمینی شامل مانده اصل قرارداد و مانده جریمه است؛ پس از اتصال سیستم پرداخت دقیق می‌شود.';

type ReceiptDetailsState = {
  payload: DueRegisterReceiptPayload;
  receipts: RegisteredReceiptRecord[];
  summary?: DueReceiptAllocationSummary;
} | null;

export default function ContractDuesPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [toast, setToast] = useState('');
  const [registerReceiptContext, setRegisterReceiptContext] = useState<DueRegisterReceiptPayload | null>(null);
  const [autoReceiptOpen, setAutoReceiptOpen] = useState(false);
  const [registeredReceipts, setRegisteredReceipts] = useState<RegisteredReceiptRecord[]>([]);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetailsState>(null);

  const listQuery = searchParams?.toString();
  const receiptRowId = searchParams?.get('receiptRowId') ?? '';

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
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

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

  useEffect(() => {
    if (!receiptRowId || registerReceiptContext || paymentMonthBuckets.length === 0) return;

    for (const bucket of paymentMonthBuckets) {
      const row = bucket.items.find((item) => item.id === receiptRowId);
      if (!row) continue;
      setRegisterReceiptContext({ bucketKey: bucket.key, monthHeading: bucket.heading, row });

      const next = new URLSearchParams(searchParams?.toString() ?? '');
      next.delete('receiptRowId');
      const q = next.toString();
      router.replace(`/contracts/${String(contractId)}/dues${q ? `?${q}` : ''}`, { scroll: false });
      return;
    }
  }, [contractId, paymentMonthBuckets, receiptRowId, registerReceiptContext, router, searchParams]);

  const duesTotals = useMemo(() => {
    const financial = contract?.data?.financial as
      | {
          pricingType?: string;
          unitArea?: string;
          parkingArea?: string;
          totalArea?: string;
          pricePerMeter?: string;
          parkingPricePerMeter?: string;
          fixedTotalAmount?: string;
        }
      | null
      | undefined;

    const parkingArea = Number(financial?.parkingArea || 0);
    const unitArea = Number(
      financial?.unitArea || Math.max(Number(financial?.totalArea || 0) - parkingArea, 0),
    );
    const amountFromPricing =
      financial?.pricingType === 'metered'
        ? unitArea * Number(financial?.pricePerMeter || 0) +
          parkingArea * Number(financial?.parkingPricePerMeter || 0)
        : Number(financial?.fixedTotalAmount || 0);

    const principal = (financialCategories as { id?: string; capAmount?: unknown }[]).find(
      (c) => c.id === 'principal',
    );
    const contractBaseExPenaltyRial = principal
      ? Number(principal.capAmount || 0)
      : Math.max(Math.round(amountFromPricing), 0);

    const penaltiesPayload = contract?.data?.penalties ?? null;
    const penaltyTotalRial = estimateContractPenaltiesTotalRial(
      contractBaseExPenaltyRial > 0 ? contractBaseExPenaltyRial : Math.max(Math.round(amountFromPricing), 1),
      penaltiesPayload,
    );

    const paidExPenaltyRial = null as number | null;
    const penaltyPaidRial = null as number | null;

    const paidEx = paidExPenaltyRial ?? 0;
    const penaltyPaid = penaltyPaidRial ?? 0;
    const remainingBaseExPenalty = Math.max(0, contractBaseExPenaltyRial - paidEx);
    const remainingPenalty = Math.max(0, penaltyTotalRial - penaltyPaid);
    const totalDebtRial = remainingBaseExPenalty + remainingPenalty;

    return {
      contractBaseExPenaltyRial,
      penaltyTotalRial,
      paidExPenaltyRial,
      penaltyPaidRial,
      totalDebtRial,
    };
  }, [contract?.data?.financial, contract?.data?.penalties, financialCategories]);

  const contractNumber =
    contract?.data?.subject && typeof contract.data.subject.contractNumber === 'string'
      ? contract.data.subject.contractNumber
      : '—';

  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setCollapsedMonths(new Set());
  }, [contractId]);

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  const handleRegisteredReceipt = (receipt: RegisteredReceiptRecord) => {
    setRegisteredReceipts((current) => {
      const next = [receipt, ...current];
      if (contractId && typeof window !== 'undefined') {
        window.localStorage.setItem(getReceiptsStorageKey(String(contractId)), JSON.stringify(next));
      }
      return next;
    });
    setToast('فیش ثبت شد و تخصیص آن بر اساس تاریخ و مبلغ محاسبه شد.');
  };

  const backHref = contractId ? `/contracts/${contractId}${listQuery ? `?${listQuery}` : ''}` : '/contracts';
  const receiptsHref = contractId
    ? `/contracts/${contractId}/dues/receipts${listQuery ? `?${listQuery}` : ''}`
    : '/contracts';

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0" dir="rtl" lang="fa">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
          >
            بازگشت به جزئیات قرارداد
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
          <div className="space-y-6">
            <section className="rounded-[22px] border border-slate-200/80 bg-white/90 px-5 py-4 text-right shadow-sm md:px-6 md:py-5">
              <div className="flex flex-wrap items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-[17px] font-black text-slate-900 md:text-[18px]">سررسیدها و فیش‌ها</h1>
                  <p className="mt-1 text-[12px] font-semibold text-slate-500">
                    قرارداد {contractNumber} — نمای ماهانه سررسیدها و فیش‌های واریزی همین قرارداد.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const q = searchParams?.toString();
                      router.push(`/contracts/${String(contractId)}/reports${q ? `?${q}` : ''}`);
                    }}
                    className="mt-3 text-[11px] font-black text-[color-mix(in_srgb,var(--dark-teal)_90%,black)] underline decoration-dotted underline-offset-4 hover:opacity-90"
                  >
                    رفتن به گزارشات قرارداد
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-5 text-right shadow-sm md:p-7">
              <div
                className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                role="group"
                aria-label="خلاصه مبلغ قرارداد، پرداخت، جریمه و مجموع بدهی"
              >
                <div
                  tabIndex={0}
                  className="rounded-2xl border border-slate-200/90 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_06%,white),white)] px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2"
                  title={TT_CONTRACT_BASE_EX_PENALTY}
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wide text-slate-500 underline decoration-dotted decoration-slate-300 underline-offset-2 cursor-help"
                    title={TT_CONTRACT_BASE_EX_PENALTY}
                  >
                    کل مبلغ قرارداد <span className="font-black text-slate-600">(به جز جریمه)</span>
                  </div>
                  <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">
                    {formatMoneyRial(duesTotals.contractBaseExPenaltyRial)}
                  </div>
                </div>
                <div
                  tabIndex={0}
                  className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2"
                  title={TT_PAID_EX_PENALTY}
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wide text-slate-500 underline decoration-dotted decoration-slate-300 underline-offset-2 cursor-help"
                    title={TT_PAID_EX_PENALTY}
                  >
                    کل پرداختی <span className="font-black text-slate-600">(به جز جریمه)</span>
                  </div>
                  <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">
                    {formatMoneyRial(duesTotals.paidExPenaltyRial ?? 0)}
                  </div>
                </div>
                <div
                  tabIndex={0}
                  className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2"
                  title={TT_PENALTY_TOTAL}
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wide text-slate-500 underline decoration-dotted decoration-slate-300 underline-offset-2 cursor-help"
                    title={TT_PENALTY_TOTAL}
                  >
                    مبلغ کل جریمه
                  </div>
                  <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">
                    {formatMoneyRial(duesTotals.penaltyTotalRial)}
                  </div>
                </div>
                <div
                  tabIndex={0}
                  className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2"
                  title={TT_PENALTY_PAID}
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wide text-slate-500 underline decoration-dotted decoration-slate-300 underline-offset-2 cursor-help"
                    title={TT_PENALTY_PAID}
                  >
                    مبلغ پرداختی جریمه
                  </div>
                  <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">
                    {formatMoneyRial(duesTotals.penaltyPaidRial ?? 0)}
                  </div>
                </div>
                <div
                  tabIndex={0}
                  className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-2"
                  title={TT_TOTAL_DEBT}
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wide text-rose-950/70 underline decoration-dotted decoration-rose-300 underline-offset-2 cursor-help"
                    title={TT_TOTAL_DEBT}
                  >
                    مجموع کلی بدهی
                  </div>
                  <div className="mt-1.5 text-[15px] font-black tabular-nums text-rose-950">
                    {formatMoneyRial(duesTotals.totalDebtRial)}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center px-1" dir="rtl">
                <button
                  type="button"
                  onClick={() => setAutoReceiptOpen(true)}
                  className="ml-2 inline-flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_92%,black),color-mix(in_srgb,var(--dark-teal)_78%,#0f766e))] px-6 py-2.5 text-[13px] font-black leading-snug text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2"
                >
                  ثبت فیش اتوماتیک
                  <ReceiptText className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => router.push(receiptsHref)}
                  className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-white px-6 py-2.5 text-[13px] font-black leading-snug text-[color-mix(in_srgb,var(--dark-teal)_88%,black)] shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2"
                  title="ثبت، مشاهده و مدیریت فیش‌های واریزی مشتری همین قرارداد"
                >
                  مدیریت فیش‌های مشتری
                  <ReceiptText className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
                </button>
              </div>

              <div className="border-b border-slate-100 pb-4">
                <div className="text-[15px] font-black text-slate-900">نمای ماهانه سررسیدها</div>
                <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                  داده از سررسیدهای ذخیره‌شده در بخش مالی قرارداد بارگذاری می‌شود. فیش‌های ثبت‌شده روی هر سررسید از همین بخش قابل مشاهده است.
                </p>
              </div>

              {paymentMonthBuckets.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-[13px] font-semibold text-slate-500">
                  برای این قرارداد هیچ ردیف سررسیدی در داده مالی ثبت نشده است.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <DueMonthAccordionList
                    buckets={paymentMonthBuckets}
                    collapsedMonths={collapsedMonths}
                    toggleMonth={toggleMonth}
                    onRegisterReceipt={setRegisterReceiptContext}
                    allocationByDueId={receiptAllocation.dueById}
                    onViewReceipts={(payload, summary) => setReceiptDetails({ payload, receipts: summary?.receipts ?? [], summary })}
                  />
                </div>
              )}
            </section>

          </div>
        )}

        <RegisterReceiptDialog
          open={registerReceiptContext !== null}
          context={registerReceiptContext}
          contractId={contractId ? String(contractId) : undefined}
          allocationMode="direct"
          onClose={() => setRegisterReceiptContext(null)}
          onSubmitted={handleRegisteredReceipt}
        />

        <RegisterReceiptDialog
          open={autoReceiptOpen}
          context={null}
          contractId={contractId ? String(contractId) : undefined}
          allocationMode="auto"
          onClose={() => setAutoReceiptOpen(false)}
          onSubmitted={handleRegisteredReceipt}
        />

        <ReceiptDetailsDialog state={receiptDetails} onClose={() => setReceiptDetails(null)} />

        {toast ? (
          <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4" dir="rtl">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-center text-sm font-bold text-slate-700 shadow-lg">
              {toast}
            </div>
          </div>
        ) : null}
      </main>
    </PanelLayout>
  );
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

function ReceiptSummaryCard({ label, value, tone }: { label: string; value: string; tone?: 'teal' }) {
  return (
    <div className={`rounded-2xl border px-4 py-3.5 shadow-sm ${tone === 'teal' ? 'border-[color-mix(in_srgb,var(--dark-teal)_22%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)]' : 'border-slate-200 bg-white'}`}>
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function ReceiptDetailsDialog({ state, onClose }: { state: ReceiptDetailsState; onClose: () => void }) {
  if (!state) return null;
  const totalPaid = state.receipts.reduce((sum, receipt) => sum + (Number(receipt.paidAmountRial) || 0), 0);
  const allocatedPaid = state.summary?.paidAmountRial ?? totalPaid;
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
                <div className="text-[13px] font-black text-slate-700">برای این سررسید هنوز فیشی ثبت نشده است.</div>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">از دکمه ثبت فیش همین سررسید برای اتصال فیش واریزی استفاده کنید.</p>
              </div>
            ) : state.receipts.map((receipt, index) => (
              (() => {
                const allocatedToDue = state.summary?.allocations
                  .filter((allocation) => allocation.receiptId === receipt.id)
                  .reduce((sum, allocation) => sum + allocation.amountRial, 0) ?? receipt.paidAmountRial;
                return (
              <article key={receipt.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-black text-slate-900">
                      فیش {Number(index + 1).toLocaleString('fa-IR')} · {transferKindLabel(receipt.transferKind)}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      ثبت: {new Date(receipt.createdAt).toLocaleDateString('fa-IR')} · واریز: {receipt.depositDate || '-'}
                    </div>
                  </div>
                  <div className="text-[15px] font-black text-emerald-700">{formatMoneyRial(allocatedToDue)}</div>
                </div>
                <div className="mt-3 grid gap-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">واریزکننده: {receipt.depositorName || '-'}</div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">دارنده مقصد: {receipt.destinationHolders.join('، ') || receipt.destinationHolder || '-'}</div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">مقصد: {receipt.destinationValue || '-'}</div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">شماره پیگیری/مرجع: {receipt.trackingNumber || receipt.referenceNumber || receipt.receiptNumber || '-'}</div>
                </div>
                {receipt.notes ? <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-5 text-slate-600">{receipt.notes}</p> : null}
                <div className="mt-3">
                  <div className="text-[11px] font-black text-slate-700">مدارک</div>
                  <div className="mt-2 space-y-2">
                    {receipt.documents.map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <div className="text-[12px] font-black text-slate-800">{doc.title}</div>
                        <div className="mt-1 text-[11px] font-semibold text-slate-500">
                          {doc.category || 'بدون دسته‌بندی'} · {doc.files.length.toLocaleString('fa-IR')} فایل
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
                );
              })()
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

