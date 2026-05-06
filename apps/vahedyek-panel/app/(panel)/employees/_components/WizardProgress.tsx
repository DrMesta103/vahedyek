'use client';

type WizardStep = 'mobile' | 'name' | 'email' | 'summary';

type Props = {
  currentStep: WizardStep;
};

const stepConfig = [
  { key: 'mobile', label: 'شماره موبایل', number: 1 },
  { key: 'name', label: 'نام و نام خانوادگی', number: 2 },
  { key: 'email', label: 'ایمیل', number: 3 },
  { key: 'summary', label: 'بررسی و ثبت', number: 4 },
];

export function WizardProgress({ currentStep }: Props) {
  const currentIndex = stepConfig.findIndex((s) => s.key === currentStep);

  return (
    <div className="wizard-progress">
      {stepConfig.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div
            key={step.key}
            className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isFuture ? 'future' : ''}`}
          >
            <div className="wizard-step-badge">{isCompleted ? '✓' : step.number}</div>
            <span className="wizard-step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
