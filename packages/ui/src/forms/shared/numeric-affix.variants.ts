import { cva } from 'class-variance-authority';
import { taavFieldShellVariants } from './field-control.variants';

export const taavNumericAffixShellVariants = cva('', {
  variants: {
    size: {
      sm: 'gap-[var(--taav-input-affix-gap-sm)]',
      md: 'gap-[var(--taav-input-affix-gap-md)]',
      lg: 'gap-[var(--taav-input-affix-gap-lg)]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const taavNumericAffixLabelVariants = cva(
  'pointer-events-none shrink-0 select-none font-semibold text-[color:var(--taav-input-affix-color)]',
  {
    variants: {
      size: {
        sm: 'min-w-[var(--taav-input-affix-min-width-sm)] text-[length:var(--taav-input-affix-font-size-sm)]',
        md: 'min-w-[var(--taav-input-affix-min-width-md)] text-[length:var(--taav-input-affix-font-size-md)]',
        lg: 'min-w-[var(--taav-input-affix-min-width-lg)] text-[length:var(--taav-input-affix-font-size-lg)]',
      },
      align: {
        start: 'text-start',
        end: 'text-end',
      },
    },
    defaultVariants: {
      size: 'md',
      align: 'start',
    },
  },
);

export const taavNumericAffixInputClass =
  'text-left tabular-nums tracking-normal placeholder:text-[var(--taav-input-placeholder)]';

export function taavNumericAffixShellClass(size: 'sm' | 'md' | 'lg') {
  return taavFieldShellVariants({ size, width: 'full', radius: 'xl' });
}
