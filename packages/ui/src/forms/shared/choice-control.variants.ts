import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavChoiceSize = 'sm' | 'md' | 'lg';
export type TaavChoiceTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

const controlSizeClass: Record<TaavChoiceSize, string> = {
  sm: 'h-[var(--taav-control-size-sm)] w-[var(--taav-control-size-sm)]',
  md: 'h-[var(--taav-control-size-md)] w-[var(--taav-control-size-md)]',
  lg: 'h-[var(--taav-control-size-lg)] w-[var(--taav-control-size-lg)]',
};

const checkboxCheckedTone: Record<TaavChoiceTone, string> = {
  brand:
    'checked:border-[color:var(--taav-control-checked-brand-border)] checked:bg-[var(--taav-control-checked-brand)]',
  neutral:
    'checked:border-[color:var(--taav-control-checked-neutral-border)] checked:bg-[var(--taav-control-checked-neutral)]',
  success:
    'checked:border-[color:var(--taav-control-checked-success-border)] checked:bg-[var(--taav-control-checked-success)]',
  warning:
    'checked:border-[color:var(--taav-control-checked-warning-border)] checked:bg-[var(--taav-control-checked-warning)]',
  danger:
    'checked:border-[color:var(--taav-control-checked-danger-border)] checked:bg-[var(--taav-control-checked-danger)]',
};

const radioCheckedTone: Record<TaavChoiceTone, string> = {
  brand:
    'checked:border-[color:var(--taav-control-checked-brand)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-brand)]',
  neutral:
    'checked:border-[color:var(--taav-control-checked-neutral)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-neutral)]',
  success:
    'checked:border-[color:var(--taav-control-checked-success)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-success)]',
  warning:
    'checked:border-[color:var(--taav-control-checked-warning)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-warning)]',
  danger:
    'checked:border-[color:var(--taav-control-checked-danger)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-danger)]',
};

const radioDotSizeVar: Record<TaavChoiceSize, string> = {
  sm: '[--taav-radio-dot-size-md:var(--taav-radio-dot-size-sm)]',
  md: '[--taav-radio-dot-size-md:var(--taav-radio-dot-size-md)]',
  lg: '[--taav-radio-dot-size-md:var(--taav-radio-dot-size-lg)]',
};

const switchTrackWidth: Record<TaavChoiceSize, string> = {
  sm: 'w-[var(--taav-switch-track-w-sm)]',
  md: 'w-[var(--taav-switch-track-w-md)]',
  lg: 'w-[var(--taav-switch-track-w-lg)]',
};

const switchTrackHeight: Record<TaavChoiceSize, string> = {
  sm: 'h-[var(--taav-switch-track-h-sm)]',
  md: 'h-[var(--taav-switch-track-h-md)]',
  lg: 'h-[var(--taav-switch-track-h-lg)]',
};

const switchThumbSize: Record<TaavChoiceSize, string> = {
  sm: 'h-[var(--taav-switch-thumb-sm)] w-[var(--taav-switch-thumb-sm)]',
  md: 'h-[var(--taav-switch-thumb-md)] w-[var(--taav-switch-thumb-md)]',
  lg: 'h-[var(--taav-switch-thumb-lg)] w-[var(--taav-switch-thumb-lg)]',
};

const switchTrackOnTone: Record<TaavChoiceTone, string> = {
  brand: 'group-has-[:checked]:bg-[var(--taav-switch-track-on-brand)]',
  neutral: 'group-has-[:checked]:bg-[var(--taav-switch-track-on-neutral)]',
  success: 'group-has-[:checked]:bg-[var(--taav-switch-track-on-success)]',
  warning: 'group-has-[:checked]:bg-[var(--taav-switch-track-on-warning)]',
  danger: 'group-has-[:checked]:bg-[var(--taav-switch-track-on-danger)]',
};

export const taavChoiceControlBase = [
  'shrink-0 appearance-none border border-solid border-[color:var(--taav-control-border)] bg-[var(--taav-control-bg)]',
  TAAV_INTERACTION.base,
  'focus-visible:outline-none focus-visible:shadow-[var(--taav-control-focus-ring)]',
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[var(--taav-control-bg-disabled)]',
].join(' ');

export const taavChoiceInvalidClass =
  'border-[color:var(--taav-control-invalid-border)] focus-visible:shadow-[var(--taav-control-focus-ring-danger)]';

export const taavChoiceCheckIconClass =
  'checked:bg-[length:10px_10px] checked:bg-center checked:bg-no-repeat checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2012%2012%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M2%206l2.5%202.5L10%203%27%20stroke%3D%27white%27%20stroke-width%3D%271.75%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E")]';

export const taavChoiceIndeterminateClass =
  'data-[indeterminate=true]:border-[color:var(--taav-control-checked-brand-border)] data-[indeterminate=true]:bg-[var(--taav-control-checked-brand)] data-[indeterminate=true]:bg-[length:10px_2px] data-[indeterminate=true]:bg-center data-[indeterminate=true]:bg-no-repeat data-[indeterminate=true]:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2012%202%27%3E%3Crect%20width%3D%2712%27%20height%3D%272%27%20rx%3D%271%27%20fill%3D%27white%27/%3E%3C/svg%3E")]';

export function getTaavCheckboxClasses(size: TaavChoiceSize, tone: TaavChoiceTone, invalid?: boolean): string {
  return [
    taavChoiceControlBase,
    controlSizeClass[size],
    'rounded-[var(--taav-checkbox-radius)]',
    checkboxCheckedTone[tone],
    taavChoiceCheckIconClass,
    taavChoiceIndeterminateClass,
    invalid ? taavChoiceInvalidClass : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getTaavRadioClasses(size: TaavChoiceSize, tone: TaavChoiceTone, invalid?: boolean): string {
  return [
    taavChoiceControlBase,
    controlSizeClass[size],
    radioDotSizeVar[size],
    'rounded-full',
    radioCheckedTone[tone],
    invalid ? taavChoiceInvalidClass : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function getTaavSwitchTrackClasses(size: TaavChoiceSize, tone: TaavChoiceTone): string {
  return [
    'inline-flex items-center rounded-full bg-[var(--taav-switch-track-off)] p-0.5',
    switchTrackWidth[size],
    switchTrackHeight[size],
    TAAV_INTERACTION.base,
    switchTrackOnTone[tone],
  ].join(' ');
}

export function getTaavSwitchThumbClasses(size: TaavChoiceSize): string {
  return [
    'block rounded-full bg-[var(--taav-switch-thumb-bg)] shadow-[var(--taav-switch-thumb-shadow)] transition-[margin] duration-[var(--taav-duration-normal)] ease-[var(--taav-ease-standard)] group-has-[:checked]:ms-auto',
    switchThumbSize[size],
  ].join(' ');
}

export const taavChoiceLabelLayoutClass = 'inline-flex items-start gap-[var(--taav-choice-label-gap)]';

export const taavChoiceTextBlockClass = 'grid gap-[var(--taav-choice-description-gap)] min-w-0';

export const taavChoiceLabelTextClass =
  'text-[length:var(--taav-form-label-md)] font-[var(--taav-font-weight-bold)] leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]';

export const taavChoiceDescriptionTextClass =
  'text-[length:var(--taav-form-description-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]';

export const taavSegmentedRootVariants = cva(
  ['inline-flex items-center gap-[var(--taav-segmented-gap)] rounded-[var(--taav-segmented-radius)] bg-[var(--taav-segmented-bg)] p-[var(--taav-segmented-gap)]', TAAV_INTERACTION.base],
  {
    variants: {
      size: {
        sm: 'min-h-[var(--taav-segmented-height-sm)]',
        md: 'min-h-[var(--taav-segmented-height-md)]',
        lg: 'min-h-[var(--taav-segmented-height-lg)]',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
    },
    defaultVariants: { size: 'md', width: 'auto' },
  },
);

export const taavSegmentedItemVariants = cva(
  [
    'inline-flex flex-1 items-center justify-center gap-[var(--taav-space-2)] rounded-[calc(var(--taav-segmented-radius)-2px)] px-[var(--taav-space-3)]',
    'text-[length:var(--taav-text-sm)] font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]',
    TAAV_INTERACTION.base,
    'focus-visible:outline-none focus-visible:shadow-[var(--taav-control-focus-ring)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[calc(var(--taav-segmented-height-sm)-4px)] text-[length:var(--taav-text-xs)]',
        md: 'min-h-[calc(var(--taav-segmented-height-md)-4px)]',
        lg: 'min-h-[calc(var(--taav-segmented-height-lg)-4px)] text-[length:var(--taav-text-md)]',
      },
      selected: {
        true: 'bg-[var(--taav-segmented-selected-bg)] text-[var(--taav-text-strong)] shadow-[var(--taav-segmented-selected-shadow)] ring-1 ring-[color:var(--taav-segmented-selected-ring)]',
        false: 'hover:text-[var(--taav-text-body)]',
      },
      tone: {
        brand: '',
        neutral: '',
      },
      variant: {
        solid: '',
        soft: '',
        outline: 'border border-transparent data-[selected=true]:border-[color:var(--taav-border)]',
      },
    },
    defaultVariants: { size: 'md', selected: false, tone: 'brand', variant: 'solid' },
  },
);

export type TaavSegmentedTone = 'brand' | 'neutral';
export type TaavSegmentedVariant = 'solid' | 'soft' | 'outline';
export type TaavSegmentedWidth = 'auto' | 'full';
