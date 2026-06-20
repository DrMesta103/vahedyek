'use client';

import { TaavSwitch } from '@repo/ui/taav/forms';
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
import { SWITCH_PROPS } from '@/lib/docs/component-props';

export default function SwitchDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms', href: '/forms' }, { label: 'سوییچ' }]}>
      <DocPageHeader
        eyebrow="Form Control"
        title="TaavSwitch"
        description="تنظیم boolean با track/thumb توکن‌محور — جایگزین switchهای محلی در settings panels."
        importCode={`import { TaavSwitch } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavSwitch
            label="اعلان ایمیل"
            description="خلاصه رویدادهای مهم را دریافت کنید."
            defaultChecked
          />
        </DocPreview>
        <DocCodeBlock>{`<TaavSwitch label="اعلان ایمیل" defaultChecked />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Sizes & tones">
        <DocPreview>
          <div className="grid gap-4">
            <TaavSwitch size="sm" tone="brand" label="sm brand" defaultChecked />
            <TaavSwitch size="md" tone="success" label="success" defaultChecked />
            <TaavSwitch size="lg" tone="danger" label="danger" />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid gap-4">
            <TaavSwitch invalid label="invalid" />
            <TaavSwitch disabled label="disabled" defaultChecked />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={SWITCH_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Track md', value: 'var(--taav-switch-track-w-md)' },
            { label: 'Thumb md', value: 'var(--taav-switch-thumb-md)' },
            { label: 'On brand', value: 'var(--taav-switch-track-on-brand)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['role=switch روی input', 'label/description استاندارد RTL']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای boolean settings از TaavSwitch استفاده کنید']} dontItems={['BusinessSwitch legacy را برای UI جدید تکرار نکنید']} />
      </DocSection>
    </DocPageShell>
  );
}
