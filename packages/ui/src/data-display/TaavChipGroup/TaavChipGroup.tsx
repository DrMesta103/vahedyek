'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { TaavChip } from '../TaavChip';
import {
  taavChipGroupGapClass,
  type TaavChipGap,
  type TaavChipSize,
  type TaavChipTone,
  type TaavChipVariant,
} from '../shared/data-display.variants';

export type TaavChipOption = {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  tone?: TaavChipTone;
};

export type TaavChipGroupSelectionMode = 'none' | 'single' | 'multiple';

export type TaavChipGroupProps = {
  orientation?: 'horizontal' | 'vertical';
  wrap?: boolean;
  gap?: TaavChipGap;
  selectionMode?: TaavChipGroupSelectionMode;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  options?: TaavChipOption[];
  size?: TaavChipSize;
  tone?: TaavChipTone;
  variant?: TaavChipVariant;
  disabled?: boolean;
  children?: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
};

function normalizeMultiple(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function TaavChipGroup({
  orientation = 'horizontal',
  wrap = true,
  gap = 'sm',
  selectionMode = 'none',
  value,
  defaultValue,
  onValueChange,
  options,
  size = 'md',
  tone = 'neutral',
  variant = 'soft',
  disabled = false,
  children,
  wrapperClassName,
  contentClassName,
}: TaavChipGroupProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (selectionMode === 'multiple' ? [] : ''),
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const toggle = (optionValue: string) => {
    if (selectionMode === 'none') return;

    let next: string | string[];
    if (selectionMode === 'single') {
      next = optionValue;
    } else {
      const current = normalizeMultiple(currentValue);
      next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
    }

    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const isSelected = (optionValue: string) => {
    if (selectionMode === 'single') return currentValue === optionValue;
    if (selectionMode === 'multiple') return normalizeMultiple(currentValue).includes(optionValue);
    return false;
  };

  return (
    <div
      role={selectionMode !== 'none' ? 'group' : undefined}
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        wrap && orientation === 'horizontal' && 'flex-wrap',
        taavChipGroupGapClass[gap],
        wrapperClassName,
      )}
    >
      {options
        ? options.map((option) => (
            <TaavChip
              key={option.value}
              size={size}
              tone={option.tone ?? tone}
              variant={variant}
              behavior={selectionMode === 'none' ? 'static' : 'selectable'}
              selected={isSelected(option.value)}
              disabled={disabled || option.disabled}
              iconStart={option.icon}
              onClick={() => toggle(option.value)}
              itemClassName={contentClassName}
            >
              {option.label}
            </TaavChip>
          ))
        : children}
    </div>
  );
}
