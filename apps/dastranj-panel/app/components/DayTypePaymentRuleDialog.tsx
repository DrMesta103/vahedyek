'use client';

import { useEffect, useMemo, useState } from 'react';
import { Info, Settings2 } from 'lucide-react';
import { PanelFormModal, PanelFormModalActions } from './PanelFormModal';
import { formatFaNumber, toPersianDigits } from '../lib/format-fa';
import {
  compareDayTypePaymentRules,
  DAY_TYPE_PAYMENT_BASE_OPTIONS,
  DAY_TYPE_PAYMENT_RULES,
  getDayTypePaymentBaseShortLabel,
  getUnpaidAbsenceImpactShortLabel,
  UNPAID_ABSENCE_IMPACT_OPTIONS,
  type BaseDifference,
  type DayTypePaymentRule,
  type DayTypePaymentRuleKey,
} from '../lib/payroll-business-settings';
import {
  buildCollectionCompareLabels,
  compareCollectionsForMode,
  type PayrollComparisonMode,
} from '../lib/payroll-comparison-labels';

type DayTypeRuleFieldErrors = Partial<Record<keyof DayTypePaymentRule, string>>;

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

function parseNumber(value: string) {
  const normalized = normalizeDigits(value).replace(/,/g, '').replace(/[^\d.]/g, '');
  return normalized ? Number(normalized) : Number.NaN;
}

function formatDayTypePaymentRuleSummary(rule: DayTypePaymentRule) {
  if (!rule.paidWithoutWork) {
    return 'بی‌حقوق · در محاسبه حقوق لحاظ نمی‌شود';
  }
  return [
    'با حقوق',
    getDayTypePaymentBaseShortLabel(rule.paymentBase),
    `غیبت هفته: ${getUnpaidAbsenceImpactShortLabel(rule.unpaidAbsenceImpact)}`,
    `ضریب ${toPersianDigits(String(rule.workedTimeCoefficient))}`,
  ].join(' · ');
}

function comparisonBaseLabel(mode: PayrollComparisonMode, baseYear?: number) {
  if (mode === 'template') return 'قالب انتخاب‌شده';
  if (mode === 'tenant_base') {
    return baseYear ? `مبنای ${formatFaNumber(baseYear, { useGrouping: false })}` : 'مبنای تنظیمات';
  }
  return 'مبنا';
}

function DifferenceBadge({
  difference,
  variant = 'template',
}: {
  difference?: BaseDifference | null;
  variant?: 'template' | 'tenant_base';
}) {
  if (!difference) return null;
  const variantClass = variant === 'tenant_base' ? ' business-payroll-difference-badge--tenant-base' : '';
  return (
    <span
      className={`business-payroll-difference-badge${variantClass}`}
      title={difference.tooltip}
      aria-label={`${difference.message}. ${difference.tooltip}`}
    >
      <Info className="h-3.5 w-3.5" />
      {difference.message}
    </span>
  );
}

function DualDifferenceBadges({
  difference,
  secondaryDifference,
}: {
  difference?: BaseDifference | null;
  secondaryDifference?: BaseDifference | null;
}) {
  if (!difference && !secondaryDifference) return null;
  return (
    <span className="employee-contract-comparison-badges">
      <DifferenceBadge difference={difference} />
      <DifferenceBadge difference={secondaryDifference} variant="tenant_base" />
    </span>
  );
}

function SelectChip({
  label,
  active,
  onClick,
  tooltip,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tooltip?: string;
}) {
  return (
    <button
      type="button"
      className={`calc-select-chip ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      title={tooltip}
    >
      {label}
    </button>
  );
}

function DayTypeRuleSummaryChips({ rule }: { rule: DayTypePaymentRule }) {
  if (!rule.paidWithoutWork) {
    return (
      <div className="day-type-rule-summary-chips">
        <span className="calc-badge is-active">بی‌حقوق</span>
      </div>
    );
  }
  return (
    <div className="day-type-rule-summary-chips">
      <span className="calc-badge is-active">با حقوق</span>
      <span className="calc-badge">{getDayTypePaymentBaseShortLabel(rule.paymentBase)}</span>
      <span className="calc-badge">غیبت هفته: {getUnpaidAbsenceImpactShortLabel(rule.unpaidAbsenceImpact)}</span>
      <span className="calc-badge">ضریب {toPersianDigits(String(rule.workedTimeCoefficient))}</span>
    </div>
  );
}

function validateDraft(rule: DayTypePaymentRule): DayTypeRuleFieldErrors {
  const errors: DayTypeRuleFieldErrors = {};
  if (rule.paidWithoutWork) {
    if (rule.paymentBase !== 'wageBase' && rule.paymentBase !== 'grossPay') {
      errors.paymentBase = 'مبنای پرداخت را انتخاب کنید';
    }
    if (
      rule.unpaidAbsenceImpact !== 'none' &&
      rule.unpaidAbsenceImpact !== 'full_deduction' &&
      rule.unpaidAbsenceImpact !== 'proportional_by_minutes'
    ) {
      errors.unpaidAbsenceImpact = 'اثر غیبت غیرموجه را انتخاب کنید';
    }
    if (!Number.isFinite(rule.workedTimeCoefficient)) {
      errors.workedTimeCoefficient = 'ضریب پرداخت را وارد کنید';
    } else if (rule.workedTimeCoefficient <= 0) {
      errors.workedTimeCoefficient = 'ضریب باید عددی مثبت باشد';
    }
  }
  return errors;
}

export function DayTypePaymentRuleDialog({
  open,
  dayType,
  value,
  baseValue,
  comparisonMode = 'tenant',
  baseLabel,
  differenceLabel,
  onClose,
  onSubmit,
}: {
  open: boolean;
  dayType: DayTypePaymentRuleKey;
  value: DayTypePaymentRule;
  baseValue?: DayTypePaymentRule;
  comparisonMode?: PayrollComparisonMode;
  baseLabel?: string;
  differenceLabel?: string;
  onClose: () => void;
  onSubmit: (next: DayTypePaymentRule) => void;
}) {
  const meta = DAY_TYPE_PAYMENT_RULES.find((item) => item.key === dayType) ?? DAY_TYPE_PAYMENT_RULES[0];
  const [draft, setDraft] = useState<DayTypePaymentRule>(value);
  const [errors, setErrors] = useState<DayTypeRuleFieldErrors>({});
  const [coefficientDraft, setCoefficientDraft] = useState(
    Number.isFinite(value.workedTimeCoefficient) ? toPersianDigits(String(value.workedTimeCoefficient)) : '',
  );

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    setErrors({});
    setCoefficientDraft(Number.isFinite(value.workedTimeCoefficient) ? toPersianDigits(String(value.workedTimeCoefficient)) : '');
  }, [open, value]);

  const hasDiff = baseValue ? !compareDayTypePaymentRules(baseValue, draft) : false;
  const labels = buildCollectionCompareLabels(comparisonMode, meta.label);
  const resolvedBaseLabel = baseLabel ?? comparisonBaseLabel(comparisonMode);
  const resolvedDifferenceLabel = differenceLabel ?? labels.changed;

  const submit = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(draft);
    onClose();
  };

  const setPaidStatus = (paidWithoutWork: boolean) => {
    setDraft((current) => ({
      ...current,
      paidWithoutWork,
      paymentBase: paidWithoutWork ? current.paymentBase ?? 'wageBase' : current.paymentBase,
      unpaidAbsenceImpact: paidWithoutWork ? current.unpaidAbsenceImpact ?? 'none' : current.unpaidAbsenceImpact,
    }));
    setErrors({});
  };

  return (
    <PanelFormModal
      open={open}
      title={`قواعد پرداخت: ${meta.label}`}
      lead={meta.helper}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت" onSubmit={submit} onCancel={onClose} />}
    >
      <div className="calc-dialog-body">
        <div className="calc-dialog-section">
          <span className="calc-dialog-section-label">وضعیت پرداخت این روز</span>
          <p className="calc-dialog-helper">
            اگر در این روز برای کارمند شیفتی ثبت نشود، مشخص کنید این روز در حقوق محاسبه شود یا نه.
          </p>
          <div className="calc-dialog-chips">
            <SelectChip
              label="با حقوق"
              active={draft.paidWithoutWork}
              onClick={() => setPaidStatus(true)}
              tooltip="در صورت نبود شیفت، این روز همچنان در حقوق کارمند لحاظ می‌شود."
            />
            <SelectChip
              label="بی‌حقوق"
              active={!draft.paidWithoutWork}
              onClick={() => setPaidStatus(false)}
              tooltip="در صورت نبود شیفت، این روز در محاسبه حقوق لحاظ نمی‌شود."
            />
          </div>
          <p className="calc-dialog-helper">
            {draft.paidWithoutWork
              ? 'در صورت نبود شیفت، این روز همچنان در حقوق کارمند لحاظ می‌شود.'
              : 'در صورت نبود شیفت، این روز در محاسبه حقوق لحاظ نمی‌شود.'}
          </p>
        </div>

        {draft.paidWithoutWork ? (
          <>
            <div className="calc-dialog-section">
              <span className="calc-dialog-section-label">مبنای پرداخت</span>
              <p className="calc-dialog-helper">
                اگر با حقوق فعال باشد، مبلغ این روز بر اساس یکی از این دو مبنا محاسبه می‌شود.
              </p>
              <div className="calc-dialog-chips">
                {DAY_TYPE_PAYMENT_BASE_OPTIONS.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    active={draft.paymentBase === option.value}
                    onClick={() => {
                      setDraft((current) => ({ ...current, paymentBase: option.value }));
                      setErrors((current) => ({ ...current, paymentBase: undefined }));
                    }}
                    tooltip={option.tooltip}
                  />
                ))}
              </div>
              {errors.paymentBase ? <p className="day-type-rule-field-error">{errors.paymentBase}</p> : null}
            </div>

            <div className="calc-dialog-section">
              <span className="calc-dialog-section-label">اثر غیبت غیرموجه در طول هفته بر حقوق این روز</span>
              <p className="calc-dialog-helper">
                مشخص کنید اگر کارمند در طول هفته غیبت غیرموجه داشته باشد، پرداخت این روز چگونه تحت تأثیر قرار بگیرد.
              </p>
              <div className="calc-dialog-chips">
                {UNPAID_ABSENCE_IMPACT_OPTIONS.map((option) => (
                  <SelectChip
                    key={option.value}
                    label={option.label}
                    active={draft.unpaidAbsenceImpact === option.value}
                    onClick={() => {
                      setDraft((current) => ({ ...current, unpaidAbsenceImpact: option.value }));
                      setErrors((current) => ({ ...current, unpaidAbsenceImpact: undefined }));
                    }}
                    tooltip={option.tooltip}
                  />
                ))}
              </div>
              {errors.unpaidAbsenceImpact ? <p className="day-type-rule-field-error">{errors.unpaidAbsenceImpact}</p> : null}
            </div>

            <div className="calc-dialog-section">
              <span className="calc-dialog-section-label">ضریب پرداخت کارکرد در این روز</span>
              <label className={`business-payroll-field day-type-rule-coefficient-field ${errors.workedTimeCoefficient ? 'has-error' : ''}`}>
                <span className="business-payroll-input">
                  <input
                    value={coefficientDraft}
                    inputMode="decimal"
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setCoefficientDraft(nextValue);
                      setDraft((current) => ({
                        ...current,
                        workedTimeCoefficient: parseNumber(nextValue),
                      }));
                      setErrors((current) => ({ ...current, workedTimeCoefficient: undefined }));
                    }}
                  />
                  <b>ضریب</b>
                </span>
              </label>
              <p className="calc-dialog-helper">مثلاً ۱.۴ یعنی ۴۰٪ بیشتر از حالت عادی.</p>
              {errors.workedTimeCoefficient ? <p className="day-type-rule-field-error">{errors.workedTimeCoefficient}</p> : null}
            </div>
          </>
        ) : null}

        {baseValue && resolvedBaseLabel ? (
          <div className="calc-dialog-compare">
            <span className="calc-dialog-compare-label">قواعد {resolvedBaseLabel}:</span>
            <DayTypeRuleSummaryChips rule={baseValue} />
            <span className="calc-dialog-compare-label">قواعد فعلی:</span>
            <DayTypeRuleSummaryChips rule={draft} />
            {hasDiff ? (
              <span className="calc-badge is-diff">
                <Info className="h-3 w-3" aria-hidden />
                {resolvedDifferenceLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </PanelFormModal>
  );
}

export function DayTypePaymentRuleCard({
  dayType,
  value,
  baseValue,
  secondaryBaseValue,
  comparisonMode = 'tenant',
  secondaryComparisonMode,
  secondaryComparisonYear,
  errors = {},
  onChange,
}: {
  dayType: DayTypePaymentRuleKey;
  value: DayTypePaymentRule;
  baseValue?: DayTypePaymentRule;
  secondaryBaseValue?: DayTypePaymentRule;
  comparisonMode?: PayrollComparisonMode;
  secondaryComparisonMode?: PayrollComparisonMode;
  secondaryComparisonYear?: number;
  errors?: DayTypeRuleFieldErrors;
  onChange: (value: DayTypePaymentRule) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const meta = DAY_TYPE_PAYMENT_RULES.find((item) => item.key === dayType) ?? DAY_TYPE_PAYMENT_RULES[0];
  const summary = useMemo(() => formatDayTypePaymentRuleSummary(value), [value]);
  const difference = baseValue
    ? compareCollectionsForMode(comparisonMode, baseValue, value, meta.label)
    : null;
  const secondaryDifference =
    secondaryBaseValue && secondaryComparisonMode
      ? compareCollectionsForMode(
          secondaryComparisonMode,
          secondaryBaseValue,
          value,
          meta.label,
          secondaryComparisonYear,
        )
      : null;
  const hasErrors = Object.values(errors).some(Boolean);
  const firstError = errors.paymentBase ?? errors.unpaidAbsenceImpact ?? errors.workedTimeCoefficient;

  return (
    <article className="day-type-rule-preview-card">
      <div className="day-type-rule-preview-head">
        <div className="day-type-rule-preview-title">
          <strong>{meta.label}</strong>
          <DualDifferenceBadges difference={difference} secondaryDifference={secondaryDifference} />
        </div>
        <button
          type="button"
          className="calc-rules-edit-btn day-type-rule-edit-btn"
          onClick={() => setDialogOpen(true)}
          aria-label={`تنظیم قواعد ${meta.label}`}
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden />
          تنظیم قواعد
        </button>
      </div>
      <p className="day-type-rule-preview-summary">{summary}</p>
      {hasErrors && firstError ? <em className="day-type-rule-preview-error">{firstError}</em> : null}
      <DayTypePaymentRuleDialog
        open={dialogOpen}
        dayType={dayType}
        value={value}
        baseValue={baseValue}
        comparisonMode={comparisonMode}
        differenceLabel={difference?.message}
        onClose={() => setDialogOpen(false)}
        onSubmit={onChange}
      />
    </article>
  );
}
