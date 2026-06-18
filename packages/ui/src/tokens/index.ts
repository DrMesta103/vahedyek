export type TaavTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export const TAAV_TONE_LABELS: Record<TaavTone, string> = {
  brand: 'برند',
  neutral: 'خنثی',
  success: 'موفقیت',
  warning: 'هشدار',
  danger: 'خطر',
  info: 'اطلاعات',
  purple: 'بنفش',
};

export const TAAV_RADIUS = {
  sm: 'var(--taav-radius-sm)',
  md: 'var(--taav-radius-md)',
  lg: 'var(--taav-radius-lg)',
  xl: 'var(--taav-radius-xl)',
  xxl: 'var(--taav-radius-xxl)',
  pill: 'var(--taav-radius-pill)',
} as const;

export const TAAV_SHADOW = {
  xs: 'var(--taav-shadow-xs)',
  sm: 'var(--taav-shadow-sm)',
  md: 'var(--taav-shadow-md)',
  lg: 'var(--taav-shadow-lg)',
} as const;

export const TAAV_SPACING = {
  0: 'var(--taav-space-0)',
  1: 'var(--taav-space-1)',
  2: 'var(--taav-space-2)',
  3: 'var(--taav-space-3)',
  4: 'var(--taav-space-4)',
  5: 'var(--taav-space-5)',
  6: 'var(--taav-space-6)',
  8: 'var(--taav-space-8)',
  10: 'var(--taav-space-10)',
  12: 'var(--taav-space-12)',
} as const;

export const TAAV_BUTTON_HEIGHT = {
  xs: 'var(--taav-btn-height-xs)',
  sm: 'var(--taav-btn-height-sm)',
  md: 'var(--taav-btn-height-md)',
  lg: 'var(--taav-btn-height-lg)',
  xl: 'var(--taav-btn-height-xl)',
} as const;

export const TAAV_DURATION = {
  fast: 'var(--taav-duration-fast)',
  normal: 'var(--taav-duration-normal)',
  slow: 'var(--taav-duration-slow)',
} as const;

export { TAAV_TOKEN_CATALOG, TAAV_TOKEN_SECTIONS, type TokenCategory, type TokenEntry } from './catalog';
