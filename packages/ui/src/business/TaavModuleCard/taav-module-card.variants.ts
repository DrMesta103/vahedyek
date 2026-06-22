import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const moduleCardRoot = cva(
  [
    'group/taav-module-card relative flex min-h-0 w-full flex-col overflow-hidden border border-solid',
    'bg-[var(--taav-module-card-surface)] text-[var(--taav-module-card-title)]',
    'border-[color:var(--taav-module-card-border)]',
    'rounded-[var(--taav-module-card-radius)] shadow-[var(--taav-module-card-shadow)]',
    TAAV_INTERACTION.base,
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[var(--taav-module-card-min-height-sm)]',
        md: 'min-h-[var(--taav-module-card-min-height-md)]',
        lg: 'min-h-[var(--taav-module-card-min-height-lg)]',
      },
      width: {
        auto: '',
        full: 'w-full',
      },
      variant: {
        default: '',
        setup: '',
        imageHeader: '',
        compact: '[--taav-module-card-header-height:var(--taav-module-card-header-height-compact)]',
        flat: 'shadow-none',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:border-[color:var(--taav-module-card-border-hover)]',
          'hover:bg-[var(--taav-module-card-surface-hover)]',
          'hover:shadow-[var(--taav-module-card-shadow-hover)]',
          TAAV_INTERACTION.pressable,
          TAAV_INTERACTION.focus,
        ],
        false: '',
      },
      selected: {
        true: [
          'border-[color:var(--taav-module-card-border-selected)]',
          'bg-[var(--taav-module-card-surface-selected)]',
          'shadow-[var(--taav-module-card-shadow-selected)]',
          'ring-1 ring-[color:var(--taav-module-card-ring-selected)]',
        ],
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-[var(--taav-module-card-disabled-opacity)]',
        false: '',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'auto',
      variant: 'setup',
      interactive: false,
      selected: false,
      disabled: false,
      loading: false,
    },
  },
);

export const moduleCardHeader = cva(
  [
    'relative flex shrink-0 items-center justify-between gap-[var(--taav-space-3)]',
    'h-[var(--taav-module-card-header-height)] px-[var(--taav-module-card-header-px)]',
    'border-b border-solid border-[color:var(--taav-module-card-header-border)]',
    'bg-[var(--taav-module-card-header-bg)]',
  ],
  {
    variants: {
      pattern: {
        geometric: 'taav-module-card-header-pattern--geometric',
        subtle: 'taav-module-card-header-pattern--subtle',
        none: '',
      },
    },
    defaultVariants: {
      pattern: 'geometric',
    },
  },
);

export const moduleCardTitle = cva('relative z-[1] m-0 min-w-0 flex-1 text-right font-black leading-[var(--taav-leading-tight)]', {
  variants: {
    size: {
      sm: 'text-[length:var(--taav-module-card-title-sm)]',
      md: 'text-[length:var(--taav-module-card-title-md)]',
      lg: 'text-[length:var(--taav-module-card-title-lg)]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const moduleCardBody = cva('relative flex w-full flex-1 flex-col', {
  variants: {
    size: {
      sm: 'p-[var(--taav-module-card-body-padding-sm)]',
      md: 'p-[var(--taav-module-card-body-padding-md)]',
      lg: 'p-[var(--taav-module-card-body-padding-lg)]',
    },
    align: {
      start: 'items-start text-right',
      center: 'items-center text-center',
      end: 'items-end text-right',
    },
  },
  defaultVariants: {
    size: 'md',
    align: 'start',
  },
});

export const moduleCardDescription = cva(
  'm-0 w-full font-normal leading-[var(--taav-leading-relaxed)] text-[var(--taav-module-card-description)]',
  {
    variants: {
      size: {
        sm: 'text-[length:var(--taav-module-card-description-sm)]',
        md: 'text-[length:var(--taav-module-card-description-md)]',
        lg: 'text-[length:var(--taav-module-card-description-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const moduleCardArrow = cva(
  [
    'relative z-[1] inline-flex shrink-0 items-center justify-center',
    'text-[var(--taav-module-card-arrow)]',
    '[&_svg]:h-[var(--taav-module-card-arrow-size)] [&_svg]:w-[var(--taav-module-card-arrow-size)]',
  ],
  {
    variants: {
      disabled: {
        true: 'opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export const moduleCardStatusTone = cva('', {
  variants: {
    status: {
      default: '',
      active: 'border-[color:var(--taav-module-card-border-selected)]',
      complete: 'border-[color:var(--taav-success-border)]',
      incomplete: 'border-[color:var(--taav-module-card-border-incomplete)]',
      locked: 'border-[color:var(--taav-border-subtle)]',
      disabled: '',
      warning: 'border-[color:var(--taav-warning-border)]',
      error: 'border-[color:var(--taav-danger-border)]',
    },
    tone: {
      neutral: '',
      brand: '[--taav-module-card-header-bg:var(--taav-module-card-header-bg-brand)]',
      success: '[--taav-module-card-header-bg:var(--taav-module-card-header-bg-success)]',
      warning: '[--taav-module-card-header-bg:var(--taav-module-card-header-bg-warning)]',
      danger: '[--taav-module-card-header-bg:var(--taav-module-card-header-bg-danger)]',
      info: '[--taav-module-card-header-bg:var(--taav-module-card-header-bg-info)]',
    },
  },
  defaultVariants: {
    status: 'default',
    tone: 'neutral',
  },
});
