import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const businessIntroCardRoot = cva(
  [
    'mx-auto w-full border border-solid',
    'bg-[var(--taav-business-intro-card-surface)]',
    'border-[color:var(--taav-business-intro-card-border)]',
    'rounded-[var(--taav-business-intro-card-radius)]',
    'shadow-[var(--taav-business-intro-card-shadow)]',
    TAAV_INTERACTION.base,
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[var(--taav-business-intro-card-min-height-sm)] p-[var(--taav-business-intro-card-padding-sm)]',
        md: 'min-h-[var(--taav-business-intro-card-min-height-md)] p-[var(--taav-business-intro-card-padding-md)]',
        lg: 'min-h-[var(--taav-business-intro-card-min-height-lg)] p-[var(--taav-business-intro-card-padding-lg)]',
      },
      width: {
        normal: 'max-w-[var(--taav-business-intro-card-max-width-normal)]',
        wide: 'max-w-[var(--taav-business-intro-card-max-width-wide)]',
        full: 'max-w-none',
      },
      variant: {
        default: '',
        soft: 'bg-[var(--taav-business-intro-card-surface-soft)]',
        outlined: 'bg-transparent shadow-none',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'normal',
      variant: 'default',
      loading: false,
    },
  },
);

export const businessIntroCardLayout = cva('flex items-center justify-between gap-[var(--taav-business-intro-card-gap)]');

export const businessIntroCardLeading = cva('flex min-w-0 flex-1 items-center gap-[var(--taav-business-intro-card-leading-gap)]');

export const businessIntroCardIconBox = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-[var(--taav-business-intro-card-icon-radius)]',
    'bg-[var(--taav-business-intro-card-icon-bg)]',
    'text-[var(--taav-business-intro-card-icon-color)]',
    '[&_svg]:h-[var(--taav-business-intro-card-icon-glyph-size)]',
    '[&_svg]:w-[var(--taav-business-intro-card-icon-glyph-size)]',
  ],
  {
    variants: {
      size: {
        sm: 'h-[var(--taav-business-intro-card-icon-size-sm)] w-[var(--taav-business-intro-card-icon-size-sm)]',
        md: 'h-[var(--taav-business-intro-card-icon-size-md)] w-[var(--taav-business-intro-card-icon-size-md)]',
        lg: 'h-[var(--taav-business-intro-card-icon-size-lg)] w-[var(--taav-business-intro-card-icon-size-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const businessIntroCardTitle = cva(
  'm-0 text-right font-semibold leading-[var(--taav-business-intro-card-title-line-height)] text-[var(--taav-business-intro-card-title)]',
  {
    variants: {
      size: {
        sm: 'text-[length:var(--taav-business-intro-card-title-sm)]',
        md: 'text-[length:var(--taav-business-intro-card-title-md)]',
        lg: 'text-[length:var(--taav-business-intro-card-title-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const businessIntroCardDescription = cva(
  'm-0 text-right font-normal leading-[var(--taav-business-intro-card-description-line-height)] text-[var(--taav-business-intro-card-description)]',
  {
    variants: {
      size: {
        sm: 'text-[length:var(--taav-business-intro-card-description-sm)]',
        md: 'text-[length:var(--taav-business-intro-card-description-md)]',
        lg: 'text-[length:var(--taav-business-intro-card-description-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const businessIntroCardCopy = cva('grid min-w-0 flex-1 gap-[var(--taav-business-intro-card-copy-gap)]');

export const businessIntroCardAction = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'h-[var(--taav-business-intro-card-action-size)] w-[var(--taav-business-intro-card-action-size)]',
    'rounded-[var(--taav-business-intro-card-action-radius)]',
    'border-0 bg-transparent p-0',
    'text-[var(--taav-business-intro-card-action-color)]',
    'hover:bg-[var(--taav-business-intro-card-action-hover-bg)]',
    'hover:text-[var(--taav-business-intro-card-action-hover-color)]',
    '[&_svg]:h-[var(--taav-business-intro-card-action-icon-size)]',
    '[&_svg]:w-[var(--taav-business-intro-card-action-icon-size)]',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus,
  ],
  {
    variants: {
      disabled: {
        true: 'pointer-events-none opacity-[var(--taav-business-intro-card-disabled-opacity)]',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export const businessIntroCardTone = cva('', {
  variants: {
    tone: {
      brand: '',
      neutral: '[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-neutral)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-neutral)]',
      success: '[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-success)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-success)]',
      warning: '[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-warning)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-warning)]',
      danger: '[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-danger)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-danger)]',
      info: '[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-info)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-info)]',
    },
  },
  defaultVariants: {
    tone: 'brand',
  },
});

export const businessIntroCardHubRoot = cva(
  [
    'relative overflow-hidden',
    'bg-[var(--taav-business-intro-card-hub-surface)]',
    'shadow-[var(--taav-business-intro-card-hub-shadow)]',
  ],
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const businessIntroCardHubPattern = cva(
  'pointer-events-none absolute inset-0 opacity-[var(--taav-business-intro-card-hub-pattern-opacity)] [background-image:var(--taav-business-intro-card-hub-pattern)]',
);

export const businessIntroCardHubContent = cva('relative z-[1] grid gap-[var(--taav-business-intro-card-hub-content-gap)]');

export const businessIntroCardHubTop = cva('flex items-center justify-between gap-[var(--taav-space-3)]');

export const businessIntroCardEyebrow = cva(
  'inline-flex min-h-[28px] items-center rounded-[var(--taav-radius-pill)] border border-solid px-[10px] text-[length:var(--taav-text-xs)] font-extrabold',
  {
    variants: {
      tone: {
        brand:
          'border-[color:var(--taav-business-intro-card-eyebrow-border)] bg-[var(--taav-business-intro-card-eyebrow-bg)] text-[var(--taav-business-intro-card-eyebrow-text)]',
        neutral:
          'border-[color:var(--taav-business-intro-card-badge-border)] bg-[var(--taav-business-intro-card-badge-bg)] text-[var(--taav-business-intro-card-badge-text)]',
        success: '',
        warning: '',
        danger: '',
        info: '',
      },
    },
    defaultVariants: {
      tone: 'brand',
    },
  },
);

export const businessIntroCardBadge = cva(
  'inline-flex min-h-[28px] items-center whitespace-nowrap rounded-[var(--taav-radius-pill)] border border-solid px-[10px] text-[length:var(--taav-text-xs)] font-extrabold border-[color:var(--taav-business-intro-card-badge-border)] bg-[var(--taav-business-intro-card-badge-bg)] text-[var(--taav-business-intro-card-badge-text)]',
);

export const businessIntroCardFootnote = cva(
  'm-0 rounded-[var(--taav-radius-lg)] border border-solid px-[14px] py-[12px] text-right text-[length:var(--taav-text-xs)] font-semibold leading-[var(--taav-leading-relaxed)] border-[color:var(--taav-business-intro-card-footnote-border)] bg-[var(--taav-business-intro-card-footnote-bg)] text-[var(--taav-business-intro-card-footnote-text)]',
);

export const businessIntroCardHubTitleRow = cva('flex items-start gap-[var(--taav-business-intro-card-leading-gap)]');
