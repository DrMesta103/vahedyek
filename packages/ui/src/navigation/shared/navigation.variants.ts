import { cva } from 'class-variance-authority';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavTabsVariant = 'underline' | 'pill' | 'soft' | 'boxed';
export type TaavTabsSize = 'sm' | 'md' | 'lg';
export type TaavTabsTone = 'brand' | 'neutral';
export type TaavTabsOrientation = 'horizontal' | 'vertical';

export type TaavStepperSize = 'sm' | 'md' | 'lg';
export type TaavStepperVariant = 'numbered' | 'icon' | 'compact';
export type TaavStepperTone = 'brand' | 'neutral';
export type TaavStepperOrientation = 'horizontal' | 'vertical';
export type TaavStepStatus = 'complete' | 'current' | 'upcoming' | 'error' | 'warning';

export const taavTabsListVariants = cva(['inline-flex gap-[var(--taav-space-1)]', TAAV_INTERACTION.base], {
  variants: {
    variant: {
      underline: 'border-b border-[color:var(--taav-border-subtle)]',
      pill: 'rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface-muted)] p-[var(--taav-space-1)]',
      soft: 'rounded-[var(--taav-radius-md)] bg-[var(--taav-surface-soft)] p-[var(--taav-space-1)]',
      boxed: 'rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border)] p-[var(--taav-space-1)]',
    },
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col items-stretch',
    },
  },
  defaultVariants: { variant: 'underline', orientation: 'horizontal' },
});

export const taavTabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center gap-[var(--taav-space-2)] whitespace-nowrap px-[var(--taav-space-3)]',
    'text-[length:var(--taav-text-sm)] font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]',
    TAAV_INTERACTION.base,
    'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=active]:text-[var(--taav-tabs-selected-text)]',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[var(--taav-tabs-height-sm)] text-[length:var(--taav-text-xs)]',
        md: 'min-h-[var(--taav-tabs-height-md)]',
        lg: 'min-h-[var(--taav-tabs-height-lg)] text-[length:var(--taav-text-md)]',
      },
      variant: {
        underline:
          'rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--taav-tabs-indicator)]',
        pill: 'rounded-[var(--taav-radius-md)] data-[state=active]:bg-[var(--taav-tabs-selected-bg)] data-[state=active]:shadow-[var(--taav-shadow-sm)]',
        soft: 'rounded-[var(--taav-radius-md)] data-[state=active]:bg-[var(--taav-surface)] data-[state=active]:shadow-[var(--taav-shadow-sm)]',
        boxed:
          'rounded-[var(--taav-radius-sm)] data-[state=active]:bg-[var(--taav-tabs-selected-bg)] data-[state=active]:ring-1 data-[state=active]:ring-[color:var(--taav-brand-border)]',
      },
      tone: {
        brand: 'data-[state=active]:text-[var(--taav-brand-strong)]',
        neutral: 'data-[state=active]:text-[var(--taav-text-strong)] data-[state=active]:border-[color:var(--taav-neutral)]',
      },
    },
    defaultVariants: { size: 'md', variant: 'underline', tone: 'brand' },
  },
);

export const taavTabsContentClass = 'mt-[var(--taav-space-4)] focus-visible:outline-none';

const stepperStatusColor: Record<TaavStepStatus, string> = {
  complete: 'border-[color:var(--taav-stepper-complete)] bg-[var(--taav-success-muted)] text-[var(--taav-success-strong)]',
  current: 'border-[color:var(--taav-stepper-current)] bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)] ring-2 ring-[color:color-mix(in_srgb,var(--taav-brand)_20%,transparent)]',
  upcoming: 'border-[color:var(--taav-stepper-upcoming)] bg-[var(--taav-surface)] text-[var(--taav-text-muted)]',
  error: 'border-[color:var(--taav-stepper-error)] bg-[var(--taav-danger-muted)] text-[var(--taav-danger-strong)]',
  warning: 'border-[color:var(--taav-stepper-warning)] bg-[var(--taav-warning-muted)] text-[var(--taav-warning-strong)]',
};

export function getTaavStepperIndicatorClass(size: TaavStepperSize, status: TaavStepStatus): string {
  const sizeClass =
    size === 'sm'
      ? 'h-[var(--taav-stepper-size-sm)] w-[var(--taav-stepper-size-sm)] text-[length:var(--taav-text-2xs)]'
      : size === 'lg'
        ? 'h-[var(--taav-stepper-size-lg)] w-[var(--taav-stepper-size-lg)] text-[length:var(--taav-text-sm)]'
        : 'h-[var(--taav-stepper-size-md)] w-[var(--taav-stepper-size-md)] text-[length:var(--taav-text-xs)]';

  return [
    'inline-flex shrink-0 items-center justify-center rounded-full border border-solid font-black',
    sizeClass,
    stepperStatusColor[status],
  ].join(' ');
}

export function getTaavStepperConnectorClass(status: TaavStepStatus, orientation: TaavStepperOrientation): string {
  const color =
    status === 'complete'
      ? 'bg-[var(--taav-stepper-complete)]'
      : status === 'error'
        ? 'bg-[var(--taav-stepper-error)]'
        : status === 'warning'
          ? 'bg-[var(--taav-stepper-warning)]'
          : 'bg-[var(--taav-stepper-connector)]';

  return orientation === 'horizontal'
    ? `h-0.5 min-w-[var(--taav-space-8)] flex-1 ${color}`
    : `w-0.5 min-h-[var(--taav-space-6)] flex-1 ${color}`;
}
