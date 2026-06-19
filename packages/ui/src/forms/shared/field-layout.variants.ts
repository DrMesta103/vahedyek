import { cva } from 'class-variance-authority';

export type TaavFieldBlockSize = 'sm' | 'md' | 'lg';
export type TaavFieldBlockAlign = 'start' | 'center' | 'end' | 'stretch';
export type TaavFieldTextAlign = 'start' | 'center' | 'end';
export type TaavFieldGridColumns = 1 | 2 | 3 | 4;
export type TaavFieldGridGap = 'sm' | 'md' | 'lg' | 'xl';
export type TaavFieldGridDensity = 'compact' | 'comfortable' | 'spacious';

const itemAlignmentClass: Record<TaavFieldBlockAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const textAlignmentClass: Record<TaavFieldTextAlign, string> = {
  start: 'text-start justify-start',
  center: 'text-center justify-center',
  end: 'text-end justify-end',
};

const blockGapClass: Record<TaavFieldBlockSize, string> = {
  sm: 'gap-[var(--taav-field-block-gap-sm)]',
  md: 'gap-[var(--taav-field-block-gap-md)]',
  lg: 'gap-[var(--taav-field-block-gap-lg)]',
};

const labelSizeClass: Record<TaavFieldBlockSize, string> = {
  sm: 'text-[length:var(--taav-field-block-label-sm)]',
  md: 'text-[length:var(--taav-field-block-label-md)]',
  lg: 'text-[length:var(--taav-field-block-label-lg)]',
};

const supportSizeClass: Record<TaavFieldBlockSize, string> = {
  sm: 'text-[length:var(--taav-field-block-support-sm)]',
  md: 'text-[length:var(--taav-field-block-support-md)]',
  lg: 'text-[length:var(--taav-field-block-support-lg)]',
};

const feedbackSizeClass: Record<TaavFieldBlockSize, string> = {
  sm: 'text-[length:var(--taav-field-block-feedback-sm)]',
  md: 'text-[length:var(--taav-field-block-feedback-md)]',
  lg: 'text-[length:var(--taav-field-block-feedback-lg)]',
};

export const taavFieldBlockVariants = cva('grid w-full', {
  variants: {
    size: blockGapClass,
    align: itemAlignmentClass,
  },
  defaultVariants: {
    size: 'md',
    align: 'stretch',
  },
});

export const taavFieldBlockLabelVariants = cva(
  'inline-flex w-full items-center gap-[var(--taav-space-1)] font-[var(--taav-font-weight-black)] leading-[var(--taav-leading-tight)] text-[var(--taav-field-block-label-color)]',
  {
    variants: {
      size: labelSizeClass,
      align: textAlignmentClass,
    },
    defaultVariants: {
      size: 'md',
      align: 'start',
    },
  },
);

export const taavFieldBlockControlVariants = cva('w-full', {
  variants: {
    size: {
      sm: 'min-h-[var(--taav-field-block-control-min-height-sm)]',
      md: 'min-h-[var(--taav-field-block-control-min-height-md)]',
      lg: 'min-h-[var(--taav-field-block-control-min-height-lg)]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const taavFieldBlockSupportVariants = cva(
  'm-0 w-full leading-[var(--taav-leading-relaxed)] text-[var(--taav-field-block-support-color)]',
  {
    variants: {
      size: supportSizeClass,
      align: textAlignmentClass,
    },
    defaultVariants: {
      size: 'md',
      align: 'start',
    },
  },
);

export const taavFieldBlockFeedbackVariants = cva('w-full', {
  variants: {
    size: feedbackSizeClass,
    align: textAlignmentClass,
  },
  defaultVariants: {
    size: 'md',
    align: 'start',
  },
});

const gridGapClass: Record<TaavFieldGridGap, string> = {
  sm: '[column-gap:var(--taav-field-grid-gap-sm)]',
  md: '[column-gap:var(--taav-field-grid-gap-md)]',
  lg: '[column-gap:var(--taav-field-grid-gap-lg)]',
  xl: '[column-gap:var(--taav-field-grid-gap-xl)]',
};

const gridRowGapClass: Record<TaavFieldGridDensity, string> = {
  compact: '[row-gap:var(--taav-field-grid-row-gap-compact)]',
  comfortable: '[row-gap:var(--taav-field-grid-row-gap-comfortable)]',
  spacious: '[row-gap:var(--taav-field-grid-row-gap-spacious)]',
};

const responsiveColumnsClass: Record<TaavFieldGridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
};

const staticColumnsClass: Record<TaavFieldGridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export function getTaavFieldGridColumnsClass(columns: TaavFieldGridColumns, responsive: boolean) {
  return responsive ? responsiveColumnsClass[columns] : staticColumnsClass[columns];
}

export const taavFieldGridVariants = cva('grid w-full', {
  variants: {
    gap: gridGapClass,
    density: gridRowGapClass,
    responsive: {
      true: 'max-md:[row-gap:var(--taav-field-grid-responsive-gap)]',
      false: '',
    },
  },
  defaultVariants: {
    gap: 'md',
    density: 'comfortable',
    responsive: true,
  },
});
