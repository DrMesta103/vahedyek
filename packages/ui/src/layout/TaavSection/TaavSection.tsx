'use client';

import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import {
  layoutDensityGap,
  layoutPaddingClass,
  type TaavLayoutDensity,
  type TaavLayoutPadding,
} from '../shared/layout.variants';

export type TaavSectionVariant = 'card' | 'plain' | 'outlined' | 'soft';

const variantSurface: Record<TaavSectionVariant, string> = {
  card: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)]',
  plain: '',
  outlined: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-outlined)]',
  soft: 'rounded-[var(--taav-radius-lg)] bg-[var(--taav-section-surface-soft)]',
};

export type TaavSectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  variant?: TaavSectionVariant;
  padding?: TaavLayoutPadding;
  density?: TaavLayoutDensity;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'>;

export function TaavSection({
  title,
  description,
  eyebrow,
  icon,
  badge,
  actions,
  footer,
  children,
  variant = 'card',
  padding = 'md',
  density = 'comfortable',
  collapsible = false,
  defaultCollapsed = false,
  disabled = false,
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
  ...props
}: TaavSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsible && collapsed;
  const hasHeader = Boolean(title || description || eyebrow || icon || badge || actions);

  if (loading) {
    return (
      <section className={cn(variantSurface[variant], layoutPaddingClass[padding], wrapperClassName)}>
        <TaavSkeleton variant="title" />
        <div className="mt-4">
          <TaavSkeleton variant="text" lines={3} />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        variantSurface[variant],
        disabled && 'pointer-events-none opacity-60',
        wrapperClassName,
      )}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {hasHeader ? (
        <div
          className={cn(
            'flex flex-wrap items-start justify-between gap-[var(--taav-space-3)] border-b border-[color:var(--taav-border-subtle)]',
            layoutPaddingClass[padding],
            !children && !footer && 'border-b-0',
            headerClassName,
          )}
        >
          <div className="grid min-w-0 flex-1 gap-[var(--taav-space-1)]">
            <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
              {collapsible ? (
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--taav-radius-sm)] text-[var(--taav-text-muted)] transition hover:bg-[var(--taav-surface-muted)]"
                  aria-expanded={!isCollapsed}
                  onClick={() => setCollapsed((value) => !value)}
                >
                  <span
                    className={cn(
                      'inline-block text-[length:var(--taav-text-xs)] transition-transform duration-[var(--taav-duration-fast)]',
                      isCollapsed && '-rotate-90',
                    )}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
              ) : null}
              {icon ? (
                <span className="inline-flex shrink-0 text-[var(--taav-brand-strong)]">{icon}</span>
              ) : null}
              {eyebrow ? (
                <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-subtle)]">
                  {eyebrow}
                </span>
              ) : null}
              {title ? (
                <h2 className="m-0 text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]">
                  {title}
                </h2>
              ) : null}
              {badge}
            </div>
            {description && !isCollapsed ? (
              <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-[var(--taav-space-2)]">{actions}</div>
          ) : null}
        </div>
      ) : null}

      {!isCollapsed && children ? (
        <div className={cn(layoutPaddingClass[padding], layoutDensityGap[density], 'grid', contentClassName)}>
          {children}
        </div>
      ) : null}

      {!isCollapsed && footer ? (
        <div
          className={cn(
            'border-t border-[color:var(--taav-border-subtle)]',
            layoutPaddingClass[padding],
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}
