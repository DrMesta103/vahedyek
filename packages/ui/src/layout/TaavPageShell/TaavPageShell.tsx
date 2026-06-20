import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  layoutDensityGap,
  pagePaddingClass,
  type TaavLayoutDensity,
  type TaavLayoutPadding,
} from '../shared/layout.variants';

export type TaavPageShellVariant = 'default' | 'dashboard' | 'settings' | 'detail' | 'form' | 'report';
export type TaavPageShellWidth = 'narrow' | 'normal' | 'wide' | 'full';

const variantClass: Record<TaavPageShellVariant, string> = {
  default: '',
  dashboard: 'bg-[var(--taav-page-bg)]',
  settings: 'bg-[var(--taav-page-bg)]',
  detail: 'bg-[var(--taav-page-bg)]',
  form: 'bg-[var(--taav-surface-soft)]',
  report: 'bg-[var(--taav-page-bg)]',
};

const widthClass: Record<TaavPageShellWidth, string> = {
  narrow: 'max-w-[var(--taav-page-container-narrow)]',
  normal: 'max-w-[var(--taav-page-container-normal)]',
  wide: 'max-w-[var(--taav-page-container-wide)]',
  full: 'max-w-[var(--taav-page-container-full)]',
};

export type TaavPageShellProps = {
  variant?: TaavPageShellVariant;
  width?: TaavPageShellWidth;
  padding?: TaavLayoutPadding;
  density?: TaavLayoutDensity;
  withBackground?: boolean;
  withContainer?: boolean;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

export function TaavPageShell({
  variant = 'default',
  width = 'normal',
  padding = 'md',
  density = 'comfortable',
  withBackground = true,
  withContainer = true,
  header,
  sidebar,
  footer,
  children,
  wrapperClassName,
  contentClassName,
  ...props
}: TaavPageShellProps) {
  const hasSidebar = Boolean(sidebar);

  return (
    <div
      className={cn(
        'min-h-full w-full',
        withBackground && (variantClass[variant] || 'bg-[var(--taav-page-bg)]'),
        wrapperClassName,
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto w-full',
          withContainer && widthClass[width],
          pagePaddingClass[padding],
        )}
      >
        <div className={cn('flex flex-col', layoutDensityGap[density], contentClassName)}>
          {header}
          {hasSidebar ? (
            <div className={cn('flex flex-col lg:flex-row', layoutDensityGap[density])}>
              {sidebar}
              <main className="min-w-0 flex-1">{children}</main>
            </div>
          ) : (
            children
          )}
          {footer}
        </div>
      </div>
    </div>
  );
}
