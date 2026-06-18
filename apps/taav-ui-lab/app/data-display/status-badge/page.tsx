import { TaavStatusBadge } from '@repo/ui/taav/data-display';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { STATUS_BADGE_PROPS } from '@/lib/docs/component-props';

export default function StatusBadgeDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'وضعیت' }]}>
      <DocPageHeader eyebrow="Status" title="TaavStatusBadge" description="وضعیت استاندارد رکوردها — label فارسی پیش‌فرض." importCode={`import { TaavStatusBadge } from "@repo/ui/taav/data-display";`} />
      <DocSection title="Statuses">
        <DocPreview label="RTL Preview">
          <div className="flex flex-wrap gap-2">
            <TaavStatusBadge status="active" />
            <TaavStatusBadge status="pending" />
            <TaavStatusBadge status="rejected" />
            <TaavStatusBadge status="draft" variant="outline" />
            <TaavStatusBadge status="locked" withDot={false} label="قفل موقت" />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={STATUS_BADGE_PROPS} /></DocSection>
      <DocSection title="Do / Don't"><DocDoDont doItems={['در جدول/کارت/detail از TaavStatusBadge استفاده کنید']} dontItems={['status color mapping محلی در app نسازید']} /></DocSection>
    </DocPageShell>
  );
}
