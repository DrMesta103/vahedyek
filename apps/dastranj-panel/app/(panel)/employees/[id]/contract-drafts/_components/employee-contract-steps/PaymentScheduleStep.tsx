'use client';

import { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { type PaymentSchedule, PAYMENT_SCHEDULE_PERIOD_OPTIONS, PAYMENT_SCHEDULE_TYPE_OPTIONS } from '../../../../../../lib/payroll-business-settings';
import { type PayrollComparisonMode } from '../../../../../../lib/payroll-comparison-labels';
import { differenceBadge, fieldBadge, SectionPlaceholder } from './employee-contract-ui';

function labelForMode(mode?: PayrollComparisonMode) {
  return mode === 'template' ? 'قالب' : 'مبنا';
}

function differenceTooltip(mode?: PayrollComparisonMode, referenceWord?: string) {
  if (mode === 'template') return 'در قالب انتخاب‌شده، نوع پرداخت متفاوت تعریف شده است.';
  if (mode === 'tenant') return 'در تنظیمات تاو ادمین، نوع پرداخت متفاوت تعریف شده است.';
  return `در ${referenceWord ?? 'مبنا'}، نوع پرداخت متفاوت تعریف شده است.`;
}

function toSingleValue(next: string | string[]) {
  return Array.isArray(next) ? next[0] ?? '' : next;
}

export function PaymentScheduleStep({
  paymentSchedule,
  basePaymentSchedule,
  comparisonMode,
  comparisonTooltip,
  onChange,
  helperText = 'نوع کلی پرداخت حقوق و مزایا را انتخاب کنید.',
}: {
  paymentSchedule?: PaymentSchedule | null;
  basePaymentSchedule?: PaymentSchedule | null;
  comparisonMode?: PayrollComparisonMode;
  comparisonTooltip?: string;
  onChange: (next: PaymentSchedule) => void;
  helperText?: string;
}) {
  const current = paymentSchedule ?? { type: 'time_period', period: 'monthly' as const };
  const hasComparison = Boolean(basePaymentSchedule);
  const baseLabel = labelForMode(comparisonMode);
  const difference = useMemo(() => {
    if (!basePaymentSchedule) return null;
    if (basePaymentSchedule.type === current.type && basePaymentSchedule.period === current.period) {
      return fieldBadge(`همسان با ${baseLabel}`, 'success');
    }
    return differenceBadge(`متفاوت با ${baseLabel}`, comparisonTooltip ?? differenceTooltip(comparisonMode, baseLabel));
  }, [baseLabel, basePaymentSchedule, comparisonMode, comparisonTooltip, current.period, current.type]);

  if (!paymentSchedule && !basePaymentSchedule) return <SectionPlaceholder />;

  return (
    <div className="business-payroll-subcard">
      <p className="contract-draft-field-hint">{helperText}</p>

      <div className="business-draft-section-title">
        <h3>نوع پرداخت</h3>
        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">
          <CreditCard className="h-4 w-4" />
          زمان‌بندی
        </span>
      </div>

      <TaavChoiceChipGroup
        ariaLabel="نوع پرداخت حقوق و مزایا"
        options={PAYMENT_SCHEDULE_TYPE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.enabled ? option.label : `${option.label} · در حال توسعه`,
          disabled: !option.enabled,
        }))}
        value={current.type}
        onValueChange={(next) => {
          const type = toSingleValue(next) as PaymentSchedule['type'];
          const selected = PAYMENT_SCHEDULE_TYPE_OPTIONS.find((option) => option.value === type);
          if (!selected?.enabled) return;
          onChange({ ...current, type });
        }}
      />

      <div className="business-payroll-highlight subtle" style={{ marginTop: 12 }}>
        {difference ?? (hasComparison ? <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">همسان با {baseLabel}</span> : null)}
      </div>

      {current.type === 'time_period' ? (
        <section className="business-payroll-subcard" style={{ marginTop: 12 }}>
          <div className="business-draft-section-title">
            <h3>دوره پرداخت</h3>
            <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">پیش‌فرض: ماهانه</span>
          </div>
          <TaavChoiceChipGroup
            ariaLabel="دوره پرداخت حقوق"
            options={PAYMENT_SCHEDULE_PERIOD_OPTIONS.map((option) => ({
              value: option.value,
              label: option.enabled ? option.label : `${option.label} · در حال توسعه`,
              disabled: !option.enabled,
            }))}
            value={current.period ?? 'monthly'}
            onValueChange={(next) => {
              const period = toSingleValue(next) as NonNullable<PaymentSchedule['period']>;
              const selected = PAYMENT_SCHEDULE_PERIOD_OPTIONS.find((option) => option.value === period);
              if (!selected?.enabled) return;
              onChange({ ...current, period });
            }}
          />
        </section>
      ) : null}
    </div>
  );
}
