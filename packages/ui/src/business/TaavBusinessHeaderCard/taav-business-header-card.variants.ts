import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const businessHeaderCardRoot = cva(
  [
    'w-full max-w-[712px] overflow-hidden rounded-none border-0',
    'box-border bg-white shadow-none',
    'transition-[background-color,box-shadow,transform] duration-150',
    'hover:bg-[rgba(250,252,253,1)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.04)]',
    'md:h-[176px] md:min-h-[176px]',
  ],
  {
    variants: {
      variant: {
        navigation: 'md:h-[100px] md:min-h-[100px] md:max-w-[696px] rounded-[16px] border border-[rgba(145,170,190,0.5)]',
        toggleWithLink: '',
        toggle: 'md:h-[96px] md:min-h-[96px] md:max-w-[960px]',
        action: 'md:h-[96px] md:min-h-[96px] md:max-w-[960px]',
        actionWithSearch: 'md:h-[145px] md:min-h-[145px] md:max-w-[690px] rounded-[14px] border border-[rgba(145,170,190,0.5)]',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
      themeMode: {
        auto: '',
        light: '',
        dark: '',
      },
    },
    defaultVariants: {
      variant: 'navigation',
      loading: false,
      themeMode: 'auto',
    },
  },
);

export const businessHeaderCardBody = cva('flex h-full min-h-0 flex-col gap-[12px] p-[24px_28px_24px_24px]', {
  variants: {
    variant: {
      navigation: 'md:p-[17px_28px] md:justify-center',
      toggleWithLink: '',
      toggle: 'md:p-[20px_28px]',
      action: 'md:p-[20px_28px]',
      actionWithSearch: 'w-full items-start',
    },
  },
  defaultVariants: { variant: 'navigation' },
});

export const businessHeaderCardTopRow = cva('grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-[16px]');

export const businessHeaderCardArrow = cva(
  [
    'inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none text-[#008f8f]',
    'appearance-none rounded-none',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.pressable,
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

export const businessHeaderCardArrowPlaceholder = cva('inline-flex h-[26px] w-[26px] shrink-0');

export const businessHeaderCardIconBox = cva([
  'inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px]',
  'bg-[rgba(0,143,143,0.10)] text-[#008f8f]',
  '[&_svg]:h-[24px] [&_svg]:w-[24px]',
]);

export const businessHeaderCardCopy = cva('flex min-w-0 flex-col items-end justify-self-end gap-[4px] text-right', {
  variants: {
    variant: {
      navigation: 'w-full items-start',
      toggleWithLink: '',
      toggle: 'w-full items-start',
      action: 'w-full items-start',
      actionWithSearch: 'w-full text-right',
    },
  },
  defaultVariants: { variant: 'navigation' },
});

export const businessHeaderCardTitle = cva('m-0 text-right text-[18px] font-semibold leading-[26px] text-[#30343b]', {
  variants: {
    variant: {
      navigation: 'w-full text-right text-[18px] font-semibold leading-[22px]',
      toggleWithLink: '',
      toggle: 'w-full text-right text-[18px] font-bold leading-[26px] text-[#30343b]',
      action: 'w-full text-right text-[18px] font-bold leading-[26px] text-[#30343b]',
      actionWithSearch: '',
    },
  },
  defaultVariants: { variant: 'navigation' },
});

export const businessHeaderCardDescription = cva(
  'm-0 max-w-[520px] text-right text-[12.5px] font-medium leading-[22px] text-[#5f6f80]',
  {
    variants: {
      variant: {
        navigation: 'md:w-[520px] md:max-w-[520px] text-[12.5px] font-medium leading-[20px]',
        toggleWithLink: '',
        toggle: 'whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#6b7280]',
        action: 'whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#6b7280]',
        actionWithSearch: 'whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#5f6f80]',
      },
    },
    defaultVariants: { variant: 'navigation' },
  },
);

export const businessHeaderCardLink = cva('mt-[2px] flex w-full justify-start text-right');

export const businessHeaderCardToggle = cva('shrink-0');

export const businessHeaderCardAction = cva('shrink-0');

export const businessHeaderCardActionButton = cva(
  [
    'inline-flex h-[36px] min-w-[148px] items-center justify-center gap-[8px] rounded-[14px]',
    'border-0 bg-[#008f8f] px-[16px] text-[14px] font-bold leading-5 text-white whitespace-nowrap',
    'box-border [direction:rtl] [font-family:inherit]',
    'transition-[background-color,transform,opacity] hover:bg-[#007f7f] active:translate-y-px active:bg-[#006f6f]',
    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(0,143,143,0.22)] focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-[0.55]',
  ],
  {
    variants: {
      variant: {
        action: 'min-w-[170px] text-[14px] font-bold',
        actionWithSearch: '',
      },
      disabled: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'actionWithSearch',
      disabled: false,
    },
  },
);

export const businessHeaderCardActionButtonLabel = cva('inline-flex items-center');

export const businessHeaderCardActionButtonIcon = cva('inline-flex h-5 w-5 shrink-0 items-center justify-center');

export const businessHeaderCardSearchWrap = cva('w-full');

export const businessHeaderCardSearchShell = cva(
  'flex h-[38px] items-center gap-2 rounded-full bg-[#dfe4ea] px-4 text-[#64748b] shadow-none',
);

export const businessHeaderCardSearchInput = cva(
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[12.5px] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none',
);

export const businessHeaderCardSearchContainer = cva('mt-[14px] flex justify-start', {
  variants: {
    variant: {
      navigation: '',
      toggleWithLink: '',
      toggle: '',
      action: '',
      actionWithSearch: 'mt-[2px] justify-end',
    },
  },
  defaultVariants: { variant: 'navigation' },
});
