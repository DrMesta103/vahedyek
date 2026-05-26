'use client';

import { ArrowUpRight, BadgePercent, CircleDollarSign, Info } from 'lucide-react';
import { useEffect, useState, type ElementType } from 'react';
import { ProfileAwareUnitInput } from '../../../components/ProfileAwareUnitInput';
import { type ContractRuleState } from '../../../lib/businessContractRules';
import {
  BUILDER_PENALTY_MODE_OPTIONS,
  BUILDER_PENALTY_PERCENT_BASIS_OPTIONS,
  BUILDER_PENALTY_PERIOD_OPTIONS,
  BUILDER_PENALTY_SECTION_META,
  type BuilderPenaltyMode,
  type BuilderPenaltySectionId,
} from '../../../lib/builderPenalty';
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

const MODE_CARDS: Array<{ value: BuilderPenaltyMode; title: string; icon: ElementType }> = [
  { value: 'fixed', title: 'مبلغ ثابت', icon: CircleDollarSign },
  { value: 'percent', title: 'درصدی', icon: BadgePercent },
  { value: 'progressive', title: 'تصاعدی', icon: ArrowUpRight },
];

const SECTION_COPY: Record<BuilderPenaltySectionId, { activationTitle: string; activationDescription: string }> = {
  'unit-delivery-delay': {
    activationTitle: 'جریمه تأخیر در تحویل واحد',
    activationDescription:
      'این بخش منطق جریمه سازنده بابت تأخیر در تحویل واحد را مشخص می‌کند. جریمه می‌تواند ثابت، درصدی یا تصاعدی باشد و با مهلت تنفس و سقف قابل کنترل تنظیم شود.',
  },
  'material-specs-change': {
    activationTitle: 'فعال‌سازی قواعد تغییر مصالح و مشخصات',
    activationDescription:
      'در صورت فعال بودن، تغییرات مهم در مصالح یا مشخصات واحد طبق این تنظیمات بررسی می‌شود و می‌تواند منجر به جبران، اصلاح، توافق مالی یا حق فسخ شود.',
  },
  'area-difference': {
    activationTitle: 'جریمه اختلاف متراژ',
    activationDescription: 'در این بخش شرایط و نحوه محاسبه جریمه اختلاف متراژ تعریف می‌شود.',
  },
};

function NumberField({
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
        <input value={value} disabled className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-right text-slate-500" />
      ) : (
        <FinancialAmountInput value={value} onChange={onChange} suffix={suffix} />
      )}
      {helper ? <p className="text-right text-sm text-[color:var(--text-muted)]">{helper}</p> : null}
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
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-slate-900 placeholder:text-slate-400"
      />
      {helper ? <p className="text-right text-sm text-[color:var(--text-muted)]">{helper}</p> : null}
    </div>
  );
}

function ModeButton({
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
    <button type="button" onClick={onClick} className="group relative flex min-w-[120px] flex-1 flex-col items-center gap-3 px-3 py-5 text-center transition">
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border transition',
          active ? 'border-[#49495f] bg-[#49495f] text-white' : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]',
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-lg font-black text-[color:var(--text-strong)]">{title}</span>
      <span className={cn('absolute inset-x-5 bottom-0 h-[2px] transition', active ? 'bg-[#49495f]' : 'bg-transparent')} />
    </button>
  );
}

function ProgressiveAmountGrid({
  rows,
  values,
  onValueChange,
  periodLabel,
}: {
  rows: Array<{ fromKey: string; toKey: string; rateKey: string }>;
  values: ContractRuleState['values'];
  onValueChange: (key: string, value: string | boolean) => void;
  periodLabel: string;
}) {
  const getOpenEndedKey = (toKey: string) => toKey.replace(/To$/, 'OpenEnded');
  let nextFrom = 1;

  const computedRows = rows.map((row) => {
    const openEndedKey = getOpenEndedKey(row.toKey);
    const to = String(values[row.toKey] ?? '');
    const openEnded = Boolean(values[openEndedKey]);
    const from = String(nextFrom);
    const toNumber = Number(String(to).replace(/\D/g, ''));

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

  const visibleUntil = computedRows.findIndex((row) => row.openEnded);
  const visibleRows = visibleUntil >= 0 ? computedRows.slice(0, visibleUntil + 1) : computedRows;

  const syncRanges = (updates: Partial<Record<string, string | boolean>>) => {
    let from = 1;
    let closed = false;

    computedRows.forEach((row) => {
      onValueChange(row.fromKey, String(from));
      if (closed) return;

      const openEnded = Boolean(updates[row.openEndedKey] ?? row.openEnded);
      onValueChange(row.openEndedKey, openEnded);
      if (openEnded) {
        onValueChange(row.toKey, '');
        closed = true;
        return;
      }

      const toValue = String(updates[row.toKey] ?? row.to).replace(/\D/g, '');
      onValueChange(row.toKey, toValue);
      const toNumber = Number(toValue);
      if (Number.isFinite(toNumber) && toNumber >= from) from = toNumber + 1;
    });
  };

  return (
    <div className="space-y-5">
      {visibleRows.map((row, index) => (
        <div key={row.fromKey} className="grid gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:grid-cols-[1.25fr_1.75fr]">
          <div className="space-y-3">
            <FieldLabel label={`مبلغ جریمه ${periodLabel} - پله ${index + 1}`} />
            <FinancialAmountInput value={row.amount} onChange={(value) => onValueChange(row.rateKey, value)} suffix="تومان" />
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,140px)_minmax(0,140px)] sm:justify-end">
              <div className="space-y-3">
                <FieldLabel label="از" />
                <ProfileAwareUnitInput value={row.from} onChange={() => undefined} suffix="روز" numericMode="integer" disabled />
              </div>
              <div className="space-y-3">
                <FieldLabel label="تا" />
                <ProfileAwareUnitInput
                  value={row.to}
                  disabled={row.openEnded}
                  onChange={(value) => syncRanges({ [row.toKey]: value.replace(/\D/g, ''), [row.openEndedKey]: false })}
                  placeholder={row.openEnded ? 'به بعد' : '30'}
                  suffix="روز"
                  numericMode="integer"
                />
              </div>
            </div>

            <label className="flex items-center justify-end gap-2 text-xs font-bold text-[color:var(--text-muted)]">
              <input
                type="checkbox"
                checked={row.openEnded}
                onChange={(event) => syncRanges({ [row.openEndedKey]: event.target.checked, [row.toKey]: '' })}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600"
              />
              به بعد
            </label>

            <p className="text-right text-xs text-[color:var(--text-muted)]">شروع هر پله به‌صورت خودکار از پایان پله قبلی محاسبه می‌شود.</p>
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
            </div>
          ))}
        </div>
      )}
      {sectionEffectLabel && sectionEffect ? (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-right">
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
      </div>
      {sectionEffectLabel && sectionEffect ? (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-right">
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
    <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2 text-right">
        <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">{title}</h3>
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
        {sectionEffectLabel && sectionEffect ? <p className="text-xs leading-6 text-cyan-800">{sectionEffectLabel}: {sectionEffect}</p> : null}
      </div>
      <div className="self-start lg:self-auto">
        <ContractRegistrationSwitch checked={checked} variant="segmented" onChange={onChange} />
      </div>
    </div>
  );
}

export function BuilderPenaltyDetailPanel({ sectionId }: { sectionId: BuilderPenaltySectionId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractRuleState | null>(null);

  const section = BUILDER_PENALTY_SECTION_META[sectionId];
  const copy = SECTION_COPY[sectionId];
  const isMaterialSpecsSection = sectionId === 'material-specs-change';

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

      if (!options?.silent) setMessage(`تنظیمات «${section.title}» با موفقیت ذخیره شد.`);
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
              ...(key === section.unlimitedCapKey && value ? { [section.capKey]: '' } : {}),
            }),
          }
        : current,
    );
  };

  if (loading || !state) {
    return <LoanLoadingState label={`در حال بارگذاری ${section.title}...`} />;
  }

  const activeMode = String(state.values[section.modeKey] || 'fixed') as BuilderPenaltyMode;
  const rootEnabled = Boolean(state.active);
  const sectionEnabled = rootEnabled && Boolean(state.values[section.stateKey]);
  const periodLabel = String(state.values[section.periodKey] || BUILDER_PENALTY_PERIOD_OPTIONS[0].value);
  const unlimitedCap = section.unlimitedCapKey ? Boolean(state.values[section.unlimitedCapKey]) : false;
  const selectedPercentBasis = section.percentBasisKey ? String(state.values[section.percentBasisKey] || BUILDER_PENALTY_PERCENT_BASIS_OPTIONS[0]) : '';
  const includedTypes = parseStoredStringList(state.values.materialSpecsChangeIncludedTypes);
  const referenceSources = parseStoredStringList(state.values.materialSpecsChangeReferenceSources);
  const violationOutcomes = parseStoredStringList(state.values.materialSpecsChangeViolationOutcomes);
  const requiredDocuments = parseStoredStringList(state.values.materialSpecsChangeRequiredDocuments);
  const importanceLevel = String(state.values.materialSpecsChangeImportanceLevel || MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS[0]?.value || '');

  return (
    <>
      <LoanPageShell title={section.title} description={section.description} backHref="/business-settings/contract-rules/builder-penalty">
        <LoanSectionCard className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <h2 className="text-xl font-black text-[color:var(--text-strong)]">{copy.activationTitle}</h2>
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">{copy.activationDescription}</p>
            </div>
            <div className="self-start lg:self-auto">
              <ContractRegistrationSwitch
                checked={Boolean(state.values[section.stateKey])}
                variant="segmented"
                onChange={(value) => {
                  const nextState = { ...state, values: { ...state.values, [section.stateKey]: value } };
                  setState(nextState);
                  void persistState(nextState, { silent: true });
                }}
              />
            </div>
          </div>
        </LoanSectionCard>

        {sectionEnabled ? (
          isMaterialSpecsSection ? (
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

              <MaterialSpecsImportanceField
                value={importanceLevel}
                onChange={(value) => setValue('materialSpecsChangeImportanceLevel', value)}
              />

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
                checked={Boolean(state.values.materialSpecsChangeEquivalentOrBetterAllowed)}
                onChange={(value) => setValue('materialSpecsChangeEquivalentOrBetterAllowed', value)}
              />

              <div className="border-t border-[color:var(--border-soft)]" />

              <MaterialSpecsToggleField
                title="تأیید خریدار برای تغییرات مهم"
                description="اگر تغییر مهم بدون تأیید خریدار انجام شود، می‌تواند موجب مطالبه جبران، اصلاح یا حق فسخ شود."
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
                sectionEffectLabel="محل ثبت در اپ"
                sectionEffect="فایل این مدارک در مرحله `پیوست و اسناد قرارداد` آپلود می‌شود؛ معمولاً با `افزودن سند` و انتخاب یک دسته سفارشی یا یکی از دسته‌های موجود."
                onToggle={(item) => setValue('materialSpecsChangeRequiredDocuments', toggleStoredStringList(state.values.materialSpecsChangeRequiredDocuments, item))}
              />
            </LoanSectionCard>
          ) : (
            <LoanSectionCard className="overflow-hidden">
              <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
                {MODE_CARDS.map((mode) => (
                  <ModeButton key={mode.value} title={mode.title} icon={mode.icon} active={activeMode === mode.value} onClick={() => setValue(section.modeKey, mode.value)} />
                ))}
              </div>

              <div className="space-y-8 p-5">
                <div className="space-y-5">
                  <div className="text-right">
                    <h2 className="text-[17px] font-black text-[color:var(--text-strong)]">دوره محاسبه جریمه</h2>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">مشخص کنید جریمه بر مبنای روز، ماه یا سال محاسبه شود.</p>
                  </div>
                  <LoanChoicePills
                    ariaLabel="دوره محاسبه جریمه"
                    options={BUILDER_PENALTY_PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                    value={periodLabel}
                    onChange={(value) => setValue(section.periodKey, value)}
                  />
                </div>

                {activeMode === 'fixed' ? (
                  <NumberField
                    label="مبلغ ثابت جریمه"
                    value={String(state.values[section.fixedAmountKey] ?? '')}
                    onChange={(value) => setValue(section.fixedAmountKey, value)}
                    helper={`مبلغ جریمه‌ای که برای هر دوره تأخیر (${periodLabel}) محاسبه می‌شود.`}
                  />
                ) : null}

                {activeMode === 'percent' ? (
                  <>
                    <NumberField
                      label="درصد جریمه"
                      value={String(state.values[section.percentAmountKey] ?? '')}
                      onChange={(value) => setValue(section.percentAmountKey, value)}
                      helper={`مثلاً ۱٪ از مبنای انتخاب‌شده در هر ${periodLabel.replace('انه', '')} تأخیر.`}
                      suffix="%"
                    />

                    {section.percentBasisKey ? (
                      <div className="space-y-5">
                        <div className="text-right">
                          <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">مبنای محاسبه درصد</h3>
                          <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">مشخص کنید درصد جریمه از چه عددی محاسبه می‌شود.</p>
                        </div>
                        <LoanChoicePills
                          ariaLabel="مبنای محاسبه درصد"
                          options={BUILDER_PENALTY_PERCENT_BASIS_OPTIONS.map((option) => ({ value: option, label: option }))}
                          value={selectedPercentBasis}
                          onChange={(value) => setValue(section.percentBasisKey!, value)}
                        />
                      </div>
                    ) : null}

                    {selectedPercentBasis === 'ارزش روز واحد' ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 text-right">
                          <h4 className="text-sm font-bold text-slate-800">فلو ثبت ارزش روز واحد</h4>
                          <p className="mt-1 text-xs leading-6 text-slate-500">چون فلو مستقلی در نرم‌افزار وجود ندارد، مبلغ و مرجع ارزش روز در همین بخش ثبت می‌شود.</p>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <NumberField
                            label="مبلغ ارزش روز واحد"
                            value={String(state.values[section.marketValueAmountKey!] ?? '')}
                            onChange={(value) => setValue(section.marketValueAmountKey!, value)}
                            helper="عددی که درصد جریمه از آن محاسبه می‌شود."
                          />
                          <TextField
                            label="مرجع / توضیح ارزش روز"
                            value={String(state.values[section.marketValueReferenceKey!] ?? '')}
                            onChange={(value) => setValue(section.marketValueReferenceKey!, value)}
                            placeholder="مثلاً گزارش داخلی ارزش‌گذاری"
                            helper="منشأ این عدد را ثبت کنید تا در آینده قابل استناد باشد."
                          />
                        </div>
                      </div>
                    ) : null}

                    {selectedPercentBasis === 'مبلغ تعیین‌شده توسط کارشناس' ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 text-right">
                          <h4 className="text-sm font-bold text-slate-800">فلو ثبت مبلغ کارشناسی</h4>
                          <p className="mt-1 text-xs leading-6 text-slate-500">برای این مبنا باید مبلغ و مشخصات استنادی کارشناس ثبت شود.</p>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <NumberField
                            label="مبلغ تعیین‌شده توسط کارشناس"
                            value={String(state.values[section.expertAmountKey!] ?? '')}
                            onChange={(value) => setValue(section.expertAmountKey!, value)}
                            helper="عددی که مبنای محاسبه درصد جریمه خواهد بود."
                          />
                          <TextField
                            label="نام کارشناس / شماره گزارش"
                            value={String(state.values[section.expertReferenceKey!] ?? '')}
                            onChange={(value) => setValue(section.expertReferenceKey!, value)}
                            placeholder="مثلاً کارشناس رسمی شماره گزارش ۱۲۳"
                            helper="برای ردیابی و استناد بعدی لازم است."
                          />
                        </div>
                      </div>
                    ) : null}

                    {selectedPercentBasis === 'سفارشی' ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 text-right">
                          <h4 className="text-sm font-bold text-slate-800">فلو مبنای سفارشی</h4>
                          <p className="mt-1 text-xs leading-6 text-slate-500">برای حالت سفارشی باید هم عنوان مبنا و هم مبلغ مرجع را مشخص کنید.</p>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3">
                          <TextField
                            label="عنوان مبنای سفارشی"
                            value={String(state.values[section.customBasisTitleKey!] ?? '')}
                            onChange={(value) => setValue(section.customBasisTitleKey!, value)}
                            placeholder="مثلاً ارزش توافقی واحد"
                            helper="شرح دهید درصد از چه چیزی محاسبه می‌شود."
                          />
                          <NumberField
                            label="مبلغ مبنای سفارشی"
                            value={String(state.values[section.customBasisAmountKey!] ?? '')}
                            onChange={(value) => setValue(section.customBasisAmountKey!, value)}
                            helper="عدد مرجع برای محاسبه درصد."
                          />
                          <TextField
                            label="توضیح / مرجع سفارشی"
                            value={String(state.values[section.customBasisReferenceKey!] ?? '')}
                            onChange={(value) => setValue(section.customBasisReferenceKey!, value)}
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
                    <div className="space-y-3">
                      <h3 className="text-right text-[17px] font-black text-[color:var(--text-strong)]">پله‌های جریمه تصاعدی</h3>
                      <p className="text-right text-sm text-[color:var(--text-muted)]">مثال: روزهای ۱ تا ۳۰ یک مبلغ، ۳۱ تا ۶۰ مبلغ بیشتر، و از روز ۶۱ به بعد مبلغ بالاتر.</p>
                    </div>
                    <ProgressiveAmountGrid rows={section.progressiveRows} values={state.values} onValueChange={setValue} periodLabel={periodLabel} />
                  </>
                ) : null}

                {sectionId === 'unit-delivery-delay' ? (
                  <>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm leading-7 text-amber-900">
                      <div className="flex items-start gap-2">
                        <Info className="mt-1 h-4 w-4 shrink-0" />
                        <p>اگر مهلت تنفس ۱۰ روز باشد، جریمه از روز ۱۱ تأخیر شروع می‌شود؛ نه از روز اول.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-right text-sm leading-7 text-sky-900">
                      <div className="flex items-start gap-2">
                        <Info className="mt-1 h-4 w-4 shrink-0" />
                        <p>منطق جریمه و منطق فسخ مستقل هستند. این صفحه فقط نحوه ایجاد و محاسبه جریمه را تعریف می‌کند؛ اگر برای همین تخلف حق فسخ هم لازم است، باید جداگانه در تنظیمات فسخ خریدار پیکربندی شود.</p>
                      </div>
                    </div>

                    <NumberField
                      label="مهلت تنفس بدون جریمه (بر حسب روز)"
                      value={String(state.values[section.graceDaysKey!] ?? '')}
                      onChange={(value) => setValue(section.graceDaysKey!, value)}
                      helper="تعداد روزهای مجاز بعد از موعد تحویل که هنوز جریمه از آن تاریخ شروع نمی‌شود."
                    />

                    <div className="space-y-5 rounded-[28px] border border-[color:var(--border-soft)] bg-white p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2 text-right">
                          <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">سقف جریمه</h3>
                          <p className="text-sm leading-7 text-[color:var(--text-muted)]">در صورت فعال بودن، جریمه فقط تا سقف مشخص محاسبه می‌شود. در حالت غیرفعال، محاسبه جریمه بدون سقف ادامه پیدا می‌کند.</p>
                        </div>
                        <div className="self-start lg:self-auto">
                          <ContractRegistrationSwitch checked={!unlimitedCap} variant="segmented" onChange={(value) => setValue(section.unlimitedCapKey!, !value)} />
                        </div>
                      </div>

                      {!unlimitedCap ? (
                        <div className="space-y-3">
                          <FieldLabel label="مبلغ سقف جریمه *" />
                          <FinancialAmountInput value={String(state.values[section.capKey] ?? '')} onChange={(value) => setValue(section.capKey, value)} suffix="" />
                          <p className="text-right text-sm text-[color:var(--text-muted)]">اگر مدل ثابت باشد، این عدد نمی‌تواند کمتر از مبلغ پایه جریمه باشد.</p>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            </LoanSectionCard>
          )
        ) : null}

        {message ? <LoanSuccess message={message} /> : null}
        {error ? <LoanError error={error} /> : null}
      </LoanPageShell>

      <LoanSaveBar
        saving={saving}
        onSave={() => (state ? void persistState(state) : undefined)}
        label={isMaterialSpecsSection ? 'ذخیره تنظیمات' : undefined}
        savingLabel={isMaterialSpecsSection ? 'در حال ذخیره‌سازی' : undefined}
      />
    </>
  );
}
