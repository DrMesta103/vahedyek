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
  if (!valueRial) return 'Û° Ø±ÛŒØ§Ù„';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} Ø±ÛŒØ§Ù„`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
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
      <SectionCard title="ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯" tone="slate">
        <p className="text-[11px] font-semibold leading-5 text-slate-500">Ù‚Ø§Ù†ÙˆÙ† Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ù†ÙˆØ¹ Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯" tone="teal">
      <div className="mb-3 rounded-2xl border border-[color-mix(in_srgb,var(--dark-teal)_18%,#cbd5e1)] bg-white/80 px-3 py-2.5 text-[11px] font-bold text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
        Ø®Ù„Ø§ØµÙ‡ ØªÙ†Ø¸ÛŒÙ…: {settings.summaryLine}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {getPenaltyRuleSettingRows(settings).map((row) => (
          <DetailRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      {settings.mode === 'progressive' && settings.progressiveRows.length > 0 ? (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Ø¨Ø§Ø²Ù‡â€ŒÙ‡Ø§ÛŒ ØªØµØ§Ø¹Ø¯ÛŒ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡</div>
          {settings.progressiveRows.map((range, index) => (
            <div key={`${range.fromDay}-${index}`} className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">
              Ø¨Ø§Ø²Ù‡ {range.fromDay.toLocaleString('fa-IR')}
              {range.openEnded ? ' Ø¨Ù‡ Ø¨Ø¹Ø¯' : ` ØªØ§ ${range.toDay?.toLocaleString('fa-IR') ?? '—'}`}
              {' Â· '}
              Ù†Ø±Ø® {range.ratePercent.toLocaleString('fa-IR')}Ùª Ø±ÙˆØ²Ø§Ù†Ù‡
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}

export function PenaltyCalculationResultPanel({ detail }: { detail: BuyerPenaltyCalculationDetail }) {
  const hasCalculationContext = detail.dueDate !== 'â€”' && detail.calculationDate !== 'â€”';

  return (
    <SectionCard title="Ù†ØªÛŒØ¬Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡ ØªØ§ Ø§Ù…Ø±ÙˆØ²" tone="rose">
      {detail.zeroReason && detail.totalPenaltyRial <= 0 ? (
        <div className="mb-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5">
          <p className="text-[12px] font-black text-amber-950">Ø¬Ø±ÛŒÙ…Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡â€ŒØ´Ø¯Ù‡: ØµÙØ±</p>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-amber-900/80">{detail.zeroReason}</p>
        </div>
      ) : null}
      {!hasCalculationContext ? (
        <p className="text-[11px] font-semibold leading-5 text-slate-500">Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø³Ø±Ø±Ø³ÛŒØ¯ Ø¯Ø± Ø¯Ø³ØªØ±Ø³ Ù†ÛŒØ³Øª.</p>
      ) : (
      <>
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailRow label="ØªØ§Ø±ÛŒØ® Ø³Ø±Ø±Ø³ÛŒØ¯" value={detail.dueDate} />
        <DetailRow label="ØªØ§Ø±ÛŒØ® Ù…Ø­Ø§Ø³Ø¨Ù‡" value={detail.calculationDate} />
        <DetailRow label="Ø±ÙˆØ²Ù‡Ø§ÛŒ ØªØ£Ø®ÛŒØ± Ø®Ø§Ù…" value={`${detail.rawDelayDays.toLocaleString('fa-IR')} Ø±ÙˆØ²`} />
        <DetailRow label="Ù…Ù‡Ù„Øª ØªÙ†ÙØ³" value={`${detail.gracePeriodDays.toLocaleString('fa-IR')} Ø±ÙˆØ²`} />
        <DetailRow label="Ø±ÙˆØ²Ù‡Ø§ÛŒ ØªØ£Ø®ÛŒØ± Ù‚Ø§Ø¨Ù„ Ù…Ø­Ø§Ø³Ø¨Ù‡" value={`${detail.chargeableDelayDays.toLocaleString('fa-IR')} Ø±ÙˆØ²`} />
        <DetailRow label="ØªØ¹Ø¯Ø§Ø¯ Ø¯ÙˆØ±Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡â€ŒØ´Ø¯Ù‡" value={detail.periodCount.toLocaleString('fa-IR')} />
        <DetailRow label="Ù…Ø§Ù†Ø¯Ù‡ Ø¨Ø¯Ù‡ÛŒ Ù…Ø¹ÙˆÙ‚" value={formatMoneyRial(detail.overdueRemainingDebtRial)} />
        {detail.calculationMethod === 'contract' ? (
          <DetailRow label="Ù…Ø¨Ù†Ø§ÛŒ Ø¯Ø±ØµØ¯ (Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯)" value={formatMoneyRial(detail.totalMainContractAmountRial)} />
        ) : null}
      </div>

      {detail.calculationNotes.length > 0 ? (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Ù…Ø±Ø§Ø­Ù„ Ù…Ø­Ø§Ø³Ø¨Ù‡</div>
          {detail.calculationNotes.map((note) => (
            <div key={note} className="rounded-xl bg-white/80 px-3 py-2 text-[11px] font-semibold leading-5 text-slate-700">
              {note}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <DetailRow label="Ø¬Ø±ÛŒÙ…Ù‡ Ø§ØµÙ„ÛŒ (Ø®Ø§Ù…)" value={formatMoneyRial(detail.mainPenaltyCoreRawRial)} />
        <DetailRow label="Ø¬Ø±ÛŒÙ…Ù‡ Ø§ØµÙ„ÛŒ (Ú¯Ø±Ø¯Ø´Ø¯Ù‡)" value={formatMoneyRial(detail.mainPenaltyCoreRoundedRial)} />
        {detail.bankInterestRoundedRial > 0 ? (
          <>
            <DetailRow label="Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ (Ø®Ø§Ù…)" value={formatMoneyRial(detail.bankInterestRawRial)} />
            <DetailRow label="Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ (Ú¯Ø±Ø¯Ø´Ø¯Ù‡)" value={formatMoneyRial(detail.bankInterestRoundedRial)} />
          </>
        ) : null}
        <DetailRow label="Ù‚Ø§Ø¹Ø¯Ù‡ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ø¬Ø±ÛŒÙ…Ù‡" value={getPenaltyRoundRuleLabel(detail.roundingRule)} />
      </div>

      {detail.lateFeeType ? (
        <div className="mt-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 px-3 py-3">
          <div className="text-[11px] font-black text-amber-950">Ù‡Ø²ÛŒÙ†Ù‡ Ø¯ÛŒØ±Ú©Ø±Ø¯ (Ù…Ø­Ø§Ø³Ø¨Ù‡â€ŒØ´Ø¯Ù‡)</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <DetailRow
              label="Ù†ÙˆØ¹ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡"
              value={
                detail.lateFeeType === 'percent'
                  ? `Ø¯Ø±ØµØ¯ÛŒ (${detail.lateFeeConfiguredValue?.toLocaleString('fa-IR') ?? 'Û°'}Ùª)`
                  : `Ø«Ø§Ø¨Øª (${formatMoneyRial(detail.lateFeeConfiguredValue ?? 0)})`
              }
            />
            <DetailRow label="Ù…Ø¨Ù†Ø§ÛŒ Ù…Ø­Ø§Ø³Ø¨Ù‡" value={formatMoneyRial(detail.lateFeeBaseRial)} />
            <DetailRow label="Ù…Ø¨Ù„Øº Ø®Ø§Ù…" value={formatMoneyRial(detail.lateFeeRawRial)} />
            <DetailRow label="Ù…Ø¨Ù„Øº Ú¯Ø±Ø¯Ø´Ø¯Ù‡" value={formatMoneyRial(detail.lateFeeRoundedRial)} />
            <DetailRow label="Ù‚Ø§Ø¹Ø¯Ù‡ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù†" value={getPenaltyRoundRuleLabel(detail.lateFeeRoundingRule)} />
          </div>
        </div>
      ) : null}

      {detail.progressiveBreakdown && detail.progressiveBreakdown.length > 0 ? (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Ø¬Ø²Ø¦ÛŒØ§Øª Ø¨Ø§Ø²Ù‡â€ŒÙ‡Ø§ÛŒ ØªØµØ§Ø¹Ø¯ÛŒ (Ù…Ø­Ø§Ø³Ø¨Ù‡â€ŒØ´Ø¯Ù‡)</div>
          {detail.progressiveBreakdown.map((range, index) => (
            <div key={`${range.fromDay}-${index}`} className="rounded-xl bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-700">
              Ø¨Ø§Ø²Ù‡ {range.fromDay.toLocaleString('fa-IR')}
              {range.openEnded ? ' Ø¨Ù‡ Ø¨Ø¹Ø¯' : ` ØªØ§ ${range.toDay?.toLocaleString('fa-IR') ?? '—'}`}
              {' Â· '}
              {range.daysInsideRange.toLocaleString('fa-IR')} Ø±ÙˆØ²
              {' Â· '}
              Ù†Ø±Ø® {range.ratePercent.toLocaleString('fa-IR')}Ùª
              {' Â· '}
              Ù…Ø¨Ù„Øº {formatMoneyRial(range.calculatedAmountRial)}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <DetailRow label="Ø¬Ù…Ø¹ Ø¬Ø±ÛŒÙ…Ù‡ Ø§ØµÙ„ÛŒ + Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ" value={formatMoneyRial(detail.mainPenaltyRoundedRial)} />
        <DetailRow label="Ø¬Ù…Ø¹ Ù‡Ø²ÛŒÙ†Ù‡ Ø¯ÛŒØ±Ú©Ø±Ø¯" value={formatMoneyRial(detail.lateFeeRoundedRial)} />
        <DetailRow label="Ø¬Ù…Ø¹ Ú©Ù„ Ø¬Ø±ÛŒÙ…Ù‡" value={formatMoneyRial(detail.totalPenaltyRial)} />
        <DetailRow label="Ù…Ø¨Ù„Øº Ù‚Ø§Ø¨Ù„ ÙˆØµÙˆÙ„" value={formatMoneyRial(detail.totalCollectibleRial)} />
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
        <DetailRow label="Ù†ÙˆØ¹ Ø¬Ø±ÛŒÙ…Ù‡" value={detail.penaltyTypeTitle} />
        <DetailRow label="Ø±ÙˆØ´ Ù…Ø­Ø§Ø³Ø¨Ù‡" value={getPenaltyMethodLabel(detail.calculationMethod)} />
        <DetailRow label="Ø¯ÙˆØ±Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡" value={getPenaltyPeriodLabel(detail.period)} />
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
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 text-right"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-black text-slate-900">{title}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
            <span>Ø³Ø±Ø±Ø³ÛŒØ¯ {detail.dueDate}</span>
            <span>Ù…Ø§Ù†Ø¯Ù‡ {formatMoneyRial(detail.overdueRemainingDebtRial)}</span>
            <span>ØªØ£Ø®ÛŒØ± {detail.chargeableDelayDays.toLocaleString('fa-IR')} Ø±ÙˆØ²</span>
            <span>Ø¬Ø±ÛŒÙ…Ù‡ {formatMoneyRial(detail.totalPenaltyRial)}</span>
          </div>
          {detail.ruleSettings ? (
            <div className="mt-1 text-[10px] font-bold text-[color-mix(in_srgb,var(--dark-teal)_80%,black)]">
              ØªÙ†Ø¸ÛŒÙ… Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯: {detail.ruleSettings.summaryLine}
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
  label = 'Ø¬Ø²Ø¦ÛŒØ§Øª Ø¬Ø±ÛŒÙ…Ù‡',
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
      <div className="flex max-h-[min(860px,calc(100vh-42px))] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/75 bg-white shadow-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-[15px] font-black text-slate-900">{state.title}</div>
            {state.subtitle ? <div className="mt-1 text-[12px] font-semibold text-slate-500">{state.subtitle}</div> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Ø¨Ø³ØªÙ†">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-4">
          {state.mode === 'monthly' ? (
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <DetailRow label="Ø¬Ù…Ø¹ Ø¬Ø±ÛŒÙ…Ù‡ Ø§ØµÙ„ÛŒ + Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ" value={formatMoneyRial(totalMainPenalty)} />
                <DetailRow label="Ø¬Ù…Ø¹ Ù‡Ø²ÛŒÙ†Ù‡ Ø¯ÛŒØ±Ú©Ø±Ø¯" value={formatMoneyRial(totalLateFee)} />
                <DetailRow label="Ø¬Ù…Ø¹ Ú©Ù„ Ø¬Ø±ÛŒÙ…Ù‡" value={formatMoneyRial(totalPenalty)} />
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



