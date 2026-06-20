'use client';

import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { TaavStatusBadge, type TaavStatus } from '../../data-display/TaavStatusBadge';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { layoutDensityGap, layoutPaddingClass, type TaavLayoutDensity } from '../shared/layout.variants';

export type TaavSidebarPanelVariant = 'card' | 'soft' | 'outlined' | 'plain';
export type TaavSidebarPanelWidth = 'sm' | 'md' | 'lg';

const variantClass: Record<TaavSidebarPanelVariant, string> = {
  card: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-sidebar-border)] bg-[var(--taav-sidebar-surface)]',
  soft: 'rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface-soft)]',
  outlined: 'rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-sidebar-border)] bg-[var(--taav-sidebar-surface)]',
  plain: '',
};

const widthClass: Record<TaavSidebarPanelWidth, string> = {
  sm: 'w-full lg:w-[var(--taav-sidebar-width-sm)]',
  md: 'w-full lg:w-[var(--taav-sidebar-width-md)]',
  lg: 'w-full lg:w-[var(--taav-sidebar-width-lg)]',
};

export type TaavSidebarPanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: TaavStatus;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  variant?: TaavSidebarPanelVariant;
  width?: TaavSidebarPanelWidth;
  sticky?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  density?: TaavLayoutDensity;
  loading?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'>;

export function TaavSidebarPanel({
  title,
  description,
  icon,
  status,
  actions,
  footer,
  children,
  variant = 'card',
  width = 'md',
  sticky = false,
  collapsible = false,
  defaultCollapsed = false,
  density = 'comfortable',
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
  ...props
}: TaavSidebarPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsible && collapsed;

  if (loading) {
    return (
      <aside className={cn(variantClass[variant], widthClass[width], layoutPaddingClass.md, wrapperClassName)}>
        <TaavSkeleton variant="title" />
        <div className="mt-4">
          <TaavSkeleton variant="card" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        variantClass[variant],
        widthClass[width],
        sticky && 'lg:sticky lg:top-[var(--taav-space-4)] lg:self-start',
        'shrink-0',
        wrapperClassName,
      )}
      {...props}
    >
      {(title || description || icon || status || actions || collapsible) && (
        <div
          className={cn(
            'flex items-start justify-between gap-[var(--taav-space-2)] border-b border-[color:var(--taav-border-subtle)]',
            layoutPaddingClass.md,
            headerClassName,
          )}
        >
          <div className="grid min-w-0 flex-1 gap-[var(--taav-space-1)]">
            <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
              {collapsible ? (
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--taav-radius-sm)] text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-muted)]"
                  aria-expanded={!isCollapsed}
                  onClick={() => setCollapsed((value) => !value)}
                >
                  <span className={cn('text-[length:var(--taav-text-xs)] transition-transform', isCollapsed && '-rotate-90')} aria-hidden>
                    ▾
                  </span>
                </button>
              ) : null}
              {icon ? <span className="text-[var(--taav-brand-strong)]">{icon}</span> : null}
              {title ? (
                <h3 className="m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                  {title}
                </h3>
              ) : null}
              {status ? <TaavStatusBadge status={status} size="sm" /> : null}
            </div>
            {description && !isCollapsed ? (
              <p className="m-0 text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-[var(--taav-space-2)]">{actions}</div> : null}
        </div>
      )}

      {!isCollapsed && children ? (
        <div className={cn(layoutPaddingClass.md, layoutDensityGap[density], 'grid', contentClassName)}>
          {children}
        </div>
      ) : null}

      {!isCollapsed && footer ? (
        <div className={cn('border-t border-[color:var(--taav-border-subtle)]', layoutPaddingClass.md)}>
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
