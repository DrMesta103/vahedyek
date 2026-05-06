'use client';

import { useEffect, useState, type ElementType } from 'react';
import { ArrowUpRight, BadgePercent, CircleDollarSign } from 'lucide-react';
import { type ContractRuleState } from '../../../lib/businessContractRules';
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

type BuilderPenaltySectionId = 'unit-delivery-delay' | 'material-specs-change' | 'area-difference';
type BuilderPenaltyMode = 'fixed' | 'percent' | 'progressive';

type SectionConfig = {
  title: string;
  description: string;
  activationTitle: string;
  activationDescription: string;
  stateKey: 'unitDeliveryDelayEnabled' | 'materialSpecsChangeEnabled' | 'areaDifferenceEnabled';
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
    title: 'تغییر مصالح / مشخصات',
    description: 'مشخص می‌کند جریمه مربوط به تغییر مصالح یا مشخصات واحد برای سازنده در چه شرایطی قابل استفاده باشد.',
    activationTitle: 'فعال‌سازی جریمه تغییر مصالح / مشخصات',
    activationDescription: 'با فعال‌سازی این گزینه، جریمه تغییر مصالح / مشخصات بر اساس پیکربندی به تمام قرارداد قابل استفاده می‌باشد.',
    stateKey: 'materialSpecsChangeEnabled',
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

      const response = await fetch('/api/business-settings/contract-rules/builder-penalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
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
            values: {
              ...current.values,
              [key]: value,
            },
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

        {sectionEnabled ? (
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
                  <ProgressiveRateGrid rows={section.progressiveRows} state={state} onValueChange={(key, value) => setValue(key, value)} />
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

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </>
  );
}
