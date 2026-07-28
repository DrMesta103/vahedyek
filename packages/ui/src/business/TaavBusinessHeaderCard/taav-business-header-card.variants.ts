import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export const businessHeaderCardRoot = cva(
  [
    'w-full max-w-[712px] overflow-hidden rounded-none border-0',
    'box-border bg-[var(--taav-business-header-card-surface)] shadow-none',
    'transition-[background-color,box-shadow,transform] duration-150',
    'hover:bg-[var(--taav-business-header-card-surface-hover)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.04)]',
    'md:h-[176px] md:min-h-[176px]',
  ],
  {
    variants: {
      variant: {
        navigation:
          'md:h-[100px] md:min-h-[100px] md:max-w-[696px] rounded-[var(--taav-business-header-card-radius)] border border-[var(--taav-business-header-card-border)]',
        toggleWithLink: '',
        toggle: 'md:h-[96px] md:min-h-[96px] md:max-w-[960px]',
        action: 'md:h-[96px] md:min-h-[96px] md:max-w-[960px]',
        actionWithSearch:
          'md:h-[145px] md:min-h-[145px] md:max-w-[690px] rounded-[var(--taav-business-header-card-radius-compact)] border border-[var(--taav-business-header-card-border)]',
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
    'inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none text-[var(--taav-business-header-card-accent)]',
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
  'inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[var(--taav-business-header-card-icon-radius)]',
  'bg-[var(--taav-business-header-card-icon-bg)] text-[var(--taav-business-header-card-accent)]',
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

export const businessHeaderCardTitle = cva(
  'm-0 text-right text-[length:var(--taav-business-header-card-title-size)] font-semibold leading-[var(--taav-business-header-card-title-leading)] text-[var(--taav-business-header-card-title-color)]',
  {
    variants: {
      variant: {
        navigation:
          'w-full text-right text-[length:var(--taav-business-header-card-title-size)] font-semibold leading-[var(--taav-business-header-card-title-leading-tight)]',
        toggleWithLink: '',
        toggle:
          'w-full text-right text-[length:var(--taav-business-header-card-title-size)] font-bold leading-[var(--taav-business-header-card-title-leading)] text-[var(--taav-business-header-card-title-color)]',
        action:
          'w-full text-right text-[length:var(--taav-business-header-card-title-size)] font-bold leading-[var(--taav-business-header-card-title-leading)] text-[var(--taav-business-header-card-title-color)]',
        actionWithSearch: '',
      },
    },
    defaultVariants: { variant: 'navigation' },
  },
);

export const businessHeaderCardDescription = cva(
  'm-0 max-w-[520px] text-right text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[var(--taav-business-header-card-description-color)]',
  {
    variants: {
      variant: {
        navigation:
          'md:w-[520px] md:max-w-[520px] text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading-tight)]',
        toggleWithLink: '',
        toggle:
          'whitespace-nowrap text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[var(--taav-business-header-card-description-color)]',
        action:
          'whitespace-nowrap text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[var(--taav-business-header-card-description-color)]',
        actionWithSearch:
          'whitespace-nowrap text-[length:var(--taav-business-header-card-desc-size)] font-medium leading-[var(--taav-business-header-card-desc-leading)] text-[var(--taav-business-header-card-description-color)]',
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
    'inline-flex h-[36px] min-w-[148px] items-center justify-center gap-[8px] rounded-[var(--taav-business-header-card-action-radius)]',
    'border-0 bg-[var(--taav-business-header-card-accent)] px-[16px] text-[length:var(--taav-business-header-card-action-size)] font-bold leading-5 text-[var(--taav-business-header-card-action-text)] whitespace-nowrap',
    'box-border [direction:rtl] [font-family:inherit]',
    'transition-[background-color,transform,opacity] hover:bg-[var(--taav-business-header-card-action-hover)] active:translate-y-px active:bg-[var(--taav-business-header-card-action-active)]',
    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--taav-business-header-card-action-focus)] focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-[0.55]',
  ],
  {
    variants: {
      variant: {
        action: 'min-w-[170px] text-[length:var(--taav-business-header-card-action-size)] font-bold',
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
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[length:var(--taav-business-header-card-search-size)] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none',
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
