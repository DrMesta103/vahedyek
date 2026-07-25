'use client';

import { useState } from 'react';
import { TaavFormStepIndicator, type TaavFormStep } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const steps: TaavFormStep[] = [
  { id: 'basic', label: 'اطلاعات پایه' },
  { id: 'additional', label: 'اطلاعات تکمیلی' },
];

const PROPS = [
  { name: 'steps', type: 'TaavFormStep[]', description: 'فهرست مراحل فرم' },
  { name: 'activeStep / defaultActiveStep', type: 'string | number', defaultValue: '0', description: 'مرحله‌ی فعال' },
  { name: 'completedSteps', type: 'string[]', description: 'مراحل تکمیل‌شده برای نمایش تیک' },
  { name: 'intro', type: 'ReactNode', description: 'توضیح بالای نشانگر' },
  { name: 'clickable / onStepChange', type: 'boolean / function', description: 'امکان جابه‌جایی بین مراحل' },
  { name: 'disabled', type: 'boolean', description: 'غیرفعال‌سازی نشانگر' },
  { name: 'themeMode', type: "'auto' | 'light' | 'dark'", defaultValue: 'auto', description: 'حالت نمایش روشن یا تیره' },
];

function InteractiveStepDemo() {
  const [activeStep, setActiveStep] = useState(0);
  return <TaavFormStepIndicator themeMode="light" steps={steps} activeStep={activeStep} completedSteps={activeStep > 0 ? ['basic'] : []} clickable onStepChange={(_, index) => setActiveStep(index)} intro="در این بخش می‌توانید اطلاعات مالک را ویرایش کنید." />;
}

export default function FormStepIndicatorPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'Stepper مرحله‌ای' }]}>
        <DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="Stepper مرحله‌ای" description="نمایش مرحله‌ی فعلی و مراحل فرم‌های چندمرحله‌ای مانند ثبت مالک، خریدار و طرف قرارداد." importCode={`import { TaavFormStepIndicator } from '@repo/ui/taav/business';`} />
        <DocSection title="حالت‌های روشن"><DocPreview label="مرحله‌ی اول و دوم"><InteractiveStepDemo /></DocPreview></DocSection>
        <DocSection title="مرحله‌ی دوم فعال در حالت روشن"><DocPreview label="مرحله‌ی تکمیلی"><TaavFormStepIndicator themeMode="light" steps={steps} activeStep="additional" completedSteps={['basic']} intro="در این بخش می‌توانید اطلاعات تکمیلی مالک کسب‌وکار را وارد کنید." /></DocPreview></DocSection>
        <DocSection title="حالت تیره"><DocPreview label="تم تیره"><TaavFormStepIndicator themeMode="dark" steps={steps} activeStep="basic" intro="در این بخش می‌توانید اطلاعات مالک را ویرایش کنید." /></DocPreview></DocSection>
        <DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection>
      </DocPageShell>
    </div>
  );
}
