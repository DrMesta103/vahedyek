'use client';

import { useState } from 'react';
import { TaavFormStepIndicator, type TaavFormStep } from '@repo/ui/taav/business';
import { DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const steps: TaavFormStep[] = [
  { id: 'basic', label: 'اطلاعات پایه' },
  { id: 'additional', label: 'اطلاعات تکمیلی' },
];

const PROPS = [
  { name: 'steps', type: 'TaavFormStep[]', description: 'فهرست مراحل فرم' },
  { name: 'activeStep / defaultActiveStep', type: 'string | number', defaultValue: '0', description: 'مرحله فعال' },
  { name: 'completedSteps', type: 'string[]', description: 'مراحل تکمیل‌شده برای نمایش تیک' },
  { name: 'intro', type: 'ReactNode', description: 'توضیح بالای نشانگر' },
  { name: 'clickable / onStepChange', type: 'boolean / function', description: 'امکان جابه‌جایی بین مراحل' },
  { name: 'disabled', type: 'boolean', description: 'غیرفعال‌سازی نشانگر' },
];

function LightStepperPreview() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <TaavFormStepIndicator
      themeMode="light"
      steps={steps}
      activeStep={activeStep}
      completedSteps={activeStep > 0 ? ['basic'] : []}
      clickable
      onStepChange={(_, index) => setActiveStep(index)}
      intro="در این بخش می‌توانید اطلاعات مالک را ویرایش کنید."
    />
  );
}

export default function ComponentsStepperPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell
        breadcrumbs={[
          { label: 'خانه', href: '/' },
          { label: 'Components', href: '/business-components' },
          { label: 'stepper' },
        ]}
      >
        <DocPageHeader
          eyebrow="Components"
          title="stepper"
          description="نمایش مرحله فعال، مراحل تکمیل‌شده و مراحل بعدی فرم در تم روشن."
          importCode={`import { TaavFormStepIndicator } from '@repo/ui/taav/business';`}
        />

        <DocSection title="کامپوننت اصلی">
          <div data-taav-theme="light" className="w-full bg-white p-4 text-[#4f5357]">
            <LightStepperPreview />
          </div>
        </DocSection>

        <DocSection title="مرحله دوم فعال">
          <div data-taav-theme="light" className="w-full bg-white p-4 text-[#4f5357]">
            <TaavFormStepIndicator
              themeMode="light"
              steps={steps}
              activeStep="additional"
              completedSteps={['basic']}
              intro="در این بخش می‌توانید اطلاعات تکمیلی مالک کسب‌وکار را وارد کنید."
            />
          </div>
        </DocSection>

        <DocSection title="ویژگی‌های کامپوننت">
          <DocPropsTable rows={PROPS} />
        </DocSection>
      </DocPageShell>
    </div>
  );
}
