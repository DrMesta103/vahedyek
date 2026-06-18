import type { ReactNode, SelectHTMLAttributes } from 'react';
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

export type TaavSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type TaavSelectProps = {
  size?: TaavFieldSize;
  variant?: TaavFieldVariant;
  tone?: TaavFieldTone;
  width?: TaavFieldWidth;
  radius?: TaavFieldRadius;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  placeholder?: string;
  options: TaavSelectOption[];
  iconStart?: ReactNode;
  wrapperClassName?: string;
  controlClassName?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'size' | 'children'>;

function SelectChevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="pointer-events-none h-[var(--taav-select-chevron-size)] w-[var(--taav-select-chevron-size)] shrink-0 text-[var(--taav-text-subtle)]"
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TaavSelect({
  size = 'md',
  variant = 'default',
  tone = 'neutral',
  width = 'full',
  radius = 'md',
  disabled,
  invalid = false,
  required,
  placeholder,
  options,
  iconStart,
  wrapperClassName,
  controlClassName,
  value,
  defaultValue,
  ...props
}: TaavSelectProps) {
  const hasPlaceholder = Boolean(placeholder);
  const showPlaceholder = hasPlaceholder && value === undefined && defaultValue === undefined;

  return (
    <div
      className={cn(
        taavFieldShellVariants({ size, variant, width, radius }),
        getTaavFieldToneClasses(tone, invalid),
        'relative gap-[var(--taav-select-icon-gap)] pe-[calc(var(--taav-input-px-md)+var(--taav-select-chevron-size)+var(--taav-space-1))]',
        wrapperClassName,
      )}
    >
      {iconStart ? <span className={TAAV_INTERACTION.iconSlot}>{iconStart}</span> : null}
      <select
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          taavFieldControlClass,
          'cursor-pointer appearance-none pe-[var(--taav-space-1)]',
          disabled && 'cursor-not-allowed',
          controlClassName,
        )}
        {...props}
      >
        {hasPlaceholder ? (
          <option value="" disabled={required} hidden={!showPlaceholder}>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 end-[var(--taav-input-px-md)] flex items-center">
        <SelectChevron />
      </span>
    </div>
  );
}
