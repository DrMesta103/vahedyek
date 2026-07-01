'use client';

import { BadgePercent, ChevronLeft, CircleDollarSign, TrendingUp } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ProfileAwareUnitInput } from '../../../../../components/ProfileAwareUnitInput';
import type { ContractRuleState } from '../../../../../lib/businessContractRules';
import {
  BUILDER_PENALTY_MODE_OPTIONS,
  BUILDER_PENALTY_PERCENT_BASIS_OPTIONS,
  BUILDER_PENALTY_PERIOD_OPTIONS,
  BUILDER_PENALTY_SECTION_META,
  type BuilderPenaltyMode,
  type BuilderPenaltySectionId,
} from '../../../../../lib/builderPenalty';
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
  LoanError,
  LoanLoadingState,
  LoanSuccess,
} from '../../../../business-settings/_components/LoanSettingsPrimitives';
import { MultiTagPills, TagPills } from '../ContractFormPrimitives';

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
    title: 'تغییرات مهم مصالح و مشخصات واحد',
    description: 'تعیین می‌کند تغییرات مهم در مصالح یا مشخصات واحد چگونه بررسی شود و چه اقدام قراردادی برای آن قابل اعمال باشد.',
  },
];

const SECTION_COPY: Record<BuilderPenaltySectionId, { activationDescription: string }> = {
  'unit-delivery-delay': {
    activationDescription: 'این بخش منطق جریمه سازنده بابت تاخیر در تحویل واحد را مشخص می‌کند.',
  },
  'material-specs-change': {
    activationDescription:
      'در صورت فعال بودن، تغییرات مهم در مصالح یا مشخصات واحد طبق این تنظیمات بررسی می‌شود و می‌تواند منجر به جبران، اصلاح، توافق مالی یا حق فسخ شود.',
  },
};

const MODE_CARD_META = {
  fixed: {
    title: 'مبلغ ثابت برای هر روز/ماه',
    description: 'در این حالت، برای هر دوره تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
    icon: CircleDollarSign,
  },
  percent: {
    title: 'درصدی از مانده بدهی معوق',
    description: 'جریمه به‌صورت درصدی از مانده بدهی معوق محاسبه می‌شود.',
    icon: BadgePercent,
  },
  progressive: {
    title: 'جریمه تصاعدی با روزهای تاخیر',
    description: 'مبلغ جریمه با افزایش مدت تاخیر بر اساس بازه‌های زمانی مختلف افزایش پیدا می‌کند.',
    icon: TrendingUp,
  },
} as const;

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
        <input value={value} disabled className="h-11 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 text-right text-slate-500" />
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
        className="h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-right text-slate-900 placeholder:text-slate-400"
      />
      {helper ? <p className="text-right text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ModeCard({
  value,
  active,
  onSelect,
}: {
  value: BuilderPenaltyMode;
  active: boolean;
  onSelect: (mode: BuilderPenaltyMode) => void;
}) {
  const meta = MODE_CARD_META[value];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex min-h-[124px] items-center gap-3 rounded-[8px] border px-4 py-4 text-right transition ${
        active
          ? 'border-cyan-300 bg-cyan-50/80 shadow-[0_4px_18px_rgba(34,211,238,0.10)]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border ${
          active ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[14px] font-black leading-6 ${active ? 'text-cyan-900' : 'text-slate-800'}`}>{meta.title}</span>
        <span className="mt-1 block text-[12px] font-semibold leading-6 text-slate-500">{meta.description}</span>
      </span>
    </button>
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
        <div key={row.fromKey} className="grid gap-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1.25fr_1.75fr]">
          <div className="space-y-2">
            <FieldLabel label={`مبلغ جریمه ${periodLabel} - پله ${index + 1}`} />
            <FinancialAmountInput value={row.amount} onChange={(value) => onValueChange(row.rateKey, value)} suffix="تومان" />
          </div>

          <div className="space-y-2">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,132px)_minmax(0,132px)] sm:justify-end">
              <div className="space-y-2">
                <FieldLabel label="از" />
                <ProfileAwareUnitInput value={row.from} onChange={() => undefined} suffix="روز" numericMode="integer" disabled />
              </div>
              <div className="space-y-2">
                <FieldLabel label="تا" />
                <ProfileAwareUnitInput
                  value={row.to}
                  disabled={row.openEnded}
                  onChange={(value) => sync({ [row.toKey]: value.replace(/\D/g, ''), [row.openEndedKey]: false })}
                  placeholder={row.openEnded ? 'به بعد' : '30'}
                  suffix="روز"
                  numericMode="integer"
                />
              </div>
            </div>

            <label className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
              <input
                type="checkbox"
                checked={row.openEnded}
                onChange={(event) => sync({ [row.openEndedKey]: event.target.checked, [row.toKey]: '' })}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600"
              />
              به بعد
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function MaterialSpecsMultiSelectField({
  label,
  helper,
  sectionEffectLabel,
  sectionEffect,
  options,
  details,
  emptyState,
  value,
  onToggle,
}: {
  label: string;
  helper: string;
  sectionEffectLabel?: string;
  sectionEffect?: string;
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
        <p className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-right text-xs leading-6 text-slate-500">{emptyState}</p>
      ) : (
        <div className="space-y-3">
          {selectedDetails.map((item) => (
            <div key={item.label} className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <div className="text-sm font-extrabold text-slate-800">{item.label}</div>
              <p className="mt-1 text-xs leading-6 text-slate-500">{item.meta.description}</p>
            </div>
          ))}
        </div>
      )}
      {sectionEffectLabel && sectionEffect ? (
        <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-right">
          <p className="text-xs leading-6 text-cyan-800">{sectionEffectLabel}: {sectionEffect}</p>
        </div>
      ) : null}
    </div>
  );
}

function MaterialSpecsImportanceField({
  value,
  onChange,
  sectionEffectLabel,
  sectionEffect,
}: {
  value: string;
  onChange: (value: string) => void;
  sectionEffectLabel?: string;
  sectionEffect?: string;
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
      <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-right">
        <p className="text-xs leading-6 text-slate-500">{selectedOption.description}</p>
      </div>
      {sectionEffectLabel && sectionEffect ? (
        <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-right">
          <p className="text-xs leading-6 text-cyan-800">{sectionEffectLabel}: {sectionEffect}</p>
        </div>
      ) : null}
    </div>
  );
}

function MaterialSpecsToggleField({
  title,
  description,
  checked,
  onChange,
  sectionEffectLabel,
  sectionEffect,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  sectionEffectLabel?: string;
  sectionEffect?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[8px] border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2 text-right">
        <div className="text-sm font-extrabold text-slate-800">{title}</div>
        <p className="text-xs leading-6 text-slate-500">{description}</p>
        {sectionEffectLabel && sectionEffect ? <p className="text-xs leading-6 text-cyan-800">{sectionEffectLabel}: {sectionEffect}</p> : null}
      </div>
      <div className="self-start lg:self-auto">
        <ContractRegistrationSwitch checked={checked} variant="segmented" onChange={onChange} />
      </div>
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

  const serialize = (value: ContractRuleState | null) => JSON.stringify(value);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/business-settings/contract-rules/builder-penalty', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
        }
        const payload = (await response.json()) as ContractRuleState;
        if (!mounted) return;
        setState(payload);
        stateRef.current = payload;
        initialSnapshotRef.current = serialize(payload);
        dirtyRef.current = false;
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

  useEffect(() => {
    onStatusChange?.({ loading, saving, dirty: dirtyRef.current });
  }, [loading, saving, onStatusChange]);

  const persist = async (nextState: ContractRuleState, options?: { silent?: boolean }) => {
    try {
      setSaving(true);
      setError('');
      if (!options?.silent) setMessage('');
      const normalizedState = { ...nextState, values: normalizeKnownProgressivePenaltyValues(nextState.values) };
      const response = await fetch('/api/business-settings/contract-rules/builder-penalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedState),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }
      setState(normalizedState);
      stateRef.current = normalizedState;
      initialSnapshotRef.current = serialize(normalizedState);
      dirtyRef.current = false;
      if (!options?.silent) setMessage('تنظیمات جرایم سازنده ذخیره شد.');
      onStatusChange?.({ loading: false, saving: false, dirty: false });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: string, value: string | boolean, sectionId?: BuilderPenaltySectionId) => {
    setState((current) => {
      if (!current) return current;
      const section = sectionId ? BUILDER_PENALTY_SECTION_META[sectionId] : null;
      const next = {
        ...current,
        values: normalizeKnownProgressivePenaltyValues({
          ...current.values,
          [key]: value,
          ...(section && key === section.unlimitedCapKey && value ? { [section.capKey]: '' } : {}),
        }),
      };
      stateRef.current = next;
      dirtyRef.current = serialize(next) !== initialSnapshotRef.current;
      onStatusChange?.({ loading: false, saving, dirty: dirtyRef.current });
      return next;
    });
  };

  const saveCurrent = async () => {
    if (!stateRef.current) return;
    await persist(stateRef.current);
  };

  useImperativeHandle(ref, () => ({
    saveIfDirty: async () => {
      if (dirtyRef.current && stateRef.current) await persist(stateRef.current, { silent: true });
    },
  }));

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات جرایم سازنده..." />;
  }

  return (
    <div className="space-y-4">
      {SECTIONS.map((item) => {
        const section = BUILDER_PENALTY_SECTION_META[item.id];
        const copy = SECTION_COPY[item.id];
        const sectionOwnEnabled = Boolean(state.values[section.stateKey]);
        const sectionEnabled = sectionOwnEnabled;
        const activeMode = String(state.values[section.modeKey] || 'fixed') as BuilderPenaltyMode;
        const periodLabel = String(state.values[section.periodKey] || BUILDER_PENALTY_PERIOD_OPTIONS[0].value);
        const unlimitedCap = section.unlimitedCapKey ? Boolean(state.values[section.unlimitedCapKey]) : false;
        const selectedPercentBasis = section.percentBasisKey ? String(state.values[section.percentBasisKey] || BUILDER_PENALTY_PERCENT_BASIS_OPTIONS[0]) : '';
        const isMaterialSpecsSection = item.id === 'material-specs-change';
        const includedTypes = parseStoredStringList(state.values.materialSpecsChangeIncludedTypes);
        const importanceLevel = String(state.values.materialSpecsChangeImportanceLevel || MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS[0]?.value || '');
        const referenceSources = parseStoredStringList(state.values.materialSpecsChangeReferenceSources);
        const violationOutcomes = parseStoredStringList(state.values.materialSpecsChangeViolationOutcomes);
        const requiredDocuments = parseStoredStringList(state.values.materialSpecsChangeRequiredDocuments);
        const isExpanded = expandedSectionId === item.id;

        return (
          <div key={item.id} className={`overflow-hidden rounded-[8px] border transition ${sectionEnabled ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'}`}>
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
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sectionEnabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-slate-200 bg-slate-50 text-slate-500'}`}>
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
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">{BUILDER_PENALTY_MODE_OPTIONS.find((m) => m.value === activeMode)?.label ?? activeMode}</span>
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
                    setValue(section.stateKey, value, item.id);
                    if (value) setExpandedSectionId(item.id);
                    else if (expandedSectionId === item.id) setExpandedSectionId(null);
                  }}
                />
              </div>
            </div>

            {isExpanded && sectionOwnEnabled ? (
              <div className="border-t border-cyan-100 bg-white/80 p-4">
                <section className="space-y-4">
                  <div className="space-y-2 text-right">
                    <h4 className="text-sm font-bold text-slate-700">تنظیمات این آیتم</h4>
                    <p className="text-xs leading-6 text-slate-500">{copy.activationDescription}</p>
                  </div>

                  <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
                    {isMaterialSpecsSection ? (
                      <div className="space-y-8 p-5 md:p-10">
                        <div className="rounded-[8px] border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-right">
                          <p className="text-xs leading-6 text-slate-700">تغییرات این بخش مستقیماً تنظیمات سازمانی جرایم سازنده را به‌روزرسانی می‌کند. نتیجه آن بلافاصله در همین فلو دیده می‌شود و برای قراردادهای بعدی نیز به‌عنوان مرجع پیش‌فرض باقی می‌ماند.</p>
                        </div>

                        <MaterialSpecsMultiSelectField
                          label="نوع تغییرات مشمول"
                          helper="مشخص کنید تغییر در کدام بخش‌ها می‌تواند مشمول بررسی و اقدام قراردادی شود."
                          options={MATERIAL_SPECS_CHANGE_TYPES}
                          details={MATERIAL_SPECS_CHANGE_TYPE_DETAILS}
                          emptyState="هنوز حوزه‌ای انتخاب نشده است. تا وقتی موردی انتخاب نشود، در ادامه فلو قرارداد هم دسته مشخصی برای این نوع تغییر وجود نخواهد داشت."
                          value={includedTypes}
                          onToggle={(itemValue) => setValue('materialSpecsChangeIncludedTypes', toggleStoredStringList(state.values.materialSpecsChangeIncludedTypes, itemValue), item.id)}
                        />

                        <div className="border-t border-slate-200" />

                        <MaterialSpecsImportanceField
                          value={importanceLevel}
                          onChange={(value) => setValue('materialSpecsChangeImportanceLevel', value, item.id)}
                        />

                        <div className="border-t border-slate-200" />

                        <MaterialSpecsMultiSelectField
                          label="مرجع مقایسه"
                          helper="تغییرات نسبت به کدام سند یا مرجع بررسی شود."
                          options={MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES}
                          details={MATERIAL_SPECS_CHANGE_REFERENCE_DETAILS}
                          emptyState="هنوز مرجع مقایسه‌ای انتخاب نشده است. در این حالت، مبنای سنجش تغییر در بررسی‌های بعدی قرارداد روشن نخواهد بود."
                          value={referenceSources}
                          onToggle={(itemValue) => setValue('materialSpecsChangeReferenceSources', toggleStoredStringList(state.values.materialSpecsChangeReferenceSources, itemValue), item.id)}
                        />

                        <div className="border-t border-slate-200" />

                        <MaterialSpecsToggleField
                          title="جایگزینی هم‌ارزش یا بهتر"
                          description="اگر متریال یا مشخصات جایگزین از نظر کیفیت و ارزش معادل یا بهتر باشد، تخلف محسوب نمی‌شود."
                          checked={Boolean(state.values.materialSpecsChangeEquivalentOrBetterAllowed)}
                          onChange={(value) => setValue('materialSpecsChangeEquivalentOrBetterAllowed', value, item.id)}
                        />

                        <div className="border-t border-slate-200" />

                        <MaterialSpecsToggleField
                          title="تأیید خریدار برای تغییرات مهم"
                          description="اگر تغییر مهم بدون تأیید خریدار انجام شود، می‌تواند موجب مطالبه جبران، اصلاح یا حق فسخ شود."
                          checked={Boolean(state.values.materialSpecsChangeBuyerApprovalRequired)}
                          onChange={(value) => setValue('materialSpecsChangeBuyerApprovalRequired', value, item.id)}
                        />

                        <div className="border-t border-slate-200" />

                        <MaterialSpecsMultiSelectField
                          label="نتیجه قابل اعمال در صورت تخلف"
                          helper="مشخص کنید در صورت احراز تغییر غیرمجاز، چه اقداماتی در سیستم قابل انتخاب باشد."
                          options={MATERIAL_SPECS_CHANGE_OUTCOMES}
                          details={MATERIAL_SPECS_CHANGE_OUTCOME_DETAILS}
                          emptyState="هنوز خروجی قابل اعمالی انتخاب نشده است. در این وضعیت، مسیر نتیجه‌گیری در بررسی‌های بعدی استاندارد نمی‌شود."
                          value={violationOutcomes}
                          onToggle={(itemValue) => setValue('materialSpecsChangeViolationOutcomes', toggleStoredStringList(state.values.materialSpecsChangeViolationOutcomes, itemValue), item.id)}
                        />

                        <div className="border-t border-slate-200" />

                        <MaterialSpecsMultiSelectField
                          label="مستندات لازم برای بررسی تغییر"
                          helper="برای ثبت یا پیگیری تغییر مصالح/مشخصات، حداقل یک مستند باید ضمیمه شود."
                          options={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS}
                          details={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENT_DETAILS}
                          emptyState="هنوز مستند لازم انتخاب نشده است. بنابراین حداقل مدارک مورد انتظار در ادامه ثبت و پیگیری تغییر روشن نیست."
                          value={requiredDocuments}
                          sectionEffectLabel="محل ثبت در اپ"
                          sectionEffect="فایل این مدارک در مرحله `پیوست و اسناد قرارداد` آپلود می‌شود؛ معمولاً با `افزودن سند` و انتخاب یک دسته سفارشی یا یکی از دسته‌های موجود."
                          onToggle={(itemValue) => setValue('materialSpecsChangeRequiredDocuments', toggleStoredStringList(state.values.materialSpecsChangeRequiredDocuments, itemValue), item.id)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-8 p-5 md:p-10">
                        <div className="grid gap-3 md:grid-cols-3">
                          {BUILDER_PENALTY_MODE_OPTIONS.map((mode) => (
                            <ModeCard key={mode.value} value={mode.value} active={activeMode === mode.value} onSelect={(value) => setValue(section.modeKey, value, item.id)} />
                          ))}
                        </div>

                        <p className="text-center text-base leading-8 text-slate-600">
                          {MODE_CARD_META[activeMode as keyof typeof MODE_CARD_META]?.description ?? 'یکی از روش‌ها را انتخاب کنید.'}
                        </p>

                        <section className="space-y-5">
                          <h5 className="text-right text-[17px] font-black text-slate-800">دوره محاسبه جریمه</h5>
                          <p className="text-right text-sm leading-7 text-slate-600">دوره را برای محاسبه جریمه انتخاب کنید.</p>
                          <TagPills
                            options={BUILDER_PENALTY_PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                            value={periodLabel}
                            onChange={(value) => setValue(section.periodKey, value, item.id)}
                            className="justify-end flex-row-reverse"
                          />
                        </section>

                        {activeMode === 'fixed' ? (
                          <AmountField
                            label="مبلغ ثابت جریمه"
                            value={String(state.values[section.fixedAmountKey] ?? '')}
                            onChange={(value) => setValue(section.fixedAmountKey, value, item.id)}
                            helper="مبلغی که به ازای هر دوره تاخیر به عنوان جریمه درنظر گرفته می‌شود."
                          />
                        ) : null}

                        {activeMode === 'percent' ? (
                          <>
                            <AmountField
                              label="درصد جریمه"
                              value={String(state.values[section.percentAmountKey] ?? '')}
                              onChange={(value) => setValue(section.percentAmountKey, value, item.id)}
                              helper="درصدی که به عنوان جریمه برای این مورد اعمال می‌شود."
                              suffix="%"
                            />

                            {section.percentBasisKey ? (
                              <div className="space-y-3">
                                <div className="text-right">
                                  <h5 className="text-sm font-extrabold text-slate-800">مبنای محاسبه درصد</h5>
                                  <p className="mt-1 text-xs leading-6 text-slate-500">مشخص کنید درصد جریمه از چه مبنایی محاسبه شود.</p>
                                </div>
                                <TagPills
                                  options={BUILDER_PENALTY_PERCENT_BASIS_OPTIONS.map((option) => ({ value: option, label: option }))}
                                  value={selectedPercentBasis}
                                  onChange={(value) => setValue(section.percentBasisKey!, value, item.id)}
                                  className="justify-end flex-row-reverse"
                                />
                              </div>
                            ) : null}

                            {selectedPercentBasis === 'ارزش روز واحد' ? (
                              <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
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
                              <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
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
                              <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
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
                                  />
                                  <AmountField
                                    label="مبلغ مبنای سفارشی"
                                    value={String(state.values[section.customBasisAmountKey!] ?? '')}
                                    onChange={(value) => setValue(section.customBasisAmountKey!, value, item.id)}
                                  />
                                  <TextField
                                    label="توضیح / مرجع سفارشی"
                                    value={String(state.values[section.customBasisReferenceKey!] ?? '')}
                                    onChange={(value) => setValue(section.customBasisReferenceKey!, value, item.id)}
                                    placeholder="اختیاری"
                                  />
                                </div>
                              </div>
                            ) : null}
                          </>
                        ) : null}

                        {activeMode === 'progressive' ? (
                          <>
                            <div className="space-y-2 text-right">
                              <h5 className="text-sm font-extrabold text-slate-800">پله‌های جریمه تصاعدی</h5>
                              <p className="text-xs leading-6 text-slate-500">مبالغ هر بازه را ثبت کنید.</p>
                            </div>
                            <ProgressiveGrid rows={section.progressiveRows} values={state.values} periodLabel={periodLabel} onValueChange={(key, value) => setValue(key, value, item.id)} />
                          </>
                        ) : null}

                        {item.id === 'unit-delivery-delay' ? (
                          <>
                            <AmountField
                              label="مهلت تنفس بدون جریمه (بر حسب روز)"
                              value={String(state.values[section.graceDaysKey!] ?? '')}
                              onChange={(value) => setValue(section.graceDaysKey!, value, item.id)}
                              helper="اگر این مقدار ۱۰ باشد، جریمه از روز ۱۱ تاخیر شروع می‌شود."
                            />

                            <div className="space-y-5 rounded-[8px] border border-slate-200 bg-white p-5">
                              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2 text-right">
                                  <h4 className="text-sm font-bold text-slate-700">سقف جریمه</h4>
                                  <p className="text-xs leading-6 text-slate-500">در صورت فعال بودن، جریمه فقط تا سقف مشخص محاسبه می‌شود.</p>
                                </div>
                                <div className="self-start lg:self-auto">
                                  <ContractRegistrationSwitch checked={!unlimitedCap} variant="segmented" onChange={(value) => setValue(section.unlimitedCapKey!, !value, item.id)} />
                                </div>
                              </div>

                              {!unlimitedCap ? (
                                <div className="space-y-3">
                                  <FieldLabel label="مبلغ سقف جریمه *" />
                                  <FinancialAmountInput value={String(state.values[section.capKey] ?? '')} onChange={(value) => setValue(section.capKey, value, item.id)} suffix="" />
                                </div>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={saveCurrent}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-[8px] bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
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

      {message ? <LoanSuccess message={message} /> : null}
      {error ? <LoanError error={error} /> : null}
    </div>
  );
});


