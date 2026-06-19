'use client';

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

export type TaavPercentageInputProps = {
  value?: number | string;
  defaultValue?: number | string;
  onValueChange?: (value: number | null) => void;

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

export function TaavPercentageInput({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
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
}: TaavPercentageInputProps) {
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

  return (
    <div
      dir="ltr"
      className={cn(
        taavNumericAffixShellClass(size),
        taavNumericAffixShellVariants({ size }),
        getTaavFieldToneClasses(tone, showInvalid),
        wrapperClassName,
        unsafeClassName,
      )}
    >
      <span className={taavNumericAffixLabelVariants({ size, align: 'start' })} aria-hidden="true">
        %
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
