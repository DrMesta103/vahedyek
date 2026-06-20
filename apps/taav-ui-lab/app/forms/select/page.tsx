'use client';

import { Globe } from 'lucide-react';
import { TaavFormField, TaavSelect } from '@repo/ui/taav/forms';
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
import { SELECT_PROPS } from '@/lib/docs/component-props';

const CITY_OPTIONS = [
  { label: 'تهران', value: 'tehran' },
  { label: 'اصفهان', value: 'isfahan' },
  { label: 'شیراز', value: 'shiraz' },
];

export default function SelectDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms', href: '/forms' }, { label: 'انتخاب' }]}>
      <DocPageHeader
        eyebrow="Form Control"
        title="TaavSelect"
        description="انتخاب native با API کنترل‌شده — مناسب فیلترها و فرم‌های ساده DastRanj/VahedYek."
        importCode={`import { TaavSelect } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavFormField label="شهر" htmlFor="city-select" required>
            <TaavSelect id="city-select" placeholder="انتخاب شهر" options={CITY_OPTIONS} />
          </TaavFormField>
        </DocPreview>
        <DocCodeBlock>{`<TaavSelect placeholder="انتخاب شهر" options={options} />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Sizes & variants">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavSelect size="sm" defaultValue="tehran" options={CITY_OPTIONS} />
            <TaavSelect size="md" variant="filled" defaultValue="tehran" options={CITY_OPTIONS} />
            <TaavSelect size="lg" variant="soft" defaultValue="tehran" options={CITY_OPTIONS} />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavSelect invalid defaultValue="tehran" options={CITY_OPTIONS} />
            <TaavSelect disabled defaultValue="tehran" options={CITY_OPTIONS} />
            <TaavSelect iconStart={<Globe className="h-4 w-4" />} placeholder="کشور" options={CITY_OPTIONS} />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={SELECT_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Height md', value: 'var(--taav-input-height-md)' },
            { label: 'Chevron gap', value: 'var(--taav-select-icon-gap)' },
            { label: 'Focus', value: 'var(--taav-input-focus-ring)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['با TaavFormField و htmlFor/id label بدهید', 'invalid → aria-invalid']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['برای helper/error از TaavFormField استفاده کنید']}
          dontItems={['select محلی با Tailwind سفارشی نسازید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
