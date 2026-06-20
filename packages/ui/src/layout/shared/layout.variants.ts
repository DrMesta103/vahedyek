export type TaavLayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type TaavLayoutPadding = 'none' | 'sm' | 'md' | 'lg';
export type TaavLayoutTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export const layoutDensityGap: Record<TaavLayoutDensity, string> = {
  compact: 'gap-[var(--taav-layout-gap-compact)]',
  comfortable: 'gap-[var(--taav-layout-gap-comfortable)]',
  spacious: 'gap-[var(--taav-layout-gap-spacious)]',
};

export const layoutPaddingClass: Record<TaavLayoutPadding, string> = {
  none: 'p-0',
  sm: 'p-[var(--taav-section-padding-sm)]',
  md: 'p-[var(--taav-section-padding-md)]',
  lg: 'p-[var(--taav-section-padding-lg)]',
};

export const pagePaddingClass: Record<TaavLayoutPadding, string> = {
  none: 'p-0',
  sm: 'p-[var(--taav-page-padding-sm)]',
  md: 'p-[var(--taav-page-padding-md)]',
  lg: 'p-[var(--taav-page-padding-lg)]',
};

export const layoutToneSurface: Record<TaavLayoutTone, string> = {
  neutral: 'bg-[var(--taav-stats-tone-neutral)]',
  brand: 'bg-[var(--taav-stats-tone-brand)]',
  success: 'bg-[var(--taav-stats-tone-success)]',
  warning: 'bg-[var(--taav-stats-tone-warning)]',
  danger: 'bg-[var(--taav-stats-tone-danger)]',
  info: 'bg-[var(--taav-stats-tone-info)]',
  purple: 'bg-[var(--taav-stats-tone-purple)]',
};

export const layoutToneText: Record<TaavLayoutTone, string> = {
  neutral: 'text-[var(--taav-text-strong)]',
  brand: 'text-[var(--taav-brand-strong)]',
  success: 'text-[var(--taav-success-strong)]',
  warning: 'text-[var(--taav-warning-strong)]',
  danger: 'text-[var(--taav-danger-strong)]',
  info: 'text-[var(--taav-info-strong)]',
  purple: 'text-[var(--taav-purple-strong)]',
};

export const progressFillTone: Record<TaavLayoutTone, string> = {
  neutral: 'bg-[var(--taav-neutral)]',
  brand: 'bg-[var(--taav-progress-fill-brand)]',
  success: 'bg-[var(--taav-progress-fill-success)]',
  warning: 'bg-[var(--taav-warning)]',
  danger: 'bg-[var(--taav-danger)]',
  info: 'bg-[var(--taav-info)]',
  purple: 'bg-[var(--taav-purple)]',
};
