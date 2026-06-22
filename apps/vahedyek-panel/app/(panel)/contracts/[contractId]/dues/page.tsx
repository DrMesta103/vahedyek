'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Pencil, ReceiptText, Trash2, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { DueMonthAccordionList, type DueRegisterReceiptPayload } from '../../../../components/contracts/DueMonthAccordionList';
import {
  PenaltyCalculationBody,
  PenaltyDetailsDialog,
  PenaltyInfoButton,
  type PenaltyDetailsDialogState,
} from '../../../../components/contracts/PenaltyDetailsDialog';
import { RegisterReceiptDialog } from '../../../../components/contracts/RegisterReceiptDialog';
import { useAppToast } from '../../../../components/feedback/AppToastProvider';
import { buildReceiptAllocation, type DueReceiptAllocationSummary } from '../../../../lib/contractReceiptAllocation';
import {
  getReceiptsStorageKey,
  normalizeReceiptRecords,
  removeReceiptFromList,
  upsertReceiptInList,
  type RegisteredReceiptRecord,
} from '../../../../lib/contractReceipts';
import { getContractDetails } from '../../../../lib/contractDraftClient';
import { resolveDueRegisterPayload } from '../../../../lib/contractPaymentMonthBuckets';
import { buildContractPenaltyTimeline } from '../../../../lib/contractPenaltyEngine';
import type { BuyerPenaltyCalculationDetail } from '../../../../lib/buyerPenaltyCalculation';
import type { PaymentHistoryMonthBucket } from '../../../../lib/contractPaymentMonthBuckets';

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

const TT_CONTRACT_BASE_EX_PENALTY =
  'سقف مالی قرارداد بر پایه مبلغ اصل ثبت‌شده یا محاسبه متراژ/مبلغ ثابت است؛ جریمه در این رقم لحاظ نشده است.';

const TT_PAID_EX_PENALTY =
  'جمع پرداخت‌هایی که روی ردیف‌های اصل بدهی تخصیص یافته‌اند؛ پرداخت‌های تخصیص‌یافته به جریمه از این عدد جدا شده‌اند.';

const TT_PENALTY_TOTAL =
  'جمع جریمه قابل وصول قرارداد پس از اعمال بخشودگی‌های ثبت‌شده، بر اساس سررسیدهای واقعی و مهلت تنفس تا تاریخ امروز.';

const TT_PENALTY_PAYABLE =
  'مانده جریمه قابل وصول پس از کسر پرداخت‌های تخصیص‌یافته به ردیف‌های جریمه.';

const TT_PENALTY_PAID =
  'مجموع پرداخت‌هایی که در تخصیص زمانی روی ردیف‌های جریمه نشسته‌اند.';

const TT_TOTAL_DEBT =
  'جمع مانده همه ردیف‌های اصل بدهی و جریمه پس از تخصیص فیش‌ها روی timeline مشترک.';

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
  const [registerReceiptContext, setRegisterReceiptContext] = useState<DueRegisterReceiptPayload | null>(null);
  const [autoReceiptOpen, setAutoReceiptOpen] = useState(false);
  const [registeredReceipts, setRegisteredReceipts] = useState<RegisteredReceiptRecord[]>([]);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetailsState>(null);
  const [penaltyDetailsState, setPenaltyDetailsState] = useState<PenaltyDetailsDialogState>(null);
  const [editingReceipt, setEditingReceipt] = useState<RegisteredReceiptRecord | null>(null);
  const [editingDueContext, setEditingDueContext] = useState<DueRegisterReceiptPayload | null>(null);
  const { showError, showSuccess } = useAppToast();

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
    if (!contractId || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(getReceiptsStorageKey(String(contractId)));
      setRegisteredReceipts(normalizeReceiptRecords(raw ? JSON.parse(raw) : []));
    } catch {
      setRegisteredReceipts([]);
    }
  }, [contractId]);

  const penaltyTimeline = useMemo(
    () =>
      buildContractPenaltyTimeline({
        financial: contract?.data?.financial ?? null,
        penalties: contract?.data?.penalties ?? null,
        receipts: registeredReceipts,
        forgiveness: contract?.data?.ruleSettings?.forgiveness ?? null,
      }),
    [contract?.data?.financial, contract?.data?.penalties, contract?.data?.ruleSettings?.forgiveness, registeredReceipts],
  );

  const paymentMonthBuckets = penaltyTimeline.combinedBuckets;

  const receiptAllocation = useMemo(
    () => buildReceiptAllocation({ buckets: paymentMonthBuckets, receipts: registeredReceipts }),
    [paymentMonthBuckets, registeredReceipts],
  );

  const editReceiptContextResolved = useMemo((): DueRegisterReceiptPayload | null => {
    if (!editingReceipt) return null;
    if (editingReceipt.allocationMode !== 'direct') return null;
    if (editingDueContext) return editingDueContext;
    return resolveDueRegisterPayload(editingReceipt, paymentMonthBuckets);
  }, [editingReceipt, editingDueContext, paymentMonthBuckets]);

  useEffect(() => {
    if (!editingReceipt || editingReceipt.allocationMode !== 'direct') return;
    if (editReceiptContextResolved) return;
    showError('سررسید این فیش در قرارداد نیست؛ امکان ویرایش نیست.');
    setEditingReceipt(null);
    setEditingDueContext(null);
  }, [editingReceipt, editReceiptContextResolved, showError]);

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
    const principalPaidRial = Object.values(receiptAllocation.dueById)
      .filter((summary) => summary.row.sourceKind !== 'penalty')
      .reduce((sum, summary) => sum + summary.paidAmountRial, 0);
    const penaltyPaidRial = Object.values(receiptAllocation.dueById)
      .filter((summary) => summary.row.sourceKind === 'penalty')
      .reduce((sum, summary) => sum + summary.paidAmountRial, 0);
    const penaltyTotalRial = penaltyTimeline.penaltyRows.reduce(
      (sum, row) => sum + Math.max(0, Number(row.claimableAmountRial ?? row.amount ?? 0)),
      0,
    );
    const penaltyRemainingRial = Object.values(receiptAllocation.dueById)
      .filter((summary) => summary.row.sourceKind === 'penalty')
      .reduce((sum, summary) => sum + summary.remainingAmountRial, 0);

    return {
      contractBaseExPenaltyRial: penaltyTimeline.contractBaseTotalRial,
      penaltyTotalRial,
      penaltyPayableRial: penaltyRemainingRial,
      paidExPenaltyRial: principalPaidRial,
      penaltyPaidRial,
      totalDebtRial: receiptAllocation.totalRemainingRial,
    };
  }, [penaltyTimeline, receiptAllocation]);

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

  const handleReceiptUpsert = (receipt: RegisteredReceiptRecord) => {
    setRegisteredReceipts((current) => {
      const existed = current.some((r) => r.id === receipt.id);
      const next = upsertReceiptInList(current, receipt);
      if (contractId && typeof window !== 'undefined') {
        window.localStorage.setItem(getReceiptsStorageKey(String(contractId)), JSON.stringify(next));
      }
      queueMicrotask(() =>
        showSuccess(existed ? 'فیش به‌روزرسانی شد.' : 'فیش ثبت شد و تخصیص آن بر اساس تاریخ و مبلغ محاسبه شد.'),
      );
      return next;
    });
    setEditingReceipt(null);
    setEditingDueContext(null);
    setRegisterReceiptContext(null);
    setAutoReceiptOpen(false);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('این فیش حذف شود؟')) return;
    setRegisteredReceipts((current) => {
      const next = removeReceiptFromList(current, receiptId);
      if (contractId && typeof window !== 'undefined') {
        window.localStorage.setItem(getReceiptsStorageKey(String(contractId)), JSON.stringify(next));
      }
      return next;
    });
    setReceiptDetails(null);
    setEditingReceipt(null);
    setEditingDueContext(null);
    showSuccess('فیش حذف شد.');
  };

  const openPenaltyDetails = (payload: {
    mode: 'single' | 'monthly';
    monthHeading?: string;
    row?: { id: string; title: string };
    bucket?: PaymentHistoryMonthBucket;
  }) => {
    if (payload.mode === 'single' && payload.row) {
      const detail = penaltyTimeline.penaltyDetailsByPrincipalDueId[payload.row.id];
      if (!detail) {
        showError('جزئیات جریمه برای این سررسید در دسترس نیست.');
        return;
      }
      setPenaltyDetailsState({
        mode: 'single',
        title: 'جزئیات جریمه سررسید',
        subtitle: `${payload.row.title} · سررسید ${detail.dueDate}`,
        detail,
      });
      return;
    }

    if (payload.mode === 'monthly' && payload.bucket) {
      const details = payload.bucket.items
        .filter((row) => (row.sourceKind ?? 'principal') !== 'penalty')
        .map((row) => ({
          title: row.title,
          detail: penaltyTimeline.penaltyDetailsByPrincipalDueId[row.id],
        }))
        .filter((item): item is { title: string; detail: NonNullable<typeof item.detail> } => Boolean(item.detail));

      if (details.length === 0) {
        setPenaltyDetailsState({
          mode: 'single',
          title: 'جزئیات جریمه ماهانه',
          subtitle: payload.monthHeading ?? payload.bucket.heading,
          detail: {
            principalDueId: '',
            penaltyTypeId: '',
            penaltyTypeTitle: '—',
            ruleId: '',
            ruleSettings: null,
            calculationMethod: 'fixed',
            period: 'daily',
            dueDate: '—',
            calculationDate: '—',
            rawDelayDays: 0,
            gracePeriodDays: 0,
            chargeableDelayDays: 0,
            periodCount: 0,
            overdueRemainingDebtRial: 0,
            totalMainContractAmountRial: 0,
            mainPenaltyCoreRawRial: 0,
            mainPenaltyCoreRoundedRial: 0,
            mainPenaltyRawRial: 0,
            mainPenaltyRoundedRial: 0,
            bankInterestRawRial: 0,
            bankInterestRoundedRial: 0,
            lateFeeType: null,
            lateFeeConfiguredValue: null,
            lateFeeBaseRial: 0,
            lateFeeRawRial: 0,
            lateFeeRoundedRial: 0,
            totalPenaltyRial: 0,
            totalCollectibleRial: 0,
            roundingRule: '0',
            lateFeeRoundingRule: '0',
            progressiveBreakdown: null,
            calculationNotes: [],
            zeroReason: 'برای سررسیدهای این ماه جریمه‌ای محاسبه نشده است.',
          },
        });
        return;
      }

      setPenaltyDetailsState({
        mode: 'monthly',
        title: 'جزئیات جریمه ماهانه',
        subtitle: payload.monthHeading ?? payload.bucket.heading,
        details,
      });
    }
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
                className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
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
                    {formatMoneyRial(duesTotals.paidExPenaltyRial)}
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
                  title={TT_PENALTY_PAYABLE}
                >
                  <div
                    className="text-[10px] font-black uppercase tracking-wide text-slate-500 underline decoration-dotted decoration-slate-300 underline-offset-2 cursor-help"
                    title={TT_PENALTY_PAYABLE}
                  >
                    جریمه قابل وصول
                  </div>
                  <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">
                    {formatMoneyRial(duesTotals.penaltyPayableRial)}
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
                    penaltyDetailsByPrincipalDueId={penaltyTimeline.penaltyDetailsByPrincipalDueId}
                    onOpenPenaltyDetails={openPenaltyDetails}
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
          onSubmitted={handleReceiptUpsert}
        />

        <RegisterReceiptDialog
          open={autoReceiptOpen}
          context={null}
          contractId={contractId ? String(contractId) : undefined}
          allocationMode="auto"
          onClose={() => setAutoReceiptOpen(false)}
          onSubmitted={handleReceiptUpsert}
        />

        <RegisterReceiptDialog
          open={
            editingReceipt !== null &&
            (editingReceipt.allocationMode === 'auto' || editReceiptContextResolved !== null)
          }
          context={editReceiptContextResolved}
          contractId={contractId ? String(contractId) : undefined}
          allocationMode={editingReceipt?.allocationMode ?? 'direct'}
          editReceipt={editingReceipt}
          onClose={() => {
            setEditingReceipt(null);
            setEditingDueContext(null);
          }}
          onSubmitted={handleReceiptUpsert}
        />

        <ReceiptDetailsDialog
          state={receiptDetails}
          penaltyDetail={
            receiptDetails?.payload.row.sourceKind !== 'penalty'
              ? penaltyTimeline.penaltyDetailsByPrincipalDueId[receiptDetails?.payload.row.id ?? '']
              : undefined
          }
          onOpenPenaltyDetails={() => {
            if (!receiptDetails?.payload.row.id) return;
            openPenaltyDetails({ mode: 'single', row: receiptDetails.payload.row });
          }}
          onClose={() => setReceiptDetails(null)}
          onEditReceipt={(receipt) => {
            if (!receiptDetails?.payload) return;
            setEditingDueContext(receiptDetails.payload);
            setEditingReceipt(receipt);
            setReceiptDetails(null);
          }}
          onDeleteReceipt={handleDeleteReceipt}
        />

        <PenaltyDetailsDialog state={penaltyDetailsState} onClose={() => setPenaltyDetailsState(null)} />
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

function ReceiptDetailsDialog({
  state,
  penaltyDetail,
  onOpenPenaltyDetails,
  onClose,
  onEditReceipt,
  onDeleteReceipt,
}: {
  state: ReceiptDetailsState;
  penaltyDetail?: BuyerPenaltyCalculationDetail;
  onOpenPenaltyDetails?: () => void;
  onClose: () => void;
  onEditReceipt?: (receipt: RegisteredReceiptRecord) => void;
  onDeleteReceipt?: (receiptId: string) => void;
}) {
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

          {penaltyDetail ? (
            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[12px] font-black text-rose-950">جزئیات جریمه این سررسید</div>
                {onOpenPenaltyDetails ? <PenaltyInfoButton onClick={onOpenPenaltyDetails} label="نمایش در پنجره جداگانه" /> : null}
              </div>
              <PenaltyCalculationBody detail={penaltyDetail} />
            </div>
          ) : null}

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
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <div className="text-[15px] font-black text-emerald-700">{formatMoneyRial(allocatedToDue)}</div>
                    {onEditReceipt && onDeleteReceipt ? (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditReceipt(receipt)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-[5px] text-[10px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          <Pencil className="h-3 w-3 shrink-0" aria-hidden />
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteReceipt(receipt.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-2.5 py-[5px] text-[10px] font-black text-rose-700 shadow-sm transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3 shrink-0" aria-hidden />
                          حذف
                        </button>
                      </div>
                    ) : null}
                  </div>
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
