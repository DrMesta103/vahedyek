'use client';

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavFieldToneClasses,
  taavFieldControlClass,
  type TaavFieldSize,
  type TaavFieldTone,
} from '../shared/field-control.variants';
import {
  taavNumericAffixInputClass,
  taavNumericAffixLabelVariants,
  taavNumericAffixShellClass,
  taavNumericAffixShellVariants,
} from '../shared/numeric-affix.variants';
import { useTaavNumericInputState } from '../shared/useTaavNumericInputState';

const CURRENCY_LABELS = {
  rial: 'ریال',
  toman: 'تومان',
} as const;

export type TaavCurrencyInputProps = {
  value?: number | string;
  defaultValue?: number | string;
  onValueChange?: (value: number | null) => void;

  currency?: 'rial' | 'toman';
  currencyLabel?: ReactNode;

  min?: number;
  max?: number;
  step?: number;

  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;

  size?: TaavFieldSize;
  tone?: TaavFieldTone;

  name?: string;
  id?: string;
  inputMode?: 'numeric' | 'decimal';
  autoComplete?: string;
  ariaLabel?: string;

  wrapperClassName?: string;
  inputClassName?: string;
  unsafeClassName?: string;
};

export function TaavCurrencyInput({
  value,
  defaultValue,
  onValueChange,
  currency = 'rial',
  currencyLabel,
  min,
  max,
  placeholder,
  disabled,
  readOnly,
  invalid = false,
  required,
  size = 'md',
  tone = 'neutral',
  name,
  id,
  inputMode = 'numeric',
  autoComplete,
  ariaLabel,
  wrapperClassName,
  inputClassName,
  unsafeClassName,
}: TaavCurrencyInputProps) {
  const decimal = inputMode === 'decimal';
  const { displayValue, rangeInvalid, handleFocus, handleChange, handleBlur } = useTaavNumericInputState({
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    decimal,
  });

  const showInvalid = invalid || rangeInvalid;
  const resolvedCurrencyLabel = currencyLabel ?? CURRENCY_LABELS[currency];

  return (
    <div
      dir="rtl"
      className={cn(
        taavNumericAffixShellClass(size),
        taavNumericAffixShellVariants({ size }),
        getTaavFieldToneClasses(tone, showInvalid),
        wrapperClassName,
        unsafeClassName,
      )}
    >
      <span className={taavNumericAffixLabelVariants({ size, align: 'end' })} aria-hidden="true">
        {resolvedCurrencyLabel}
      </span>
      <input
        id={id}
        name={name}
        type="text"
        dir="ltr"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-invalid={showInvalid || undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(event) => handleChange(event.target.value)}
        className={cn(taavFieldControlClass, taavNumericAffixInputClass, inputClassName)}
      />
    </div>
  );
}
