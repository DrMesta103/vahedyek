'use client';

import { useState } from 'react';
import { TaavRadioGroup } from '@repo/ui/taav/forms';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { RADIO_PROPS } from '@/lib/docs/component-props';

const PLAN_OPTIONS = [
  { label: 'پایه', value: 'basic', description: 'برای تیم‌های کوچک' },
  { label: 'حرفه‌ای', value: 'pro', description: 'امکانات کامل' },
  { label: 'سازمانی', value: 'enterprise', description: 'پشتیبانی اختصاصی', disabled: true },
];

export default function RadioDocPage() {
  const [value, setValue] = useState('basic');

  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms', href: '/forms' }, { label: 'رادیو' }]}>
      <DocPageHeader
        eyebrow="Form Control"
        title="TaavRadio & TaavRadioGroup"
        description="انتخاب تک‌گزینه‌ای با چیدمان عمودی/افقی — مناسب wizard و setup flows."
        importCode={`import { TaavRadio, TaavRadioGroup } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="Controlled RTL example">
          <TaavRadioGroup name="plan" value={value} onValueChange={setValue} options={PLAN_OPTIONS} />
        </DocPreview>
        <DocCodeBlock>{`<TaavRadioGroup name="plan" value={value} onValueChange={setValue} options={options} />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Orientation">
        <DocPreview>
          <TaavRadioGroup
            name="mode-h"
            orientation="horizontal"
            defaultValue="a"
            options={[
              { label: 'روزانه', value: 'a' },
              { label: 'هفتگی', value: 'b' },
              { label: 'ماهانه', value: 'c' },
            ]}
          />
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <TaavRadioGroup name="invalid" invalid options={PLAN_OPTIONS.slice(0, 2)} defaultValue="basic" />
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={RADIO_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Size md', value: 'var(--taav-control-size-md)' },
            { label: 'Dot md', value: 'var(--taav-radio-dot-size-md)' },
            { label: 'Focus', value: 'var(--taav-control-focus-ring)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['role=radiogroup روی TaavRadioGroup', 'name مشترک برای keyboard navigation']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای لیست گزینه از TaavRadioGroup استفاده کنید']} dontItems={['radio row سفارشی در VahedYek نسازید']} />
      </DocSection>
    </DocPageShell>
  );
}
