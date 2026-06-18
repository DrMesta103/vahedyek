import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavFieldSize = 'sm' | 'md' | 'lg';
export type TaavFieldVariant = 'default' | 'filled' | 'soft' | 'ghost';
export type TaavFieldTone = 'neutral' | 'success' | 'warning' | 'danger';
export type TaavFieldWidth = 'auto' | 'full';
export type TaavFieldRadius = 'md' | 'lg' | 'xl';

const toneBorderMap: Record<TaavFieldTone, string> = {
  neutral: 'border-[color:var(--taav-input-border)] focus-within:border-[color:var(--taav-border-strong)]',
  success: 'border-[color:var(--taav-success-border)] focus-within:border-[color:var(--taav-success)]',
  warning: 'border-[color:var(--taav-warning-border)] focus-within:border-[color:var(--taav-warning)]',
  danger: 'border-[color:var(--taav-danger-border)] focus-within:border-[color:var(--taav-danger)]',
};

const variantBgMap: Record<TaavFieldVariant, string> = {
  default: 'bg-[var(--taav-input-bg)]',
  filled: 'bg-[var(--taav-input-bg-filled)]',
  soft: 'bg-[var(--taav-input-bg-soft)]',
  ghost: 'bg-[var(--taav-surface-ghost)] border-transparent',
};

export const taavFieldShellVariants = cva(
  [
    'flex items-center gap-[var(--taav-space-2)] border border-solid',
    TAAV_INTERACTION.base,
    'focus-within:shadow-[var(--taav-input-focus-ring)]',
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:bg-[var(--taav-input-bg-disabled)]',
    'has-[:read-only]:bg-[var(--taav-input-bg-soft)]',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[var(--taav-input-height-sm)] px-[var(--taav-input-px-sm)]',
        md: 'min-h-[var(--taav-input-height-md)] px-[var(--taav-input-px-md)]',
        lg: 'min-h-[var(--taav-input-height-lg)] px-[var(--taav-input-px-lg)]',
      },
      variant: {
        default: variantBgMap.default,
        filled: variantBgMap.filled,
        soft: variantBgMap.soft,
        ghost: variantBgMap.ghost,
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
      radius: {
        md: 'rounded-[var(--taav-input-radius-md)]',
        lg: 'rounded-[var(--taav-input-radius-lg)]',
        xl: 'rounded-[var(--taav-input-radius-xl)]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      width: 'full',
      radius: 'md',
    },
  },
);

export const taavFieldControlClass =
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-[length:var(--taav-text-sm)] text-[var(--taav-input-text)] placeholder:text-[var(--taav-input-placeholder)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed read-only:cursor-default';

export function getTaavFieldToneClasses(tone: TaavFieldTone, invalid?: boolean): string {
  if (invalid) {
    return 'border-[color:var(--taav-danger-border)] focus-within:border-[color:var(--taav-danger)] focus-within:shadow-[var(--taav-input-focus-ring-danger)]';
  }
  return toneBorderMap[tone];
}

export const taavTextareaShellVariants = cva(
  [
    'relative flex flex-col border border-solid',
    TAAV_INTERACTION.base,
    'focus-within:shadow-[var(--taav-input-focus-ring)]',
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:bg-[var(--taav-input-bg-disabled)]',
    'has-[:read-only]:bg-[var(--taav-input-bg-soft)]',
  ],
  {
    variants: {
      size: {
        sm: 'px-[var(--taav-input-px-sm)] py-[var(--taav-input-py-sm)] min-h-[var(--taav-textarea-min-height-sm)]',
        md: 'px-[var(--taav-input-px-md)] py-[var(--taav-input-py-md)] min-h-[var(--taav-textarea-min-height-md)]',
        lg: 'px-[var(--taav-input-px-lg)] py-[var(--taav-input-py-lg)] min-h-[var(--taav-textarea-min-height-lg)]',
      },
      variant: {
        default: variantBgMap.default,
        filled: variantBgMap.filled,
        soft: variantBgMap.soft,
        ghost: variantBgMap.ghost,
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
      radius: {
        md: 'rounded-[var(--taav-input-radius-md)]',
        lg: 'rounded-[var(--taav-input-radius-lg)]',
        xl: 'rounded-[var(--taav-input-radius-xl)]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      width: 'full',
      radius: 'md',
    },
  },
);

export const taavTextareaControlClass =
  'min-h-[inherit] w-full flex-1 resize-y border-0 bg-transparent p-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-input-text)] placeholder:text-[var(--taav-input-placeholder)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed read-only:cursor-default';
