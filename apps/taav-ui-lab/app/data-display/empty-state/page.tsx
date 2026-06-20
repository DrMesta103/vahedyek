import { Inbox } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { EMPTY_STATE_PROPS } from '@/lib/docs/component-props';

export default function EmptyStateDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'خالی' }]}>
      <DocPageHeader eyebrow="Empty State" title="TaavEmptyState" description="لیست/جدول/جستجو/setup خالی." importCode={`import { TaavEmptyState } from "@repo/ui/taav/data-display";`} />
      <DocSection title="استفاده پایه">
        <DocPreview>
          <TaavEmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="هنوز رکوردی ثبت نشده"
            description="اولین مورد را اضافه کنید."
            primaryAction={<TaavButton>افزودن</TaavButton>}
            secondaryAction={<TaavButton variant="outline" tone="neutral">راهنما</TaavButton>}
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Compact / search">
        <DocPreview>
          <TaavEmptyState variant="search" size="sm" title="نتیجه‌ای یافت نشد" description="عبارت جستجو را تغییر دهید." />
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={EMPTY_STATE_PROPS} /></DocSection>
      <DocSection title="Do / Don't"><DocDoDont doItems={['برای empty table/list از TaavEmptyState استفاده کنید']} dontItems={['empty UI سفارشی در هر صفحه نسازید']} /></DocSection>
    </DocPageShell>
  );
}
