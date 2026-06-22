'use client';

import { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { TaavChoiceChipGroup, TaavInput } from '@repo/ui/taav/forms';
import { TaavDialog, TaavDialogContent, TaavDialogDescription, TaavDialogFooter, TaavDialogHeader, TaavDialogTitle } from '@repo/ui/taav/overlays';
import { TaavButton, TaavTooltip, TaavTooltipProvider } from '@repo/ui/taav/primitives';
import { CalculationRulesBadges, CalcRulesDiffBadge, CalcRulesEditButton, CalculationRulesDialog } from './CalculationRulesChips';
import { VariableAmountTitlePicker } from './VariableAmountTitlePicker';
import {
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  VARIABLE_PAYMENT_BASE_OPTIONS,
  compareValues,
  type BaseDifference,
  type CalculationRules,
  type VariableAmountType,
  type VariableCalculationBase,
} from '../lib/payroll-business-settings';
import { formatFaNumber } from '../lib/format-fa';

type VariablePaymentMethod = 'fixed' | 'percentage';

export type VariablePaymentDialogValue = {
  id: string;
  title: string;
  type: VariableAmountType;
  method: VariablePaymentMethod;
  amount: number;
  percent: number;
  base: VariableCalculationBase;
  calculationRules: CalculationRules;
};

type VariablePaymentDialogProps = {
  open: boolean;
  mode: VariableAmountType;
  initialValue?: VariablePaymentDialogValue | null;
  comparison?: {
    baseValue?: VariablePaymentDialogValue | null;
    differenceLabel?: string;
    amountTooltip?: (baseValue: VariablePaymentDialogValue) => string;
    percentTooltip?: (baseValue: VariablePaymentDialogValue) => string;
    baseTooltip?: string;
    amountHigher?: (difference: number) => string;
    amountLower?: (difference: number) => string;
    percentHigher?: (difference: number) => string;
    percentLower?: (difference: number) => string;
    baseRules?: CalculationRules | null;
    baseLabel?: string;
    rulesDifferenceLabel?: string;
  };
  calculateAmount: (value: VariablePaymentDialogValue) => number;
  onClose: () => void;
  onSubmit: (value: VariablePaymentDialogValue) => void;
};

type ValidationState = Partial<Record<'title' | 'amount' | 'percent' | 'base', string>>;

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

function parseNumber(value: string) {
  const normalized = normalizeDigits(value).replace(/,/g, '').replace(/[^\d.]/g, '');
  return normalized ? Number(normalized) : Number.NaN;
}

function formatNumberInput(value: number) {
  return Number.isFinite(value) ? formatFaNumber(Math.round(value)) : '';
}

function formatMoney(value: number) {
  return `${formatFaNumber(Math.round(value))} ریال`;
}

function differenceBadge(difference?: BaseDifference | null) {
  if (!difference) return null;
  return (
    <span className="business-payroll-difference-badge" title={difference.tooltip}>
      {difference.message}
    </span>
  );
}

export function createVariablePaymentDialogValue(mode: VariableAmountType): VariablePaymentDialogValue {
  return {
    id: `variable-payment-${Date.now()}`,
    title: '',
    type: mode,
    method: 'fixed',
    amount: Number.NaN,
    percent: Number.NaN,
    base: 'wage_base',
    calculationRules: mode === 'addition' ? { ...DEFAULT_OPTIONAL_ADDITION_RULES } : { ...DEFAULT_OPTIONAL_DEDUCTION_RULES },
  };
}

export function VariablePaymentItemDialog({
  open,
  mode,
  initialValue,
  comparison,
  calculateAmount,
  onClose,
  onSubmit,
}: VariablePaymentDialogProps) {
  const [value, setValue] = useState<VariablePaymentDialogValue>(initialValue ?? createVariablePaymentDialogValue(mode));
  const [errors, setErrors] = useState<ValidationState>({});
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const isEditing = Boolean(initialValue);

  useEffect(() => {
    if (!open) {
      setRulesDialogOpen(false);
      return;
    }
    setValue(initialValue ?? createVariablePaymentDialogValue(mode));
    setErrors({});
    setRulesDialogOpen(false);
  }, [initialValue, mode, open]);

  const calculatedAmount = useMemo(() => calculateAmount(value), [calculateAmount, value]);
  const rules = value.calculationRules ?? (mode === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES);
  const selectedBaseOption = VARIABLE_PAYMENT_BASE_OPTIONS.find((option) => option.value === value.base) ?? VARIABLE_PAYMENT_BASE_OPTIONS[0];

  const validate = () => {
    const nextErrors: ValidationState = {};
    if (!value.title.trim()) {
      nextErrors.title = 'عنوان آیتم را وارد کنید';
    }
    if (value.method === 'fixed') {
      if (!Number.isFinite(value.amount) || value.amount < 0) {
        nextErrors.amount = 'مبلغ را وارد کنید';
      }
    } else {
      if (!Number.isFinite(value.percent) || value.percent < 0) {
        nextErrors.percent = 'درصد محاسبه را وارد کنید';
      }
      if (!value.base) {
        nextErrors.base = 'مبنای پرداخت را انتخاب کنید';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({ ...value, type: mode, calculationRules: rules });
  };

  const methodDifference = comparison?.baseValue
    ? {
        isDifferent: true as const,
        direction: 'changed' as const,
        message: comparison.differenceLabel ?? 'متفاوت با مبنا',
        tooltip: comparison.baseTooltip ?? 'روش محاسبه این آیتم با مقدار مرجع متفاوت است.',
      }
    : null;
  const amountDifference =
    comparison?.baseValue && value.method === 'fixed' && comparison.baseValue.method === 'fixed'
      ? compareValues(comparison.baseValue.amount, value.amount, {
          changed: comparison.differenceLabel ?? 'متفاوت با مبنا',
          tooltip: comparison.amountTooltip?.(comparison.baseValue) ?? '',
          higher: comparison.amountHigher,
          lower: comparison.amountLower,
        })
      : comparison?.baseValue && value.method !== comparison.baseValue.method
        ? methodDifference
        : null;
  const percentDifference =
    comparison?.baseValue && value.method === 'percentage' && comparison.baseValue.method === 'percentage'
      ? compareValues(comparison.baseValue.percent, value.percent, {
          changed: comparison.differenceLabel ?? 'متفاوت با مبنا',
          tooltip: comparison.percentTooltip?.(comparison.baseValue) ?? '',
          higher: comparison.percentHigher,
          lower: comparison.percentLower,
        })
      : comparison?.baseValue && value.method !== comparison.baseValue.method
        ? methodDifference
        : null;
  const baseDifference =
    comparison?.baseValue && value.method === 'percentage' && comparison.baseValue.method === 'percentage' && comparison.baseValue.base !== value.base
      ? {
          isDifferent: true as const,
          direction: 'changed' as const,
          message: comparison.differenceLabel ?? 'متفاوت با مبنا',
          tooltip: comparison.baseTooltip ?? 'مبنای محاسبه این آیتم با مقدار مرجع متفاوت است.',
        }
      : null;

  return (
    <>
      <TaavDialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
        <TaavDialogContent
          size="md"
          contentClassName="overflow-visible border border-[#41648b] bg-[#18365a] p-0 text-white shadow-[0_30px_80px_rgba(5,13,31,0.45)]"
        >
          <TaavDialogHeader className="gap-2 border-b border-white/10 px-6 pb-4 pt-6 text-right">
            <TaavDialogTitle className="text-2xl font-black text-white">
              {isEditing ? 'ویرایش آیتم پرداخت متغیر' : mode === 'addition' ? 'افزودن آیتم پرداخت متغیر' : 'افزودن آیتم کسورات متغیر'}
            </TaavDialogTitle>
            <TaavDialogDescription className="text-sm text-white/70">
              {mode === 'addition' ? 'این آیتم به پرداخت‌های این قرارداد اضافه می‌شود.' : 'این آیتم از پرداخت‌های این قرارداد کسر می‌شود.'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="rounded-2xl border border-[#9b7a33] bg-[#173554] p-4">
              <div className="space-y-4 rounded-xl border border-dashed border-[#4f75a3] p-4">
                <VariableAmountTitlePicker
                  type={mode}
                  title={value.title}
                  customFieldLabel="عنوان آیتم"
                  onTitleChange={(title) => {
                    setValue((current) => ({ ...current, title }));
                    setErrors((current) => ({ ...current, title: undefined }));
                  }}
                />
                {errors.title ? <p className="text-sm text-[#ff8f8f]">{errors.title}</p> : null}
              </div>

              <div className="mt-4 space-y-4">
                <TaavChoiceChipGroup
                  label="نحوه محاسبه"
                  options={[
                    { value: 'fixed', label: 'مبلغ ثابت' },
                    { value: 'percentage', label: 'ضریب محاسبه' },
                  ]}
                  value={value.method}
                  onValueChange={(next) => {
                    setValue((current) => ({ ...current, method: Array.isArray(next) ? 'fixed' : next as VariablePaymentMethod }));
                    setErrors((current) => ({ ...current, amount: undefined, percent: undefined, base: undefined }));
                  }}
                />

                {value.method === 'fixed' ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-white">
                      مبلغ
                    </label>
                    <TaavInput
                      value={formatNumberInput(value.amount)}
                      onChange={(event) => {
                        setValue((current) => ({ ...current, amount: parseNumber(event.target.value) }));
                        setErrors((current) => ({ ...current, amount: undefined }));
                      }}
                      placeholder="مثلاً ۱,۵۰۰,۰۰۰"
                      suffix="ریال"
                      invalid={Boolean(errors.amount)}
                      inputClassName="text-right"
                      wrapperClassName="bg-white/5"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {differenceBadge(amountDifference)}
                      {errors.amount ? <p className="text-sm text-[#ff8f8f]">{errors.amount}</p> : null}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-white">
                        درصد محاسبه
                      </label>
                      <TaavInput
                        value={formatNumberInput(value.percent)}
                        onChange={(event) => {
                          setValue((current) => ({ ...current, percent: parseNumber(event.target.value) }));
                          setErrors((current) => ({ ...current, percent: undefined }));
                        }}
                        placeholder="مثلاً ۱۰"
                        suffix="%"
                        invalid={Boolean(errors.percent)}
                        inputClassName="text-right"
                        wrapperClassName="bg-white/5"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        {differenceBadge(percentDifference)}
                        {errors.percent ? <p className="text-sm text-[#ff8f8f]">{errors.percent}</p> : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="block text-sm font-bold text-white">
                          مبنای پرداخت
                        </label>
                        <TaavTooltipProvider>
                          <div className="flex items-center gap-2">
                            {VARIABLE_PAYMENT_BASE_OPTIONS.map((option) => (
                              <TaavTooltip key={option.value} content={option.tooltip} side="top">
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-white/75">
                                  <span>{option.label}</span>
                                  <Info className="h-3.5 w-3.5" />
                                </span>
                              </TaavTooltip>
                            ))}
                          </div>
                        </TaavTooltipProvider>
                      </div>
                      <TaavChoiceChipGroup
                        options={VARIABLE_PAYMENT_BASE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                        value={value.base}
                        invalid={Boolean(errors.base)}
                        onValueChange={(next) => {
                          setValue((current) => ({ ...current, base: Array.isArray(next) ? current.base : next as VariableCalculationBase }));
                          setErrors((current) => ({ ...current, base: undefined }));
                        }}
                      />
                      <p className="text-xs text-white/65">{selectedBaseOption.tooltip}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {differenceBadge(baseDifference)}
                        {errors.base ? <p className="text-sm text-[#ff8f8f]">{errors.base}</p> : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <CalculationRulesBadges rules={rules} />
                {comparison?.baseRules && comparison.baseLabel ? (
                  <CalcRulesDiffBadge
                    baseRules={comparison.baseRules}
                    currentRules={rules}
                    baseLabel={comparison.baseLabel}
                    differenceLabel={comparison.rulesDifferenceLabel}
                  />
                ) : null}
                <CalcRulesEditButton onClick={() => setRulesDialogOpen(true)} />
              </div>

              {Number.isFinite(calculatedAmount) ? (
                <div className="mt-4 rounded-2xl border border-[#9b7a33] bg-white/[0.03] px-4 py-3 text-sm font-bold text-[#ffd48a]">
                  مبلغ نهایی محاسبه‌شده: {formatMoney(calculatedAmount)}
                </div>
              ) : null}
            </div>
          </div>

          <TaavDialogFooter className="justify-start gap-3 border-t border-white/10 px-6 py-4">
            <TaavButton onClick={submit}>ثبت</TaavButton>
            <TaavButton variant="outline" tone="neutral" onClick={onClose}>انصراف</TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      {rulesDialogOpen ? (
        <CalculationRulesDialog
          open={rulesDialogOpen}
          itemTitle={value.title.trim() || (mode === 'addition' ? 'آیتم پرداخت متغیر' : 'آیتم کسورات متغیر')}
          rules={rules}
          baseRules={comparison?.baseRules}
          baseLabel={comparison?.baseLabel}
          differenceLabel={comparison?.rulesDifferenceLabel}
          effectContext={mode === 'addition' ? 'benefit_or_addition' : 'deduction'}
          onClose={() => setRulesDialogOpen(false)}
          onSubmit={(next) => {
            setValue((current) => ({ ...current, calculationRules: next }));
            setRulesDialogOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
