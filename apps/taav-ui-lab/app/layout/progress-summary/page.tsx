import { TaavProgressSummary } from '@repo/ui/taav/layout';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection, DocSpecGrid } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { PROGRESS_SUMMARY_PROPS } from '@/lib/docs/component-props';

const setupItems = [
  { id: '1', label: 'اطلاعات کسب‌وکار', status: 'done' as const, description: 'تکمیل شده' },
  { id: '2', label: 'حساب بانکی', status: 'current' as const, description: 'در حال تکمیل' },
  { id: '3', label: 'تنظیمات حقوق', status: 'pending' as const },
  { id: '4', label: 'دعوت کارمندان', status: 'pending' as const },
];

export default function ProgressSummaryDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'خلاصه پیشرفت' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavProgressSummary" description="پیشرفت setup، multi-step و document completion." importCode={`import { TaavProgressSummary } from '@repo/ui/taav/layout';`} />
      <DocSection title="Bar variant">
        <DocPreview label="RTL Preview">
          <TaavProgressSummary label="تکمیل راه‌اندازی" description="۴ مرحله" value={2} max={4} status="pending" tone="brand" />
        </DocPreview>
      </DocSection>
      <DocSection title="Ring variant">
        <DocPreview>
          <TaavProgressSummary variant="ring" percent={65} label="پیشرفت قرارداد" tone="success" size="lg" />
        </DocPreview>
      </DocSection>
      <DocSection title="List variant">
        <DocPreview>
          <TaavProgressSummary variant="list" items={setupItems} showPercent={false} label="مراحل setup VahedYek" />
        </DocPreview>
      </DocSection>
      <DocSection title="Compact">
        <DocPreview><TaavProgressSummary variant="compact" percent={40} tone="warning" showPercent /></DocPreview>
      </DocSection>
      <DocSection title="Loading"><DocPreview><TaavProgressSummary loading /></DocPreview></DocSection>
      <DocSection title="Props"><DocPropsTable rows={PROGRESS_SUMMARY_PROPS} /></DocSection>
      <DocSection title="Design Specs">
        <DocSpecGrid items={[
          { label: 'Bar height md', value: 'var(--taav-progress-height-md)' },
          { label: 'Fill brand', value: 'var(--taav-progress-fill-brand)' },
        ]} />
      </DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['percent/value/max را در page محاسبه کنید']} dontItems={['منطق business completion داخل ProgressSummary نگذارید']} />
      </DocSection>
    </DocPageShell>
  );
}
