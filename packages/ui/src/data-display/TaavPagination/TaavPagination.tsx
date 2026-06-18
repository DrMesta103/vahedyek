'use client';

import { cn } from '../../utils/cn';
import { TaavButton } from '../../primitives/TaavButton';

export type TaavPaginationSize = 'sm' | 'md' | 'lg';
export type TaavPaginationVariant = 'default' | 'compact' | 'minimal';

export type TaavPaginationProps = {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  size?: TaavPaginationSize;
  variant?: TaavPaginationVariant;
  showPageSize?: boolean;
  showTotal?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
};

function buildPageItems(page: number, totalPages: number, variant: TaavPaginationVariant): (number | 'ellipsis')[] {
  if (variant === 'minimal') return [page];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const items: (number | 'ellipsis')[] = [1];
  if (page > 3) items.push('ellipsis');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) items.push(p);
  if (page < totalPages - 2) items.push('ellipsis');
  items.push(totalPages);
  return items;
}

export function TaavPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  size = 'md',
  variant = 'default',
  showPageSize = false,
  showTotal = true,
  disabled = false,
  wrapperClassName,
}: TaavPaginationProps) {
  const buttonSize = size === 'lg' ? 'md' : size === 'sm' ? 'sm' : 'md';
  const pages = buildPageItems(page, totalPages, variant);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-[var(--taav-space-3)]',
        wrapperClassName,
      )}
      dir="rtl"
    >
      {showTotal ? (
        <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          {totalItems != null ? `${totalItems} مورد` : `صفحه ${page} از ${totalPages}`}
        </p>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-[var(--taav-space-2)]">
        <TaavButton
          size={buttonSize}
          variant="outline"
          tone="neutral"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="صفحه قبل"
        >
          قبلی
        </TaavButton>

        {variant !== 'minimal' &&
          pages.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-[var(--taav-text-subtle)]">
                …
              </span>
            ) : (
              <TaavButton
                key={item}
                size={buttonSize}
                variant={item === page ? 'primary' : 'outline'}
                tone={item === page ? 'brand' : 'neutral'}
                disabled={disabled}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </TaavButton>
            ),
          )}

        <TaavButton
          size={buttonSize}
          variant="outline"
          tone="neutral"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="صفحه بعد"
        >
          بعدی
        </TaavButton>
      </div>

      {showPageSize && pageSize != null && onPageSizeChange ? (
        <label className="inline-flex items-center gap-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          <span>تعداد</span>
          <select
            className="h-[var(--taav-pagination-height-md)] rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border)] bg-[var(--taav-surface)] px-2 text-[length:var(--taav-text-sm)]"
            value={pageSize}
            disabled={disabled}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
