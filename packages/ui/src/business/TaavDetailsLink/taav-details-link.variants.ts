import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const detailsLinkRoot = cva(
  [
    'inline-flex max-w-full items-center gap-[var(--taav-details-link-gap)]',
    'border-0 bg-transparent p-0 text-right font-medium',
    'text-[var(--taav-details-link-text)]',
    'decoration-[var(--taav-details-link-underline)] decoration-[length:var(--taav-details-link-underline-thickness)]',
    'underline-offset-[var(--taav-details-link-underline-offset)]',
    'hover:text-[var(--taav-details-link-text-hover)]',
    'hover:decoration-[var(--taav-details-link-underline-hover)]',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus,
  ],
  {
    variants: {
      size: {
        sm: 'text-[length:var(--taav-details-link-text-sm)]',
        md: 'text-[length:var(--taav-details-link-text-md)]',
        lg: 'text-[length:var(--taav-details-link-text-lg)]',
      },
      underline: {
        always: 'underline',
        hover: 'no-underline hover:underline',
        none: 'no-underline',
      },
      disabled: {
        true: 'pointer-events-none opacity-[var(--taav-details-link-disabled-opacity)]',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      underline: 'always',
      disabled: false,
    },
  },
);

export const detailsLinkTone = cva('', {
  variants: {
    tone: {
      neutral: '',
      brand: '[--taav-details-link-text:var(--taav-details-link-text-brand)] [--taav-details-link-text-hover:var(--taav-details-link-text-brand-hover)]',
      info: '[--taav-details-link-text:var(--taav-details-link-text-info)] [--taav-details-link-text-hover:var(--taav-details-link-text-info-hover)]',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});
