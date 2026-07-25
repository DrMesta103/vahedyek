import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const recommendationCardRoot = cva(
  [
    'mx-auto w-[712px] max-w-none border-0',
    'bg-[var(--taav-recommendation-card-surface)]',
    'rounded-none shadow-none',
    TAAV_INTERACTION.base,
  ],
  {
    variants: {
      size: {
        sm: 'h-[var(--taav-recommendation-card-height-sm)] p-[var(--taav-recommendation-card-padding-sm)]',
        md: 'h-[var(--taav-recommendation-card-height-md)] p-[var(--taav-recommendation-card-padding-md)]',
        lg: 'h-[var(--taav-recommendation-card-height-lg)] p-[var(--taav-recommendation-card-padding-lg)]',
      },
      width: {
        normal: 'max-w-[var(--taav-recommendation-card-max-width-normal)]',
        wide: 'max-w-[var(--taav-recommendation-card-max-width-wide)]',
        full: 'max-w-none',
      },
      variant: {
        default: '',
        soft: 'bg-[var(--taav-recommendation-card-surface-soft)]',
        outlined: 'bg-transparent shadow-none',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'wide',
      variant: 'default',
      loading: false,
    },
  },
);

export const recommendationCardLayout = cva(
  'flex items-start justify-between gap-[var(--taav-recommendation-card-gap)]',
);

export const recommendationCardLeading = cva(
  'flex min-w-0 flex-1 items-start gap-[var(--taav-recommendation-card-leading-gap)]',
);

export const recommendationCardIconBox = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-[var(--taav-recommendation-card-icon-radius)]',
    'bg-[var(--taav-recommendation-card-icon-bg)]',
    'text-[var(--taav-recommendation-card-icon-color)]',
    '[&_svg]:h-[var(--taav-recommendation-card-icon-glyph-size)]',
    '[&_svg]:w-[var(--taav-recommendation-card-icon-glyph-size)]',
  ],
  {
    variants: {
      size: {
        sm: 'h-[var(--taav-recommendation-card-icon-size-sm)] w-[var(--taav-recommendation-card-icon-size-sm)]',
        md: 'h-[var(--taav-recommendation-card-icon-size-md)] w-[var(--taav-recommendation-card-icon-size-md)]',
        lg: 'h-[var(--taav-recommendation-card-icon-size-lg)] w-[var(--taav-recommendation-card-icon-size-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const recommendationCardAction = cva(
  [
    'mt-[15px] inline-flex shrink-0 items-center justify-center self-start',
    'text-[var(--taav-recommendation-card-action-color)]',
    '[&_svg]:h-[var(--taav-recommendation-card-action-icon-size)]',
    '[&_svg]:w-[var(--taav-recommendation-card-action-icon-size)]',
    'hover:text-[var(--taav-recommendation-card-action-hover-color)]',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus,
  ],
  {
    variants: {
      disabled: {
        true: 'pointer-events-none opacity-[var(--taav-recommendation-card-disabled-opacity)]',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export const recommendationCardCopy = cva('grid min-w-0 max-w-[370px] flex-1 justify-items-end gap-[var(--taav-recommendation-card-copy-gap)]');

export const recommendationCardTitle = cva(
  'm-0 text-right font-semibold leading-[var(--taav-recommendation-card-title-line-height)] text-[var(--taav-recommendation-card-title)]',
  {
    variants: {
      size: {
        sm: 'text-[length:var(--taav-recommendation-card-title-sm)]',
        md: 'text-[length:var(--taav-recommendation-card-title-md)]',
        lg: 'text-[length:var(--taav-recommendation-card-title-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const recommendationCardDescription = cva(
  'm-0 text-right font-normal leading-[var(--taav-recommendation-card-description-line-height)] text-[var(--taav-recommendation-card-description)]',
  {
    variants: {
      size: {
        sm: 'text-[length:var(--taav-recommendation-card-description-sm)]',
        md: 'text-[length:var(--taav-recommendation-card-description-md)]',
        lg: 'text-[length:var(--taav-recommendation-card-description-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const recommendationCardTrailing = cva(
  'mt-0 flex shrink-0 flex-wrap items-center justify-end gap-[var(--taav-recommendation-card-trailing-gap)] self-start',
);

export const recommendationCardTone = cva('', {
  variants: {
    tone: {
      brand: '',
      neutral:
        '[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-neutral)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-neutral)] [--taav-recommendation-card-action-color:var(--taav-recommendation-card-action-color-neutral)]',
      success:
        '[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-success)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-success)]',
      warning:
        '[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-warning)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-warning)]',
      danger:
        '[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-danger)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-danger)]',
      info: '[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-info)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-info)]',
    },
  },
  defaultVariants: {
    tone: 'brand',
  },
});
