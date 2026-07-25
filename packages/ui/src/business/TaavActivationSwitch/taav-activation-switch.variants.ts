import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const activationSwitchRoot = cva(
  [
    'inline-flex shrink-0 items-stretch overflow-hidden',
    'rounded-[var(--taav-activation-switch-radius)]',
    'border border-solid border-[color:var(--taav-activation-switch-border)]',
    'bg-[var(--taav-activation-switch-track-bg)]',
    'p-[var(--taav-activation-switch-padding)]',
    TAAV_INTERACTION.base,
  ],
  {
    variants: {
      size: {
        sm: 'gap-[var(--taav-activation-switch-gap-sm)]',
        md: 'gap-[var(--taav-activation-switch-gap-md)]',
        lg: 'gap-[var(--taav-activation-switch-gap-lg)]',
      },
      disabled: {
        true: 'pointer-events-none opacity-[var(--taav-activation-switch-disabled-opacity)]',
        false: '',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      disabled: false,
      loading: false,
    },
  },
);

export const activationSwitchSegment = cva(
  [
    'inline-flex min-w-0 items-center justify-center border-0',
    'rounded-[var(--taav-activation-switch-segment-radius)]',
    'font-semibold leading-none whitespace-nowrap',
    'transition-[background-color,color,box-shadow] duration-[var(--taav-duration-normal)]',
    TAAV_INTERACTION.focus,
  ],
  {
    variants: {
      size: {
        sm: 'min-w-[var(--taav-activation-switch-segment-min-width-sm)] px-[var(--taav-activation-switch-segment-px-sm)] py-[var(--taav-activation-switch-segment-py-sm)] text-[length:var(--taav-activation-switch-text-sm)]',
        md: 'min-w-[var(--taav-activation-switch-segment-min-width-md)] px-[var(--taav-activation-switch-segment-px-md)] py-[var(--taav-activation-switch-segment-py-md)] text-[length:var(--taav-activation-switch-text-md)]',
        lg: 'min-w-[var(--taav-activation-switch-segment-min-width-lg)] px-[var(--taav-activation-switch-segment-px-lg)] py-[var(--taav-activation-switch-segment-py-lg)] text-[length:var(--taav-activation-switch-text-lg)]',
      },
      selected: {
        true: 'bg-[var(--taav-activation-switch-active-bg)] text-[var(--taav-activation-switch-active-text)] shadow-[var(--taav-activation-switch-active-shadow)]',
        false: 'bg-transparent text-[var(--taav-activation-switch-inactive-text)] hover:bg-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      selected: false,
    },
  },
);

export const activationSwitchTone = cva('', {
  variants: {
    tone: {
      brand: '',
      success:
        '[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-success)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]',
      warning:
        '[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-warning)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]',
      danger:
        '[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-danger)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]',
      neutral:
        '[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-neutral)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]',
    },
  },
  defaultVariants: {
    tone: 'brand',
  },
});
