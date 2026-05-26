'use client';

import { useEffect, useState, type ElementType } from 'react';
import { ArrowUpRight, BadgePercent, CircleDollarSign } from 'lucide-react';
import { type ContractRuleState } from '../../../lib/businessContractRules';
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
} from '../../../lib/materialSpecsChangeRule';
import { normalizeKnownProgressivePenaltyValues } from '../../../lib/progressivePenalty';
import {
  ContractRegistrationSwitch,
  FieldLabel,
  FinancialAmountInput,
  LoanChoicePills,
  LoanError,
  LoanLoadingState,
  LoanPageShell,
  LoanSaveBar,
  LoanSectionCard,
  LoanSuccess,
  cn,
} from './LoanSettingsPrimitives';
import { MultiTagPills, TagPills } from '../../contracts/new/_components/ContractFormPrimitives';

type BuilderPenaltySectionId = 'unit-delivery-delay' | 'material-specs-change' | 'area-difference';
type BuilderPenaltyMode = 'fixed' | 'percent' | 'progressive';

type SectionConfig = {
  title: string;
  description: string;
  activationTitle: string;
  activationDescription: string;
  stateKey: 'unitDeliveryDelayEnabled' | 'materialSpecsChangeEnabled' | 'areaDifferenceEnabled';
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

const MODE_OPTIONS: Array<{ id: BuilderPenaltyMode; title: string; icon: ElementType }> = [
  { id: 'fixed', title: 'مبلغ ثابت', icon: CircleDollarSign },
  { id: 'percent', title: 'درصدی', icon: BadgePercent },
  { id: 'progressive', title: 'تصاعدی', icon: ArrowUpRight },
];

const SECTION_META: Record<BuilderPenaltySectionId, SectionConfig> = {
  'unit-delivery-delay': {
    title: 'تاخیر در تحویل واحد',
    description: 'مشخص می‌کند جریمه تاخیر در تحویل واحد برای سازنده در چه شرایطی قابل استفاده باشد.',
    activationTitle: 'فعال‌سازی تاخیر در تحویل واحد',
    activationDescription: 'با فعال‌سازی این گزینه، جریمه تاخیر در تحویل واحد بر اساس پیکربندی به تمام قرارداد قابل استفاده می‌باشد.',
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
    description: 'تعیین شرایطی که تغییر مصالح یا مشخصات، موجب جبران، اصلاح یا حق فسخ برای خریدار می‌شود.',
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
      helper: 'با فعال‌سازی این گزینه، جرائم بر اساس پیکربندی به تمام قراردادهای جدید اعمال خواهند شد',
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
    description: 'مشخص می‌کند جریمه مربوط به اختلاف متراژ برای سازنده در چه شرایطی قابل استفاده باشد.',
    activationTitle: 'فعال‌سازی جریمه اختلاف متراژ',
    activationDescription: 'با فعال‌سازی این گزینه، جریمه اختلاف متراژ بر اساس پیکربندی به تمام قرارداد قابل استفاده می‌باشد.',
    stateKey: 'areaDifferenceEnabled',
    modeKey: 'areaDifferenceMode',
    periodKey: 'areaDifferencePeriod',
    fixedAmountKey: 'areaDifferenceFixedAmount',
    percentAmountKey: 'areaDifferencePercentAmount',
    capKey: 'areaDifferencePenaltyCap',
    trailingField: {
      key: 'areaDifferenceAllowedChange',
      label: 'میزان مجاز تغییر در متراژ',
      helper: 'میزان مجاز تغییر در متراژ واحد که در صورتی که بیش از این مقدار تغییر داشته باشد سازنده بایستی جریمه پرداخت کند',
      type: 'number',
    },
    progressiveRows: [
      { fromKey: 'areaDifferenceProgressiveRow1From', toKey: 'areaDifferenceProgressiveRow1To', rateKey: 'areaDifferenceProgressiveRow1Rate' },
      { fromKey: 'areaDifferenceProgressiveRow2From', toKey: 'areaDifferenceProgressiveRow2To', rateKey: 'areaDifferenceProgressiveRow2Rate' },
      { fromKey: 'areaDifferenceProgressiveRow3From', toKey: 'areaDifferenceProgressiveRow3To', rateKey: 'areaDifferenceProgressiveRow3Rate' },
    ],
  },
};

function BuilderPenaltyModeButton({
  title,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  icon: ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex min-w-[120px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition"
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border transition',
          active
            ? 'border-[#49495f] bg-[#49495f] text-white'
            : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]',
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-lg font-black text-[color:var(--text-strong)]">{title}</span>
      <span className={cn('absolute inset-x-5 bottom-0 h-[2px] transition', active ? 'bg-[#49495f]' : 'bg-transparent')} />
    </button>
  );
}

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
      <p className="text-right text-sm text-[color:var(--text-muted)]">{helper}</p>
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
    <div className="space-y-4">
      <div className="text-right">
        <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">{label}</h3>
        <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{helper}</p>
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
        <p className="rounded-2xl border border-dashed border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-3 text-right text-sm leading-7 text-[color:var(--text-muted)]">{emptyState}</p>
      ) : (
        <div className="space-y-3">
          {selectedDetails.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-3 text-right">
              <div className="text-sm font-black text-[color:var(--text-strong)]">{item.label}</div>
              <p className="mt-1 text-sm leading-7 text-[color:var(--text-muted)]">{item.meta.description}</p>
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
    <div className="space-y-4">
      <div className="text-right">
        <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">سطح اهمیت تغییر</h3>
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
      <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-3 text-right">
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{selectedOption.description}</p>
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
    <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2 text-right">
        <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">{title}</h3>
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
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
    <div className="space-y-5">
      {visibleRows.map((row, index) => (
        <div key={row.fromKey} className="grid gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:grid-cols-[1fr_120px_1fr_1fr]">
          <div className="space-y-3">
            <FieldLabel label={`از بازه ${index + 1}`} />
            <input value={row.from} disabled className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-slate-500" />
            <p className="text-right text-xs text-[color:var(--text-muted)]">شروع خودکار است.</p>
          </div>
          <label className="flex items-center justify-end gap-2 pt-9 text-xs font-bold text-[color:var(--text-muted)]">
            <input
              type="checkbox"
              checked={row.openEnded}
              onChange={(event) => syncRanges({ [row.openEndedKey]: event.target.checked, [row.toKey]: '' })}
              className="h-4 w-4 rounded border-slate-300 text-cyan-600"
            />
            به بعد
          </label>
          <div className="space-y-3">
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
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-right disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div className="space-y-3">
            <FieldLabel label={`نرخ جریمه ${index + 1}`} />
            <FinancialAmountInput value={row.rate} onChange={(value) => onValueChange(row.rateKey, value)} suffix="%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BuilderPenaltyDetailPanel({ sectionId }: { sectionId: BuilderPenaltySectionId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractRuleState | null>(null);

  const section = SECTION_META[sectionId];

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
        if (mounted) setState(payload);
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
  }, [sectionId]);

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

      const response = await fetch('/api/business-settings/contract-rules/builder-penalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedState),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }

      if (!options?.silent) {
        setMessage(`تنظیمات «${section.title}» با موفقیت ذخیره شد.`);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
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

  const handleSave = async () => {
    if (!state) return;
    await persistState(state);
  };

  if (loading || !state) {
    return <LoanLoadingState label={`در حال بارگذاری ${section.title}...`} />;
  }

  const activeMode = String(state.values[section.modeKey] || 'fixed') as BuilderPenaltyMode;
  const rootEnabled = Boolean(state.active);
  const sectionOwnEnabled = Boolean(state.values[section.stateKey]);
  const sectionEnabled = rootEnabled && sectionOwnEnabled;
  const includedTypes = parseStoredStringList(state.values.materialSpecsChangeIncludedTypes);
  const referenceSources = parseStoredStringList(state.values.materialSpecsChangeReferenceSources);
  const violationOutcomes = parseStoredStringList(state.values.materialSpecsChangeViolationOutcomes);
  const requiredDocuments = parseStoredStringList(state.values.materialSpecsChangeRequiredDocuments);
  const importanceLevel =
    String(state.values.materialSpecsChangeImportanceLevel || MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS[0]?.value || '');
  const isMaterialSpecsSection = section.variant === 'material-specs-change';

  return (
    <>
      <LoanPageShell title={section.title} description={section.description} backHref="/business-settings/contract-rules/builder-penalty">
        <LoanSectionCard className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <h2 className="text-xl font-black text-[color:var(--text-strong)]">{section.activationTitle}</h2>
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">{section.activationDescription}</p>
            </div>
            <div className="self-start lg:self-auto">
              <ContractRegistrationSwitch
                checked={sectionOwnEnabled}
                variant="segmented"
                onChange={(value) => {
                  const nextState = {
                    ...state,
                    values: {
                      ...state.values,
                      [section.stateKey]: value,
                    },
                  };
                  setState(nextState);
                  void persistState(nextState, { silent: true });
                }}
              />
            </div>
          </div>
        </LoanSectionCard>

        {sectionEnabled ? isMaterialSpecsSection ? (
          <LoanSectionCard className="space-y-8 p-5">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-right">
              <p className="text-sm leading-7 text-slate-700">
                این تنظیمات همان ساختاری را تعیین می‌کنند که در بخش جرایم سازنده داخل پیش‌نویس قرارداد نمایش داده می‌شود. هر تغییر پس از ذخیره، به عنوان مرجع پیش‌فرض قراردادهای بعدی و مبنای بررسی اختلافات مربوط به تغییر مصالح و مشخصات استفاده خواهد شد.
              </p>
            </div>
            <MaterialSpecsMultiSelectField
              label="نوع تغییرات مشمول"
              helper="مشخص کنید تغییر در کدام بخش‌ها می‌تواند مشمول بررسی و اقدام قراردادی شود."
              options={MATERIAL_SPECS_CHANGE_TYPES}
              details={MATERIAL_SPECS_CHANGE_TYPE_DETAILS}
              emptyState="هنوز حوزه‌ای انتخاب نشده است. تا زمانی که موردی انتخاب نشود، در فلو قرارداد نیز دسته مشخصی برای ثبت این نوع تغییر نمایش یا تفسیر نمی‌شود."
              value={includedTypes}
              onToggle={(item) => setValue('materialSpecsChangeIncludedTypes', toggleStoredStringList(state.values.materialSpecsChangeIncludedTypes, item))}
            />

            <div className="border-t border-[color:var(--border-soft)]" />

            <MaterialSpecsImportanceField value={importanceLevel} onChange={(value) => setValue('materialSpecsChangeImportanceLevel', value)} />

            <div className="border-t border-[color:var(--border-soft)]" />

            <MaterialSpecsMultiSelectField
              label="مرجع مقایسه"
              helper="تغییرات نسبت به کدام سند یا مرجع بررسی شود."
              options={MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES}
              details={MATERIAL_SPECS_CHANGE_REFERENCE_DETAILS}
              emptyState="هنوز مرجع مقایسه‌ای انتخاب نشده است. بدون این انتخاب، تیم قرارداد در پیش‌نویس و رسیدگی‌های بعدی مبنای روشنی برای سنجش تغییر نخواهد داشت."
              value={referenceSources}
              onToggle={(item) => setValue('materialSpecsChangeReferenceSources', toggleStoredStringList(state.values.materialSpecsChangeReferenceSources, item))}
            />

            <div className="border-t border-[color:var(--border-soft)]" />

            <MaterialSpecsToggleField
              title="جایگزینی هم‌ارزش یا بهتر"
              description="اگر متریال یا مشخصات جایگزین از نظر کیفیت و ارزش معادل یا بهتر باشد، تخلف محسوب نمی‌شود."
              effect="در پیش‌نویس و رسیدگی‌های بعدی، این سوییچ تعیین می‌کند آیا تغییر هم‌ارزش باید تخلف تلقی شود یا سیستم آن را به‌عنوان جایگزینی مجاز بپذیرد."
              checked={Boolean(state.values.materialSpecsChangeEquivalentOrBetterAllowed)}
              onChange={(value) => setValue('materialSpecsChangeEquivalentOrBetterAllowed', value)}
            />

            <div className="border-t border-[color:var(--border-soft)]" />

            <MaterialSpecsToggleField
              title="تأیید خریدار برای تغییرات مهم"
              description="اگر تغییر مهم بدون تأیید خریدار انجام شود، می‌تواند موجب مطالبه جبران، اصلاح یا حق فسخ شود."
              effect="این گزینه در جریان قرارداد مشخص می‌کند که برای تغییرات مهم، نبود تأیید خریدار خودِ یک مبنای اعتراض، جبران یا فسخ باشد یا نه."
              checked={Boolean(state.values.materialSpecsChangeBuyerApprovalRequired)}
              onChange={(value) => setValue('materialSpecsChangeBuyerApprovalRequired', value)}
            />

            <div className="border-t border-[color:var(--border-soft)]" />

            <MaterialSpecsMultiSelectField
              label="نتیجه قابل اعمال در صورت تخلف"
              helper="مشخص کنید در صورت احراز تغییر غیرمجاز، چه اقداماتی در سیستم قابل انتخاب باشد."
              options={MATERIAL_SPECS_CHANGE_OUTCOMES}
              details={MATERIAL_SPECS_CHANGE_OUTCOME_DETAILS}
              emptyState="هنوز خروجی قابل اعمالی انتخاب نشده است. تا وقتی این بخش خالی بماند، نتیجه رسیدگی در بخش‌های بعدی پروژه استاندارد و ازپیش‌تعریف‌شده نخواهد بود."
              value={violationOutcomes}
              onToggle={(item) => setValue('materialSpecsChangeViolationOutcomes', toggleStoredStringList(state.values.materialSpecsChangeViolationOutcomes, item))}
            />

            <div className="border-t border-[color:var(--border-soft)]" />

            <MaterialSpecsMultiSelectField
              label="مستندات لازم برای بررسی تغییر"
              helper="برای ثبت یا پیگیری تغییر مصالح/مشخصات، حداقل یک مستند باید ضمیمه شود."
              options={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS}
              details={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENT_DETAILS}
              emptyState="هنوز مستند لازم انتخاب نشده است. در این وضعیت، تیم اجرا و بررسی نمی‌داند برای ثبت یا پیگیری این نوع تغییر حداقل چه مدرکی باید ضمیمه شود."
              value={requiredDocuments}
              onToggle={(item) => setValue('materialSpecsChangeRequiredDocuments', toggleStoredStringList(state.values.materialSpecsChangeRequiredDocuments, item))}
            />
          </LoanSectionCard>
        ) : (
          <LoanSectionCard className="overflow-hidden">
            <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
              {MODE_OPTIONS.map((mode) => (
                <BuilderPenaltyModeButton
                  key={mode.id}
                  title={mode.title}
                  icon={mode.icon}
                  active={activeMode === mode.id}
                  onClick={() => setValue(section.modeKey, mode.id)}
                />
              ))}
            </div>

            <div className="space-y-8 p-5">
              <div className="space-y-5">
                <div className="text-right">
                  <h2 className="text-[17px] font-black text-[color:var(--text-strong)]">دوره محاسبه جریمه</h2>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                    با فعال‌سازی این گزینه، جرائم بر اساس پیکربندی به تمام قراردادهای جدید اعمال خواهند شد
                  </p>
                </div>

                <LoanChoicePills
                  ariaLabel="دوره محاسبه جریمه"
                  options={PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  value={String(state.values[section.periodKey] || PERIOD_OPTIONS[0].value)}
                  onChange={(value) => setValue(section.periodKey, value)}
                />
              </div>

              {activeMode === 'fixed' ? (
                <>
                  <div className="border-t border-[color:var(--border-soft)]" />
                  <NumericField
                    label="مبلغ ثابت جریمه"
                    value={String(state.values[section.fixedAmountKey] ?? '')}
                    onChange={(value) => setValue(section.fixedAmountKey, value)}
                    helper="مبلغی که به ازای هر دوره تاخیر به عنوان جریمه درنظر گرفته میشود"
                  />
                </>
              ) : null}

              {activeMode === 'percent' ? (
                <>
                  <div className="border-t border-[color:var(--border-soft)]" />
                  <NumericField
                    label="درصد جریمه"
                    value={String(state.values[section.percentAmountKey] ?? '')}
                    onChange={(value) => setValue(section.percentAmountKey, value)}
                    helper="درصدی که به عنوان جریمه برای این مورد اعمال می‌شود"
                  />
                </>
              ) : null}

              {activeMode === 'progressive' ? (
                <>
                  <div className="border-t border-[color:var(--border-soft)]" />
                  <div className="space-y-3">
                    <h3 className="text-right text-[17px] font-black text-[color:var(--text-strong)]">جدول جریمه‌های تصاعدی</h3>
                    <p className="text-right text-sm text-[color:var(--text-muted)]">نرخ جریمه را برای بازه‌های مختلف ثبت کنید.</p>
                  </div>
                  <SmartProgressiveRateGrid rows={section.progressiveRows} state={state} onValueChange={(key, value) => setValue(key, value)} />
                </>
              ) : null}

              <div className="border-t border-[color:var(--border-soft)]" />

              <NumericField
                label="سقف جریمه"
                value={String(state.values[section.capKey] ?? '')}
                onChange={(value) => setValue(section.capKey, value)}
                helper="حداکثر مبلغ جریمه ای که قابل اعمال میباشد مشخص میشود"
              />

              <div className="border-t border-[color:var(--border-soft)]" />

              {section.trailingField.type === 'number' ? (
                <NumericField
                  label={section.trailingField.label}
                  value={String(state.values[section.trailingField.key] ?? '')}
                  onChange={(value) => setValue(section.trailingField.key, value)}
                  helper={section.trailingField.helper}
                />
              ) : (
                <div className="space-y-5">
                  <div className="text-right">
                    <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">{section.trailingField.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{section.trailingField.helper}</p>
                  </div>
                  <LoanChoicePills
                    ariaLabel={section.trailingField.label}
                    options={(section.trailingField.options ?? []).map((option) => ({ value: option, label: option }))}
                    value={String(state.values[section.trailingField.key] || section.trailingField.options?.[0] || '')}
                    onChange={(value) => setValue(section.trailingField.key, value)}
                  />
                </div>
              )}
            </div>
          </LoanSectionCard>
        ) : null}

        {message ? <LoanSuccess message={message} /> : null}
        {error ? <LoanError error={error} /> : null}
      </LoanPageShell>

      <LoanSaveBar
        saving={saving}
        onSave={() => void handleSave()}
        label={isMaterialSpecsSection ? 'ذخیره تنظیمات' : undefined}
        savingLabel={isMaterialSpecsSection ? 'در حال ذخیره‌سازی' : undefined}
      />
    </>
  );
}
