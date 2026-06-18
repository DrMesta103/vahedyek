'use client';

import { Calendar, List } from 'lucide-react';
import { useState } from 'react';
import { TaavSegmentedControl } from '@repo/ui/taav/forms';
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
import { SEGMENTED_PROPS } from '@/lib/docs/component-props';

const VIEW_OPTIONS = [
  { label: 'لیست', value: 'list', icon: <List className="h-4 w-4" /> },
  { label: 'تقویم', value: 'calendar', icon: <Calendar className="h-4 w-4" /> },
];

export default function SegmentedControlDocPage() {
  const [value, setValue] = useState('list');

  return (
    <DocPageShell
      breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms', href: '/forms' }, { label: 'سگمنت' }]}
    >
      <DocPageHeader
        eyebrow="Form Control"
        title="TaavSegmentedControl"
        description="انتخاب compact از چند mode — فیلترها، yes/no، view switch در DastRanj/VahedYek."
        importCode={`import { TaavSegmentedControl } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="Controlled RTL example">
          <TaavSegmentedControl
            aria-label="نوع نمایش"
            value={value}
            onValueChange={setValue}
            options={VIEW_OPTIONS}
          />
        </DocPreview>
        <DocCodeBlock>{`<TaavSegmentedControl value={value} onValueChange={setValue} options={options} />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Variants & width">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavSegmentedControl variant="outline" defaultValue="a" options={[{ label: 'بله', value: 'a' }, { label: 'خیر', value: 'b' }]} />
            <TaavSegmentedControl width="full" size="lg" defaultValue="list" options={VIEW_OPTIONS} />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <TaavSegmentedControl disabled defaultValue="list" options={VIEW_OPTIONS} />
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={SEGMENTED_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Height md', value: 'var(--taav-segmented-height-md)' },
            { label: 'Selected bg', value: 'var(--taav-segmented-selected-bg)' },
            { label: 'Radius', value: 'var(--taav-segmented-radius)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['aria-label برای radiogroup بدون label visible', 'role=radio روی هر segment']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای ۲–۴ گزینه compact از segmented استفاده کنید']} dontItems={['ChoicePills legacy را برای UI TaavUI جدید کپی نکنید']} />
      </DocSection>
    </DocPageShell>
  );
}
