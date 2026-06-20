import type { HTMLAttributes, ReactNode } from 'react';
import { TaavStatusBadge, type TaavStatus } from '../../data-display/TaavStatusBadge';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { layoutDensityGap, layoutPaddingClass, type TaavLayoutDensity } from '../shared/layout.variants';

export type TaavSettingsSectionVariant = 'default' | 'card' | 'split' | 'compact';

const variantClass: Record<TaavSettingsSectionVariant, string> = {
  default: 'border-b border-[color:var(--taav-section-border)] pb-[var(--taav-space-6)]',
  card: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)]',
  split: '',
  compact: 'border-b border-[color:var(--taav-section-border)] pb-[var(--taav-space-4)]',
};

export type TaavSettingsSectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  status?: TaavStatus;
  completion?: ReactNode;
  required?: boolean;
  optional?: boolean;
  warning?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  variant?: TaavSettingsSectionVariant;
  density?: TaavLayoutDensity;
  loading?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'>;

export function TaavSettingsSection({
  title,
  description,
  status,
  completion,
  required,
  optional,
  warning,
  actions,
  aside,
  children,
  variant = 'default',
  density = 'comfortable',
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
  ...props
}: TaavSettingsSectionProps) {
  const isSplit = variant === 'split' || variant === 'card';
  const padding = variant === 'card' ? layoutPaddingClass.md : '';

  if (loading) {
    return (
      <section className={cn(variantClass[variant], padding, wrapperClassName)}>
        <TaavSkeleton variant="title" />
        <div className="mt-4">
          <TaavSkeleton variant="row" count={2} />
        </div>
      </section>
    );
  }

  return (
    <section className={cn(variantClass[variant], padding, wrapperClassName)} {...props}>
      <div
        className={cn(
          isSplit
            ? cn('grid gap-[var(--taav-space-6)] lg:grid-cols-[minmax(0,280px)_1fr]', layoutDensityGap[density])
            : cn('grid', layoutDensityGap[density]),
        )}
      >
        <div className={cn('grid gap-[var(--taav-space-2)]', headerClassName)}>
          <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
            {title ? (
              <h3 className="m-0 text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]">
                {title}
                {required ? (
                  <span className="ms-1 text-[color:var(--taav-required-mark)]" aria-hidden>
                    *
                  </span>
                ) : null}
              </h3>
            ) : null}
            {optional ? (
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">(اختیاری)</span>
            ) : null}
            {status ? <TaavStatusBadge status={status} size="sm" /> : null}
            {completion}
          </div>
          {description ? (
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
              {description}
            </p>
          ) : null}
          {warning ? (
            <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-warning-strong)]">{warning}</p>
          ) : null}
          {aside}
        </div>

        <div className={cn('grid gap-[var(--taav-space-4)]', contentClassName)}>
          {actions ? (
            <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">{actions}</div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
