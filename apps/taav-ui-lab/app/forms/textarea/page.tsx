'use client';

import { TaavTextarea } from '@repo/ui/taav/forms';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { TEXTAREA_PROPS } from '@/lib/docs/component-props';

export default function TextareaDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Forms', href: '/forms' },
        { label: 'متن چندخطی' },
      ]}
    >
      <DocPageHeader
        eyebrow="Form Primitive"
        title="TaavTextarea"
        description="ورودی چندخطی با token-based sizing و شمارنده اختیاری."
        importCode={`import { TaavTextarea } from "@repo/ui/taav";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavTextarea placeholder="توضیحات..." rows={4} />
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavTextarea invalid placeholder="invalid" />
            <TaavTextarea disabled defaultValue="disabled" />
            <TaavTextarea readOnly defaultValue="readOnly content" />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Character count">
        <DocPreview>
          <TaavTextarea
            placeholder="حداکثر 120 کاراکتر"
            maxLength={120}
            showCount
            defaultValue="نمونه متن فارسی"
          />
        </DocPreview>
        <DocCodeBlock>{`<TaavTextarea maxLength={120} showCount />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={TEXTAREA_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Min height md', value: 'var(--taav-textarea-min-height-md)' },
            { label: 'Padding', value: 'var(--taav-input-px-md)' },
            { label: 'Line height', value: 'var(--taav-leading-relaxed)' },
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['showCount را فقط با maxLength فعال کنید']}
          dontItems={['textarea خام با className محلی نسازید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
