'use client';

import { ChevronLeft } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ContractRuleState } from '../../../../../lib/businessContractRules';
import {
  BUILDER_PENALTY_MODE_OPTIONS,
  BUILDER_PENALTY_PERCENT_BASIS_OPTIONS,
  BUILDER_PENALTY_PERIOD_OPTIONS,
  BUILDER_PENALTY_SECTION_META,
  type BuilderPenaltyMode,
  type BuilderPenaltySectionId,
} from '../../../../../lib/builderPenalty';
import { normalizeKnownProgressivePenaltyValues } from '../../../../../lib/progressivePenalty';
import {
  ContractRegistrationSwitch,
  FieldLabel,
  FinancialAmountInput,
  LoanChoicePills,
  LoanError,
  LoanLoadingState,
  LoanSuccess,
} from '../../../../business-settings/_components/LoanSettingsPrimitives';

type BuilderPenaltySection = {
  id: BuilderPenaltySectionId;
  title: string;
  description: string;
};

const SECTIONS: BuilderPenaltySection[] = [
  {
    id: 'unit-delivery-delay',
    title: 'تاخیر در تحویل واحد',
    description: 'جریمه سازنده بابت تاخیر در تحویل واحد را با مدل ثابت، درصدی یا تصاعدی تنظیم کنید.',
  },
  {
    id: 'material-specs-change',
    title: 'تغییر مصالح / مشخصات',
    description: 'منطق جریمه تغییر مصالح یا مشخصات را برای قراردادهای جدید مشخص کنید.',
  },
  {
    id: 'area-difference',
    title: 'اختلاف متراژ',
    description: 'منطق جریمه اختلاف متراژ را برای قراردادهای جدید مشخص کنید.',
  },
];

function AmountField({
  label,
  value,
  onChange,
  helper,
  suffix = '',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <FieldLabel label={label} />
      {disabled ? (
        <input value={value} disabled className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-right text-slate-500" />
      ) : (
        <FinancialAmountInput value={value} onChange={onChange} suffix={suffix} />
      )}
      {helper ? <p className="text-right text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  helper,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-3">
      <FieldLabel label={label} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-slate-900 placeholder:text-slate-400"
      />
      {helper ? <p className="text-right text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ProgressiveGrid({
  rows,
  values,
  periodLabel,
  onValueChange,
}: {
  rows: Array<{ fromKey: string; toKey: string; rateKey: string }>;
  values: ContractRuleState['values'];
  periodLabel: string;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const getOpenEndedKey = (toKey: string) => toKey.replace(/To$/, 'OpenEnded');
  let nextFrom = 1;

  const normalizedRows = rows.map((row) => {
    const openEndedKey = getOpenEndedKey(row.toKey);
    const to = String(values[row.toKey] ?? '');
    const openEnded = Boolean(values[openEndedKey]);
    const from = String(nextFrom);
    const toNumber = Number(to.replace(/\D/g, ''));
    if (!openEnded && Number.isFinite(toNumber) && toNumber >= nextFrom) nextFrom = toNumber + 1;

    return {
      ...row,
      openEndedKey,
      from,
      to,
      openEnded,
      amount: String(values[row.rateKey] ?? ''),
    };
  });

  const visibleUntil = normalizedRows.findIndex((row) => row.openEnded);
  const visibleRows = visibleUntil >= 0 ? normalizedRows.slice(0, visibleUntil + 1) : normalizedRows;

  const sync = (updates: Partial<Record<string, string | boolean>>) => {
    let from = 1;
    let closed = false;

    normalizedRows.forEach((row) => {
      onValueChange(row.fromKey, String(from));
      if (closed) return;

      const openEnded = Boolean(updates[row.openEndedKey] ?? row.openEnded);
      onValueChange(row.openEndedKey, openEnded);
      if (openEnded) {
        onValueChange(row.toKey, '');
        closed = true;
        return;
      }

      const to = String(updates[row.toKey] ?? row.to).replace(/\D/g, '');
      onValueChange(row.toKey, to);
      const toNumber = Number(to);
      if (Number.isFinite(toNumber) && toNumber >= from) from = toNumber + 1;
    });
  };

  return (
    <div className="space-y-4">
      {visibleRows.map((row, index) => (
        <div key={row.fromKey} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_100px_1fr_1fr]">
          <div className="space-y-2">
            <FieldLabel label={`از روز ${row.from}`} />
            <input value={row.from} disabled className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-slate-500" />
          </div>

          <label className="flex items-center justify-end gap-2 pt-8 text-xs font-bold text-slate-500">
            <input
              type="checkbox"
              checked={row.openEnded}
              onChange={(event) => sync({ [row.openEndedKey]: event.target.checked, [row.toKey]: '' })}
              className="h-4 w-4 rounded border-slate-300 text-cyan-600"
            />
            به بعد
          </label>

          <div className="space-y-2">
            <FieldLabel label={`تا روز ${index + 1}`} />
            <input
              value={row.to}
              disabled={row.openEnded}
              onChange={(event) => sync({ [row.toKey]: event.target.value.replace(/\D/g, ''), [row.openEndedKey]: false })}
              placeholder={row.openEnded ? 'به بعد' : 'مثلاً 30'}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-right disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel label={`مبلغ جریمه ${periodLabel} - پله ${index + 1}`} />
            <FinancialAmountInput value={row.amount} onChange={(value) => onValueChange(row.rateKey, value)} suffix="" />
          </div>
        </div>
      ))}
    </div>
  );
}

export type BuilderPenaltyInFlowHandle = {
  saveIfDirty: () => Promise<void>;
};

export const BuilderPenaltyInFlow = forwardRef<
  BuilderPenaltyInFlowHandle,
  {
    onStatusChange?: (status: { loading: boolean; saving: boolean; dirty: boolean }) => void;
  }
>(function BuilderPenaltyInFlow({ onStatusChange }, ref) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractRuleState | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<BuilderPenaltySectionId | null>('unit-delivery-delay');
  const initialSnapshotRef = useRef('');
  const stateRef = useRef<ContractRuleState | null>(null);
  const dirtyRef = useRef(false);

  const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) => {
    const timeoutMs = init?.timeoutMs ?? 20_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const { timeoutMs: _timeoutMs, signal, ...rest } = init ?? {};
      return await fetch(input, { ...rest, signal: signal ?? controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchWithTimeout('/api/business-settings/contract-rules/builder-penalty', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
        }
        const payload = (await response.json()) as ContractRuleState;
        if (!mounted) return;
        setState(payload);
        initialSnapshotRef.current = JSON.stringify(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistState = async (nextState: ContractRuleState, options?: { silent?: boolean }) => {
    try {
      setSaving(true);
      setError('');
      if (!options?.silent) setMessage('');

      const normalizedState = {
        ...nextState,
        values: normalizeKnownProgressivePenaltyValues(nextState.values),
      };
      setState(normalizedState);
      stateRef.current = normalizedState;

      const response = await fetchWithTimeout('/api/business-settings/contract-rules/builder-penalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedState),
        timeoutMs: 25_000,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }

      initialSnapshotRef.current = JSON.stringify(normalizedState);
      if (!options?.silent) setMessage('تنظیمات جرائم سازنده ذخیره شد.');
    } catch (saveError) {
      if (saveError instanceof DOMException && saveError.name === 'AbortError') {
        setError('ذخیره‌سازی بیش از حد طول کشید. دوباره تلاش کنید.');
      } else {
        setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: string, value: string | boolean, sectionId?: BuilderPenaltySectionId) => {
    setState((current) => {
      if (!current) return current;
      const section = sectionId ? BUILDER_PENALTY_SECTION_META[sectionId] : null;
      return {
        ...current,
        values: normalizeKnownProgressivePenaltyValues({
          ...current.values,
          [key]: value,
          ...(section && key === section.unlimitedCapKey && value ? { [section.capKey]: '' } : {}),
        }),
      };
    });
  };

  const dirty = useMemo(() => (state ? JSON.stringify(state) !== initialSnapshotRef.current : false), [state]);

  useEffect(() => {
    onStatusChange?.({ loading, saving, dirty });
  }, [dirty, loading, onStatusChange, saving]);

  useEffect(() => {
    stateRef.current = state;
    dirtyRef.current = dirty;
  }, [dirty, state]);

  useImperativeHandle(
    ref,
    () => ({
      saveIfDirty: async () => {
        if (stateRef.current && dirtyRef.current) await persistState(stateRef.current);
      },
    }),
    [],
  );

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات جریمه سازنده..." />;
  }

  const saveCurrent = async () => {
    if (stateRef.current) await persistState(stateRef.current);
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">تعریف جرائم سازنده</p>
          <p className="mt-0.5 text-[13px] text-slate-500">ساختار و پارامترهای جرائم مرتبط با تعهدات سازنده را تنظیم کنید.</p>
        </div>

        <div className="space-y-6 p-5">
          {SECTIONS.map((item) => {
            const section = BUILDER_PENALTY_SECTION_META[item.id];
            const expanded = expandedSectionId === item.id;
            const enabled = Boolean(state.values[section.stateKey]);
            const activeMode = String(state.values[section.modeKey] || 'fixed') as BuilderPenaltyMode;
            const periodLabel = String(state.values[section.periodKey] || BUILDER_PENALTY_PERIOD_OPTIONS[0].value);
            const unlimitedCap = section.unlimitedCapKey ? Boolean(state.values[section.unlimitedCapKey]) : false;
            const selectedPercentBasis = section.percentBasisKey ? String(state.values[section.percentBasisKey] || BUILDER_PENALTY_PERCENT_BASIS_OPTIONS[0]) : '';

            return (
              <div key={item.id} className={`overflow-hidden rounded-2xl border transition ${enabled ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!enabled) return;
                        setExpandedSectionId((current) => (current === item.id ? null : item.id));
                      }}
                      className="flex min-w-0 flex-1 flex-col gap-3 text-right sm:flex-row-reverse sm:items-center sm:gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${enabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-slate-200 bg-slate-50 text-slate-500'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden />
                            {enabled ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                        <p className="text-xs leading-6 text-slate-500">{item.description}</p>
                        {enabled ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{BUILDER_PENALTY_MODE_OPTIONS.find((option) => option.value === activeMode)?.label ?? activeMode}</span>
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{periodLabel}</span>
                          </div>
                        ) : null}
                      </div>
                      <ChevronLeft className={`h-5 w-5 shrink-0 text-slate-400 transition ${expanded ? '-rotate-90' : ''}`} aria-hidden />
                    </button>

                    <ContractRegistrationSwitch
                      checked={enabled}
                      variant="segmented"
                      onChange={(value) => {
                        setState((current) =>
                          current
                            ? {
                                ...current,
                                values: {
                                  ...current.values,
                                  [section.stateKey]: value,
                                },
                              }
                            : current,
                        );
                        if (value) setExpandedSectionId(item.id);
                        else if (expandedSectionId === item.id) setExpandedSectionId(null);
                      }}
                    />
                  </div>
                </div>

                {expanded && enabled ? (
                  <div className="border-t border-cyan-100 bg-white/80 p-4">
                    <section className="space-y-4">
                      <div className="space-y-3">
                        <div className="text-right">
                          <h4 className="text-sm font-bold text-slate-700">روش محاسبه</h4>
                          <p className="text-xs leading-6 text-slate-500">یکی از سه مدل ثابت، درصدی یا تصاعدی را انتخاب کنید.</p>
                        </div>
                        <LoanChoicePills
                          ariaLabel="روش محاسبه جریمه"
                          options={BUILDER_PENALTY_MODE_OPTIONS}
                          value={activeMode}
                          onChange={(value) => setValue(section.modeKey, value, item.id)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="text-right">
                          <h4 className="text-sm font-bold text-slate-700">دوره محاسبه جریمه</h4>
                          <p className="text-xs leading-6 text-slate-500">جریمه برای هر روز، ماه یا سال تاخیر محاسبه می‌شود.</p>
                        </div>
                        <LoanChoicePills
                          ariaLabel="دوره محاسبه جریمه"
                          options={BUILDER_PENALTY_PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                          value={periodLabel}
                          onChange={(value) => setValue(section.periodKey, value, item.id)}
                        />
                      </div>

                      {activeMode === 'fixed' ? (
                        <AmountField
                          label="مبلغ ثابت جریمه"
                          value={String(state.values[section.fixedAmountKey] ?? '')}
                          onChange={(value) => setValue(section.fixedAmountKey, value, item.id)}
                          helper={`مبلغ جریمه‌ای که برای هر دوره تاخیر (${periodLabel}) محاسبه می‌شود.`}
                        />
                      ) : null}

                      {activeMode === 'percent' ? (
                        <>
                          <AmountField
                            label="درصد جریمه"
                            value={String(state.values[section.percentAmountKey] ?? '')}
                            onChange={(value) => setValue(section.percentAmountKey, value, item.id)}
                            helper="صرف تعیین درصد کافی نیست؛ مبنای محاسبه را نیز مشخص کنید."
                            suffix="%"
                          />

                          {section.percentBasisKey ? (
                            <div className="space-y-3">
                              <div className="text-right">
                                <h4 className="text-sm font-bold text-slate-700">مبنای محاسبه درصد</h4>
                                <p className="text-xs leading-6 text-slate-500">مثلاً مبلغ کل قرارداد یا مانده تعهد مالی.</p>
                              </div>
                              <LoanChoicePills
                                ariaLabel="مبنای محاسبه درصد"
                                options={BUILDER_PENALTY_PERCENT_BASIS_OPTIONS.map((option) => ({ value: option, label: option }))}
                                value={selectedPercentBasis}
                                onChange={(value) => setValue(section.percentBasisKey!, value, item.id)}
                              />
                            </div>
                          ) : null}

                          {selectedPercentBasis === 'ارزش روز واحد' ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-4 text-right">
                                <h4 className="text-sm font-bold text-slate-700">فلو ثبت ارزش روز واحد</h4>
                                <p className="text-xs leading-6 text-slate-500">چون فلو مستقلی در نرم‌افزار وجود ندارد، مبلغ و مرجع ارزش روز در همین بخش ثبت می‌شود.</p>
                              </div>
                              <div className="grid gap-4 lg:grid-cols-2">
                                <AmountField
                                  label="مبلغ ارزش روز واحد"
                                  value={String(state.values[section.marketValueAmountKey!] ?? '')}
                                  onChange={(value) => setValue(section.marketValueAmountKey!, value, item.id)}
                                  helper="عددی که درصد جریمه از آن محاسبه می‌شود."
                                />
                                <TextField
                                  label="مرجع / توضیح ارزش روز"
                                  value={String(state.values[section.marketValueReferenceKey!] ?? '')}
                                  onChange={(value) => setValue(section.marketValueReferenceKey!, value, item.id)}
                                  placeholder="مثلاً گزارش داخلی ارزش‌گذاری"
                                  helper="منبع این عدد را مشخص کنید."
                                />
                              </div>
                            </div>
                          ) : null}

                          {selectedPercentBasis === 'مبلغ تعیین‌شده توسط کارشناس' ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-4 text-right">
                                <h4 className="text-sm font-bold text-slate-700">فلو ثبت مبلغ کارشناسی</h4>
                                <p className="text-xs leading-6 text-slate-500">برای این مبنا باید مبلغ و مشخصات استنادی کارشناس ثبت شود.</p>
                              </div>
                              <div className="grid gap-4 lg:grid-cols-2">
                                <AmountField
                                  label="مبلغ تعیین‌شده توسط کارشناس"
                                  value={String(state.values[section.expertAmountKey!] ?? '')}
                                  onChange={(value) => setValue(section.expertAmountKey!, value, item.id)}
                                  helper="عددی که مبنای محاسبه درصد جریمه خواهد بود."
                                />
                                <TextField
                                  label="نام کارشناس / شماره گزارش"
                                  value={String(state.values[section.expertReferenceKey!] ?? '')}
                                  onChange={(value) => setValue(section.expertReferenceKey!, value, item.id)}
                                  placeholder="مثلاً گزارش شماره ۱۲۳"
                                  helper="برای استناد و پیگیری بعدی."
                                />
                              </div>
                            </div>
                          ) : null}

                          {selectedPercentBasis === 'سفارشی' ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-4 text-right">
                                <h4 className="text-sm font-bold text-slate-700">فلو مبنای سفارشی</h4>
                                <p className="text-xs leading-6 text-slate-500">در حالت سفارشی باید عنوان و مبلغ مرجع را مشخص کنید.</p>
                              </div>
                              <div className="grid gap-4 lg:grid-cols-3">
                                <TextField
                                  label="عنوان مبنای سفارشی"
                                  value={String(state.values[section.customBasisTitleKey!] ?? '')}
                                  onChange={(value) => setValue(section.customBasisTitleKey!, value, item.id)}
                                  placeholder="مثلاً ارزش توافقی واحد"
                                  helper="شرح دهید درصد از چه چیزی محاسبه می‌شود."
                                />
                                <AmountField
                                  label="مبلغ مبنای سفارشی"
                                  value={String(state.values[section.customBasisAmountKey!] ?? '')}
                                  onChange={(value) => setValue(section.customBasisAmountKey!, value, item.id)}
                                  helper="عدد مرجع برای محاسبه درصد."
                                />
                                <TextField
                                  label="توضیح / مرجع سفارشی"
                                  value={String(state.values[section.customBasisReferenceKey!] ?? '')}
                                  onChange={(value) => setValue(section.customBasisReferenceKey!, value, item.id)}
                                  placeholder="در صورت نیاز"
                                  helper="اختیاری، برای شفافیت بیشتر."
                                />
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : null}

                      {activeMode === 'progressive' ? (
                        <>
                          <div className="space-y-2 text-right">
                            <h4 className="text-sm font-bold text-slate-700">پله‌های جریمه تصاعدی</h4>
                            <p className="text-xs leading-6 text-slate-500">روزهای ۱ تا ۳۰، ۳۱ تا ۶۰ و از ۶۱ به بعد را می‌توانید با مبالغ متفاوت تعریف کنید.</p>
                          </div>
                          <ProgressiveGrid rows={section.progressiveRows} values={state.values} periodLabel={periodLabel} onValueChange={(key, value) => setValue(key, value, item.id)} />
                        </>
                      ) : null}

                      {item.id === 'unit-delivery-delay' ? (
                        <>
                          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-right text-sm leading-7 text-sky-900">
                            منطق جریمه و فسخ مستقل هستند. این فرم فقط نحوه ایجاد و محاسبه جریمه را تعریف می‌کند. اگر برای همین Trigger حق فسخ هم لازم باشد، باید جداگانه در تنظیمات فسخ خریدار تعریف شود.
                          </div>

                          <AmountField
                            label="مهلت تنفس بدون جریمه (بر حسب روز)"
                            value={String(state.values[section.graceDaysKey!] ?? '')}
                            onChange={(value) => setValue(section.graceDaysKey!, value, item.id)}
                            helper="اگر این مقدار ۱۰ باشد، جریمه از روز ۱۱ تاخیر شروع می‌شود."
                          />

                          <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                            <label className="flex items-center justify-between gap-3">
                              <div className="text-right">
                                <div className="text-sm font-bold text-slate-700">بدون سقف</div>
                                <p className="text-xs leading-6 text-slate-500">در این حالت جریمه تا هر زمان تاخیر ادامه یابد محاسبه می‌شود.</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={unlimitedCap}
                                onChange={(event) => setValue(section.unlimitedCapKey!, event.target.checked, item.id)}
                                className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                              />
                            </label>

                            <AmountField
                              label="سقف جریمه"
                              value={String(state.values[section.capKey] ?? '')}
                              onChange={(value) => setValue(section.capKey, value, item.id)}
                              helper={unlimitedCap ? 'در حالت بدون سقف، این فیلد غیرفعال است.' : 'اگر مدل ثابت باشد، سقف نمی‌تواند کمتر از مبلغ پایه جریمه باشد.'}
                              disabled={unlimitedCap}
                            />
                          </div>
                        </>
                      ) : null}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={saveCurrent}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                        >
                          {saving ? 'در حال ذخیره...' : 'ثبت'}
                        </button>
                      </div>
                    </section>
                  </div>
                ) : null}
              </div>
            );
          })}

          {message ? <LoanSuccess message={message} /> : null}
          {error ? <LoanError error={error} /> : null}
        </div>
      </div>
    </div>
  );
});
