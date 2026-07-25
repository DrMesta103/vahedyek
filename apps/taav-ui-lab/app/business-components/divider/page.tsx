import { TaavDivider } from '@repo/ui/taav/primitives';
import { DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

export default function ComponentsDividerPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell
        breadcrumbs={[
          { label: 'خانه', href: '/' },
          { label: 'Components', href: '/business-components' },
          { label: 'divider' },
        ]}
      >
        <DocPageHeader
          eyebrow="Components"
          title="divider"
          description="جداکننده افقی برای تفکیک واضح بخش‌های فرم و محتوا."
          importCode={`import { TaavDivider } from '@repo/ui/taav/primitives';`}
        />

        <DocSection title="کامپوننت اصلی">
          <div data-taav-theme="light" className="w-full bg-[#fafafa] px-[11px] py-[10px]">
            <TaavDivider />
          </div>
        </DocSection>

      </DocPageShell>
    </div>
  );
}
