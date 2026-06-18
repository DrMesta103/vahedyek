import type { HTMLAttributes, ReactNode } from 'react';
import { TaavStatusBadge, type TaavStatus } from '../../data-display/TaavStatusBadge';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { progressFillTone, type TaavLayoutTone } from '../shared/layout.variants';

export type TaavProgressSummaryItem = {
  id: string;
  label: string;
  status: 'done' | 'current' | 'pending' | 'warning' | 'error';
  description?: string;
};

export type TaavProgressSummaryVariant = 'bar' | 'ring' | 'list' | 'compact';
export type TaavProgressSummarySize = 'sm' | 'md' | 'lg';

const sizeBarHeight: Record<TaavProgressSummarySize, string> = {
  sm: 'h-[var(--taav-progress-height-sm)]',
  md: 'h-[var(--taav-progress-height-md)]',
  lg: 'h-[var(--taav-progress-height-lg)]',
};

const sizeRingSize: Record<TaavProgressSummarySize, string> = {
  sm: 'h-[var(--taav-progress-ring-size-sm)] w-[var(--taav-progress-ring-size-sm)]',
  md: 'h-[var(--taav-progress-ring-size-md)] w-[var(--taav-progress-ring-size-md)]',
  lg: 'h-[var(--taav-progress-ring-size-lg)] w-[var(--taav-progress-ring-size-lg)]',
};

const itemStatusClass: Record<TaavProgressSummaryItem['status'], string> = {
  done: 'text-[var(--taav-success-strong)]',
  current: 'text-[var(--taav-brand-strong)]',
  pending: 'text-[var(--taav-text-subtle)]',
  warning: 'text-[var(--taav-warning-strong)]',
  error: 'text-[var(--taav-danger-strong)]',
};

const itemStatusSymbol: Record<TaavProgressSummaryItem['status'], string> = {
  done: '✓',
  current: '●',
  pending: '○',
  warning: '!',
  error: '✕',
};

const ringStrokeVar: Record<TaavLayoutTone, string> = {
  neutral: 'var(--taav-neutral)',
  brand: 'var(--taav-progress-fill-brand)',
  success: 'var(--taav-progress-fill-success)',
  warning: 'var(--taav-warning)',
  danger: 'var(--taav-danger)',
  info: 'var(--taav-info)',
  purple: 'var(--taav-purple)',
};

function resolvePercent(value?: number, max?: number, percent?: number): number {
  if (typeof percent === 'number') return Math.min(100, Math.max(0, percent));
  if (typeof value === 'number' && typeof max === 'number' && max > 0) {
    return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  }
  return 0;
}

export type TaavProgressSummaryProps = {
  value?: number;
  max?: number;
  percent?: number;
  label?: ReactNode;
  description?: ReactNode;
  status?: TaavStatus;
  items?: TaavProgressSummaryItem[];
  tone?: TaavLayoutTone;
  size?: TaavProgressSummarySize;
  variant?: TaavProgressSummaryVariant;
  showPercent?: boolean;
  loading?: boolean;
  contentClassName?: string;
  wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

export function TaavProgressSummary({
  value,
  max,
  percent,
  label,
  description,
  status,
  items,
  tone = 'brand',
  size = 'md',
  variant = 'bar',
  showPercent = true,
  loading = false,
  contentClassName,
  wrapperClassName,
  ...props
}: TaavProgressSummaryProps) {
  const resolvedPercent = resolvePercent(value, max, percent);

  if (loading) {
    return (
      <div className={cn('grid gap-[var(--taav-space-3)]', wrapperClassName)}>
        <TaavSkeleton variant="text" width="50%" />
        <TaavSkeleton variant="custom" height={8} />
      </div>
    );
  }

  return (
    <div className={cn('grid gap-[var(--taav-space-3)]', wrapperClassName)} {...props}>
      {(label || description || status || (showPercent && variant !== 'list')) && (
        <div className={cn('flex flex-wrap items-start justify-between gap-[var(--taav-space-2)]', contentClassName)}>
          <div className="grid gap-[var(--taav-space-1)]">
            {label ? (
              <p className="m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">{label}</p>
            ) : null}
            {description ? (
              <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
            {status ? <TaavStatusBadge status={status} size="sm" /> : null}
            {showPercent && variant !== 'list' ? (
              <span className="text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                {resolvedPercent}%
              </span>
            ) : null}
          </div>
        </div>
      )}

      {variant === 'bar' || variant === 'compact' ? (
        <div
          className={cn(
            'overflow-hidden rounded-[var(--taav-radius-pill)] bg-[var(--taav-progress-bg)]',
            sizeBarHeight[size],
            variant === 'compact' && 'max-w-xs',
          )}
          role="progressbar"
          aria-valuenow={resolvedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn('h-full rounded-[var(--taav-radius-pill)] transition-[width] duration-[var(--taav-duration-normal)]', progressFillTone[tone])}
            style={{ width: `${resolvedPercent}%` }}
          />
        </div>
      ) : null}

      {variant === 'ring' ? (
        <div className="flex items-center gap-[var(--taav-space-4)]">
          <div
            className={cn('relative inline-flex items-center justify-center rounded-full', sizeRingSize[size])}
            role="progressbar"
            aria-valuenow={resolvedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--taav-progress-bg)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={ringStrokeVar[tone]}
                strokeWidth="3"
                strokeDasharray={`${resolvedPercent} 100`}
                strokeLinecap="round"
                pathLength={100}
              />
            </svg>
            {showPercent ? (
              <span className="absolute text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-strong)]">
                {resolvedPercent}%
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{description}</p>
          ) : null}
        </div>
      ) : null}

      {(variant === 'list' || items) && items && items.length > 0 ? (
        <ul className="m-0 grid list-none gap-[var(--taav-space-2)] p-0">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-[var(--taav-space-2)]">
              <span className={cn('inline-flex h-5 w-5 shrink-0 items-center justify-center text-[length:var(--taav-text-xs)] font-black', itemStatusClass[item.status])} aria-hidden>
                {itemStatusSymbol[item.status]}
              </span>
              <div className="grid gap-[var(--taav-space-0)]">
                <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)]">{item.label}</span>
                {item.description ? (
                  <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{item.description}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
