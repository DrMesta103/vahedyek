import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavChipTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
export type TaavChipSize = 'xs' | 'sm' | 'md' | 'lg';
export type TaavChipShape = 'pill' | 'rounded' | 'square';
export type TaavChipWidth = 'auto' | 'fixed' | 'full';
export type TaavChipVariant = 'soft' | 'outline' | 'solid' | 'ghost';
export type TaavChipGap = 'xs' | 'sm' | 'md' | 'lg';

const chipToneStyles: Record<TaavChipTone, Record<TaavChipVariant, string>> = {
  neutral: {
    soft: 'bg-[var(--taav-neutral-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-neutral-border)]',
    outline: 'bg-transparent text-[var(--taav-text-body)] border-[color:var(--taav-border)]',
    solid: 'bg-[var(--taav-neutral-strong)] text-[var(--taav-surface)] border-[color:var(--taav-neutral-border)]',
    ghost: 'bg-transparent text-[var(--taav-text-muted)] border-transparent',
  },
  brand: {
    soft: 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]',
    outline: 'bg-transparent text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]',
    solid: 'bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] border-[color:var(--taav-brand-border)]',
    ghost: 'bg-transparent text-[var(--taav-brand-strong)] border-transparent',
  },
  success: {
    soft: 'bg-[var(--taav-success-soft)] text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]',
    outline: 'bg-transparent text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]',
    solid: 'bg-[var(--taav-success)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-success-border)]',
    ghost: 'bg-transparent text-[var(--taav-success-strong)] border-transparent',
  },
  warning: {
    soft: 'bg-[var(--taav-warning-soft)] text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]',
    outline: 'bg-transparent text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]',
    solid: 'bg-[var(--taav-warning)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-warning-border)]',
    ghost: 'bg-transparent text-[var(--taav-warning-strong)] border-transparent',
  },
  danger: {
    soft: 'bg-[var(--taav-danger-soft)] text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]',
    outline: 'bg-transparent text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]',
    solid: 'bg-[var(--taav-danger)] text-[var(--taav-text-on-danger)] border-[color:var(--taav-danger-border)]',
    ghost: 'bg-transparent text-[var(--taav-danger-strong)] border-transparent',
  },
  info: {
    soft: 'bg-[var(--taav-info-soft)] text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]',
    outline: 'bg-transparent text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]',
    solid: 'bg-[var(--taav-info)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-info-border)]',
    ghost: 'bg-transparent text-[var(--taav-info-strong)] border-transparent',
  },
  purple: {
    soft: 'bg-[var(--taav-purple-soft)] text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]',
    outline: 'bg-transparent text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]',
    solid: 'bg-[var(--taav-purple)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-purple-border)]',
    ghost: 'bg-transparent text-[var(--taav-purple-strong)] border-transparent',
  },
};

export const taavChipVariants = cva(
  [
    'inline-flex max-w-full items-center justify-center gap-[var(--taav-space-1)] border border-solid',
    'font-[var(--taav-font-weight-medium)] leading-none',
    TAAV_INTERACTION.base,
    'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        xs: 'h-[var(--taav-chip-height-xs)] px-[var(--taav-chip-px-xs)] text-[length:var(--taav-text-2xs)]',
        sm: 'h-[var(--taav-chip-height-sm)] px-[var(--taav-chip-px-sm)] text-[length:var(--taav-text-xs)]',
        md: 'h-[var(--taav-chip-height-md)] px-[var(--taav-chip-px-md)] text-[length:var(--taav-text-sm)]',
        lg: 'h-[var(--taav-chip-height-lg)] px-[var(--taav-chip-px-lg)] text-[length:var(--taav-text-md)]',
      },
      shape: {
        pill: 'rounded-[var(--taav-radius-pill)]',
        rounded: 'rounded-[var(--taav-radius-md)]',
        square: 'rounded-[var(--taav-radius-sm)]',
      },
      width: {
        auto: 'w-auto',
        fixed: 'w-[var(--taav-chip-width-fixed)]',
        full: 'w-full',
      },
    },
    defaultVariants: { size: 'md', shape: 'pill', width: 'auto' },
  },
);

export function getTaavChipToneClasses(tone: TaavChipTone, variant: TaavChipVariant): string {
  return chipToneStyles[tone][variant];
}

export const taavChipSelectedClass =
  'border-[color:var(--taav-chip-selected-border)] bg-[var(--taav-chip-selected-bg)] ring-1 ring-[color:var(--taav-chip-selected-ring)]';

export const taavChipGroupGapClass: Record<TaavChipGap, string> = {
  xs: 'gap-[var(--taav-space-1)]',
  sm: 'gap-[var(--taav-space-2)]',
  md: 'gap-[var(--taav-space-3)]',
  lg: 'gap-[var(--taav-space-4)]',
};

export type TaavTableDensity = 'compact' | 'comfortable' | 'spacious';
export type TaavTableVariant = 'default' | 'bordered' | 'striped' | 'card';

export const taavTableShellVariants = cva(
  ['relative w-full overflow-x-auto rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-table-border)]', TAAV_INTERACTION.base],
  {
    variants: {
      variant: {
        default: 'bg-[var(--taav-surface)]',
        bordered: 'bg-[var(--taav-surface)]',
        striped: 'bg-[var(--taav-surface)]',
        card: 'bg-[var(--taav-surface)] shadow-[var(--taav-shadow-sm)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export const taavTableRowHeightClass: Record<TaavTableDensity, string> = {
  compact: 'min-h-[var(--taav-table-row-height-compact)]',
  comfortable: 'min-h-[var(--taav-table-row-height-comfortable)]',
  spacious: 'min-h-[var(--taav-table-row-height-spacious)]',
};

export const taavTableHeadCellClass =
  'bg-[var(--taav-table-header-bg)] px-[var(--taav-space-4)] py-[var(--taav-space-3)] text-start text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-subtle)]';

export const taavTableCellClass =
  'border-t border-[color:var(--taav-table-border)] px-[var(--taav-space-4)] py-[var(--taav-space-3)] text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)]';

export const taavTableRowClass =
  'transition-colors hover:bg-[var(--taav-table-row-hover)] data-[striped=true]:bg-[var(--taav-surface-soft)]';

export type TaavKeyValueSize = 'sm' | 'md' | 'lg';
export type TaavKeyValueDensity = 'compact' | 'comfortable';
export type TaavKeyValueLayout = 'vertical' | 'horizontal' | 'grid';

export const taavKeyValueLabelClass: Record<TaavKeyValueSize, string> = {
  sm: 'text-[length:var(--taav-kv-label-size-sm)]',
  md: 'text-[length:var(--taav-kv-label-size-md)]',
  lg: 'text-[length:var(--taav-kv-label-size-lg)]',
};

export const taavKeyValueValueClass: Record<TaavKeyValueSize, string> = {
  sm: 'text-[length:var(--taav-kv-value-size-sm)]',
  md: 'text-[length:var(--taav-kv-value-size-md)]',
  lg: 'text-[length:var(--taav-kv-value-size-lg)]',
};

export const taavKeyValueGapClass: Record<TaavKeyValueDensity, string> = {
  compact: 'gap-[var(--taav-kv-gap-compact)]',
  comfortable: 'gap-[var(--taav-kv-gap-comfortable)]',
};
