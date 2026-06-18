import type { HTMLAttributes, ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import {
  layoutPaddingClass,
  layoutToneSurface,
  layoutToneText,
  type TaavLayoutTone,
} from '../shared/layout.variants';

export type TaavStatsTrend = {
  value: string;
  direction?: 'up' | 'down' | 'flat';
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  label?: string;
};

export type TaavStatsCardVariant = 'card' | 'soft' | 'outline' | 'ghost';
export type TaavStatsCardSize = 'sm' | 'md' | 'lg';

const variantClass: Record<TaavStatsCardVariant, string> = {
  card: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)]',
  soft: 'rounded-[var(--taav-radius-lg)]',
  outline: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-transparent',
  ghost: 'rounded-[var(--taav-radius-lg)] bg-transparent',
};

const sizeValueClass: Record<TaavStatsCardSize, string> = {
  sm: 'text-[length:var(--taav-stats-value-sm)]',
  md: 'text-[length:var(--taav-stats-value-md)]',
  lg: 'text-[length:var(--taav-stats-value-lg)]',
};

const trendToneClass: Record<NonNullable<TaavStatsTrend['tone']>, string> = {
  neutral: 'text-[var(--taav-text-muted)]',
  success: 'text-[var(--taav-success-strong)]',
  warning: 'text-[var(--taav-warning-strong)]',
  danger: 'text-[var(--taav-danger-strong)]',
  info: 'text-[var(--taav-info-strong)]',
};

const trendDirectionSymbol: Record<NonNullable<TaavStatsTrend['direction']>, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export type TaavStatsCardProps = {
  title?: ReactNode;
  value?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trend?: TaavStatsTrend;
  tone?: TaavLayoutTone;
  size?: TaavStatsCardSize;
  variant?: TaavStatsCardVariant;
  loading?: boolean;
  footer?: ReactNode;
  action?: ReactNode;
  contentClassName?: string;
  wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'title'>;

export function TaavStatsCard({
  title,
  value,
  description,
  icon,
  trend,
  tone = 'neutral',
  size = 'md',
  variant = 'card',
  loading = false,
  footer,
  action,
  contentClassName,
  wrapperClassName,
  ...props
}: TaavStatsCardProps) {
  const softSurface = variant === 'soft';

  if (loading) {
    return (
      <div className={cn(variantClass[variant], layoutPaddingClass.md, wrapperClassName)}>
        <TaavSkeleton variant="text" width="40%" />
        <TaavSkeleton variant="title" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        variantClass[variant],
        softSurface && layoutToneSurface[tone],
        layoutPaddingClass.md,
        wrapperClassName,
      )}
      {...props}
    >
      <div className={cn('grid gap-[var(--taav-space-2)]', contentClassName)}>
        <div className="flex items-start justify-between gap-[var(--taav-space-2)]">
          <div className="grid min-w-0 flex-1 gap-[var(--taav-space-1)]">
            {title ? (
              <p className="m-0 text-[length:var(--taav-stats-title)] font-bold text-[var(--taav-text-subtle)]">
                {title}
              </p>
            ) : null}
            {value ? (
              <p className={cn('m-0 font-black leading-[var(--taav-leading-tight)]', sizeValueClass[size], softSurface ? layoutToneText[tone] : 'text-[var(--taav-text-strong)]')}>
                {value}
              </p>
            ) : null}
          </div>
          {icon ? (
            <span className={cn('inline-flex shrink-0 rounded-[var(--taav-radius-md)] p-2', layoutToneSurface[tone], layoutToneText[tone])}>
              {icon}
            </span>
          ) : null}
        </div>

        {description ? (
          <p className="m-0 text-[length:var(--taav-stats-description)] text-[var(--taav-text-muted)]">{description}</p>
        ) : null}

        {trend ? (
          <div className={cn('flex flex-wrap items-center gap-[var(--taav-space-1)] text-[length:var(--taav-text-xs)] font-bold', trendToneClass[trend.tone ?? 'neutral'])}>
            {trend.direction ? <span aria-hidden>{trendDirectionSymbol[trend.direction]}</span> : null}
            <span>{trend.value}</span>
            {trend.label ? <span className="font-normal text-[var(--taav-text-subtle)]">{trend.label}</span> : null}
          </div>
        ) : null}

        {action ? <div>{action}</div> : null}
        {footer ? <div className="border-t border-[color:var(--taav-border-subtle)] pt-[var(--taav-space-2)]">{footer}</div> : null}
      </div>
    </div>
  );
}
