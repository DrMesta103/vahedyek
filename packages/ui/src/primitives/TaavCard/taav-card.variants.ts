import { cva, type VariantProps } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../shared/interaction';

export type TaavCardVariant = 'elevated' | 'outlined' | 'soft' | 'ghost';
export type TaavCardPadding = 'none' | 'sm' | 'md' | 'lg';
export type TaavCardRadius = 'md' | 'lg' | 'xl' | 'xxl';

export const taavCardVariants = cva(
  ['relative flex flex-col overflow-hidden', TAAV_INTERACTION.base],
  {
    variants: {
      variant: {
        elevated:
          'bg-[var(--taav-surface-elevated)] border border-[color:var(--taav-border-subtle)] shadow-[var(--taav-shadow-sm)]',
        outlined: 'bg-[var(--taav-surface)] border border-[color:var(--taav-border)]',
        soft: 'bg-[var(--taav-surface-soft)] border border-[color:var(--taav-border-subtle)]',
        ghost: 'bg-[var(--taav-surface-ghost)] border border-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-[var(--taav-card-padding-sm)]',
        md: 'p-[var(--taav-card-padding-md)]',
        lg: 'p-[var(--taav-card-padding-lg)]',
      },
      radius: {
        md: 'rounded-[var(--taav-radius-md)]',
        lg: 'rounded-[var(--taav-radius-lg)]',
        xl: 'rounded-[var(--taav-radius-xl)]',
        xxl: 'rounded-[var(--taav-radius-xxl)]',
      },
      interactive: {
        true: 'cursor-pointer hover:border-[color:var(--taav-border-strong)] hover:shadow-[var(--taav-shadow-md)] hover:-translate-y-px active:translate-y-0',
        false: '',
      },
      selected: {
        true: 'border-[color:var(--taav-brand-border)] shadow-[var(--taav-shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--taav-brand)_22%,transparent)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      padding: 'md',
      radius: 'lg',
      interactive: false,
      selected: false,
    },
  },
);

export type TaavCardVariantProps = VariantProps<typeof taavCardVariants>;
