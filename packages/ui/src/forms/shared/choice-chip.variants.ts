import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavChoiceChipTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type TaavChoiceChipSize = 'sm' | 'md' | 'lg';
export type TaavChoiceChipShape = 'pill' | 'rounded';
export type TaavChoiceChipGap = 'sm' | 'md' | 'lg';

const selectedToneClass: Record<TaavChoiceChipTone, string> = {
  neutral:
    'bg-[var(--taav-neutral-soft)] text-[var(--taav-choice-chip-selected-text)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none',
  brand:
    'bg-[var(--taav-choice-chip-selected-bg)] text-[var(--taav-choice-chip-selected-text)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none',
  success:
    'bg-[var(--taav-success-muted)] text-[var(--taav-success-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none',
  warning:
    'bg-[var(--taav-warning-muted)] text-[var(--taav-warning-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none',
  danger:
    'bg-[var(--taav-danger-muted)] text-[var(--taav-danger-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none',
  info:
    'bg-[var(--taav-info-muted)] text-[var(--taav-info-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none',
};

export const taavChoiceChipVariants = cva(
  [
    'inline-flex max-w-full items-center justify-center gap-[var(--taav-choice-chip-gap)] border border-solid',
    'font-[var(--taav-font-weight-medium)] leading-none text-[var(--taav-choice-chip-text)]',
    'bg-[var(--taav-choice-chip-bg)] border-[color:var(--taav-choice-chip-border)]',
    'hover:bg-[var(--taav-choice-chip-hover-bg)]',
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus,
    'focus-visible:shadow-[var(--taav-choice-chip-focus-ring)]',
    TAAV_INTERACTION.pressable,
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-[var(--taav-choice-chip-height-sm)] px-[var(--taav-choice-chip-px-sm)] text-[length:var(--taav-text-xs)]',
        md: 'h-[var(--taav-choice-chip-height-md)] px-[var(--taav-choice-chip-px-md)] text-[length:var(--taav-text-sm)]',
        lg: 'h-[var(--taav-choice-chip-height-lg)] px-[var(--taav-choice-chip-px-lg)] text-[length:var(--taav-text-md)]',
      },
      shape: {
        pill: 'rounded-[var(--taav-choice-chip-radius-pill)]',
        rounded: 'rounded-[var(--taav-choice-chip-radius-rounded)]',
      },
      tone: {
        neutral: '',
        brand: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
      },
      selected: {
        true: '',
        false: '',
      },
      invalid: {
        true: 'border-[color:var(--taav-danger-border)]',
        false: '',
      },
    },
    compoundVariants: [
      { selected: true, tone: 'neutral', className: selectedToneClass.neutral },
      { selected: true, tone: 'brand', className: selectedToneClass.brand },
      { selected: true, tone: 'success', className: selectedToneClass.success },
      { selected: true, tone: 'warning', className: selectedToneClass.warning },
      { selected: true, tone: 'danger', className: selectedToneClass.danger },
      { selected: true, tone: 'info', className: selectedToneClass.info },
    ],
    defaultVariants: {
      size: 'md',
      shape: 'pill',
      selected: false,
      invalid: false,
    },
  },
);

export const taavChoiceChipCheckClass =
  'inline-flex shrink-0 text-[var(--taav-choice-chip-selected-icon)] [&_svg]:h-4 [&_svg]:w-4';

export const taavChoiceChipIconSlotClass =
  'inline-flex shrink-0 text-[var(--taav-text-muted)] [&_svg]:h-4 [&_svg]:w-4';

export const taavChoiceChipGroupGapClass: Record<TaavChoiceChipGap, string> = {
  sm: 'gap-[var(--taav-choice-chip-group-gap-sm)]',
  md: 'gap-[var(--taav-choice-chip-group-gap-md)]',
  lg: 'gap-[var(--taav-choice-chip-group-gap-lg)]',
};

export const taavChoiceChipGroupShellClass =
  'grid w-full gap-[var(--taav-choice-chip-group-shell-gap)]';

const choiceChipGroupLabelSizeClass: Record<TaavChoiceChipSize, string> = {
  sm: 'text-[length:var(--taav-text-sm)]',
  md: 'text-[length:var(--taav-text-md)]',
  lg: 'text-[length:var(--taav-text-lg)]',
};

const choiceChipGroupDescriptionSizeClass: Record<TaavChoiceChipSize, string> = {
  sm: 'text-[length:var(--taav-text-xs)]',
  md: 'text-[length:var(--taav-text-sm)]',
  lg: 'text-[length:var(--taav-text-md)]',
};

export function taavChoiceChipGroupLabelClass(size: TaavChoiceChipSize = 'md') {
  return [
    'm-0 inline-flex w-full items-center gap-[var(--taav-space-1)] font-[var(--taav-font-weight-black)] leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]',
    choiceChipGroupLabelSizeClass[size],
  ].join(' ');
}

export function taavChoiceChipGroupDescriptionClass(size: TaavChoiceChipSize = 'md') {
  return [
    'm-0 leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]',
    choiceChipGroupDescriptionSizeClass[size],
  ].join(' ');
}

export const taavChoiceChipGroupOptionsClass = 'flex w-full';
