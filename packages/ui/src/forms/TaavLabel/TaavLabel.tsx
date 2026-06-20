import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TaavRequiredMark } from '../TaavRequiredMark';

export type TaavLabelSize = 'sm' | 'md' | 'lg';
export type TaavLabelTone = 'default' | 'muted' | 'danger';

const sizeClass: Record<TaavLabelSize, string> = {
  sm: 'text-[length:var(--taav-form-label-sm)]',
  md: 'text-[length:var(--taav-form-label-md)]',
  lg: 'text-[length:var(--taav-form-label-lg)]',
};

const toneClass: Record<TaavLabelTone, string> = {
  default: 'text-[var(--taav-text-strong)]',
  muted: 'text-[var(--taav-text-muted)]',
  danger: 'text-[var(--taav-danger-strong)]',
};

export type TaavLabelProps = {
  htmlFor?: string;
  children: ReactNode;
  size?: TaavLabelSize;
  tone?: TaavLabelTone;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
} & Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className' | 'children'>;

export function TaavLabel({
  htmlFor,
  children,
  size = 'md',
  tone = 'default',
  required = false,
  optional = false,
  disabled = false,
  wrapperClassName,
  ...props
}: TaavLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'inline-flex items-center gap-[var(--taav-space-1)] font-[var(--taav-font-weight-bold)] leading-[var(--taav-leading-tight)]',
        sizeClass[size],
        toneClass[tone],
        disabled && 'cursor-not-allowed opacity-60',
        wrapperClassName,
      )}
      {...props}
    >
      <span>{children}</span>
      {required ? <TaavRequiredMark tone="danger" /> : null}
      {!required && optional ? (
        <span className="text-[length:var(--taav-form-label-sm)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]">
          (اختیاری)
        </span>
      ) : null}
    </label>
  );
}
