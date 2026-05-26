'use client';

import { Input, RULE_PANEL_TEXT_INPUT_CLASSNAME, RuleAmountInput } from '@repo/ui';
import { useEffect, useState } from 'react';
import { getCurrencyLabelBySettings, loadProfileStore } from '../(panel)/business-settings/profile/_components/profileStorage';

type NumericMode = 'integer' | 'decimal' | 'text';

function formatIntegerInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function formatDecimalInput(value: string) {
  const normalized = value.replace(/[٫,]/g, '.');
  const cleaned = normalized.replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const [integerPart = '', ...fractionParts] = cleaned.split('.');
  const fractionPart = fractionParts.join('');
  if (!fractionParts.length) return integerPart;
  return `${integerPart}.${fractionPart}`;
}

function normalizeWithMode(value: string, mode: NumericMode) {
  if (mode === 'integer') return formatIntegerInput(value);
  if (mode === 'decimal') return formatDecimalInput(value);
  return value;
}

type ProfileAwareUnitInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  numericMode?: NumericMode;
};

export function ProfileAwareUnitInput({
  value,
  onChange,
  placeholder,
  suffix = 'currency',
  disabled = false,
  className,
  inputClassName,
  numericMode,
}: ProfileAwareUnitInputProps) {
  const [currencySuffix, setCurrencySuffix] = useState('تومان');

  useEffect(() => {
    setCurrencySuffix(getCurrencyLabelBySettings(loadProfileStore().currency));
  }, []);

  const isCurrencySuffix = suffix === 'currency' || suffix === 'تومان' || suffix === 'ریال' || suffix === '';
  const resolvedSuffix = isCurrencySuffix ? currencySuffix : suffix;
  const resolvedMode = numericMode ?? (resolvedSuffix === '%' ? 'decimal' : resolvedSuffix ? 'integer' : 'text');

  if (resolvedSuffix === '%' || isCurrencySuffix) {
    return <RuleAmountInput value={value} onChange={onChange} placeholder={placeholder} suffix={resolvedSuffix} />;
  }

  return (
    <Input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(normalizeWithMode(event.target.value, resolvedMode))}
      placeholder={placeholder}
      inputMode={resolvedMode === 'decimal' ? 'decimal' : resolvedMode === 'integer' ? 'numeric' : undefined}
      dir={resolvedMode === 'text' ? undefined : 'ltr'}
      className={`${RULE_PANEL_TEXT_INPUT_CLASSNAME} ${resolvedSuffix ? '!pr-12' : ''} ${inputClassName ?? ''}`.trim()}
      containerClassName={className}
      endAdornment={resolvedSuffix ? <span className="text-xs font-bold text-[color:var(--text-muted)]">{resolvedSuffix}</span> : undefined}
    />
  );
}
