'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import {
  activationSwitchRoot,
  activationSwitchSegment,
  activationSwitchTone,
} from './taav-activation-switch.variants';

export type TaavActivationSwitchValue = 'active' | 'inactive';
export type TaavActivationSwitchSize = 'sm' | 'md' | 'lg';
export type TaavActivationSwitchTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

export type TaavActivationSwitchProps = {
  value?: TaavActivationSwitchValue;
  defaultValue?: TaavActivationSwitchValue;
  onValueChange?: (value: TaavActivationSwitchValue) => void;
  activeLabel?: ReactNode;
  inactiveLabel?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: TaavActivationSwitchSize;
  tone?: TaavActivationSwitchTone;
  ariaLabel?: string;
  wrapperClassName?: string;
  unsafeClassName?: string;
};

export function TaavActivationSwitch({
  value,
  defaultValue = 'inactive',
  onValueChange,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
  disabled = false,
  loading = false,
  size = 'md',
  tone = 'brand',
  ariaLabel = 'وضعیت فعال‌سازی',
  wrapperClassName,
  unsafeClassName,
}: TaavActivationSwitchProps) {
  const [internalValue, setInternalValue] = useState<TaavActivationSwitchValue>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = (next: TaavActivationSwitchValue) => {
    if (disabled || loading) return;
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  if (loading) {
    return (
      <TaavSkeleton
        variant="custom"
        width={size === 'sm' ? 120 : size === 'lg' ? 168 : 144}
        height={size === 'sm' ? 32 : size === 'lg' ? 40 : 36}
        radius="pill"
        wrapperClassName={wrapperClassName}
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-taav-activation-switch
      data-value={currentValue}
      data-size={size}
      data-tone={tone}
      className={cn(
        activationSwitchRoot({ size, disabled, loading }),
        activationSwitchTone({ tone }),
        wrapperClassName,
        unsafeClassName,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={currentValue === 'active'}
        disabled={disabled}
        className={activationSwitchSegment({ size, selected: currentValue === 'active' })}
        onClick={() => setValue('active')}
      >
        {activeLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={currentValue === 'inactive'}
        disabled={disabled}
        className={activationSwitchSegment({ size, selected: currentValue === 'inactive' })}
        onClick={() => setValue('inactive')}
      >
        {inactiveLabel}
      </button>
    </div>
  );
}
