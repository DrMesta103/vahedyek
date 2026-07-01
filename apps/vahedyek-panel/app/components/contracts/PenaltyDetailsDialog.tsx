'use client';

import { ChevronDown, Info, X } from 'lucide-react';
import { useState } from 'react';
import {
  getPenaltyMethodLabel,
  getPenaltyPeriodLabel,
  getPenaltyRuleSettingRows,
  getPenaltyRoundRuleLabel,
  type BuyerPenaltyCalculationDetail,
} from '../../lib/buyerPenaltyCalculation';

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <div className="text-[10px] font-bold text-slate-500">{label}</div>
      <div className="mt-0.5 text-[12px] font-black text-slate-900">{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  tone = 'slate',
  children,
}: {
  title: string;
  tone?: 'slate' | 'teal' | 'amber' | 'rose';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'teal'
      ? 'border-[color-mix(in_srgb,var(--dark-teal)_20%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_05%,white)]'
      : tone === 'amber'
        ? 'border-amber-200/80 bg-amber-50/50'
        : tone === 'rose'
          ? 'border-rose-200/70 bg-rose-50/40'
          : 'border-slate-200 bg-white';

  return (
    <div className={`rounded-3xl border px-4 py-4 ${toneClass}`}>
      <div className="text-[12px] font-black text-slate-900">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function PenaltyConfiguredSettingsPanel({ detail }: { detail: BuyerPenaltyCalculationDetail }) {
  const settings = detail.ruleSettings;

  if (!settings) {
    return (
      <SectionCard title="تنظیمات ثبت‌شده در قرارداد" tone="slate">
        <p className="text-[11px] font-semibold leading-5 text-slate-500">قانون جریمه برای این نوع در قرارداد ثبت نشده است.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="تنظیمات ثبت‌شده در قرارداد" tone="teal">
      <div className="mb-3 rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_18%,#cbd5e1)] bg-white/80 px-3 py-2.5 text-[11px] font-bold text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
        خلاصه تنظیم: {settings.summaryLine}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {getPenaltyRuleSettingRows(settings).map((row) => (
          <DetailRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      {settings.mode === 'progressive' && settings.progressiveRows.length > 0 ? (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">بازه‌های تصاعدی ثبت‌شده</div>
          {settings.progressiveRows.map((range, index) => (
            <div key={`${range.fromDay}-${index}`} className="rounded-[8px] bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">
              بازه {range.fromDay.toLocaleString('fa-IR')}
              {range.openEnded ? ' به بعد' : ` تا ${range.toDay?.toLocaleString('fa-IR') ?? '�'}`}
              {' · '}
              نرخ {range.ratePercent.toLocaleString('fa-IR')}٪ روزانه
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}

export function PenaltyCalculationResultPanel({ detail }: { detail: BuyerPenaltyCalculationDetail }) {
  const hasCalculationContext = detail.dueDate !== '—' && detail.calculationDate !== '—';

  return (
    <SectionCard title="نتیجه محاسبه تا امروز" tone="rose">
      {detail.zeroReason && detail.totalPenaltyRial <= 0 ? (
        <div className="mb-3 rounded-[8px] border border-amber-200/80 bg-amber-50/60 px-3 py-2.5">
          <p className="text-[12px] font-black text-amber-950">جریمه محاسبه‌شده: صفر</p>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-amber-900/80">{detail.zeroReason}</p>
        </div>
      ) : null}
      {!hasCalculationContext ? (
        <p className="text-[11px] font-semibold leading-5 text-slate-500">اطلاعات محاسبه برای این سررسید در دسترس نیست.</p>
      ) : (
      <>
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailRow label="تاریخ سررسید" value={detail.dueDate} />
        <DetailRow label="تاریخ محاسبه" value={detail.calculationDate} />
        <DetailRow label="روزهای تأخیر خام" value={`${detail.rawDelayDays.toLocaleString('fa-IR')} روز`} />
        <DetailRow label="مهلت تنفس" value={`${detail.gracePeriodDays.toLocaleString('fa-IR')} روز`} />
        <DetailRow label="روزهای تأخیر قابل محاسبه" value={`${detail.chargeableDelayDays.toLocaleString('fa-IR')} روز`} />
        <DetailRow label="تعداد دوره محاسبه‌شده" value={detail.periodCount.toLocaleString('fa-IR')} />
        <DetailRow label="مانده بدهی معوق" value={formatMoneyRial(detail.overdueRemainingDebtRial)} />
        {detail.calculationMethod === 'contract' ? (
          <DetailRow label="مبنای درصد (کل قرارداد)" value={formatMoneyRial(detail.totalMainContractAmountRial)} />
        ) : null}
      </div>

      {detail.calculationNotes.length > 0 ? (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">مراحل محاسبه</div>
          {detail.calculationNotes.map((note) => (
            <div key={note} className="rounded-[8px] bg-white/80 px-3 py-2 text-[11px] font-semibold leading-5 text-slate-700">
              {note}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <DetailRow label="جریمه اصلی (خام)" value={formatMoneyRial(detail.mainPenaltyCoreRawRial)} />
        <DetailRow label="جریمه اصلی (گردشده)" value={formatMoneyRial(detail.mainPenaltyCoreRoundedRial)} />
        {detail.bankInterestRoundedRial > 0 ? (
          <>
            <DetailRow label="سود بانکی (خام)" value={formatMoneyRial(detail.bankInterestRawRial)} />
            <DetailRow label="سود بانکی (گردشده)" value={formatMoneyRial(detail.bankInterestRoundedRial)} />
          </>
        ) : null}
        <DetailRow label="قاعده گرد کردن جریمه" value={getPenaltyRoundRuleLabel(detail.roundingRule)} />
      </div>

      {detail.lateFeeType ? (
        <div className="mt-3 rounded-[8px] border border-amber-200/80 bg-amber-50/50 px-3 py-3">
          <div className="text-[11px] font-black text-amber-950">هزینه دیرکرد (محاسبه‌شده)</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <DetailRow
              label="نوع ثبت‌شده"
              value={
                detail.lateFeeType === 'percent'
                  ? `درصدی (${detail.lateFeeConfiguredValue?.toLocaleString('fa-IR') ?? '۰'}٪)`
                  : `ثابت (${formatMoneyRial(detail.lateFeeConfiguredValue ?? 0)})`
              }
            />
            <DetailRow label="مبنای محاسبه" value={formatMoneyRial(detail.lateFeeBaseRial)} />
            <DetailRow label="مبلغ خام" value={formatMoneyRial(detail.lateFeeRawRial)} />
            <DetailRow label="مبلغ گردشده" value={formatMoneyRial(detail.lateFeeRoundedRial)} />
            <DetailRow label="قاعده گرد کردن" value={getPenaltyRoundRuleLabel(detail.lateFeeRoundingRule)} />
          </div>
        </div>
      ) : null}

      {detail.progressiveBreakdown && detail.progressiveBreakdown.length > 0 ? (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">جزئیات بازه‌های تصاعدی (محاسبه‌شده)</div>
          {detail.progressiveBreakdown.map((range, index) => (
            <div key={`${range.fromDay}-${index}`} className="rounded-[8px] bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-700">
              بازه {range.fromDay.toLocaleString('fa-IR')}
              {range.openEnded ? ' به بعد' : ` تا ${range.toDay?.toLocaleString('fa-IR') ?? '�'}`}
              {' · '}
              {range.daysInsideRange.toLocaleString('fa-IR')} روز
              {' · '}
              نرخ {range.ratePercent.toLocaleString('fa-IR')}٪
              {' · '}
              مبلغ {formatMoneyRial(range.calculatedAmountRial)}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <DetailRow label="جمع جریمه اصلی + سود بانکی" value={formatMoneyRial(detail.mainPenaltyRoundedRial)} />
        <DetailRow label="جمع هزینه دیرکرد" value={formatMoneyRial(detail.lateFeeRoundedRial)} />
        <DetailRow label="جمع کل جریمه" value={formatMoneyRial(detail.totalPenaltyRial)} />
        <DetailRow label="مبلغ قابل وصول" value={formatMoneyRial(detail.totalCollectibleRial)} />
      </div>
      </>
      )}
    </SectionCard>
  );
}

export function PenaltyCalculationBody({ detail }: { detail: BuyerPenaltyCalculationDetail }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailRow label="نوع جریمه" value={detail.penaltyTypeTitle} />
        <DetailRow label="روش محاسبه" value={getPenaltyMethodLabel(detail.calculationMethod)} />
        <DetailRow label="دوره محاسبه" value={getPenaltyPeriodLabel(detail.period)} />
      </div>
      <PenaltyConfiguredSettingsPanel detail={detail} />
      <PenaltyCalculationResultPanel detail={detail} />
    </div>
  );
}

function AggregatedDueRow({
  title,
  detail,
}: {
  title: string;
  detail: BuyerPenaltyCalculationDetail;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-3 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 text-right"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-black text-slate-900">{title}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
            <span>سررسید {detail.dueDate}</span>
            <span>مانده {formatMoneyRial(detail.overdueRemainingDebtRial)}</span>
            <span>تأخیر {detail.chargeableDelayDays.toLocaleString('fa-IR')} روز</span>
            <span>جریمه {formatMoneyRial(detail.totalPenaltyRial)}</span>
          </div>
          {detail.ruleSettings ? (
            <div className="mt-1 text-[10px] font-bold text-[color-mix(in_srgb,var(--dark-teal)_80%,black)]">
              تنظیم قرارداد: {detail.ruleSettings.summaryLine}
            </div>
          ) : null}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <PenaltyCalculationBody detail={detail} />
        </div>
      ) : null}
    </div>
  );
}

export type PenaltyDetailsDialogState =
  | {
      mode: 'single';
      title: string;
      subtitle?: string;
      detail: BuyerPenaltyCalculationDetail;
    }
  | {
      mode: 'monthly';
      title: string;
      subtitle?: string;
      details: Array<{ title: string; detail: BuyerPenaltyCalculationDetail }>;
    }
  | null;

export function PenaltyInfoButton({
  onClick,
  label = 'جزئیات جریمه',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-[3px] text-[10px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
      title={label}
      aria-label={label}
    >
      <Info className="h-3 w-3 shrink-0" aria-hidden />
    </button>
  );
}

export function PenaltyDetailsDialog({
  state,
  onClose,
}: {
  state: PenaltyDetailsDialogState;
  onClose: () => void;
}) {
  if (!state) return null;

  const totalMainPenalty = state.mode === 'monthly'
    ? state.details.reduce((sum, item) => sum + item.detail.mainPenaltyRoundedRial, 0)
    : state.detail.mainPenaltyRoundedRial;
  const totalLateFee = state.mode === 'monthly'
    ? state.details.reduce((sum, item) => sum + item.detail.lateFeeRoundedRial, 0)
    : state.detail.lateFeeRoundedRial;
  const totalPenalty = state.mode === 'monthly'
    ? state.details.reduce((sum, item) => sum + item.detail.totalPenaltyRial, 0)
    : state.detail.totalPenaltyRial;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" dir="rtl" role="dialog" aria-modal="true">
      <div className="flex max-h-[min(860px,calc(100vh-42px))] w-full max-w-3xl flex-col overflow-hidden rounded-[8px] border border-white/75 bg-white shadow-2xl sm:rounded-[8px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-[15px] font-black text-slate-900">{state.title}</div>
            {state.subtitle ? <div className="mt-1 text-[12px] font-semibold text-slate-500">{state.subtitle}</div> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-[8px] p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="بستن">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-4">
          {state.mode === 'monthly' ? (
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <DetailRow label="جمع جریمه اصلی + سود بانکی" value={formatMoneyRial(totalMainPenalty)} />
                <DetailRow label="جمع هزینه دیرکرد" value={formatMoneyRial(totalLateFee)} />
                <DetailRow label="جمع کل جریمه" value={formatMoneyRial(totalPenalty)} />
              </div>
              <div className="space-y-2">
                {state.details.map((item) => (
                  <AggregatedDueRow key={item.detail.principalDueId} title={item.title} detail={item.detail} />
                ))}
              </div>
            </div>
          ) : (
            <PenaltyCalculationBody detail={state.detail} />
          )}
        </div>
      </div>
    </div>
  );
}






