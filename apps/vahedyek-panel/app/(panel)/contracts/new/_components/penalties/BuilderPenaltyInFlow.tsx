'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { ContractRuleState } from '../../../../../lib/businessContractRules';
import {
  MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES,
  MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS,
  MATERIAL_SPECS_CHANGE_OUTCOMES,
  MATERIAL_SPECS_CHANGE_OUTCOME_DETAILS,
  MATERIAL_SPECS_CHANGE_REFERENCE_DETAILS,
  MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS,
  MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENT_DETAILS,
  MATERIAL_SPECS_CHANGE_TYPE_DETAILS,
  MATERIAL_SPECS_CHANGE_TYPES,
  type MaterialSpecsOptionDetail,
  parseStoredStringList,
  toggleStoredStringList,
} from '../../../../../lib/materialSpecsChangeRule';
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
import { MultiTagPills, TagPills } from '../ContractFormPrimitives';

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
    title: 'تغییرات مهم مصالح و مشخصات واحد',
    description: 'تعیین می‌کند تغییرات مهم در مصالح یا مشخصات واحد چگونه بررسی شود و چه اقدام قراردادی برای آن قابل اعمال باشد.',
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
  variant?: 'default' | 'material-specs-change';
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
    title: 'تغییرات مهم مصالح و مشخصات واحد',
    activationTitle: 'فعال‌سازی قواعد تغییر مصالح و مشخصات',
    activationDescription:
      'در صورت فعال بودن، تغییرات مهم در مصالح یا مشخصات واحد طبق این تنظیمات بررسی می‌شود و می‌تواند منجر به جبران، اصلاح، توافق مالی یا حق فسخ شود.',
    stateKey: 'materialSpecsChangeEnabled',
    variant: 'material-specs-change',
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

function MaterialSpecsMultiSelectField({
  label,
  helper,
  options,
  details,
  emptyState,
  value,
  onToggle,
}: {
  label: string;
  helper: string;
  options: readonly string[];
  details: Record<string, MaterialSpecsOptionDetail>;
  emptyState: string;
  value: string[];
  onToggle: (item: string) => void;
}) {
  const selectedDetails = value
    .map((item) => (details[item] ? { label: item, meta: details[item] } : null))
    .filter((item): item is { label: string; meta: MaterialSpecsOptionDetail } => Boolean(item));

  return (
    <div className="space-y-3">
      <div className="text-right">
        <FieldLabel label={label} />
        <p className="-mt-2 text-sm leading-7 text-slate-500">{helper}</p>
      </div>
      <MultiTagPills
        options={options.map((option) => ({ value: option, label: option, tooltip: option }))}
        values={value}
        onChange={(nextValues) => {
          const currentSet = new Set(value);
          const nextSet = new Set(nextValues);
          const changed = options.find((option) => currentSet.has(option) !== nextSet.has(option));
          if (changed) onToggle(changed);
        }}
        className="justify-end flex-row-reverse"
      />
      {!selectedDetails.length ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-right text-xs leading-6 text-slate-500">{emptyState}</p>
      ) : (
        <div className="space-y-3">
          {selectedDetails.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <div className="text-sm font-extrabold text-slate-800">{item.label}</div>
              <p className="mt-1 text-xs leading-6 text-slate-500">{item.meta.description}</p>
              <p className="mt-2 text-xs leading-6 text-cyan-800">اثر در بخش‌های دیگر: {item.meta.effect}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialSpecsImportanceField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedOption =
    MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS.find((option) => option.value === value) ?? MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS[0];

  return (
    <div className="space-y-3">
      <div className="text-right">
        <FieldLabel label="سطح اهمیت تغییر" />
      </div>
      <TagPills
        options={MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS.map((option) => ({
          value: option.value,
          label: option.label,
          tooltip: option.label,
        }))}
        value={selectedOption.value}
        onChange={onChange}
        className="justify-end flex-row-reverse"
      />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
        <p className="text-xs leading-6 text-slate-500">{selectedOption.description}</p>
        <p className="mt-2 text-xs leading-6 text-cyan-800">اثر در بخش‌های دیگر: {selectedOption.effect}</p>
      </div>
    </div>
  );
}

function MaterialSpecsToggleField({
  title,
  description,
  effect,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  effect: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2 text-right">
        <div className="text-sm font-extrabold text-slate-800">{title}</div>
        <p className="text-xs leading-6 text-slate-500">{description}</p>
        <p className="text-xs leading-6 text-cyan-800">اثر در بخش‌های دیگر: {effect}</p>
      </div>
      <div className="self-start lg:self-auto">
        <ContractRegistrationSwitch checked={checked} variant="segmented" onChange={onChange} />
      </div>
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

function SmartProgressiveRateGrid({
  rows,
  state,
  onValueChange,
}: {
  rows: SectionConfig['progressiveRows'];
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const getOpenEndedKey = (toKey: string) => toKey.replace(/To$/, 'OpenEnded');
  let nextFrom = 1;
  const normalizedRows = rows.map((row) => {
    const openEndedKey = getOpenEndedKey(row.toKey);
    const from = String(nextFrom);
    const to = String(state.values[row.toKey] || '');
    const openEnded = Boolean(state.values[openEndedKey]);
    const toNumber = Number(to.replace(/\D/g, ''));

    if (!openEnded && Number.isFinite(toNumber) && toNumber >= nextFrom) {
      nextFrom = toNumber + 1;
    }

    return {
      ...row,
      openEndedKey,
      from,
      to,
      rate: String(state.values[row.rateKey] || ''),
      openEnded,
    };
  });
  const firstOpenEndedIndex = normalizedRows.findIndex((row) => row.openEnded);
  const visibleRows = firstOpenEndedIndex >= 0 ? normalizedRows.slice(0, firstOpenEndedIndex + 1) : normalizedRows;

  const syncRanges = (updates: Partial<Record<string, string | boolean>>) => {
    let nextFrom = 1;
    let closed = false;

    normalizedRows.forEach((row) => {
      onValueChange(row.fromKey, String(nextFrom));
      if (closed) return;

      const openEnded = Boolean(updates[row.openEndedKey] ?? row.openEnded);
      onValueChange(row.openEndedKey, openEnded);
      if (openEnded) {
        onValueChange(row.toKey, '');
        closed = true;
        return;
      }

      const to = Number(String(updates[row.toKey] ?? row.to).replace(/\D/g, ''));
      if (Number.isFinite(to) && to >= nextFrom) nextFrom = to + 1;
    });
  };

  return (
    <div className="space-y-4">
      {visibleRows.map((row, index) => (
        <div key={row.fromKey} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_100px_1fr_1fr]">
          <div className="space-y-2">
            <FieldLabel label={`از بازه ${index + 1}`} />
            <input value={row.from} disabled className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-slate-500" />
          </div>
          <label className="flex items-center justify-end gap-2 pt-8 text-xs font-bold text-slate-500">
            <input
              type="checkbox"
              checked={row.openEnded}
              onChange={(event) => syncRanges({ [row.openEndedKey]: event.target.checked, [row.toKey]: '' })}
              className="h-4 w-4 rounded border-slate-300 text-cyan-600"
            />
            به بعد
          </label>
          <div className="space-y-2">
            <FieldLabel label={`تا بازه ${index + 1}`} />
            <input
              value={row.to}
              disabled={row.openEnded}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '');
                onValueChange(row.toKey, value);
                syncRanges({ [row.toKey]: value, [row.openEndedKey]: false });
              }}
              placeholder={row.openEnded ? 'به بعد' : 'تا روز'}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-right disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel label={`نرخ جریمه ${index + 1}`} />
            <FinancialAmountInput value={row.rate} onChange={(value) => onValueChange(row.rateKey, value)} suffix="%" />
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
            values: normalizeKnownProgressivePenaltyValues({
              ...current.values,
              [key]: value,
            }),
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
                const isMaterialSpecsSection = config.variant === 'material-specs-change';
                const includedTypes = parseStoredStringList(state.values.materialSpecsChangeIncludedTypes);
                const importanceLevel =
                  String(state.values.materialSpecsChangeImportanceLevel || MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS[0]?.value || '');
                const referenceSources = parseStoredStringList(state.values.materialSpecsChangeReferenceSources);
                const violationOutcomes = parseStoredStringList(state.values.materialSpecsChangeViolationOutcomes);
                const requiredDocuments = parseStoredStringList(state.values.materialSpecsChangeRequiredDocuments);

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
                                {isMaterialSpecsSection ? (
                                  <>
                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{importanceLevel}</span>
                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{`${includedTypes.length} حوزه مشمول`}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{MODE_OPTIONS.find((m) => m.value === activeMode)?.label ?? activeMode}</span>
                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{periodLabel}</span>
                                  </>
                                )}
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
                            {isMaterialSpecsSection ? (
                              <div className="space-y-6 p-4">
                                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-right">
                                  <p className="text-xs leading-6 text-slate-700">
                                    تغییرات این بخش مستقیماً تنظیمات سازمانی جرایم سازنده را به‌روزرسانی می‌کند. نتیجه آن بلافاصله در همین فلو دیده می‌شود و برای قراردادهای بعدی نیز به‌عنوان مرجع پیش‌فرض باقی می‌ماند.
                                  </p>
                                </div>
                                <MaterialSpecsMultiSelectField
                                  label="نوع تغییرات مشمول"
                                  helper="مشخص کنید تغییر در کدام بخش‌ها می‌تواند مشمول بررسی و اقدام قراردادی شود."
                                  options={MATERIAL_SPECS_CHANGE_TYPES}
                                  details={MATERIAL_SPECS_CHANGE_TYPE_DETAILS}
                                  emptyState="هنوز حوزه‌ای انتخاب نشده است. تا وقتی موردی انتخاب نشود، در ادامه فلو قرارداد هم دسته مشخصی برای این نوع تغییر وجود نخواهد داشت."
                                  value={includedTypes}
                                  onToggle={(item) =>
                                    setValue('materialSpecsChangeIncludedTypes', toggleStoredStringList(state.values.materialSpecsChangeIncludedTypes, item))
                                  }
                                />

                                <div className="border-t border-slate-200" />

                                <MaterialSpecsImportanceField
                                  value={importanceLevel}
                                  onChange={(value) => setValue('materialSpecsChangeImportanceLevel', value)}
                                />

                                <div className="border-t border-slate-200" />

                                <MaterialSpecsMultiSelectField
                                  label="مرجع مقایسه"
                                  helper="تغییرات نسبت به کدام سند یا مرجع بررسی شود."
                                  options={MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES}
                                  details={MATERIAL_SPECS_CHANGE_REFERENCE_DETAILS}
                                  emptyState="هنوز مرجع مقایسه‌ای انتخاب نشده است. در این حالت، مبنای سنجش تغییر در بررسی‌های بعدی قرارداد روشن نخواهد بود."
                                  value={referenceSources}
                                  onToggle={(item) =>
                                    setValue('materialSpecsChangeReferenceSources', toggleStoredStringList(state.values.materialSpecsChangeReferenceSources, item))
                                  }
                                />

                                <div className="border-t border-slate-200" />

                                <MaterialSpecsToggleField
                                  title="جایگزینی هم‌ارزش یا بهتر"
                                  description="اگر متریال یا مشخصات جایگزین از نظر کیفیت و ارزش معادل یا بهتر باشد، تخلف محسوب نمی‌شود."
                                  effect="در همین فلو و در قراردادهای بعدی، این سوییچ تعیین می‌کند آیا جایگزینی هم‌ارزش به‌عنوان تخلف باز شود یا خیر."
                                  checked={Boolean(state.values.materialSpecsChangeEquivalentOrBetterAllowed)}
                                  onChange={(value) => setValue('materialSpecsChangeEquivalentOrBetterAllowed', value)}
                                />

                                <div className="border-t border-slate-200" />

                                <MaterialSpecsToggleField
                                  title="تأیید خریدار برای تغییرات مهم"
                                  description="اگر تغییر مهم بدون تأیید خریدار انجام شود، می‌تواند موجب مطالبه جبران، اصلاح یا حق فسخ شود."
                                  effect="این گزینه در ادامه رسیدگی مشخص می‌کند که تغییر مهم بدون تأیید خریدار، صرفاً یک ثبت عادی باشد یا مبنای اعتراض و جبران."
                                  checked={Boolean(state.values.materialSpecsChangeBuyerApprovalRequired)}
                                  onChange={(value) => setValue('materialSpecsChangeBuyerApprovalRequired', value)}
                                />

                                <div className="border-t border-slate-200" />

                                <MaterialSpecsMultiSelectField
                                  label="نتیجه قابل اعمال در صورت تخلف"
                                  helper="مشخص کنید در صورت احراز تغییر غیرمجاز، چه اقداماتی در سیستم قابل انتخاب باشد."
                                  options={MATERIAL_SPECS_CHANGE_OUTCOMES}
                                  details={MATERIAL_SPECS_CHANGE_OUTCOME_DETAILS}
                                  emptyState="هنوز خروجی قابل اعمالی انتخاب نشده است. در این وضعیت، مسیر نتیجه‌گیری در بررسی‌های بعدی استاندارد نمی‌شود."
                                  value={violationOutcomes}
                                  onToggle={(item) =>
                                    setValue('materialSpecsChangeViolationOutcomes', toggleStoredStringList(state.values.materialSpecsChangeViolationOutcomes, item))
                                  }
                                />

                                <div className="border-t border-slate-200" />

                                <MaterialSpecsMultiSelectField
                                  label="مستندات لازم برای بررسی تغییر"
                                  helper="برای ثبت یا پیگیری تغییر مصالح/مشخصات، حداقل یک مستند باید ضمیمه شود."
                                  options={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS}
                                  details={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENT_DETAILS}
                                  emptyState="هنوز مستند لازم انتخاب نشده است. بنابراین حداقل مدارک مورد انتظار در ادامه ثبت و پیگیری تغییر روشن نیست."
                                  value={requiredDocuments}
                                  onToggle={(item) =>
                                    setValue('materialSpecsChangeRequiredDocuments', toggleStoredStringList(state.values.materialSpecsChangeRequiredDocuments, item))
                                  }
                                />
                              </div>
                            ) : (
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
                                  <SmartProgressiveRateGrid rows={config.progressiveRows} state={state} onValueChange={(k, v) => setValue(k, v)} />
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
                            )}
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={saveCurrent}
                              disabled={saving}
                              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                            >
                              {saving ? 'در حال ذخیره…' : isMaterialSpecsSection ? 'ذخیره تنظیمات' : 'ثبت'}
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

