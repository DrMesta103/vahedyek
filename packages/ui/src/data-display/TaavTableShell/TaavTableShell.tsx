import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { TaavEmptyState } from '../TaavEmptyState';
import { TaavSkeleton } from '../TaavSkeleton';
import {
  taavTableCellClass,
  taavTableHeadCellClass,
  taavTableRowClass,
  taavTableRowHeightClass,
  taavTableShellVariants,
  type TaavTableDensity,
  type TaavTableVariant,
} from '../shared/data-display.variants';

export type TaavTableShellProps = {
  variant?: TaavTableVariant;
  density?: TaavTableDensity;
  loading?: boolean;
  empty?: boolean;
  emptyState?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
};

export function TaavTableShell({
  variant = 'default',
  density = 'comfortable',
  loading = false,
  empty = false,
  emptyState,
  footer,
  children,
  wrapperClassName,
  contentClassName,
}: TaavTableShellProps) {
  return (
    <div className={cn(taavTableShellVariants({ variant }), wrapperClassName)}>
      {loading ? (
        <div className="p-[var(--taav-space-4)]">
          <TaavSkeleton variant="table" count={5} />
        </div>
      ) : empty ? (
        emptyState ?? <TaavEmptyState variant="compact" size="sm" title="موردی یافت نشد" description="داده‌ای برای نمایش وجود ندارد." />
      ) : (
        <table className={cn('w-full border-collapse text-right', contentClassName)} data-density={density} data-variant={variant}>
          {children}
        </table>
      )}
      {footer ? <div className="border-t border-[color:var(--taav-table-border)] p-[var(--taav-space-3)]">{footer}</div> : null}
    </div>
  );
}

export function TaavTableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function TaavTableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export type TaavTableRowProps = HTMLAttributes<HTMLTableRowElement> & { striped?: boolean };

export function TaavTableRow({ className, striped, ...props }: TaavTableRowProps) {
  return <tr className={cn(taavTableRowClass, className)} data-striped={striped || undefined} {...props} />;
}

export function TaavTableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn(taavTableHeadCellClass, className)} {...props} />;
}

export function TaavTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn(taavTableCellClass, className)} {...props} />;
}

export function TaavTableActions({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(taavTableCellClass, 'w-[1%] whitespace-nowrap text-end', className)}
      {...props}
    />
  );
}

export { taavTableRowHeightClass, type TaavTableDensity, type TaavTableVariant };
