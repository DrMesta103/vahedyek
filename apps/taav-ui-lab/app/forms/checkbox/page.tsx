'use client';

import { TaavCheckbox } from '@repo/ui/taav/forms';
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
import { CHECKBOX_PROPS } from '@/lib/docs/component-props';

export default function CheckboxDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms', href: '/forms' }, { label: 'چک‌باکس' }]}>
      <DocPageHeader
        eyebrow="Form Control"
        title="TaavCheckbox"
        description="چک‌باکس native با label/description استاندارد — برای consent، multi-select و bulk actions."
        importCode={`import { TaavCheckbox } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavCheckbox label="قوانین را می‌پذیرم" description="مطالعه قرارداد الزامی است." defaultChecked />
        </DocPreview>
        <DocCodeBlock>{`<TaavCheckbox label="قوانین را می‌پذیرم" defaultChecked />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Sizes & tones">
        <DocPreview>
          <div className="grid gap-3">
            <TaavCheckbox size="sm" label="sm / brand" defaultChecked />
            <TaavCheckbox size="md" tone="success" label="success tone" defaultChecked />
            <TaavCheckbox size="lg" tone="warning" label="warning tone" defaultChecked />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid gap-3">
            <TaavCheckbox indeterminate label="indeterminate" />
            <TaavCheckbox invalid label="invalid" />
            <TaavCheckbox disabled label="disabled" defaultChecked />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={CHECKBOX_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Size md', value: 'var(--taav-control-size-md)' },
            { label: 'Radius', value: 'var(--taav-checkbox-radius)' },
            { label: 'Focus', value: 'var(--taav-control-focus-ring)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['input native + label مرتبط', 'indeterminate برای select-all']}/>
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['از label/description داخلی استفاده کنید']} dontItems={['ردیف checkbox سفارشی در صفحات app نسازید']} />
      </DocSection>
    </DocPageShell>
  );
}
