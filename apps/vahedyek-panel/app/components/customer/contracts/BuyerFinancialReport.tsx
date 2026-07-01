'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ContractFinancialCharts from '../../contracts/financial-report/ContractFinancialCharts';
import { buildBuyerFinancialSummary, type BuyerFinancialSummary } from '../../../lib/contractBuyerFinancialSummary';
import { getContractDetails } from '../../../lib/contractDraftClient';
import { getReceiptsStorageKey, normalizeReceiptRecords } from '../../../lib/contractReceipts';

function formatMoneyRial(valueRial: number | null | undefined) {
  if (valueRial == null) return 'نامشخص';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

function SummaryCard({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: string;
  tone?: 'slate' | 'emerald' | 'amber' | 'rose' | 'cyan';
}) {
  const toneClasses: Record<typeof tone, string> = {
    slate: 'border-slate-200 bg-white text-slate-900',
    emerald: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
    amber: 'border-amber-200 bg-amber-50/70 text-amber-950',
    rose: 'border-rose-200 bg-rose-50/70 text-rose-950',
    cyan: 'border-cyan-200 bg-cyan-50/70 text-cyan-950',
  };

  return (
    <div className={`rounded-3xl border px-4 py-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="text-[11px] font-black opacity-75">{label}</div>
      <div className="mt-2 text-[18px] font-black leading-7">{value}</div>
    </div>
  );
}

export default function BuyerFinancialReport({ contractId }: { contractId: string }) {
  const [summary, setSummary] = useState<BuyerFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const contract = await getContractDetails(contractId, { view: 'buyer-safe' });
        const storedReceipts = typeof window === 'undefined' ? null : window.localStorage.getItem(getReceiptsStorageKey(contractId));
        let rawReceipts: unknown = [];
        try {
          rawReceipts = storedReceipts ? JSON.parse(storedReceipts) : [];
        } catch {
          rawReceipts = [];
        }
        const receipts = normalizeReceiptRecords(rawReceipts);

        if (!mounted) return;
        setSummary(buildBuyerFinancialSummary(contract, receipts));
      } catch (loadError) {
        if (!mounted) return;
        setSummary(null);
        setError(loadError instanceof Error ? loadError.message : 'خطا در بارگذاری گزارش مالی');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [contractId]);

  if (loading) {
    return (
      <div className="rounded-[8px] border border-slate-200 bg-white/95 p-10 text-center shadow-sm">
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#008080' }}></i>
        <p className="mt-4 text-sm font-semibold text-slate-500">در حال دریافت اطلاعات مالی قرارداد...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-[8px] border border-rose-200 bg-rose-50/90 p-8 text-right shadow-sm">
        <h3 className="text-lg font-black text-rose-900">گزارش مالی در دسترس نیست</h3>
        <p className="mt-2 text-sm font-semibold leading-7 text-rose-800">
          امکان نمایش نمودار مالی قرارداد در حال حاضر وجود ندارد. لطفاً بعداً دوباره بررسی کنید.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-[8px] border border-slate-200/80 bg-white/95 p-5 text-right shadow-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-900">
            نسخه خریدار
          </div>
          <h1 className="mt-3 text-2xl font-black text-slate-950">گزارش مالی قرارداد {summary.contractNumber}</h1>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
            {summary.contractDate} · {summary.contractTypeLabel} · {summary.unitLabel}
          </p>
        </div>

        <div className="max-w-xl rounded-[8px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-[12px] font-semibold leading-7 text-slate-600">
          این نسخه فقط اطلاعات مجاز خریدار را نشان می‌دهد. جزئیات داخلی، یادداشت محرمانه و تصمیم‌های بازبینی نمایش داده نمی‌شود.
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="مبلغ کل قرارداد" value={formatMoneyRial(summary.totalAmountRial)} />
        <SummaryCard label="پرداخت‌شده تأییدشده" value={formatMoneyRial(summary.confirmedPaidRial)} tone="emerald" />
        <SummaryCard label="در انتظار بررسی" value={formatMoneyRial(summary.pendingReviewRial)} tone="amber" />
        <SummaryCard label="مانده بدهی" value={formatMoneyRial(summary.remainingDebtRial)} tone="rose" />
        <SummaryCard label="مبلغ معوق" value={formatMoneyRial(summary.overdueDebtRial)} tone="rose" />
        <SummaryCard label="جریمه باز" value={formatMoneyRial(summary.openPenaltyRial)} tone="amber" />
        <SummaryCard
          label="وضعیت تسویه"
          value={summary.settlementStatus?.label ?? 'نامشخص'}
          tone={summary.settlementStatus?.tone ?? 'slate'}
        />
        <SummaryCard
          label="آمادگی مالی"
          value={summary.readinessStatus?.label ?? 'نامشخص'}
          tone={summary.readinessStatus?.tone ?? 'slate'}
        />
      </div>

      <ContractFinancialCharts
        className="mt-5"
        payment={{
          confirmedPaidRial: summary.charts.paymentBreakdown.confirmedPaidRial,
          pendingReviewRial: summary.charts.paymentBreakdown.pendingReviewRial,
          remainingDebtRial: summary.charts.paymentBreakdown.remainingDebtRial,
          settled: summary.charts.paymentBreakdown.settled,
          note: 'نسخه خریدار فقط اطلاعات مالی همین قرارداد را با داده‌های مجاز نمایش می‌دهد.',
        }}
        installments={{
          totalCount: summary.charts.installmentStatus.totalCount,
          items: summary.charts.installmentStatus.items,
          emptyMessage: 'برای این قرارداد هنوز برنامه اقساط قابل نمایش ثبت نشده است.',
          note: 'اقساط تغییر‌یافته با متمم فقط زمانی تفکیک می‌شوند که در داده فعلی قابل تشخیص باشند.',
        }}
        trend={{
          points: summary.charts.paymentTrend.points,
          approvedReceiptCount: summary.charts.paymentTrend.approvedReceiptCount,
          missingTimelineCount: summary.charts.paymentTrend.missingTimelineCount,
          emptyMessage: 'هنوز پرداخت تأییدشده‌ای برای این قرارداد ثبت نشده است.',
          note:
            summary.charts.paymentTrend.points.length > 0
              ? 'در این مرحله فقط روند پرداخت‌های تأییدشده نمایش داده می‌شود و مقایسه با برنامه پرداخت هنوز آماده نیست.'
              : 'در این مرحله فقط روند پرداخت‌های تأییدشده نمایش داده می‌شود.',
        }}
        penalties={{
          calculatedRial: summary.charts.penalties.calculatedRial,
          appliedRial: summary.charts.penalties.appliedRial,
          paidRial: summary.charts.penalties.paidRial,
          forgivenRial: summary.charts.penalties.forgivenRial,
          remainingRial: summary.charts.penalties.remainingRial,
          totalCount: summary.charts.penalties.totalCount,
          emptyMessage: 'برای این قرارداد جریمه‌ای ثبت یا اعمال نشده است.',
          note: 'جریمه بخشوده‌شده فقط در صورت وجود داده معتبر نمایش داده می‌شود.',
        }}
      />

      {summary.gaps.length > 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-amber-200 bg-amber-50/70 px-4 py-4">
          <div className="text-[13px] font-black text-amber-900">موارد نیازمند تکمیل اطلاعات</div>
          <ul className="mt-2 space-y-1 text-[12px] font-semibold leading-6 text-amber-900/90">
            {summary.gaps.map((gap) => (
              <li key={gap}>• {gap}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/customer-portal/contracts/${contractId}/due-dates`}
          className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-[12px] font-black text-cyan-900 transition hover:bg-cyan-100"
        >
          مشاهده سررسیدها
        </Link>
        <Link
          href={`/customer-portal/contracts/${contractId}/receipts`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-black text-slate-700 transition hover:bg-slate-50"
        >
          مشاهده رسیدها
        </Link>
      </div>
    </section>
  );
}


