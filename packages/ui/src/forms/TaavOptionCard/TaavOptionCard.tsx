import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavOptionCardSize = 'sm' | 'md' | 'lg';
export type TaavOptionCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type TaavOptionCardInputType = 'radio' | 'checkbox' | 'none';

const sizePadding: Record<TaavOptionCardSize, string> = {
  sm: 'p-[var(--taav-space-3)]',
  md: 'p-[var(--taav-space-4)]',
  lg: 'p-[var(--taav-space-5)]',
};

const sizeTitle: Record<TaavOptionCardSize, string> = {
  sm: 'text-[length:var(--taav-text-sm)]',
  md: 'text-[length:var(--taav-text-md)]',
  lg: 'text-[length:var(--taav-text-lg)]',
};

const toneSelectedBorder: Record<TaavOptionCardTone, string> = {
  brand: 'border-[color:var(--taav-option-card-selected-border)] bg-[var(--taav-option-card-selected-bg)] ring-1 ring-[color:var(--taav-option-card-selected-ring)]',
  neutral: 'border-[color:var(--taav-border-strong)] bg-[var(--taav-surface-soft)] ring-1 ring-[color:var(--taav-neutral-muted)]',
  success: 'border-[color:var(--taav-success-border)] bg-[var(--taav-success-muted)] ring-1 ring-[color:var(--taav-success-muted)]',
  warning: 'border-[color:var(--taav-warning-border)] bg-[var(--taav-warning-muted)] ring-1 ring-[color:var(--taav-warning-muted)]',
  danger: 'border-[color:var(--taav-danger-border)] bg-[var(--taav-danger-muted)] ring-1 ring-[color:var(--taav-danger-muted)]',
  info: 'border-[color:var(--taav-info-border)] bg-[var(--taav-info-muted)] ring-1 ring-[color:var(--taav-info-muted)]',
};

export type TaavOptionCardProps = {
  size?: TaavOptionCardSize;
  tone?: TaavOptionCardTone;
  selected?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  inputType?: TaavOptionCardInputType;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onClick?: () => void;
  wrapperClassName?: string;
  contentClassName?: string;
  unsafeClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'type' | 'value' | 'checked' | 'defaultChecked' | 'onChange'>;

export function TaavOptionCard({
  size = 'md',
  tone = 'brand',
  selected = false,
  disabled = false,
  invalid = false,
  title,
  description,
  meta,
  icon,
  badge,
  inputType = 'none',
  name,
  value,
  checked,
  defaultChecked,
  onClick,
  wrapperClassName,
  contentClassName,
  unsafeClassName,
  id,
  ...inputProps
}: TaavOptionCardProps) {
  const isSelected = selected || checked;
  const inputId = id ?? (value ? `taav-option-${value}` : undefined);
  const showInput = inputType !== 'none';

  const cardClass = cn(
    'relative flex w-full cursor-pointer flex-col gap-[var(--taav-space-3)] rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-border)] bg-[var(--taav-surface)] text-start',
    TAAV_INTERACTION.base,
    sizePadding[size],
    !disabled && !isSelected && 'hover:border-[color:var(--taav-border-strong)] hover:shadow-[var(--taav-shadow-sm)]',
    isSelected && toneSelectedBorder[tone],
    invalid && !isSelected && 'border-[color:var(--taav-option-card-invalid-border)]',
    disabled && 'cursor-not-allowed opacity-60',
    unsafeClassName,
    wrapperClassName,
  );

  const body = (
    <>
      {showInput ? (
        <input
          id={inputId}
          type={inputType}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className="peer sr-only"
          onChange={() => onClick?.()}
          {...inputProps}
        />
      ) : null}
      <div className={cn('grid gap-[var(--taav-space-2)]', contentClassName)}>
        <div className="flex items-start justify-between gap-[var(--taav-space-3)]">
          <div className="flex min-w-0 items-start gap-[var(--taav-space-3)]">
            {icon ? (
              <span className="inline-flex shrink-0 rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-2 text-[var(--taav-text-muted)] [&_svg]:h-5 [&_svg]:w-5">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0 grid gap-[var(--taav-space-1)]">
              <strong className={cn('font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]', sizeTitle[size])}>
                {title}
              </strong>
              {description ? (
                <p className="m-0 text-[length:var(--taav-form-description-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {badge ? <span className="shrink-0">{badge}</span> : null}
        </div>
        {meta ? (
          <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">{meta}</p>
        ) : null}
      </div>
    </>
  );

  if (showInput) {
    return (
      <label htmlFor={inputId} className={cardClass}>
        {body}
      </label>
    );
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cardClass}>
      {body}
    </button>
  );
}
