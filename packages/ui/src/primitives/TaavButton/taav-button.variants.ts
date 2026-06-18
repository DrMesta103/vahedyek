import { cva, type VariantProps } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../shared/interaction';

export type TaavButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'soft'
  | 'danger'
  | 'success'
  | 'warning'
  | 'link';

export type TaavButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TaavButtonWidth = 'auto' | 'full' | 'fit' | 'icon';
export type TaavButtonTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const toneColorMap = {
  brand: {
    solid:
      'bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] border-[color:var(--taav-brand-border)] hover:brightness-110 hover:shadow-[var(--taav-shadow-xs)]',
    soft: 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)] hover:bg-[color-mix(in_srgb,var(--taav-brand-soft)_82%,var(--taav-brand))]',
    outline:
      'bg-transparent text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)] hover:bg-[var(--taav-brand-muted)]',
    ghost:
      'bg-transparent text-[var(--taav-brand-strong)] border-transparent hover:bg-[var(--taav-brand-muted)]',
    link: 'bg-transparent text-[var(--taav-brand-strong)] border-transparent underline-offset-4 hover:underline',
  },
  neutral: {
    solid:
      'bg-[var(--taav-neutral-strong)] text-[var(--taav-surface)] border-[color:var(--taav-neutral-border)] hover:brightness-110',
    soft: 'bg-[var(--taav-neutral-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-neutral-border)] hover:bg-[color-mix(in_srgb,var(--taav-neutral-soft)_88%,var(--taav-neutral))]',
    outline:
      'bg-transparent text-[var(--taav-text-body)] border-[color:var(--taav-border)] hover:bg-[var(--taav-surface-muted)] hover:border-[color:var(--taav-border-strong)]',
    ghost:
      'bg-transparent text-[var(--taav-text-muted)] border-transparent hover:bg-[var(--taav-surface-muted)] hover:text-[var(--taav-text-body)]',
    link: 'bg-transparent text-[var(--taav-text-muted)] border-transparent underline-offset-4 hover:underline hover:text-[var(--taav-text-body)]',
  },
  success: {
    solid:
      'bg-[var(--taav-success)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-success-border)] hover:brightness-110',
    soft: 'bg-[var(--taav-success-soft)] text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)] hover:bg-[color-mix(in_srgb,var(--taav-success-soft)_82%,var(--taav-success))]',
    outline:
      'bg-transparent text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)] hover:bg-[var(--taav-success-muted)]',
    ghost:
      'bg-transparent text-[var(--taav-success-strong)] border-transparent hover:bg-[var(--taav-success-muted)]',
    link: 'bg-transparent text-[var(--taav-success-strong)] border-transparent underline-offset-4 hover:underline',
  },
  warning: {
    solid:
      'bg-[var(--taav-warning)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-warning-border)] hover:brightness-110',
    soft: 'bg-[var(--taav-warning-soft)] text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)] hover:bg-[color-mix(in_srgb,var(--taav-warning-soft)_82%,var(--taav-warning))]',
    outline:
      'bg-transparent text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)] hover:bg-[var(--taav-warning-muted)]',
    ghost:
      'bg-transparent text-[var(--taav-warning-strong)] border-transparent hover:bg-[var(--taav-warning-muted)]',
    link: 'bg-transparent text-[var(--taav-warning-strong)] border-transparent underline-offset-4 hover:underline',
  },
  danger: {
    solid:
      'bg-[var(--taav-danger)] text-[var(--taav-text-on-danger)] border-[color:var(--taav-danger-border)] hover:brightness-110 focus-visible:shadow-[var(--taav-focus-ring-danger)]',
    soft: 'bg-[var(--taav-danger-soft)] text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)] hover:bg-[color-mix(in_srgb,var(--taav-danger-soft)_82%,var(--taav-danger))]',
    outline:
      'bg-transparent text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)] hover:bg-[var(--taav-danger-muted)]',
    ghost:
      'bg-transparent text-[var(--taav-danger-strong)] border-transparent hover:bg-[var(--taav-danger-muted)]',
    link: 'bg-transparent text-[var(--taav-danger-strong)] border-transparent underline-offset-4 hover:underline',
  },
  info: {
    solid:
      'bg-[var(--taav-info)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-info-border)] hover:brightness-110',
    soft: 'bg-[var(--taav-info-soft)] text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)] hover:bg-[color-mix(in_srgb,var(--taav-info-soft)_82%,var(--taav-info))]',
    outline:
      'bg-transparent text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)] hover:bg-[var(--taav-info-muted)]',
    ghost: 'bg-transparent text-[var(--taav-info-strong)] border-transparent hover:bg-[var(--taav-info-muted)]',
    link: 'bg-transparent text-[var(--taav-info-strong)] border-transparent underline-offset-4 hover:underline',
  },
} as const;

function resolveVariantStyle(variant: TaavButtonVariant, tone: TaavButtonTone): string {
  if (variant === 'primary') return toneColorMap[tone].solid;
  if (variant === 'secondary')
    return 'bg-[var(--taav-surface-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-border)] hover:bg-[var(--taav-surface-muted)] hover:border-[color:var(--taav-border-strong)]';
  if (variant === 'outline') return toneColorMap[tone].outline;
  if (variant === 'ghost') return toneColorMap[tone].ghost;
  if (variant === 'soft') return toneColorMap[tone].soft;
  if (variant === 'link') return toneColorMap[tone].link;
  if (variant === 'danger') return toneColorMap.danger.solid;
  if (variant === 'success') return toneColorMap.success.solid;
  if (variant === 'warning') return toneColorMap.warning.solid;
  return toneColorMap.brand.solid;
}

export const taavButtonVariants = cva(
  [
    'inline-flex items-center justify-center gap-[var(--taav-btn-gap)] font-[var(--taav-font-weight-medium)]',
    'border border-solid',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.pressable,
    TAAV_INTERACTION.focus,
    'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
    'select-none whitespace-nowrap',
  ],
  {
    variants: {
      size: {
        xs: 'h-[var(--taav-btn-height-xs)] px-[var(--taav-btn-px-xs)] text-[length:var(--taav-text-xs)] rounded-[var(--taav-btn-radius-sm)]',
        sm: 'h-[var(--taav-btn-height-sm)] px-[var(--taav-btn-px-sm)] text-[length:var(--taav-text-xs)] rounded-[var(--taav-btn-radius-md)]',
        md: 'h-[var(--taav-btn-height-md)] px-[var(--taav-btn-px-md)] text-[length:var(--taav-text-sm)] rounded-[var(--taav-btn-radius-md)]',
        lg: 'h-[var(--taav-btn-height-lg)] px-[var(--taav-btn-px-lg)] text-[length:var(--taav-text-sm)] rounded-[var(--taav-btn-radius-lg)]',
        xl: 'h-[var(--taav-btn-height-xl)] px-[var(--taav-btn-px-xl)] text-[length:var(--taav-text-lg)] rounded-[var(--taav-btn-radius-lg)]',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        fit: 'w-fit',
        icon: 'aspect-square p-0',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'auto',
    },
  },
);

export type TaavButtonVariantProps = VariantProps<typeof taavButtonVariants>;

export function getTaavButtonToneClasses(variant: TaavButtonVariant, tone: TaavButtonTone): string {
  return resolveVariantStyle(variant, tone);
}
