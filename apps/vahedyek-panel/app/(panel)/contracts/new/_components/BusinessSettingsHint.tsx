'use client';

import { Info, TriangleAlert } from 'lucide-react';
import { formatBusinessSettingValue, type BusinessSettingsComparison, type BusinessSettingsLine } from '../../../../lib/contractSettingsReference';

type BusinessSettingsHintProps = {
  comparison: BusinessSettingsComparison;
  unitLabel?: string;
  referenceLabel?: string;
  currentLabel?: string;
  helperText?: string | null;
};

export function BusinessSettingsHint({
  comparison,
  unitLabel,
  referenceLabel = 'مقدار تنظیمات',
  currentLabel = 'مقدار فعلی قرارداد',
  helperText = null,
}: BusinessSettingsHintProps) {
  const effectiveUnitLabel = unitLabel ?? comparison.unitLabel ?? 'واحد';
  const effectiveComparison =
    effectiveUnitLabel !== comparison.unitLabel && comparison.numericDifference !== null
      ? {
          ...comparison,
          differenceText:
            comparison.differenceDirection === null
              ? comparison.differenceText
              : `مقدار فعلی ${new Intl.NumberFormat('fa-IR').format(Math.abs(comparison.numericDifference))} ${effectiveUnitLabel} ${comparison.differenceDirection === 'under' ? 'کمتر' : 'بیشتر'} از تنظیمات است.`,
        }
      : comparison;
  const status = effectiveComparison.status ?? (effectiveComparison.missing ? 'missing' : effectiveComparison.differs ? 'different' : 'equal');
  const text = helperText ?? effectiveComparison.helperText;

  if (status === 'missing') {
    return (
      <div className="mt-2 flex max-w-full items-start gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600" dir="rtl">
        <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{text ?? 'برای این مورد تنظیمی در تنظیمات کسب‌وکار ثبت نشده است.'}</span>
      </div>
    );
  }

  if (status === 'info') {
    const hasDetailLines =
      effectiveComparison.referenceLines.length > 0 ||
      effectiveComparison.currentLines.length > 0 ||
      effectiveComparison.breakdownLines.length > 0;

    if (!hasDetailLines) {
      return (
        <div className="mt-2 flex max-w-full items-start gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600" dir="rtl">
          <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{text ?? 'برای این مورد تنظیمی در تنظیمات کسب‌وکار ثبت نشده است.'}</span>
        </div>
      );
    }

    return (
      <div className="mt-2 max-w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-700" dir="rtl">
        <div className="mb-1 flex items-start gap-2 font-bold text-slate-800">
          <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>مرجع تنظیمات کسب‌وکار</span>
        </div>
        {effectiveComparison.referenceLines.length ? <LineList lines={effectiveComparison.referenceLines} /> : null}
        {effectiveComparison.currentLines.length ? <LineList lines={effectiveComparison.currentLines} /> : null}
        {effectiveComparison.breakdownLines.length ? <Breakdown lines={effectiveComparison.breakdownLines} tone="cyan" /> : null}
        {text ? <div className="mt-1 text-slate-600">{text}</div> : null}
      </div>
    );
  }

  if (status === 'equal') {
    return (
      <div className="mt-2 max-w-full rounded-[8px] border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-xs leading-6 text-cyan-800" dir="rtl">
        <LineList lines={effectiveComparison.referenceLines.length ? effectiveComparison.referenceLines : [{ label: referenceLabel, value: formatBusinessSettingValue(effectiveComparison.reference) }]} />
        {effectiveComparison.breakdownLines.length ? <Breakdown lines={effectiveComparison.breakdownLines} tone="cyan" /> : null}
        {text ? <div className="mt-1 text-cyan-700">{text}</div> : null}
      </div>
    );
  }

  return (
    <div className="mt-2 max-w-full rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-900" dir="rtl" role="note">
      <div className="flex items-start gap-2 font-bold">
        <TriangleAlert className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>با تنظیمات کسب‌وکار مغایرت دارد.</span>
      </div>
      <LineList lines={effectiveComparison.referenceLines.length ? effectiveComparison.referenceLines : [{ label: referenceLabel, value: formatBusinessSettingValue(effectiveComparison.reference) }]} />
      <LineList lines={effectiveComparison.currentLines.length ? effectiveComparison.currentLines : [{ label: currentLabel, value: formatBusinessSettingValue(effectiveComparison.current) }]} />
      {effectiveComparison.differenceText ? <div className="font-bold">{effectiveComparison.differenceText}</div> : null}
      {effectiveComparison.breakdownLines.length ? <Breakdown lines={effectiveComparison.breakdownLines} tone="amber" /> : null}
      {text ? <div className="mt-1 text-amber-800">{text}</div> : null}
    </div>
  );
}

function LineList({ lines }: { lines: BusinessSettingsLine[] }) {
  return (
    <div className="space-y-0.5">
      {lines.map((line) => (
        <div key={`${line.label}:${line.value}`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-medium">{line.label}:</span>
          <span className="font-bold">{line.value}</span>
        </div>
      ))}
    </div>
  );
}

function Breakdown({ lines, tone }: { lines: BusinessSettingsLine[]; tone: 'cyan' | 'amber' }) {
  const className = tone === 'cyan'
    ? 'mt-2 rounded-[8px] border border-cyan-100 bg-white/55 px-2.5 py-2 text-cyan-900'
    : 'mt-2 rounded-[8px] border border-amber-100 bg-white/55 px-2.5 py-2 text-amber-950';
  return (
    <div className={className}>
      <div className="mb-1 font-bold">جزئیات مرجع تنظیمات</div>
      <LineList lines={lines} />
    </div>
  );
}
