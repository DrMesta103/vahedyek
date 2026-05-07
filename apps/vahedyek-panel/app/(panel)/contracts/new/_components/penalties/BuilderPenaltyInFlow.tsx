'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { ContractRuleState } from '../../../../../lib/businessContractRules';
import {
  ContractRegistrationSwitch,
  FieldLabel,
  FinancialAmountInput,
  LoanChoicePills,
  LoanError,
  LoanLoadingState,
  LoanSuccess,
} from '../../../../business-settings/_components/LoanSettingsPrimitives';

type BuilderPenaltySectionId = 'unit-delivery-delay' | 'material-specs-change' | 'area-difference';
type BuilderPenaltyMode = 'fixed' | 'percent' | 'progressive';

type BuilderPenaltySection = {
  id: BuilderPenaltySectionId;
  title: string;
  description: string;
  stateKey: 'unitDeliveryDelayEnabled' | 'materialSpecsChangeEnabled' | 'areaDifferenceEnabled';
};

const BUILDER_PENALTY_SECTIONS: BuilderPenaltySection[] = [
  {
    id: 'unit-delivery-delay',
    title: 'تاخیر در تحویل واحد',
    description: 'مشخص می‌کند جریمه تاخیر در تحویل واحد برای سازنده در چه شرایطی قابل استفاده باشد.',
    stateKey: 'unitDeliveryDelayEnabled',
  },
  {
    id: 'material-specs-change',
    title: 'تغییر مصالح / مشخصات',
    description: 'مشخص می‌کند جریمه مربوط به تغییر مصالح یا مشخصات واحد برای سازنده در چه شرایطی قابل استفاده باشد.',
    stateKey: 'materialSpecsChangeEnabled',
  },
  {
    id: 'area-difference',
    title: 'اختلاف متراژ',
    description: 'مشخص می‌کند جریمه مربوط به اختلاف متراژ برای سازنده در چه شرایطی قابل استفاده باشد.',
    stateKey: 'areaDifferenceEnabled',
  },
];

type SectionConfig = {
  title: string;
  activationTitle: string;
  activationDescription: string;
  stateKey: BuilderPenaltySection['stateKey'];
  modeKey: string;
  periodKey: string;
  fixedAmountKey: string;
  percentAmountKey: string;
  capKey: string;
  trailingField: {
    key: string;
    label: string;
    helper: string;
    type: 'number' | 'choice';
    options?: string[];
  };
  progressiveRows: Array<{ fromKey: string; toKey: string; rateKey: string }>;
};

const PERIOD_OPTIONS = [
  { value: 'روزانه', label: 'روزانه' },
  { value: 'ماهانه', label: 'ماهانه' },
  { value: 'سالانه', label: 'سالانه' },
] as const;

const MODE_OPTIONS: Array<{ value: BuilderPenaltyMode; label: string }> = [
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'percent', label: 'درصدی' },
  { value: 'progressive', label: 'تصاعدی' },
];

const SECTION_META: Record<BuilderPenaltySectionId, SectionConfig> = {
  'unit-delivery-delay': {
    title: 'تاخیر در تحویل واحد',
    activationTitle: 'فعال‌سازی تاخیر در تحویل واحد',
    activationDescription: 'با فعال‌سازی این گزینه، جریمه تاخیر در تحویل واحد بر اساس پیکربندی قابل استفاده می‌باشد.',
    stateKey: 'unitDeliveryDelayEnabled',
    modeKey: 'unitDeliveryDelayMode',
    periodKey: 'unitDeliveryDelayPeriod',
    fixedAmountKey: 'unitDeliveryDelayFixedAmount',
    percentAmountKey: 'unitDeliveryDelayPercentAmount',
    capKey: 'unitDeliveryDelayPenaltyCap',
    trailingField: {
      key: 'unitDeliveryDelayGraceDays',
      label: 'مهلت تنفس (بدون جریمه)',
      helper: 'تعداد روز تاخیر مجاز قبل از شروع محاسبه جریمه',
      type: 'number',
    },
    progressiveRows: [
      { fromKey: 'unitDeliveryDelayProgressiveRow1From', toKey: 'unitDeliveryDelayProgressiveRow1To', rateKey: 'unitDeliveryDelayProgressiveRow1Rate' },
      { fromKey: 'unitDeliveryDelayProgressiveRow2From', toKey: 'unitDeliveryDelayProgressiveRow2To', rateKey: 'unitDeliveryDelayProgressiveRow2Rate' },
      { fromKey: 'unitDeliveryDelayProgressiveRow3From', toKey: 'unitDeliveryDelayProgressiveRow3To', rateKey: 'unitDeliveryDelayProgressiveRow3Rate' },
    ],
  },
  'material-specs-change': {
    title: 'تغییر مصالح / مشخصات',
    activationTitle: 'فعال‌سازی جریمه تغییر مصالح / مشخصات',
    activationDescription: 'با فعال‌سازی این گزینه، جریمه تغییر مصالح / مشخصات بر اساس پیکربندی قابل استفاده می‌باشد.',
    stateKey: 'materialSpecsChangeEnabled',
    modeKey: 'materialSpecsChangeMode',
    periodKey: 'materialSpecsChangePeriod',
    fixedAmountKey: 'materialSpecsChangeFixedAmount',
    percentAmountKey: 'materialSpecsChangePercentAmount',
    capKey: 'materialSpecsChangePenaltyCap',
    trailingField: {
      key: 'materialSpecsChangeSubject',
      label: 'مشخصات محتمل',
      helper: 'یک گزینه را برای مشخصات محتمل انتخاب کنید.',
      type: 'choice',
      options: ['گرمایش از کف', 'شیرآلات با کیفیت'],
    },
    progressiveRows: [
      { fromKey: 'materialSpecsChangeProgressiveRow1From', toKey: 'materialSpecsChangeProgressiveRow1To', rateKey: 'materialSpecsChangeProgressiveRow1Rate' },
      { fromKey: 'materialSpecsChangeProgressiveRow2From', toKey: 'materialSpecsChangeProgressiveRow2To', rateKey: 'materialSpecsChangeProgressiveRow2Rate' },
      { fromKey: 'materialSpecsChangeProgressiveRow3From', toKey: 'materialSpecsChangeProgressiveRow3To', rateKey: 'materialSpecsChangeProgressiveRow3Rate' },
    ],
  },
  'area-difference': {
    title: 'اختلاف متراژ',
    activationTitle: 'فعال‌سازی جریمه اختلاف متراژ',
    activationDescription: 'با فعال‌سازی این گزینه، جریمه اختلاف متراژ بر اساس پیکربندی قابل استفاده می‌باشد.',
    stateKey: 'areaDifferenceEnabled',
    modeKey: 'areaDifferenceMode',
    periodKey: 'areaDifferencePeriod',
    fixedAmountKey: 'areaDifferenceFixedAmount',
    percentAmountKey: 'areaDifferencePercentAmount',
    capKey: 'areaDifferencePenaltyCap',
    trailingField: {
      key: 'areaDifferenceAllowedChange',
      label: 'میزان مجاز تغییر در متراژ',
      helper: 'اگر اختلاف از این مقدار بیشتر شود، جریمه اعمال می‌شود.',
      type: 'number',
    },
    progressiveRows: [
      { fromKey: 'areaDifferenceProgressiveRow1From', toKey: 'areaDifferenceProgressiveRow1To', rateKey: 'areaDifferenceProgressiveRow1Rate' },
      { fromKey: 'areaDifferenceProgressiveRow2From', toKey: 'areaDifferenceProgressiveRow2To', rateKey: 'areaDifferenceProgressiveRow2Rate' },
      { fromKey: 'areaDifferenceProgressiveRow3From', toKey: 'areaDifferenceProgressiveRow3To', rateKey: 'areaDifferenceProgressiveRow3Rate' },
    ],
  },
};

function NumericField({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper: string;
}) {
  return (
    <div className="space-y-3">
      <FieldLabel label={label} />
      <FinancialAmountInput value={value} onChange={onChange} suffix="" />
      <p className="text-right text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function ProgressiveRateGrid({
  rows,
  state,
  onValueChange,
}: {
  rows: SectionConfig['progressiveRows'];
  state: ContractRuleState;
  onValueChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      {rows.map((row, index) => (
        <div key={row.fromKey} className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <FieldLabel label={`از بازه ${index + 1}`} />
            <FinancialAmountInput value={String(state.values[row.fromKey] ?? '')} onChange={(value) => onValueChange(row.fromKey, value)} suffix="" />
          </div>
          <div className="space-y-3">
            <FieldLabel label={`تا بازه ${index + 1}`} />
            <FinancialAmountInput value={String(state.values[row.toKey] ?? '')} onChange={(value) => onValueChange(row.toKey, value)} suffix="" />
          </div>
          <div className="space-y-3">
            <FieldLabel label={`نرخ جریمه ${index + 1}`} />
            <FinancialAmountInput value={String(state.values[row.rateKey] ?? '')} onChange={(value) => onValueChange(row.rateKey, value)} suffix="%" />
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
        const response = await fetchWithTimeout('/api/business-settings/contract-rules/builder-penalty', { cache: 'no-store', timeoutMs: 20_000 });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
        }
        const payload = (await response.json()) as ContractRuleState;
        if (!mounted) return;
        setState(payload);
        initialSnapshotRef.current = JSON.stringify(payload);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
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

      const response = await fetchWithTimeout('/api/business-settings/contract-rules/builder-penalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
        timeoutMs: 25_000,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }

      initialSnapshotRef.current = JSON.stringify(nextState);
      if (!options?.silent) setMessage('تنظیمات جرایم سازنده ذخیره شد.');
    } catch (saveError) {
      if (saveError instanceof DOMException && saveError.name === 'AbortError') {
        setError('ذخیره‌سازی بیش از حد طول کشید. لطفاً دوباره تلاش کنید.');
      } else {
        setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: string, value: string | boolean) => {
    setState((current) =>
      current
        ? {
            ...current,
            values: {
              ...current.values,
              [key]: value,
            },
          }
        : current,
    );
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
        const currentState = stateRef.current;
        if (!currentState) return;
        if (!dirtyRef.current) return;
        await persistState(currentState);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const listProgress = useMemo(() => {
    if (!state) return { configured: 0, total: BUILDER_PENALTY_SECTIONS.length };
    const configured = BUILDER_PENALTY_SECTIONS.filter((s) => Boolean(state.values[s.stateKey])).length;
    return { configured, total: BUILDER_PENALTY_SECTIONS.length };
  }, [state]);

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات جریمه سازنده..." />;
  }

  const saveCurrent = async () => {
    if (!stateRef.current) return;
    await persistState(stateRef.current);
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">تعریف جرایم سازنده</p>
          <p className="mt-0.5 text-[13px] text-slate-500">ساختار و پارامترهای جرایم مرتبط با تعهدات سازنده را تنظیم کنید.</p>
        </div>

        <div className="space-y-6 p-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">فهرست جرایم سازنده</h2>
              <span className="text-xs text-slate-400">
                {listProgress.configured}/{listProgress.total} مورد فعال
              </span>
            </div>

            <div className="space-y-3">
              {BUILDER_PENALTY_SECTIONS.map((item) => {
                const config = SECTION_META[item.id];
                const isExpanded = expandedSectionId === item.id;
                const sectionOwnEnabled = Boolean(state.values[item.stateKey]);
                const sectionEnabled = sectionOwnEnabled;
                const activeMode = String(state.values[config.modeKey] || 'fixed') as BuilderPenaltyMode;
                const periodLabel = String(state.values[config.periodKey] || PERIOD_OPTIONS[0].value);

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border transition ${sectionEnabled ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!sectionOwnEnabled) return;
                            setExpandedSectionId((current) => (current === item.id ? null : item.id));
                          }}
                          className="flex min-w-0 flex-1 flex-col gap-3 text-right sm:flex-row-reverse sm:items-center sm:gap-4"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  sectionEnabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-slate-200 bg-slate-50 text-slate-500'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${sectionEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden />
                                {sectionEnabled ? 'فعال' : 'غیرفعال'}
                              </span>
                            </div>
                            <p className="text-xs leading-6 text-slate-500">{item.description}</p>
                            {sectionEnabled ? (
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{MODE_OPTIONS.find((m) => m.value === activeMode)?.label ?? activeMode}</span>
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{periodLabel}</span>
                              </div>
                            ) : null}
                          </div>
                          <ChevronLeft className={`h-5 w-5 shrink-0 text-slate-400 transition ${isExpanded ? '-rotate-90' : ''}`} aria-hidden />
                        </button>

                        <ContractRegistrationSwitch
                          checked={sectionOwnEnabled}
                          variant="segmented"
                          onChange={(value) => {
                            setState((current) =>
                              current
                                ? {
                                    ...current,
                                    values: {
                                      ...current.values,
                                      [config.stateKey]: value,
                                    },
                                  }
                                : current,
                            );
                            if (value) {
                              setExpandedSectionId(item.id);
                            } else if (expandedSectionId === item.id) {
                              setExpandedSectionId(null);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {isExpanded && sectionOwnEnabled ? (
                      <div className="border-t border-cyan-100 bg-white/80 p-4">
                        <section className="space-y-4">
                          <div className="space-y-2 text-right">
                            <h4 className="text-sm font-bold text-slate-700">تنظیمات این آیتم</h4>
                            <p className="text-xs leading-6 text-slate-500">{config.activationDescription}</p>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="space-y-6 p-4">
                              <div className="space-y-3">
                                <div className="text-right">
                                  <h5 className="text-sm font-extrabold text-slate-800">روش محاسبه</h5>
                                  <p className="mt-1 text-xs leading-6 text-slate-500">یکی از روش‌ها را انتخاب کنید.</p>
                                </div>
                                <LoanChoicePills
                                  ariaLabel="روش محاسبه جریمه"
                                  options={MODE_OPTIONS}
                                  value={activeMode}
                                  onChange={(value) => setValue(config.modeKey, value)}
                                />
                              </div>

                              <div className="space-y-3">
                                <div className="text-right">
                                  <h5 className="text-sm font-extrabold text-slate-800">دوره محاسبه جریمه</h5>
                                  <p className="mt-1 text-xs leading-6 text-slate-500">دوره را انتخاب کنید.</p>
                                </div>
                                <LoanChoicePills
                                  ariaLabel="دوره محاسبه جریمه"
                                  options={PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                                  value={periodLabel}
                                  onChange={(value) => setValue(config.periodKey, value)}
                                />
                              </div>

                              {activeMode === 'fixed' ? (
                                <>
                                  <div className="border-t border-slate-200" />
                                  <NumericField
                                    label="مبلغ ثابت جریمه"
                                    value={String(state.values[config.fixedAmountKey] ?? '')}
                                    onChange={(value) => setValue(config.fixedAmountKey, value)}
                                    helper="مبلغی که به ازای هر دوره تاخیر به عنوان جریمه درنظر گرفته می‌شود"
                                  />
                                </>
                              ) : null}

                              {activeMode === 'percent' ? (
                                <>
                                  <div className="border-t border-slate-200" />
                                  <NumericField
                                    label="درصد جریمه"
                                    value={String(state.values[config.percentAmountKey] ?? '')}
                                    onChange={(value) => setValue(config.percentAmountKey, value)}
                                    helper="درصدی که به عنوان جریمه برای این مورد اعمال می‌شود"
                                  />
                                </>
                              ) : null}

                              {activeMode === 'progressive' ? (
                                <>
                                  <div className="border-t border-slate-200" />
                                  <div className="space-y-2 text-right">
                                    <h5 className="text-sm font-extrabold text-slate-800">جدول جریمه‌های تصاعدی</h5>
                                    <p className="text-xs leading-6 text-slate-500">نرخ جریمه را برای بازه‌های مختلف ثبت کنید.</p>
                                  </div>
                                  <ProgressiveRateGrid rows={config.progressiveRows} state={state} onValueChange={(k, v) => setValue(k, v)} />
                                </>
                              ) : null}

                              <div className="border-t border-slate-200" />
                              <NumericField
                                label="سقف جریمه"
                                value={String(state.values[config.capKey] ?? '')}
                                onChange={(value) => setValue(config.capKey, value)}
                                helper="حداکثر مبلغ جریمه‌ای که قابل اعمال است"
                              />

                              <div className="border-t border-slate-200" />

                              {config.trailingField.type === 'number' ? (
                                <NumericField
                                  label={config.trailingField.label}
                                  value={String(state.values[config.trailingField.key] ?? '')}
                                  onChange={(value) => setValue(config.trailingField.key, value)}
                                  helper={config.trailingField.helper}
                                />
                              ) : (
                                <div className="space-y-3">
                                  <div className="text-right">
                                    <FieldLabel label={config.trailingField.label} />
                                    <p className="-mt-2 text-sm leading-7 text-slate-500">{config.trailingField.helper}</p>
                                  </div>
                                  <LoanChoicePills
                                    ariaLabel={config.trailingField.label}
                                    options={(config.trailingField.options ?? []).map((o) => ({ value: o, label: o }))}
                                    value={String(state.values[config.trailingField.key] || config.trailingField.options?.[0] || '')}
                                    onChange={(value) => setValue(config.trailingField.key, value)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={saveCurrent}
                              disabled={saving}
                              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                            >
                              {saving ? 'در حال ذخیره…' : 'ثبت'}
                            </button>
                          </div>
                        </section>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {message ? <LoanSuccess message={message} /> : null}
          {error ? <LoanError error={error} /> : null}
        </div>
      </div>
    </div>
  );
});

