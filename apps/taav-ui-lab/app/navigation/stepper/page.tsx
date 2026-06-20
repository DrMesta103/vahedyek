'use client';

import { useState } from 'react';
import { FileText, Settings, Users } from 'lucide-react';
import { TaavStepper } from '@repo/ui/taav/navigation';
import {
  DocApiNote,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { STEPPER_PROPS } from '@/lib/docs/component-props';

const SETUP_STEPS = [
  { id: 'org', title: 'اطلاعات سازمان', description: 'نام و شناسه', icon: <Settings className="h-4 w-4" /> },
  { id: 'team', title: 'تیم', description: 'دعوت اعضا', icon: <Users className="h-4 w-4" /> },
  { id: 'contract', title: 'قرارداد پایه', description: 'انتخاب الگو', icon: <FileText className="h-4 w-4" /> },
];

export default function StepperDocPage() {
  const [current, setCurrent] = useState('team');

  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Navigation', href: '/navigation' }, { label: 'استپر' }]}>
      <DocPageHeader
        eyebrow="Navigation Primitive"
        title="TaavStepper"
        description="جریان چندمرحله‌ای visual shell — onboarding، draft contract، setup."
        importCode={`import { TaavStepper } from "@repo/ui/taav/navigation";`}
      />
      <DocApiNote />

      <DocSection title="Horizontal + progress">
        <DocPreview label="Controlled RTL example">
          <TaavStepper steps={SETUP_STEPS} currentStep={current} variant="icon" allowClick onStepClick={setCurrent} />
        </DocPreview>
      </DocSection>

      <DocSection title="Vertical">
        <DocPreview>
          <TaavStepper
            orientation="vertical"
            steps={[
              { id: '1', title: 'مرحله ۱', status: 'complete' as const },
              { id: '2', title: 'مرحله ۲', status: 'current' as const },
              { id: '3', title: 'مرحله ۳', status: 'upcoming' as const },
              { id: '4', title: 'خطا', status: 'error' as const },
            ]}
            showProgress={false}
          />
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={STEPPER_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Size md', value: 'var(--taav-stepper-size-md)' },
            { label: 'Current', value: 'var(--taav-stepper-current)' },
            { label: 'Connector', value: 'var(--taav-stepper-connector)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['aria-current=step روی step فعلی', 'فقط visual shell — logic در app/page']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['برای wizard/onboarding از TaavStepper استفاده کنید']}
          dontItems={['validation/submit logic داخل TaavStepper نگذارید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
