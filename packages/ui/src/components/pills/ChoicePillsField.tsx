'use client';

import type { ElementType } from 'react';
import { ChoicePills, type ChoicePillsOption } from './ChoicePills';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function ChoicePillsField<T extends string>({
  label,
  labelAs: LabelAs = 'div',
  ariaLabel,
  options,
  value,
  onChange,
  wrap,
  className = '',
  labelClassName = '',
  pillsClassName = '',
  pillClassName = '',
  showActiveIndicator,
  invalid = false,
}: {
  label: string;
  labelAs?: ElementType;
  ariaLabel?: string;
  options: ReadonlyArray<ChoicePillsOption<T>>;
  value: T;
  onChange: (value: NoInfer<T>) => void;
  wrap?: boolean;
  className?: string;
  labelClassName?: string;
  pillsClassName?: string;
  pillClassName?: string;
  showActiveIndicator?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className={cn('space-y-2', invalid && 'rounded-xl border border-rose-300 bg-rose-50/40 p-2', className)}>
      <LabelAs className={cn('text-[12px] font-bold text-[color:var(--text-strong)]', labelClassName)}>{label}</LabelAs>
      <ChoicePills
        ariaLabel={ariaLabel ?? label}
        options={options}
        value={value}
        onChange={onChange}
        wrap={wrap}
        className={pillsClassName}
        pillClassName={pillClassName}
        showActiveIndicator={showActiveIndicator}
      />
    </div>
  );
}
