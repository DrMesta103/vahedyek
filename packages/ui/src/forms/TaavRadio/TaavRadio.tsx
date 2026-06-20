import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavRadioClasses,
  taavChoiceDescriptionTextClass,
  taavChoiceLabelLayoutClass,
  taavChoiceLabelTextClass,
  taavChoiceTextBlockClass,
  type TaavChoiceSize,
  type TaavChoiceTone,
} from '../shared/choice-control.variants';

export type TaavRadioProps = {
  size?: TaavChoiceSize;
  tone?: TaavChoiceTone;
  invalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  wrapperClassName?: string;
  controlClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type'>;

export function TaavRadio({
  size = 'md',
  tone = 'brand',
  invalid = false,
  label,
  description,
  disabled,
  wrapperClassName,
  controlClassName,
  id,
  ...props
}: TaavRadioProps) {
  const control = (
    <input
      id={id}
      type="radio"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(getTaavRadioClasses(size, tone, invalid), 'mt-0.5', controlClassName)}
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

export type TaavRadioOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

export type TaavRadioGroupProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  options: TaavRadioOption[];
  orientation?: 'horizontal' | 'vertical';
  size?: TaavChoiceSize;
  tone?: TaavChoiceTone;
  disabled?: boolean;
  invalid?: boolean;
  wrapperClassName?: string;
  contentClassName?: string;
};

export function TaavRadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  options,
  orientation = 'vertical',
  size = 'md',
  tone = 'brand',
  disabled = false,
  invalid = false,
  wrapperClassName,
  contentClassName,
}: TaavRadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      className={cn(
        'flex gap-[var(--taav-space-3)]',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap items-center',
        wrapperClassName,
      )}
    >
      {options.map((option, index) => {
        const id = `${name ?? 'taav-radio'}-${option.value}-${index}`;
        const isControlled = value !== undefined;

        return (
          <TaavRadio
            key={option.value}
            id={id}
            name={name}
            value={option.value}
            size={size}
            tone={tone}
            invalid={invalid}
            disabled={disabled || option.disabled}
            label={option.label}
            description={option.description}
            checked={isControlled ? value === option.value : undefined}
            defaultChecked={!isControlled ? defaultValue === option.value : undefined}
            onChange={(event) => {
              if (event.target.checked) {
                onValueChange?.(option.value);
              }
            }}
            wrapperClassName={contentClassName}
          />
        );
      })}
    </div>
  );
}
