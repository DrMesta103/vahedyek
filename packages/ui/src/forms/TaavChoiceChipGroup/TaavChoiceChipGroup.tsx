'use client';

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TaavRequiredMark } from '../TaavRequiredMark';
import { TaavChoiceChip } from '../TaavChoiceChip/TaavChoiceChip';
import {
  taavChoiceChipGroupDescriptionClass,
  taavChoiceChipGroupGapClass,
  taavChoiceChipGroupLabelClass,
  taavChoiceChipGroupOptionsClass,
  taavChoiceChipGroupShellClass,
  type TaavChoiceChipGap,
  type TaavChoiceChipSize,
  type TaavChoiceChipTone,
} from '../shared/choice-chip.variants';

export type TaavChoiceChipOption = {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
};

export type TaavChoiceChipGroupProps = {
  options: TaavChoiceChipOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  selectionMode?: 'single' | 'multiple';
  label?: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  size?: TaavChoiceChipSize;
  tone?: TaavChoiceChipTone;
  disabled?: boolean;
  invalid?: boolean;
  wrap?: boolean;
  gap?: TaavChoiceChipGap;
  align?: 'start' | 'center' | 'end';
  ariaLabel?: string;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
};

function normalizeValue(value?: string | string[]): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : value ? [value] : [];
}

const alignClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
} as const;

export function TaavChoiceChipGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  selectionMode = 'single',
  label,
  description,
  hint,
  required = false,
  size = 'md',
  tone = 'brand',
  disabled = false,
  invalid = false,
  wrap = true,
  gap = 'md',
  align = 'start',
  ariaLabel,
  className,
  labelClassName,
  descriptionClassName,
}: TaavChoiceChipGroupProps) {
  const generatedLabelId = useId();
  const descriptionId = useId();
  const visibleLabelId = useId();
  const supportText = description ?? hint;
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (selectionMode === 'multiple' ? [] : ''),
  );
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const selectedValues = useMemo(() => normalizeValue(currentValue), [currentValue]);
  const accessibleName = label ?? ariaLabel;

  const updateValue = (nextValues: string[]) => {
    const next = selectionMode === 'multiple' ? nextValues : nextValues[0] ?? '';
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const toggleValue = (optionValue: string) => {
    if (selectionMode === 'multiple') {
      const nextValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((valueItem) => valueItem !== optionValue)
        : [...selectedValues, optionValue];
      updateValue(nextValues);
      return;
    }

    updateValue([optionValue]);
  };

  const focusNext = (currentIndex: number, direction: 1 | -1) => {
    const enabledIndexes = options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !(disabled || option.disabled))
      .map(({ index }) => index);

    const activeListIndex = enabledIndexes.indexOf(currentIndex);
    if (activeListIndex === -1) return;

    const nextIndex = enabledIndexes[(activeListIndex + direction + enabledIndexes.length) % enabledIndexes.length];
    buttonRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, optionValue: string) => {
    if (selectionMode === 'single') {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusNext(index, 1);
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusNext(index, -1);
        return;
      }
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggleValue(optionValue);
    }
  };

  return (
    <div className={cn(taavChoiceChipGroupShellClass, className)}>
      {label ? (
        <div id={visibleLabelId} className={cn(taavChoiceChipGroupLabelClass(size), labelClassName)}>
          <span>{label}</span>
          {required ? <TaavRequiredMark /> : null}
        </div>
      ) : null}

      {supportText ? (
        <p id={descriptionId} className={cn(taavChoiceChipGroupDescriptionClass(size), descriptionClassName)}>
          {supportText}
        </p>
      ) : null}

      <div
        role={selectionMode === 'single' ? 'radiogroup' : 'group'}
        aria-label={!label ? ariaLabel : undefined}
        aria-labelledby={label ? visibleLabelId : !ariaLabel ? generatedLabelId : undefined}
        aria-describedby={supportText ? descriptionId : undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        className={cn(
          taavChoiceChipGroupOptionsClass,
          alignClass[align],
          wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto pb-1',
          taavChoiceChipGroupGapClass[gap],
        )}
      >
        {!accessibleName ? <span id={generatedLabelId} className="sr-only">گروه انتخاب گزینه</span> : null}
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled = disabled || option.disabled;
          const showCheck = selectionMode === 'multiple' && isSelected;

          return (
            <TaavChoiceChip
              key={option.value}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              selected={isSelected}
              showCheck={showCheck}
              disabled={isDisabled}
              invalid={invalid}
              size={size}
              tone={tone}
              iconStart={showCheck ? undefined : option.icon}
              role={selectionMode === 'single' ? 'radio' : 'checkbox'}
              tabIndex={selectionMode === 'single' ? (isSelected || (!selectedValues.length && index === 0) ? 0 : -1) : 0}
              aria-label={option.label}
              onClick={() => toggleValue(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index, option.value)}
            >
              {option.label}
            </TaavChoiceChip>
          );
        })}
      </div>
    </div>
  );
}
