import { Settings } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import { DocDoDont, DocGuidelines, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { PAGE_HEADER_PROPS } from '@/lib/docs/component-props';

export default function PageHeaderDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'سرصفحه' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavPageHeader" description="سرصفحه یکپارچه برای settings، detail، report و create/edit." importCode={`import { TaavPageHeader } from '@repo/ui/taav/layout';`} />
      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavPageHeader
            eyebrow="VahedYek"
            title="گزارش حضور و غیاب"
            description="خلاصه ماه جاری با فیلتر واحد سازمانی."
            badge={<TaavBadge tone="info" variant="soft" size="sm">گزارش</TaavBadge>}
            status="active"
            meta={<span>آخرین بروزرسانی: ۱۴۰۴/۰۳/۲۰</span>}
            actions={<TaavButton size="sm">خروجی Excel</TaavButton>}
            secondaryActions={<TaavButton variant="outline" tone="neutral" size="sm">فیلتر</TaavButton>}
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-6">
            <TaavPageHeader variant="compact" size="sm" title="Compact header" description="برای صفحات فرم فشرده" />
            <TaavPageHeader variant="hero" size="lg" title="Hero header" icon={<Settings className="h-5 w-5" />} description="برای onboarding و setup" />
            <TaavPageHeader variant="plain" title="Plain header" bordered />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Loading">
        <DocPreview><TaavPageHeader loading /></DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={PAGE_HEADER_PROPS} /></DocSection>
      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['title در h1 رندر می‌شود', 'breadcrumbs در nav با aria-label="breadcrumb"', 'actions را با TaavButton بدهید']} />
      </DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['status را با prop status بدهید تا TaavStatusBadge استاندارد رندر شود']} dontItems={['header سفارشی با Tailwind arbitrary در هر صفحه نسازید']} />
      </DocSection>
    </DocPageShell>
  );
}
