'use client';

import { useMemo } from 'react';
import { BadgePercent, CircleDollarSign, CirclePercent, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { Input } from '@repo/ui';
import { FieldLabel } from '../../../(panel)/contracts/new/_components/FieldLabel';
import { TagPills } from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import {
  canAddProgressiveRow,
  getNextProgressiveFromDay,
  normalizeProgressiveRows,
  sanitizeDecimalInput,
  sanitizePositiveIntegerInput,
  validateProgressiveRows,
} from '../../../lib/progressivePenalty';
import type { AppendixPenaltyWaiverPayload, PenaltyExtraFeeType, PenaltyMode, PenaltyPeriod, PenaltyProgressiveRowData, PenaltyRoundRule } from '../../../types/contract';

const MODE_OPTIONS: Array<{
  id: PenaltyMode;
  title: string;
  description: string;
  icon: typeof CircleDollarSign;
}> = [
  {
    id: 'fixed',
    title: 'مبلغ ثابت برای هر روز/ماه',
    description: 'در این حالت، برای هر دوره تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
    icon: CircleDollarSign,
  },
  {
    id: 'overdue',
    title: 'درصدی از مانده بدهی معوق',
    description: 'جریمه به‌صورت درصدی از مانده بدهی معوق محاسبه می‌شود.',
    icon: BadgePercent,
  },
  {
    id: 'contract',
    title: 'درصدی از کل قرارداد',
    description: 'جریمه بر مبنای درصدی از کل مبلغ قرارداد در بازه انتخاب‌شده محاسبه می‌شود.',
    icon: CirclePercent,
  },
  {
    id: 'progressive',
    title: 'جریمه تصاعدی با روزهای تاخیر',
    description: 'مبلغ جریمه با افزایش مدت تاخیر بر اساس بازه‌های زمانی مختلف افزایش پیدا می‌کند.',
    icon: TrendingUp,
  },
];

const PERIOD_OPTIONS: Array<{ value: PenaltyPeriod; label: string }> = [
  { value: 'daily', label: 'روزانه' },
  { value: 'monthly', label: 'ماهانه' },
  { value: 'yearly', label: 'سالانه' },
];

const ROUND_RULE_OPTIONS: Array<{ value: PenaltyRoundRule; label: string }> = [
  { value: '00', label: '00' },
  { value: '0', label: '0' },
  { value: '100', label: 'کسر 100' },
  { value: '1000', label: 'کسر 1000' },
];

const EXTRA_FEE_OPTIONS: Array<{ value: PenaltyExtraFeeType; label: string }> = [
  { value: 'percent', label: 'درصد' },
  { value: 'fixed', label: 'مبلغ ثابت' },
];

const DEFAULT_PROGRESSIVE_ROWS: PenaltyProgressiveRowData[] = [
  { id: 'row-1', fromDay: '1', toDay: '4', rate: '0.5' },
  { id: 'row-2', fromDay: '5', toDay: '6', rate: '0.5' },
  { id: 'row-3', fromDay: '7', toDay: '65', rate: '3.3' },
  { id: 'row-4', fromDay: '66', toDay: '', rate: '', openEnded: false },
];

function formatMoney(value: string) {
  const raw = String(value ?? '').replace(/,/g, '').trim();
  if (!raw) return '';
  const amount = Number(raw.replace(/[^\d.]/g, '')) || 0;
  return amount.toLocaleString('en-US');
}

function normalizeMode(value: PenaltyMode | string | undefined): PenaltyMode {
  if (value === 'fixed' || value === 'overdue' || value === 'contract' || value === 'progressive') return value;
  return 'fixed';
}

function normalizePeriod(value: PenaltyPeriod | string | undefined): PenaltyPeriod {
  if (value === 'daily' || value === 'monthly' || value === 'yearly') return value;
  return 'monthly';
}

function normalizeRoundRule(value: string | undefined): PenaltyRoundRule {
  if (value === '00' || value === '0' || value === '100' || value === '1000') return value;
  return '100';
}

function patchProgressiveRows(
  value: AppendixPenaltyWaiverPayload,
  onChange: (next: AppendixPenaltyWaiverPayload) => void,
  rows: PenaltyProgressiveRowData[],
) {
  onChange({
    ...value,
    progressiveRows: normalizeProgressiveRows(rows),
  });
}

export function AppendixPenaltyWaiverEditor({
  value,
  onChange,
}: {
  value: AppendixPenaltyWaiverPayload;
  onChange: (value: AppendixPenaltyWaiverPayload) => void;
}) {
  const normalizedRows = useMemo(() => normalizeProgressiveRows(value.progressiveRows?.length ? value.progressiveRows : DEFAULT_PROGRESSIVE_ROWS), [value.progressiveRows]);
  const progressiveValidation = useMemo(() => validateProgressiveRows(normalizedRows), [normalizedRows]);
  const activeMode = normalizeMode(value.mode);
  const activePeriod = normalizePeriod(value.period);

  const updateValue = (patch: Partial<AppendixPenaltyWaiverPayload>) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const updateProgressiveRow = (rowId: string, key: 'fromDay' | 'toDay' | 'rate', nextValue: string) => {
    const nextRows = normalizedRows.map((row) => {
      if (row.id !== rowId) return row;
      if (key === 'rate') return { ...row, rate: sanitizeDecimalInput(nextValue) };
      if (key === 'toDay') return { ...row, toDay: sanitizePositiveIntegerInput(nextValue), openEnded: false };
      return { ...row, fromDay: sanitizePositiveIntegerInput(nextValue) };
    });
    patchProgressiveRows(value, onChange, nextRows);
  };

  const toggleOpenEnded = (rowId: string, checked: boolean) => {
    const index = normalizedRows.findIndex((row) => row.id === rowId);
    const nextRows = normalizedRows
      .slice(0, checked ? index + 1 : normalizedRows.length)
      .map((row) => (row.id === rowId ? { ...row, openEnded: checked, toDay: checked ? '' : row.toDay } : row));
    patchProgressiveRows(value, onChange, nextRows);
  };

  const addProgressiveRow = () => {
    if (!canAddProgressiveRow(normalizedRows)) return;
    patchProgressiveRows(value, onChange, [
      ...normalizedRows,
      {
        id: `row-${Date.now()}`,
        fromDay: getNextProgressiveFromDay(normalizedRows),
        toDay: '',
        rate: '',
        openEnded: false,
      },
    ]);
  };

  const removeProgressiveRow = (rowId: string) => {
    patchProgressiveRows(
      value,
      onChange,
      normalizedRows.filter((row) => row.id !== rowId),
    );
  };

  return (
    <div className="space-y-5 rounded-[8px] border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6">
      <div className="rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_16%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)] px-4 py-3 text-right">
        <div className="text-[13px] font-black text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">این بخش با منطق جریمه در پیش‌نویس هم‌ساخت است.</div>
        <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-600">
          حالت محاسبه، دوره، بازه‌های تصاعدی و هزینهٔ دیرکرد را می‌توانید از همین‌جا تنظیم کنید.
        </p>
      </div>

      <section className="space-y-3">
        <div className="text-right">
          <h3 className="text-[18px] font-black text-slate-900">روش محاسبه</h3>
          <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">یکی از روش‌ها را انتخاب کنید.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {MODE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateValue({ mode: item.id })}
                className={`flex min-h-[124px] items-center gap-3 rounded-[8px] border px-4 py-4 text-right transition ${
                  isActive
                    ? 'border-cyan-300 bg-cyan-50/80 shadow-[0_4px_18px_rgba(34,211,238,0.10)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border ${
                    isActive ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] font-black leading-6 ${isActive ? 'text-cyan-900' : 'text-slate-800'}`}>{item.title}</span>
                  <span className="mt-1 block text-[12px] font-semibold leading-6 text-slate-500">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-right">
          <h3 className="text-[18px] font-black text-slate-900">دوره محاسبه جریمه</h3>
          <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">دوره را برای جریمه انتخاب کنید.</p>
        </div>
        <TagPills
          options={PERIOD_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          value={activePeriod}
          onChange={(period) => updateValue({ period })}
          className="justify-end flex-row-reverse"
        />
      </section>

      {activeMode === 'fixed' ? (
        <section className="space-y-3">
          <FieldLabel label="مبلغ ثابت جریمه" />
          <Input
            value={formatMoney(value.fixedAmount)}
            onChange={(event) => updateValue({ fixedAmount: event.target.value.replace(/[^\d,]/g, '') })}
            placeholder="مثلاً: 100,000"
            className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-right text-slate-900"
          />
          <p className="text-right text-[12px] font-semibold leading-6 text-slate-500">مبلغی که برای هر دوره تاخیر به‌عنوان جریمه در نظر گرفته می‌شود.</p>
        </section>
      ) : null}

      {(activeMode === 'overdue' || activeMode === 'contract') ? (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <FieldLabel label="درصد جریمه" />
              <Input
                value={value.penaltyPercent}
                onChange={(event) => updateValue({ penaltyPercent: sanitizeDecimalInput(event.target.value) })}
                placeholder="مثلاً: 0.5"
                className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-right text-slate-900"
              />
            </div>
            <div className="space-y-3">
              <FieldLabel label="درصد سود بانکی" />
              <Input
                value={value.bankInterestPercent}
                onChange={(event) => updateValue({ bankInterestPercent: sanitizeDecimalInput(event.target.value) })}
                placeholder="در صورت نیاز"
                className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-right text-slate-900"
              />
            </div>
          </div>
        </section>
      ) : null}

      {activeMode === 'progressive' ? (
        <section className="space-y-4 rounded-[8px] border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-right">
              <h3 className="text-[18px] font-black text-slate-900">جدول جریمه‌های تصاعدی</h3>
              <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">برای هر بازه، نرخ جریمه را ثبت کنید.</p>
            </div>
            <button
              type="button"
              onClick={addProgressiveRow}
              disabled={!canAddProgressiveRow(normalizedRows)}
              className="inline-flex items-center gap-2 rounded-[8px] border border-cyan-200 bg-white px-4 py-2 text-[12px] font-black text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              افزودن بازه
            </button>
          </div>

          <div className="space-y-3">
            {normalizedRows.map((row, index) => (
              <div key={row.id} className="grid gap-3 rounded-[8px] border border-slate-200 bg-white p-3 md:grid-cols-[120px_minmax(0,1fr)_120px_120px_auto] md:items-end">
                <div className="space-y-2">
                  <FieldLabel label="از روز" />
                  <Input value={row.fromDay} disabled className="h-10 rounded-[8px] border-slate-200 bg-slate-50 px-3 text-right text-slate-500" />
                </div>
                <div className="space-y-2">
                  <FieldLabel label="پایان بازه" />
                  <div className="flex items-center gap-2">
                    <Input
                      value={row.toDay}
                      disabled={row.openEnded}
                      onChange={(event) => updateProgressiveRow(row.id, 'toDay', event.target.value)}
                      placeholder="تا روز"
                      className="h-10 rounded-[8px] border-slate-200 bg-white px-3 text-right text-slate-900"
                    />
                    <label className="inline-flex shrink-0 items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={Boolean(row.openEnded)}
                        onChange={(event) => toggleOpenEnded(row.id, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                      />
                      به بعد
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel label="نرخ جریمه" />
                  <Input
                    value={row.rate}
                    onChange={(event) => updateProgressiveRow(row.id, 'rate', event.target.value)}
                    placeholder="مثلاً: 1.25"
                    className="h-10 rounded-[8px] border-slate-200 bg-white px-3 text-right text-slate-900"
                  />
                </div>
                <div className="rounded-[8px] bg-slate-50 px-3 py-2 text-[12px] font-semibold leading-6 text-slate-500">
                  {row.openEnded ? `از روز ${row.fromDay} به بعد` : row.toDay ? `${row.fromDay} تا ${row.toDay} روز` : 'پایان بازه را وارد کنید'}
                </div>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => removeProgressiveRow(row.id)}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-rose-200 px-3 text-[12px] font-black text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeMode !== 'progressive' ? (
        <section className="space-y-3">
          <FieldLabel label="مهلت تنفس (روز)" />
          <Input
            value={value.graceDays}
            onChange={(event) => updateValue({ graceDays: sanitizePositiveIntegerInput(event.target.value) })}
            placeholder="مثلاً: 2"
            className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-right text-slate-900"
          />
        </section>
      ) : null}

      {activeMode === 'progressive' ? (
        <section className="space-y-3">
          <FieldLabel label="مهلت تنفس (روز)" />
          <Input
            value={value.graceDays}
            onChange={(event) => updateValue({ graceDays: sanitizePositiveIntegerInput(event.target.value) })}
            placeholder="مثلاً: 2"
            className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-right text-slate-900"
          />
          <p className="text-right text-[12px] font-semibold leading-6 text-slate-500">تعداد روزهایی که پس از سررسید بدون محاسبه جریمه در نظر گرفته می‌شود.</p>
        </section>
      ) : null}

      {activeMode !== 'fixed' ? (
        <section className="space-y-3">
          <div className="text-right">
            <h3 className="text-[18px] font-black text-slate-900">قاعده گرد کردن مبلغ جریمه</h3>
            <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود.</p>
          </div>
          <TagPills
            options={ROUND_RULE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            value={normalizeRoundRule(value.roundRule)}
            onChange={(roundRule) => updateValue({ roundRule })}
            className="justify-end flex-row-reverse"
          />
        </section>
      ) : null}

      <section className="space-y-4 rounded-[8px] border border-cyan-100 bg-cyan-50/70 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-right">
            <h3 className="text-[18px] font-black text-slate-900">هزینه دیرکرد</h3>
            <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">در صورت نیاز، هزینه‌ای جدا از جریمه اصلی ثبت کنید.</p>
          </div>
          <button
            type="button"
            onClick={() => updateValue({ extraFeeEnabled: !value.extraFeeEnabled })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
              value.extraFeeEnabled ? 'bg-cyan-500' : 'bg-slate-300'
            }`}
            aria-pressed={value.extraFeeEnabled}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                value.extraFeeEnabled ? 'right-1' : 'right-7'
              }`}
            />
          </button>
        </div>

        {value.extraFeeEnabled ? (
          <div className="space-y-4">
            <TagPills
              options={EXTRA_FEE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
              value={value.extraFeeType}
              onChange={(extraFeeType) => updateValue({ extraFeeType })}
              className="justify-end flex-row-reverse"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel label="مقدار هزینه دیرکرد" />
                <Input
                  value={value.extraFeeAmount}
                  onChange={(event) => updateValue({ extraFeeAmount: value.extraFeeType === 'fixed' ? formatMoney(event.target.value) : sanitizeDecimalInput(event.target.value) })}
                  placeholder={value.extraFeeType === 'fixed' ? 'مثلاً: 100,000' : 'مثلاً: 0.6'}
                  className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-right text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel label="قاعده گرد کردن هزینه دیرکرد" />
                <TagPills
                  options={ROUND_RULE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  value={normalizeRoundRule(value.extraFeeRoundRule)}
                  onChange={(extraFeeRoundRule) => updateValue({ extraFeeRoundRule })}
                  className="justify-end flex-row-reverse"
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {activeMode === 'progressive' && !progressiveValidation.ok ? (
        <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-right text-[12px] font-semibold leading-6 text-amber-800">
          {progressiveValidation.message}
        </div>
      ) : null}
    </div>
  );
}


