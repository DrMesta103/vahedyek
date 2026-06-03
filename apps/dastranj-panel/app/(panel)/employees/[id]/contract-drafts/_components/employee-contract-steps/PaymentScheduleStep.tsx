'use client';

import { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
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

      <div className="business-payroll-chips" role="radiogroup" aria-label="نوع پرداخت حقوق و مزایا">
        {PAYMENT_SCHEDULE_TYPE_OPTIONS.map((option) => {
          const isDisabled = !option.enabled;
          const isSelected = current.type === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              className={[isSelected ? 'is-selected' : '', isDisabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
              onClick={() => {
                if (isDisabled) return;
                onChange({ ...current, type: option.value });
              }}
            >
              {option.label}
              {isDisabled ? <small>در حال توسعه</small> : null}
            </button>
          );
        })}
      </div>

      <div className="business-payroll-highlight subtle" style={{ marginTop: 12 }}>
        {difference ?? (hasComparison ? <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">همسان با {baseLabel}</span> : null)}
      </div>

      {current.type === 'time_period' ? (
        <section className="business-payroll-subcard" style={{ marginTop: 12 }}>
          <div className="business-draft-section-title">
            <h3>دوره پرداخت</h3>
            <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">پیش‌فرض: ماهانه</span>
          </div>
          <div className="business-payroll-chips" role="radiogroup" aria-label="دوره پرداخت حقوق">
            {PAYMENT_SCHEDULE_PERIOD_OPTIONS.map((option) => {
              const isDisabled = !option.enabled;
              const isSelected = current.period === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isDisabled}
                  className={[isSelected ? 'is-selected' : '', isDisabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (isDisabled) return;
                    onChange({ ...current, period: option.value });
                  }}
                >
                  {option.label}
                  {isDisabled ? <small>در حال توسعه</small> : null}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
