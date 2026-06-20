'use client';

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TaavInput } from '../../forms/TaavInput';
import { TaavSkeleton } from '../TaavSkeleton';

export type TaavFilterBarLayout = 'inline' | 'stacked' | 'responsive';
export type TaavFilterBarDensity = 'compact' | 'comfortable';

export type TaavFilterBarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  activeFilters?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  layout?: TaavFilterBarLayout;
  density?: TaavFilterBarDensity;
  sticky?: boolean;
  resultCount?: number;
  loading?: boolean;
  wrapperClassName?: string;
  contentClassName?: string;
};

export function TaavFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'جستجو...',
  filters,
  activeFilters,
  actions,
  children,
  layout = 'responsive',
  density = 'comfortable',
  sticky = false,
  resultCount,
  loading = false,
  wrapperClassName,
  contentClassName,
}: TaavFilterBarProps) {
  const showSearch = onSearchChange !== undefined;

  return (
    <div
      className={cn(
        'rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-filterbar-border)] bg-[var(--taav-filterbar-surface)]',
        density === 'compact' ? 'p-[var(--taav-space-3)]' : 'p-[var(--taav-space-4)]',
        sticky && 'sticky top-0 z-[var(--taav-z-sticky)]',
        wrapperClassName,
      )}
    >
      <div
        className={cn(
          'grid gap-[var(--taav-filterbar-gap)]',
          layout === 'inline' && 'grid-cols-[1fr_auto_auto]',
          layout === 'stacked' && 'grid-cols-1',
          layout === 'responsive' && 'lg:grid-cols-[1fr_auto_auto] lg:items-center',
          contentClassName,
        )}
      >
        <div className="grid gap-[var(--taav-filterbar-gap)]">
          {showSearch ? (
            loading ? (
              <TaavSkeleton variant="row" size="sm" />
            ) : (
              <TaavInput
                size={density === 'compact' ? 'sm' : 'md'}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
              />
            )
          ) : null}
          {filters}
          {activeFilters ? (
            <div className="flex flex-wrap gap-[var(--taav-space-2)]">{activeFilters}</div>
          ) : null}
        </div>

        {resultCount != null ? (
          <p className="m-0 self-center text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            {loading ? '…' : `${resultCount} نتیجه`}
          </p>
        ) : null}

        {actions ? <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
