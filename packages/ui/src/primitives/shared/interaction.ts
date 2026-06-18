/** Shared interaction classes for TaavUI primitives */
export const TAAV_INTERACTION = {
  base: [
    'transition-[background-color,border-color,color,box-shadow,transform,opacity]',
    'duration-[var(--taav-duration-normal)]',
    'ease-[var(--taav-ease-standard)]',
  ].join(' '),
  pressable: 'active:scale-[0.98] active:brightness-[0.97] disabled:active:scale-100 disabled:active:brightness-100',
  focus: 'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
  iconSlot: 'inline-flex shrink-0 [&_svg]:pointer-events-none',
} as const;
