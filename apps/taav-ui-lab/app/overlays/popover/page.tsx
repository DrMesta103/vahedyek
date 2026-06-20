'use client';

import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavPopover, TaavPopoverContent, TaavPopoverTrigger } from '@repo/ui/taav/overlays';
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
import { POPOVER_PROPS } from '@/lib/docs/component-props';

export default function PopoverDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Overlays', href: '/overlays' }, { label: 'پاپ‌اور' }]}>
      <DocPageHeader
        eyebrow="Overlay Primitive"
        title="TaavPopover"
        description="پنل contextual فشرده — راهنما، quick actions، mini form."
        importCode={`import { TaavPopover, TaavPopoverTrigger, TaavPopoverContent } from "@repo/ui/taav/overlays";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavPopover>
            <TaavPopoverTrigger asChild>
              <TaavButton variant="outline" tone="neutral">
                راهنمای سریع
              </TaavButton>
            </TaavPopoverTrigger>
            <TaavPopoverContent size="md" side="bottom" align="start">
              <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)]">
                این فیلد در گزارش حقوق و بیمه استفاده می‌شود.
              </p>
            </TaavPopoverContent>
          </TaavPopover>
        </DocPreview>
      </DocSection>

      <DocSection title="Tones">
        <DocPreview>
          <TaavPopover>
            <TaavPopoverTrigger asChild>
              <TaavButton tone="warning" variant="soft">
                هشدار
              </TaavButton>
            </TaavPopoverTrigger>
            <TaavPopoverContent tone="warning" size="sm">
              <p className="m-0 text-[length:var(--taav-text-xs)]">تغییر این مقدار روی محاسبه اثر می‌گذارد.</p>
            </TaavPopoverContent>
          </TaavPopover>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={POPOVER_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Width md', value: 'var(--taav-popover-width-md)' },
            { label: 'Padding md', value: 'var(--taav-popover-padding-md)' },
            { label: 'Z-index', value: 'var(--taav-z-dropdown)' },
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای helper panel کوچک از Popover استفاده کنید']} dontItems={['Tooltip را جای dialog/popover نگذارید']} />
      </DocSection>
    </DocPageShell>
  );
}
