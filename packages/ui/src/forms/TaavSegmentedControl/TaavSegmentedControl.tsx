'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import {
  taavSegmentedItemVariants,
  taavSegmentedRootVariants,
  type TaavChoiceSize,
  type TaavSegmentedTone,
  type TaavSegmentedVariant,
  type TaavSegmentedWidth,
} from '../shared/choice-control.variants';

export type TaavSegmentedOption = {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type TaavSegmentedControlProps = {
  size?: TaavChoiceSize;
  tone?: TaavSegmentedTone;
  variant?: TaavSegmentedVariant;
  width?: TaavSegmentedWidth;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: TaavSegmentedOption[];
  disabled?: boolean;
  wrapperClassName?: string;
  contentClassName?: string;
  'aria-label'?: string;
};

export function TaavSegmentedControl({
  size = 'md',
  tone = 'brand',
  variant = 'solid',
  width = 'auto',
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  wrapperClassName,
  contentClassName,
  'aria-label': ariaLabel,
}: TaavSegmentedControlProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(taavSegmentedRootVariants({ size, width }), wrapperClassName)}
    >
      {options.map((option) => {
        const isSelected = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            data-selected={isSelected || undefined}
            className={cn(
              taavSegmentedItemVariants({ size, selected: isSelected, tone, variant }),
              contentClassName,
            )}
            onClick={() => {
              if (isDisabled) return;
              if (!isControlled) {
                setInternalValue(option.value);
              }
              onValueChange?.(option.value);
            }}
          >
            {option.icon ? <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">{option.icon}</span> : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
