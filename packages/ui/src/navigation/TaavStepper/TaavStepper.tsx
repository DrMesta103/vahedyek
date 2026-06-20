'use client';

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavStepperConnectorClass,
  getTaavStepperIndicatorClass,
  type TaavStepperOrientation,
  type TaavStepperSize,
  type TaavStepperVariant,
  type TaavStepStatus,
} from '../shared/navigation.variants';

export type TaavStep = {
  id: string;
  title: string;
  description?: string;
  status?: TaavStepStatus;
  icon?: ReactNode;
  disabled?: boolean;
};

export type TaavStepperProps = {
  steps: TaavStep[];
  currentStep?: string;
  orientation?: TaavStepperOrientation;
  size?: TaavStepperSize;
  variant?: TaavStepperVariant;
  tone?: 'brand' | 'neutral';
  showProgress?: boolean;
  allowClick?: boolean;
  onStepClick?: (stepId: string) => void;
  wrapperClassName?: string;
  contentClassName?: string;
};

function resolveStatus(step: TaavStep, index: number, currentIndex: number): TaavStepStatus {
  if (step.status) return step.status;
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'upcoming';
}

export function TaavStepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  variant = 'numbered',
  showProgress = true,
  allowClick = false,
  onStepClick,
  wrapperClassName,
  contentClassName,
}: TaavStepperProps) {
  const currentIndex = Math.max(0, currentStep ? steps.findIndex((step) => step.id === currentStep) : 0);
  const progress = steps.length > 1 ? Math.round((currentIndex / (steps.length - 1)) * 100) : 100;

  return (
    <div className={cn('grid gap-[var(--taav-space-4)]', wrapperClassName)} dir="rtl">
      {showProgress ? (
        <div className="h-1 overflow-hidden rounded-full bg-[var(--taav-surface-muted)]">
          <div
            className="h-full rounded-full bg-[var(--taav-brand)] transition-[width] duration-[var(--taav-duration-normal)]"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      ) : null}

      <ol
        className={cn(
          'm-0 flex list-none p-0',
          orientation === 'horizontal' ? 'flex-row items-start' : 'flex-col gap-[var(--taav-space-4)]',
          contentClassName,
        )}
      >
        {steps.map((step, index) => {
          const status = resolveStatus(step, index, currentIndex);
          const clickable = allowClick && !step.disabled && Boolean(onStepClick);
          const showCheck = status === 'complete' && variant !== 'icon';
          const indicatorContent = showCheck ? '✓' : variant === 'icon' && step.icon ? step.icon : index + 1;

          const stepNode = (
            <div
              className={cn(
                'flex min-w-0',
                orientation === 'horizontal' ? 'flex-col items-center gap-[var(--taav-space-2)] text-center' : 'flex-row items-start gap-[var(--taav-space-3)]',
              )}
            >
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(step.id)}
                className={cn(
                  getTaavStepperIndicatorClass(size, status),
                  clickable && 'cursor-pointer hover:brightness-105',
                  !clickable && 'cursor-default',
                  step.disabled && 'opacity-50',
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {indicatorContent}
              </button>
              <div className="min-w-0">
                <p className="m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">{step.title}</p>
                {step.description ? (
                  <p className="mt-1 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{step.description}</p>
                ) : null}
              </div>
            </div>
          );

          return (
            <li
              key={step.id}
              className={cn('flex min-w-0 items-start', orientation === 'horizontal' && 'flex-1 flex-row')}
            >
              {orientation === 'horizontal' && index > 0 ? (
                <div
                  className={cn('mt-[calc(var(--taav-stepper-size-md)/2)] flex-1', getTaavStepperConnectorClass('complete', orientation))}
                  aria-hidden
                />
              ) : null}
              <div className={orientation === 'horizontal' ? 'shrink-0' : 'w-full'}>{stepNode}</div>
              {orientation === 'vertical' && index < steps.length - 1 ? (
                <div className={cn('ms-[calc(var(--taav-stepper-size-md)/2)]', getTaavStepperConnectorClass(status, orientation))} aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
