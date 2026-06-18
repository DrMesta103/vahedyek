import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  taavKeyValueGapClass,
  taavKeyValueLabelClass,
  taavKeyValueValueClass,
  type TaavKeyValueDensity,
  type TaavKeyValueLayout,
  type TaavKeyValueSize,
} from '../shared/data-display.variants';

export type TaavKeyValueItemTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type TaavKeyValueItem = {
  label: string;
  value?: ReactNode;
  description?: string;
  icon?: ReactNode;
  tone?: TaavKeyValueItemTone;
};

const valueToneClass: Record<TaavKeyValueItemTone, string> = {
  neutral: 'text-[var(--taav-text-strong)]',
  success: 'text-[var(--taav-success-strong)]',
  warning: 'text-[var(--taav-warning-strong)]',
  danger: 'text-[var(--taav-danger-strong)]',
  info: 'text-[var(--taav-info-strong)]',
};

export type TaavKeyValueProps = {
  items?: TaavKeyValueItem[];
  layout?: TaavKeyValueLayout;
  size?: TaavKeyValueSize;
  density?: TaavKeyValueDensity;
  labelWidth?: string | number;
  emptyText?: string;
  separator?: boolean;
  children?: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
};

export function TaavKeyValue({
  items,
  layout = 'vertical',
  size = 'md',
  density = 'comfortable',
  labelWidth,
  emptyText = '—',
  separator = false,
  children,
  wrapperClassName,
  contentClassName,
}: TaavKeyValueProps) {
  if (children) {
    return <div className={cn('grid', wrapperClassName)}>{children}</div>;
  }

  const layoutClass =
    layout === 'grid'
      ? 'grid gap-[var(--taav-space-4)] sm:grid-cols-2'
      : layout === 'horizontal'
        ? 'grid gap-[var(--taav-space-3)]'
        : 'grid gap-[var(--taav-space-3)]';

  return (
    <dl className={cn(layoutClass, wrapperClassName)}>
      {items?.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={cn(
            layout === 'horizontal' ? 'flex items-start gap-[var(--taav-space-4)]' : 'grid',
            taavKeyValueGapClass[density],
            separator && index > 0 && 'border-t border-[color:var(--taav-border-subtle)] pt-[var(--taav-space-3)]',
            contentClassName,
          )}
        >
          <dt
            className={cn(
              'm-0 font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]',
              taavKeyValueLabelClass[size],
              layout === 'horizontal' && 'shrink-0',
            )}
            style={labelWidth ? { width: labelWidth } : undefined}
          >
            <span className="inline-flex items-center gap-[var(--taav-space-2)]">
              {item.icon ? <span className="inline-flex [&_svg]:h-4 [&_svg]:w-4">{item.icon}</span> : null}
              {item.label}
            </span>
          </dt>
          <dd className={cn('m-0 font-[var(--taav-font-weight-medium)]', taavKeyValueValueClass[size], valueToneClass[item.tone ?? 'neutral'])}>
            {item.value ?? emptyText}
            {item.description ? (
              <span className="mt-1 block text-[length:var(--taav-text-xs)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]">
                {item.description}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
