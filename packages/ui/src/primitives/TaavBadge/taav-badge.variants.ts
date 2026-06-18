import { cva, type VariantProps } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../shared/interaction';

export type TaavBadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
export type TaavBadgeSize = 'sm' | 'md' | 'lg';
export type TaavBadgeShape = 'pill' | 'rounded' | 'square';
export type TaavBadgeWidth = 'auto' | 'fixed' | 'full';
export type TaavBadgeVariant = 'solid' | 'soft' | 'outline' | 'subtle';

const toneStyles: Record<TaavBadgeTone, Record<TaavBadgeVariant, string>> = {
  neutral: {
    solid: 'bg-[var(--taav-neutral-strong)] text-[var(--taav-surface)] border-[color:var(--taav-neutral-border)]',
    soft: 'bg-[var(--taav-neutral-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-neutral-border)]',
    outline: 'bg-transparent text-[var(--taav-text-body)] border-[color:var(--taav-border)]',
    subtle: 'bg-[var(--taav-surface-muted)] text-[var(--taav-text-muted)] border-transparent',
  },
  brand: {
    solid: 'bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] border-[color:var(--taav-brand-border)]',
    soft: 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]',
    outline: 'bg-transparent text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]',
    subtle: 'bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)] border-transparent',
  },
  success: {
    solid: 'bg-[var(--taav-success)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-success-border)]',
    soft: 'bg-[var(--taav-success-soft)] text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]',
    outline: 'bg-transparent text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]',
    subtle: 'bg-[var(--taav-success-muted)] text-[var(--taav-success-strong)] border-transparent',
  },
  warning: {
    solid: 'bg-[var(--taav-warning)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-warning-border)]',
    soft: 'bg-[var(--taav-warning-soft)] text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]',
    outline: 'bg-transparent text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]',
    subtle: 'bg-[var(--taav-warning-muted)] text-[var(--taav-warning-strong)] border-transparent',
  },
  danger: {
    solid: 'bg-[var(--taav-danger)] text-[var(--taav-text-on-danger)] border-[color:var(--taav-danger-border)]',
    soft: 'bg-[var(--taav-danger-soft)] text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]',
    outline: 'bg-transparent text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]',
    subtle: 'bg-[var(--taav-danger-muted)] text-[var(--taav-danger-strong)] border-transparent',
  },
  info: {
    solid: 'bg-[var(--taav-info)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-info-border)]',
    soft: 'bg-[var(--taav-info-soft)] text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]',
    outline: 'bg-transparent text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]',
    subtle: 'bg-[var(--taav-info-muted)] text-[var(--taav-info-strong)] border-transparent',
  },
  purple: {
    solid: 'bg-[var(--taav-purple)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-purple-border)]',
    soft: 'bg-[var(--taav-purple-soft)] text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]',
    outline: 'bg-transparent text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]',
    subtle: 'bg-[var(--taav-purple-muted)] text-[var(--taav-purple-strong)] border-transparent',
  },
};

export const taavBadgeVariants = cva(
  [
    'inline-flex items-center justify-center gap-[var(--taav-space-1)] border border-solid',
    'font-[var(--taav-font-weight-medium)] leading-none',
    TAAV_INTERACTION.base,
  ],
  {
    variants: {
      size: {
        sm: 'h-[var(--taav-badge-height-sm)] min-w-[var(--taav-badge-height-sm)] px-[var(--taav-badge-px-sm)] text-[length:var(--taav-text-2xs)]',
        md: 'h-[var(--taav-badge-height-md)] min-w-[var(--taav-badge-height-md)] px-[var(--taav-badge-px-md)] text-[length:var(--taav-text-xs)]',
        lg: 'h-[var(--taav-badge-height-lg)] min-w-[var(--taav-badge-height-lg)] px-[var(--taav-badge-px-lg)] text-[length:var(--taav-text-sm)]',
      },
      shape: {
        pill: 'rounded-[var(--taav-radius-pill)]',
        rounded: 'rounded-[var(--taav-radius-md)]',
        square: 'rounded-[var(--taav-radius-sm)]',
      },
      width: {
        auto: 'w-auto max-w-full',
        fixed: 'w-[var(--taav-badge-width-fixed)]',
        full: 'w-full',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'pill',
      width: 'auto',
    },
  },
);

export type TaavBadgeVariantProps = VariantProps<typeof taavBadgeVariants>;

export function getTaavBadgeToneClasses(tone: TaavBadgeTone, variant: TaavBadgeVariant): string {
  return toneStyles[tone][variant];
}
