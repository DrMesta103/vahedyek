'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavCheckboxClasses,
  taavChoiceDescriptionTextClass,
  taavChoiceLabelLayoutClass,
  taavChoiceLabelTextClass,
  taavChoiceTextBlockClass,
  type TaavChoiceSize,
  type TaavChoiceTone,
} from '../shared/choice-control.variants';

export type TaavCheckboxProps = {
  size?: TaavChoiceSize;
  tone?: TaavChoiceTone;
  indeterminate?: boolean;
  invalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  wrapperClassName?: string;
  controlClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type'>;

export function TaavCheckbox({
  size = 'md',
  tone = 'brand',
  indeterminate = false,
  invalid = false,
  label,
  description,
  disabled,
  wrapperClassName,
  controlClassName,
  id,
  ...props
}: TaavCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const control = (
    <input
      ref={inputRef}
      id={id}
      type="checkbox"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-indeterminate={indeterminate || undefined}
      className={cn(getTaavCheckboxClasses(size, tone, invalid), 'mt-0.5', controlClassName)}
      {...props}
    />
  );

  if (!label && !description) {
    return control;
  }

  return (
    <label
      className={cn(taavChoiceLabelLayoutClass, disabled && 'cursor-not-allowed opacity-60', wrapperClassName)}
    >
      {control}
      <span className={taavChoiceTextBlockClass}>
        {label ? <span className={taavChoiceLabelTextClass}>{label}</span> : null}
        {description ? <span className={taavChoiceDescriptionTextClass}>{description}</span> : null}
      </span>
    </label>
  );
}
