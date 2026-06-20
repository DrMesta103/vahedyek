import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type TaavEmptyStateVariant = 'default' | 'search' | 'error' | 'permission' | 'setup' | 'compact';
export type TaavEmptyStateSize = 'sm' | 'md' | 'lg';
export type TaavEmptyStateTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';

const sizePadding: Record<TaavEmptyStateSize, string> = {
  sm: 'p-[var(--taav-empty-padding-sm)]',
  md: 'p-[var(--taav-empty-padding-md)]',
  lg: 'p-[var(--taav-empty-padding-lg)]',
};

const iconSize: Record<TaavEmptyStateSize, string> = {
  sm: 'h-[var(--taav-empty-icon-size-sm)] w-[var(--taav-empty-icon-size-sm)]',
  md: 'h-[var(--taav-empty-icon-size-md)] w-[var(--taav-empty-icon-size-md)]',
  lg: 'h-[var(--taav-empty-icon-size-lg)] w-[var(--taav-empty-icon-size-lg)]',
};

const toneSurface: Record<TaavEmptyStateTone, string> = {
  neutral: 'text-[var(--taav-text-muted)]',
  info: 'text-[var(--taav-info-strong)]',
  warning: 'text-[var(--taav-warning-strong)]',
  danger: 'text-[var(--taav-danger-strong)]',
  success: 'text-[var(--taav-success-strong)]',
};

export type TaavEmptyStateProps = {
  variant?: TaavEmptyStateVariant;
  size?: TaavEmptyStateSize;
  tone?: TaavEmptyStateTone;
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  children?: ReactNode;
  contentClassName?: string;
  wrapperClassName?: string;
};

export function TaavEmptyState({
  variant = 'default',
  size = 'md',
  tone = 'neutral',
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  contentClassName,
  wrapperClassName,
}: TaavEmptyStateProps) {
  const isCompact = variant === 'compact' || size === 'sm';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizePadding[size],
        variant !== 'compact' && 'rounded-[var(--taav-radius-lg)] bg-[var(--taav-empty-surface)]',
        wrapperClassName,
      )}
    >
      <div className={cn('grid max-w-md gap-[var(--taav-space-3)]', contentClassName)}>
        {icon ? (
          <div className={cn('mx-auto inline-flex items-center justify-center rounded-full bg-[var(--taav-surface-muted)]', iconSize[size], toneSurface[tone])}>
            {icon}
          </div>
        ) : null}
        {title ? (
          <h3 className={cn('m-0 font-black text-[var(--taav-text-strong)]', isCompact ? 'text-[length:var(--taav-text-sm)]' : 'text-[length:var(--taav-text-lg)]')}>
            {title}
          </h3>
        ) : null}
        {description ? (
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
            {description}
          </p>
        ) : null}
        {children}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-[var(--taav-space-2)]">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
