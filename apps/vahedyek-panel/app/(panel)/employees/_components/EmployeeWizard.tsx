'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileStep } from './MobileStep';
import { NameStep } from './NameStep';
import { EmailStep } from './EmailStep';
import { SummaryStep, type EmployeeFormData } from './SummaryStep';
import { WizardProgress } from './WizardProgress';

type WizardStep = 'mobile' | 'name' | 'email' | 'summary';

export function EmployeeWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('mobile');
  const [formData, setFormData] = useState<EmployeeFormData>({
    mobile: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const steps: WizardStep[] = ['mobile', 'name', 'email', 'summary'];
  const currentStepIndex = steps.indexOf(currentStep);

  const updateFormData = (data: Partial<EmployeeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ثبت کارمند');
      }

      router.push('/employees');
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="employee-wizard">
      <WizardProgress currentStep={currentStep} />

      <div className="wizard-content">
        {currentStep === 'mobile' && (
          <MobileStep
            value={formData.mobile}
            onNext={(mobile) => {
              updateFormData({ mobile });
              nextStep();
            }}
          />
        )}

        {currentStep === 'name' && (
          <NameStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            onNext={(firstName, lastName) => {
              updateFormData({ firstName, lastName });
              nextStep();
            }}
            onBack={prevStep}
          />
        )}

        {currentStep === 'email' && (
          <EmailStep
            value={formData.email}
            onNext={(email) => {
              updateFormData({ email });
              nextStep();
            }}
            onBack={prevStep}
          />
        )}

        {currentStep === 'summary' && (
          <SummaryStep
            formData={formData}
            onEdit={(field) => goToStep(field as WizardStep)}
            onUpdateData={updateFormData}
            onBack={prevStep}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
