'use client';

import { useMemo, useState, type ChangeEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavFieldToneClasses,
  taavTextareaControlClass,
  taavTextareaShellVariants,
  type TaavFieldRadius,
  type TaavFieldSize,
  type TaavFieldTone,
  type TaavFieldVariant,
  type TaavFieldWidth,
} from '../shared/field-control.variants';

export type TaavTextareaProps = {
  size?: TaavFieldSize;
  variant?: TaavFieldVariant;
  tone?: TaavFieldTone;
  width?: TaavFieldWidth;
  radius?: TaavFieldRadius;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  rows?: number;
  minRows?: number;
  maxLength?: number;
  showCount?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'size'>;

export function TaavTextarea({
  size = 'md',
  variant = 'default',
  tone = 'neutral',
  width = 'full',
  radius = 'md',
  disabled,
  readOnly,
  invalid = false,
  required,
  rows,
  minRows,
  maxLength,
  showCount = false,
  wrapperClassName,
  inputClassName,
  value,
  defaultValue,
  onChange,
  ...props
}: TaavTextareaProps) {
  const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '');
  const currentValue = value !== undefined ? value.toString() : internalValue;
  const count = currentValue.length;

  const resolvedRows = useMemo(() => {
    if (rows) return rows;
    if (minRows) return minRows;
    return size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  }, [rows, minRows, size]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) setInternalValue(event.target.value);
    onChange?.(event);
  };

  return (
    <div className={cn('grid gap-[var(--taav-space-1)]', width === 'full' && 'w-full')}>
      <div
        className={cn(
          taavTextareaShellVariants({ size, variant, width, radius }),
          getTaavFieldToneClasses(tone, invalid),
          wrapperClassName,
        )}
      >
        <textarea
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={resolvedRows}
          maxLength={maxLength}
          aria-invalid={invalid || undefined}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={handleChange}
          className={cn(taavTextareaControlClass, inputClassName)}
          style={minRows ? { minHeight: `${minRows * 1.5}rem` } : undefined}
          {...props}
        />
      </div>
      {showCount && maxLength ? (
        <div className="text-left text-[length:var(--taav-form-message-sm)] text-[var(--taav-text-subtle)]" dir="ltr">
          {count}/{maxLength}
        </div>
      ) : null}
    </div>
  );
}
