import type { HTMLAttributes, ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';

export type TaavStickyActionBarPosition = 'bottom' | 'top';
export type TaavStickyActionBarVariant = 'default' | 'elevated' | 'soft' | 'transparent';
export type TaavStickyActionBarAlign = 'start' | 'end' | 'between' | 'center';

const positionClass: Record<TaavStickyActionBarPosition, string> = {
  bottom: 'sticky bottom-0 border-t',
  top: 'sticky top-[var(--taav-header-sticky-offset)] border-b',
};

const variantClass: Record<TaavStickyActionBarVariant, string> = {
  default: 'bg-[var(--taav-action-bar-surface)] border-[color:var(--taav-action-bar-border)]',
  elevated: 'bg-[var(--taav-action-bar-surface)] border-[color:var(--taav-action-bar-border)] shadow-[var(--taav-action-bar-shadow)]',
  soft: 'bg-[var(--taav-surface-soft)] border-[color:var(--taav-border-subtle)]',
  transparent: 'border-[color:var(--taav-border-subtle)] bg-transparent backdrop-blur-sm',
};

const alignClass: Record<TaavStickyActionBarAlign, string> = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
  center: 'justify-center',
};

export type TaavStickyActionBarProps = {
  position?: TaavStickyActionBarPosition;
  variant?: TaavStickyActionBarVariant;
  align?: TaavStickyActionBarAlign;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  tertiaryAction?: ReactNode;
  actions?: ReactNode;
  summary?: ReactNode;
  dirty?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  contentClassName?: string;
  wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

export function TaavStickyActionBar({
  position = 'bottom',
  variant = 'default',
  align = 'end',
  primaryAction,
  secondaryAction,
  tertiaryAction,
  actions,
  summary,
  dirty = false,
  loading = false,
  disabled = false,
  children,
  contentClassName,
  wrapperClassName,
  ...props
}: TaavStickyActionBarProps) {
  const hasActions = Boolean(primaryAction || secondaryAction || tertiaryAction || actions || children);

  return (
    <div
      role="toolbar"
      aria-label="اقدامات صفحه"
      className={cn(
        'z-[var(--taav-z-sticky)] min-h-[var(--taav-action-bar-height)] px-[var(--taav-page-padding-md)] py-[var(--taav-space-3)]',
        positionClass[position],
        variantClass[variant],
        disabled && 'pointer-events-none opacity-60',
        wrapperClassName,
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[var(--taav-page-container-wide)] flex-wrap items-center gap-[var(--taav-space-3)]',
          summary ? 'justify-between' : alignClass[align],
          contentClassName,
        )}
      >
        {summary ? <div className="min-w-0 flex-1 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{summary}</div> : null}

        {loading ? (
          <TaavSkeleton variant="button" count={2} />
        ) : hasActions ? (
          <div className={cn('flex flex-wrap items-center gap-[var(--taav-space-2)]', !summary && alignClass[align])}>
            {dirty ? (
              <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-warning-strong)]">
                تغییرات ذخیره نشده
              </span>
            ) : null}
            {tertiaryAction}
            {secondaryAction}
            {primaryAction}
            {actions}
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
