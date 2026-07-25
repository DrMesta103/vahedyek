import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const sectionToolbarCardRoot = cva(
  [
    'w-full max-w-[690px] overflow-hidden rounded-[14px] border border-[color:rgba(145,170,190,0.5)]',
    'box-border bg-[#ffffff] shadow-none',
    'md:h-[145px] md:min-h-[145px]',
  ],
  {
    variants: {
      interactive: {
        true: TAAV_INTERACTION.base,
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
);

export const sectionToolbarCardBody = cva('block p-[22px_26px_22px_32px]');

export const sectionToolbarCardHeader = cva('block');

export const sectionToolbarCardLead = cva('block min-w-0');

export const sectionToolbarCardIconBox = cva([
  'inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px]',
  'bg-[rgba(0,143,143,0.1)] text-[#008f8f]',
  '[&_svg]:h-[24px] [&_svg]:w-[24px]',
]);

export const sectionToolbarCardCopy = cva('block min-w-0 w-full');

export const sectionToolbarCardTitle = cva(
  'm-0 text-right text-[18px] font-semibold leading-[28px] text-[#30343b]',
);

export const sectionToolbarCardDescription = cva(
  'm-0 mt-0 text-right text-[12.5px] font-normal leading-[22px] text-[#5f6f80]',
);

export const sectionToolbarCardArrow = cva(
  [
    'inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center text-[#008f8f] justify-self-end mt-[18px]',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus,
  ],
  {
    variants: {
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export const sectionToolbarCardActions = cva('block mt-[9px] w-full');

export const sectionToolbarCardSearch = cva('w-full');

export const sectionToolbarCardAction = cva('block');

export const sectionToolbarCardSearchShell = cva(
  'flex h-[38px] items-center gap-2 rounded-full bg-[#dfe4ea] px-4 text-[#64748b] shadow-none',
);

export const sectionToolbarCardSearchInput = cva(
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[12.5px] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none',
);

export const sectionToolbarCardActionButton = cva(
  'taav-business-action-button box-border inline-flex h-[36px] min-w-[148px] items-center justify-center gap-2 border-0 rounded-[14px] bg-[#008f8f] px-[16px] text-[14px] font-bold leading-5 text-white transition-[background-color,transform,opacity] hover:bg-[#007f7f] active:translate-y-px active:bg-[#006f6f] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(0,143,143,0.22)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-[0.55] [direction:rtl] [font-family:inherit] whitespace-nowrap',
);

export const sectionToolbarCardActionButtonLabel = cva('inline-flex items-center');

export const sectionToolbarCardActionButtonIcon = cva('inline-flex h-5 w-5 shrink-0 items-center justify-center');
