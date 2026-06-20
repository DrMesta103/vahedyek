'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';
import {
  getTaavFieldToneClasses,
  taavFieldControlClass,
  taavFieldShellVariants,
  type TaavFieldRadius,
  type TaavFieldSize,
  type TaavFieldTone,
  type TaavFieldVariant,
  type TaavFieldWidth,
} from '../shared/field-control.variants';

export type TaavInputProps = {
  size?: TaavFieldSize;
  variant?: TaavFieldVariant;
  tone?: TaavFieldTone;
  width?: TaavFieldWidth;
  radius?: TaavFieldRadius;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'>;

function LoadingSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-[var(--taav-text-muted)]"
      aria-hidden
    />
  );
}

export function TaavInput({
  size = 'md',
  variant = 'default',
  tone = 'neutral',
  width = 'full',
  radius = 'md',
  disabled,
  readOnly,
  invalid = false,
  required,
  loading = false,
  iconStart,
  iconEnd,
  prefix,
  suffix,
  wrapperClassName,
  inputClassName,
  type = 'text',
  ...props
}: TaavInputProps) {
  const isDisabled = disabled || loading;

  return (
    <div
      className={cn(
        taavFieldShellVariants({ size, variant, width, radius }),
        getTaavFieldToneClasses(tone, invalid),
        wrapperClassName,
      )}
    >
      {loading ? <LoadingSpinner /> : null}
      {!loading && iconStart ? <span className={TAAV_INTERACTION.iconSlot}>{iconStart}</span> : null}
      {!loading && prefix ? (
        <span className="shrink-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">{prefix}</span>
      ) : null}
      <input
        type={type}
        disabled={isDisabled}
        readOnly={readOnly}
        required={required}
        aria-invalid={invalid || undefined}
        className={cn(taavFieldControlClass, inputClassName)}
        {...props}
      />
      {!loading && suffix ? (
        <span className="shrink-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">{suffix}</span>
      ) : null}
      {!loading && iconEnd ? <span className={TAAV_INTERACTION.iconSlot}>{iconEnd}</span> : null}
    </div>
  );
}
