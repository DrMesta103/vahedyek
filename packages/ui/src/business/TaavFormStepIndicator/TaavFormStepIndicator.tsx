'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavFormStep = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
};

export type TaavFormStepIndicatorProps = {
  steps: TaavFormStep[];
  activeStep?: string | number;
  defaultActiveStep?: string | number;
  completedSteps?: string[];
  intro?: ReactNode;
  onStepChange?: (stepId: string, index: number) => void;
  clickable?: boolean;
  disabled?: boolean;
  themeMode?: 'auto' | 'light' | 'dark';
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'onChange'>;

function resolveIndex(value: string | number | undefined, steps: TaavFormStep[], fallback: number) {
  if (typeof value === 'number') return Math.max(0, Math.min(value, steps.length - 1));
  if (typeof value === 'string') {
    const index = steps.findIndex((step) => step.id === value);
    if (index >= 0) return index;
  }
  return fallback;
}

export function TaavFormStepIndicator({
  steps,
  activeStep,
  defaultActiveStep = 0,
  completedSteps = [],
  intro,
  onStepChange,
  clickable = false,
  disabled = false,
  themeMode = 'auto',
  className,
  ...rest
}: TaavFormStepIndicatorProps) {
  const activeIndex = resolveIndex(activeStep ?? defaultActiveStep, steps, 0);
  const isControlled = activeStep !== undefined;

  const handleStepClick = (step: TaavFormStep, index: number) => {
    if (disabled || !clickable) return;
    onStepChange?.(step.id, index);
  };

  return (
    <nav {...rest} dir="rtl" aria-label="مراحل فرم" data-taav-form-step-indicator data-theme-mode={themeMode} data-disabled={disabled || undefined} className={cn('w-full border-b border-[var(--taav-form-step-divider)] px-[20px] pb-[14px] pt-[18px] text-right', disabled ? 'opacity-60' : '', className)}>
      {intro ? <p className="m-0 text-center text-[13px] leading-6 text-[var(--taav-form-step-intro)]">{intro}</p> : null}
      <ol role="list" className={cn('mx-auto mt-[14px] grid max-w-[420px] items-start', steps.length === 2 ? 'grid-cols-2' : '')}>
        {steps.map((step, index) => {
          const complete = completedSteps.includes(step.id) || index < activeIndex;
          const current = index === activeIndex;
          const stepContent = (
            <>
              <span className={cn('inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border text-[14px] font-normal transition-colors', complete ? 'border-[var(--taav-form-step-complete-border)] bg-[var(--taav-form-step-complete-bg)] text-[var(--taav-form-step-complete-text)]' : current ? 'border-[var(--taav-form-step-active)] bg-[var(--taav-form-step-active-bg)] text-[var(--taav-form-step-active-text)]' : 'border-[var(--taav-form-step-inactive-border)] bg-transparent text-[var(--taav-form-step-inactive-text)]')}>
                {complete ? <Check className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden="true" /> : index + 1}
              </span>
              <span className={cn('mt-[5px] text-[13px] leading-5 transition-colors', current || complete ? 'text-[var(--taav-form-step-label-active)]' : 'text-[var(--taav-form-step-label-inactive)]')}>{step.label}</span>
              {step.description ? <span className="sr-only">{step.description}</span> : null}
            </>
          );
          return (
            <li key={step.id} className="flex justify-center text-center">
              {clickable ? <button type="button" aria-current={current ? 'step' : undefined} aria-label={`مرحله ${index + 1}: ${step.label}`} onClick={() => handleStepClick(step, index)} disabled={disabled} className="flex min-w-[100px] flex-col items-center rounded-lg px-3 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]">{stepContent}</button> : <div aria-current={current ? 'step' : undefined} className="flex min-w-[100px] flex-col items-center px-3 pb-1">{stepContent}</div>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
