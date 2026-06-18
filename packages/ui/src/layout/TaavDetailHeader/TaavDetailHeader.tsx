import type { ReactNode } from 'react';
import { TaavStatusBadge, type TaavStatus } from '../../data-display/TaavStatusBadge';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';

export type TaavDetailHeaderVariant = 'default' | 'card' | 'compact' | 'hero';

const variantClass: Record<TaavDetailHeaderVariant, string> = {
  default: 'pb-[var(--taav-space-5)]',
  card: 'rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)] p-[var(--taav-section-padding-md)]',
  compact: 'pb-[var(--taav-space-3)]',
  hero: 'rounded-[var(--taav-radius-xl)] bg-[var(--taav-surface-soft)] p-[var(--taav-section-padding-lg)] pb-[var(--taav-space-6)]',
};

export type TaavDetailHeaderProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  icon?: ReactNode;
  status?: TaavStatus;
  meta?: ReactNode;
  tags?: ReactNode;
  actions?: ReactNode;
  backAction?: ReactNode;
  tabs?: ReactNode;
  summary?: ReactNode;
  variant?: TaavDetailHeaderVariant;
  loading?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  wrapperClassName?: string;
};

export function TaavDetailHeader({
  title,
  subtitle,
  avatar,
  icon,
  status,
  meta,
  tags,
  actions,
  backAction,
  tabs,
  summary,
  variant = 'default',
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
}: TaavDetailHeaderProps) {
  if (loading) {
    return (
      <header className={cn(variantClass[variant], wrapperClassName)}>
        <div className="flex items-center gap-[var(--taav-space-4)]">
          <TaavSkeleton variant="avatar" />
          <div className="flex-1">
            <TaavSkeleton variant="title" />
            <TaavSkeleton variant="text" lines={1} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn(variantClass[variant], wrapperClassName)}>
      <div className={cn('grid gap-[var(--taav-space-4)]', headerClassName)}>
        {backAction ? <div>{backAction}</div> : null}

        <div className={cn('flex flex-col gap-[var(--taav-space-4)] lg:flex-row lg:items-start lg:justify-between', contentClassName)}>
          <div className="flex min-w-0 flex-1 items-start gap-[var(--taav-space-4)]">
            {avatar ? <div className="shrink-0">{avatar}</div> : null}
            {!avatar && icon ? (
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)]">
                {icon}
              </span>
            ) : null}
            <div className="grid min-w-0 flex-1 gap-[var(--taav-space-2)]">
              <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
                {title ? (
                  <h1 className="m-0 text-[length:var(--taav-header-title-md)] font-black text-[var(--taav-text-strong)]">
                    {title}
                  </h1>
                ) : null}
                {status ? <TaavStatusBadge status={status} size="sm" /> : null}
              </div>
              {subtitle ? (
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{subtitle}</p>
              ) : null}
              {meta ? (
                <div className="flex flex-wrap items-center gap-[var(--taav-space-3)] text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">
                  {meta}
                </div>
              ) : null}
              {tags ? (
                <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">{tags}</div>
              ) : null}
            </div>
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-[var(--taav-space-2)]">{actions}</div>
          ) : null}
        </div>

        {summary ? <div>{summary}</div> : null}
        {tabs ? <div className="border-b border-[color:var(--taav-border-subtle)]">{tabs}</div> : null}
      </div>
    </header>
  );
}
