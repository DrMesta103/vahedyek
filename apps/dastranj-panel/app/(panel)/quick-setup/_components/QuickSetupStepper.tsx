'use client';

import { Check } from 'lucide-react';
import type { QuickSetupStep } from './quick-setup.types';

type QuickSetupStepperProps = {
  steps: QuickSetupStep[];
  activeIndex: number;
  visitedSteps: Set<number>;
  isStepDone: (step: QuickSetupStep) => boolean;
  onStepSelect: (index: number) => void;
};

export function QuickSetupStepper({ steps, activeIndex, visitedSteps, isStepDone, onStepSelect }: QuickSetupStepperProps) {
  return (
    <section className="quick-setup-stepper-shell">
      <div className="quick-setup-stepper">
        {steps.map((step, index) => {
          const isDone = isStepDone(step);
          const isActive = index === activeIndex;
          const wasVisited = visitedSteps.has(index);
          const currentIsDone = isStepDone(steps[activeIndex]);
          const canAccess = isDone || isActive || wasVisited || (index === activeIndex + 1 && currentIsDone);

          let stepClass = 'quick-step';
          if (isDone && isActive) stepClass += ' is-done-active';
          else if (isDone) stepClass += ' is-done';
          else if (isActive) stepClass += ' is-current';
          else if (wasVisited) stepClass += ' is-visited';
          else stepClass += ' is-future';

          return (
            <button
              key={step.key}
              type="button"
              disabled={!canAccess}
              className={stepClass}
              onClick={() => onStepSelect(index)}
            >
              <span className="quick-step-badge">{isDone ? <Check size={16} /> : index + 1}</span>
              <strong>{step.title}</strong>
              <span>{step.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="quick-setup-stepper-footer">
        <strong>{steps[activeIndex].title}</strong>
        <span>{isStepDone(steps[activeIndex]) ? 'این مرحله تکمیل شده است.' : steps[activeIndex].subtitle}</span>
      </div>
    </section>
  );
}
