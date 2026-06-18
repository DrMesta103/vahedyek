import type { ReactNode } from 'react';
import { TaavStatusBadge, type TaavStatus } from '../../data-display/TaavStatusBadge';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';

export type TaavPageHeaderVariant = 'default' | 'compact' | 'hero' | 'plain';
export type TaavPageHeaderSize = 'sm' | 'md' | 'lg';

const variantClass: Record<TaavPageHeaderVariant, string> = {
  default: 'pb-[var(--taav-header-gap)]',
  compact: 'pb-[var(--taav-space-3)]',
  hero: 'pb-[var(--taav-space-6)]',
  plain: '',
};

const sizeTitleClass: Record<TaavPageHeaderSize, string> = {
  sm: 'text-[length:var(--taav-header-title-sm)]',
  md: 'text-[length:var(--taav-header-title-md)]',
  lg: 'text-[length:var(--taav-header-title-lg)]',
};

export type TaavPageHeaderProps = {
  title?: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  status?: TaavStatus;
  meta?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  secondaryActions?: ReactNode;
  backAction?: ReactNode;
  icon?: ReactNode;
  variant?: TaavPageHeaderVariant;
  size?: TaavPageHeaderSize;
  sticky?: boolean;
  bordered?: boolean;
  loading?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  wrapperClassName?: string;
};

export function TaavPageHeader({
  title,
  eyebrow,
  description,
  badge,
  status,
  meta,
  breadcrumbs,
  actions,
  secondaryActions,
  backAction,
  icon,
  variant = 'default',
  size = 'md',
  sticky = false,
  bordered = false,
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
}: TaavPageHeaderProps) {
  if (loading) {
    return (
      <header className={cn('grid gap-[var(--taav-space-3)]', variantClass[variant], wrapperClassName)}>
        <TaavSkeleton variant="text" lines={1} width="30%" />
        <TaavSkeleton variant="title" />
        <TaavSkeleton variant="text" lines={2} />
      </header>
    );
  }

  return (
    <header
      className={cn(
        variantClass[variant],
        sticky && 'sticky top-[var(--taav-header-sticky-offset)] z-[var(--taav-z-sticky)] bg-[var(--taav-page-bg)]',
        bordered && 'border-b border-[color:var(--taav-border-subtle)]',
        wrapperClassName,
      )}
    >
      {breadcrumbs ? (
        <nav aria-label="breadcrumb" className="mb-[var(--taav-space-3)] text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">
          {breadcrumbs}
        </nav>
      ) : null}

      <div className={cn('grid gap-[var(--taav-header-gap)]', headerClassName)}>
        {(backAction || icon || eyebrow) && (
          <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
            {backAction}
            {icon ? (
              <span className="inline-flex shrink-0 items-center justify-center rounded-[var(--taav-radius-md)] bg-[var(--taav-surface-muted)] p-2 text-[var(--taav-brand-strong)]">
                {icon}
              </span>
            ) : null}
            {eyebrow ? (
              <span className="text-[length:var(--taav-header-eyebrow)] font-bold text-[var(--taav-text-subtle)]">
                {eyebrow}
              </span>
            ) : null}
          </div>
        )}

        <div className={cn('flex flex-col gap-[var(--taav-space-4)] lg:flex-row lg:items-start lg:justify-between', contentClassName)}>
          <div className="grid min-w-0 flex-1 gap-[var(--taav-space-2)]">
            <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
              {title ? (
                <h1 className={cn('m-0 font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]', sizeTitleClass[size])}>
                  {title}
                </h1>
              ) : null}
              {badge}
              {status ? <TaavStatusBadge status={status} size="sm" /> : null}
            </div>
            {description ? (
              <p className="m-0 max-w-3xl text-[length:var(--taav-header-description)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                {description}
              </p>
            ) : null}
            {meta ? (
              <div className="flex flex-wrap items-center gap-[var(--taav-space-3)] text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">
                {meta}
              </div>
            ) : null}
          </div>

          {(actions || secondaryActions) && (
            <div className="flex shrink-0 flex-wrap items-center gap-[var(--taav-space-2)]">
              {secondaryActions}
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
