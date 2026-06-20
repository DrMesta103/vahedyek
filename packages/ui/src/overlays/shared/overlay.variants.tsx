import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavOverlayVariant = 'default' | 'elevated' | 'soft';
export type TaavOverlayTone = 'neutral' | 'danger' | 'success' | 'warning' | 'info';
export type TaavDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type TaavDrawerSide = 'right' | 'left' | 'top' | 'bottom';
export type TaavDrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type TaavPopoverSize = 'sm' | 'md' | 'lg';
export type TaavPopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type TaavPopoverAlign = 'start' | 'center' | 'end';

const overlayVariantMap: Record<TaavOverlayVariant, string> = {
  default: 'bg-[var(--taav-overlay-surface)] border-[color:var(--taav-overlay-border)] shadow-[var(--taav-overlay-shadow)]',
  elevated:
    'bg-[var(--taav-overlay-surface)] border-[color:var(--taav-overlay-border-subtle)] shadow-[var(--taav-shadow-xl)]',
  soft: 'bg-[var(--taav-overlay-surface-soft)] border-[color:var(--taav-overlay-border-subtle)] shadow-[var(--taav-shadow-md)]',
};

const overlayToneBorderMap: Record<TaavOverlayTone, string> = {
  neutral: '',
  danger: 'border-[color:var(--taav-danger-border)]',
  success: 'border-[color:var(--taav-success-border)]',
  warning: 'border-[color:var(--taav-warning-border)]',
  info: 'border-[color:var(--taav-info-border)]',
};

export const taavOverlayBackdropClass =
  'fixed inset-0 z-[var(--taav-z-overlay)] bg-[var(--taav-overlay-backdrop)]';

export const taavDialogContentVariants = cva(
  [
    'fixed z-[calc(var(--taav-z-overlay)+1)] grid w-full gap-[var(--taav-space-4)] border border-solid',
    'rounded-[var(--taav-overlay-radius)] p-[var(--taav-overlay-padding-md)] text-right',
    TAAV_INTERACTION.base,
    'focus:outline-none',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-[var(--taav-dialog-width-sm)]',
        md: 'max-w-[var(--taav-dialog-width-md)]',
        lg: 'max-w-[var(--taav-dialog-width-lg)]',
        xl: 'max-w-[var(--taav-dialog-width-xl)]',
        fullscreen: 'inset-4 max-w-none h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] overflow-hidden',
      },
      variant: {
        default: overlayVariantMap.default,
        elevated: overlayVariantMap.elevated,
        soft: overlayVariantMap.soft,
      },
    },
    defaultVariants: { size: 'md', variant: 'default' },
  },
);

export function getTaavOverlayToneClass(tone: TaavOverlayTone): string {
  return overlayToneBorderMap[tone];
}

export const taavDialogPositionClass =
  'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100vh-var(--taav-space-8))] overflow-y-auto';

export const taavDrawerContentVariants = cva(
  [
    'fixed z-[calc(var(--taav-z-overlay)+1)] flex flex-col border border-solid',
    TAAV_INTERACTION.base,
    'focus:outline-none',
  ],
  {
    variants: {
      side: {
        left: 'inset-y-0 start-0 h-full border-e',
        right: 'inset-y-0 end-0 h-full border-s',
        top: 'inset-x-0 top-0 w-full border-b',
        bottom: 'inset-x-0 bottom-0 w-full border-t',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
        full: '',
      },
      variant: {
        default: overlayVariantMap.default,
        elevated: overlayVariantMap.elevated,
        soft: overlayVariantMap.soft,
      },
    },
    compoundVariants: [
      { side: ['left', 'right'], size: 'sm', class: 'w-[var(--taav-drawer-width-sm)]' },
      { side: ['left', 'right'], size: 'md', class: 'w-[var(--taav-drawer-width-md)]' },
      { side: ['left', 'right'], size: 'lg', class: 'w-[var(--taav-drawer-width-lg)]' },
      { side: ['left', 'right'], size: 'xl', class: 'w-[var(--taav-drawer-width-xl)]' },
      { side: ['left', 'right'], size: 'full', class: 'w-full max-w-full' },
      { side: ['top', 'bottom'], size: 'sm', class: 'h-[240px]' },
      { side: ['top', 'bottom'], size: 'md', class: 'h-[320px]' },
      { side: ['top', 'bottom'], size: 'lg', class: 'h-[420px]' },
      { side: ['top', 'bottom'], size: 'xl', class: 'h-[520px]' },
      { side: ['top', 'bottom'], size: 'full', class: 'h-full max-h-full' },
    ],
    defaultVariants: { side: 'left', size: 'md', variant: 'default' },
  },
);

export const taavPopoverContentVariants = cva(
  [
    'z-[var(--taav-z-dropdown)] rounded-[var(--taav-radius-lg)] border border-solid text-right',
    TAAV_INTERACTION.base,
    'focus:outline-none',
  ],
  {
    variants: {
      size: {
        sm: 'w-[var(--taav-popover-width-sm)] p-[var(--taav-popover-padding-sm)]',
        md: 'w-[var(--taav-popover-width-md)] p-[var(--taav-popover-padding-md)]',
        lg: 'w-[var(--taav-popover-width-lg)] p-[var(--taav-popover-padding-lg)]',
      },
      variant: {
        default: overlayVariantMap.default,
        elevated: overlayVariantMap.elevated,
        soft: overlayVariantMap.soft,
      },
      tone: {
        neutral: '',
        info: 'border-[color:var(--taav-info-border)]',
        success: 'border-[color:var(--taav-success-border)]',
        warning: 'border-[color:var(--taav-warning-border)]',
        danger: 'border-[color:var(--taav-danger-border)]',
      },
    },
    defaultVariants: { size: 'md', variant: 'default', tone: 'neutral' },
  },
);

export const taavDropdownContentClass =
  'z-[var(--taav-z-dropdown)] min-w-[var(--taav-dropdown-min-width)] overflow-hidden rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-overlay-border)] bg-[var(--taav-overlay-surface)] p-[var(--taav-space-1)] shadow-[var(--taav-overlay-shadow)]';

export type TaavDropdownItemTone = 'neutral' | 'danger' | 'success' | 'warning' | 'info';

export const taavDropdownItemVariants = cva(
  [
    'relative flex cursor-pointer select-none items-center gap-[var(--taav-space-2)] rounded-[var(--taav-dropdown-item-radius)] px-[var(--taav-space-3)]',
    'text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)] outline-none',
    TAAV_INTERACTION.base,
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    'data-[highlighted]:bg-[var(--taav-dropdown-item-hover)] data-[highlighted]:text-[var(--taav-text-strong)]',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[var(--taav-dropdown-item-height-sm)] text-[length:var(--taav-text-xs)]',
        md: 'min-h-[var(--taav-dropdown-item-height-md)]',
        lg: 'min-h-[var(--taav-dropdown-item-height-lg)] text-[length:var(--taav-text-md)]',
      },
      tone: {
        neutral: '',
        danger: 'text-[var(--taav-danger-strong)] data-[highlighted]:bg-[var(--taav-danger-muted)]',
        success: 'text-[var(--taav-success-strong)] data-[highlighted]:bg-[var(--taav-success-muted)]',
        warning: 'text-[var(--taav-warning-strong)] data-[highlighted]:bg-[var(--taav-warning-muted)]',
        info: 'text-[var(--taav-info-strong)] data-[highlighted]:bg-[var(--taav-info-muted)]',
      },
    },
    defaultVariants: { size: 'md', tone: 'neutral' },
  },
);

export function TaavOverlayCloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4">
      <path d="M4 4l8 8M12 4 4 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export const taavOverlayCloseButtonClass =
  'absolute top-[var(--taav-space-4)] end-[var(--taav-space-4)] inline-flex h-8 w-8 items-center justify-center rounded-[var(--taav-radius-md)] text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-muted)] hover:text-[var(--taav-text-strong)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]';

export const taavOverlayHeaderClass = 'grid gap-[var(--taav-space-2)] pe-10';
export const taavOverlayTitleClass =
  'text-[length:var(--taav-text-lg)] font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]';
export const taavOverlayDescriptionClass =
  'text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]';
export const taavOverlayFooterClass = 'flex flex-wrap items-center justify-end gap-[var(--taav-space-2)]';
