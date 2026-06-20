import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { taavCardVariants, type TaavCardPadding, type TaavCardRadius, type TaavCardVariant } from './taav-card.variants';

export type TaavCardProps = {
  variant?: TaavCardVariant;
  padding?: TaavCardPadding;
  radius?: TaavCardRadius;
  interactive?: boolean;
  selected?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

const sectionPadding: Record<Exclude<TaavCardPadding, 'none'>, string> = {
  sm: 'px-[var(--taav-card-padding-sm)] py-[var(--taav-space-3)]',
  md: 'px-[var(--taav-card-header-px)] py-[var(--taav-card-header-py)]',
  lg: 'px-[var(--taav-card-padding-lg)] py-[var(--taav-space-5)]',
};

export function TaavCard({
  variant = 'outlined',
  padding = 'md',
  radius = 'lg',
  interactive = false,
  selected = false,
  header,
  footer,
  children,
  wrapperClassName,
  contentClassName,
  ...props
}: TaavCardProps) {
  const hasSections = Boolean(header || footer);
  const bodyPadding = hasSections ? 'none' : padding;
  const sectionPad = padding === 'none' ? sectionPadding.md : sectionPadding[padding];

  return (
    <div
      className={cn(
        taavCardVariants({ variant, padding: bodyPadding, radius, interactive, selected }),
        wrapperClassName,
      )}
      {...props}
    >
      {header ? (
        <div className={cn('border-b border-[color:var(--taav-border-subtle)]', sectionPad)}>{header}</div>
      ) : null}
      {children ? (
        <div
          className={cn(
            hasSections && padding === 'sm' && 'p-[var(--taav-card-padding-sm)]',
            hasSections && padding === 'md' && 'p-[var(--taav-card-padding-md)]',
            hasSections && padding === 'lg' && 'p-[var(--taav-card-padding-lg)]',
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : null}
      {footer ? (
        <div className={cn('border-t border-[color:var(--taav-border-subtle)]', sectionPad)}>{footer}</div>
      ) : null}
    </div>
  );
}
