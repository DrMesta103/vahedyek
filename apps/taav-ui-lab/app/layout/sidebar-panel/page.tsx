'use client';

import { FileText } from 'lucide-react';
import { TaavKeyValue } from '@repo/ui/taav/data-display';
import { TaavProgressSummary } from '@repo/ui/taav/layout';
import { TaavSidebarPanel } from '@repo/ui/taav/layout/interactive';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { SIDEBAR_PANEL_PROPS } from '@/lib/docs/component-props';

const summaryItems = [
  { id: '1', label: 'اطلاعات پایه', status: 'done' as const },
  { id: '2', label: 'شرایط حقوق', status: 'current' as const },
  { id: '3', label: 'امضا', status: 'pending' as const },
];

export default function SidebarPanelDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'پنل کناری' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavSidebarPanel" description="پنل خلاصه live report، help و secondary navigation." importCode={`import { TaavSidebarPanel } from '@repo/ui/taav/layout';`} />
      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavSidebarPanel
            title="خلاصه پیش‌نویس"
            description="وضعیت تکمیل قرارداد"
            icon={<FileText className="h-4 w-4" />}
            status="draft"
            sticky
            width="md"
          >
            <TaavProgressSummary variant="list" items={summaryItems} tone="brand" showPercent={false} />
            <TaavKeyValue
              items={[
                { label: 'حقوق پایه', value: '۴۵,۰۰۰,۰۰۰ ریال' },
                { label: 'نوع قرارداد', value: 'تمام‌وقت' },
              ]}
              size="sm"
              density="compact"
            />
          </TaavSidebarPanel>
        </DocPreview>
      </DocSection>
      <DocSection title="Variants & width">
        <DocPreview>
          <div className="grid gap-4 lg:grid-cols-3">
            {(['sm', 'md', 'lg'] as const).map((width) => (
              <TaavSidebarPanel key={width} variant="soft" width={width} title={`Width ${width}`}>
                <p className="m-0 text-[length:var(--taav-text-xs)]">پنل {width}</p>
              </TaavSidebarPanel>
            ))}
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Collapsible">
        <DocPreview>
          <TaavSidebarPanel title="پنل تاشو" collapsible defaultCollapsed={false}>
            <p className="m-0 text-[length:var(--taav-text-sm)]">محتوای panel</p>
          </TaavSidebarPanel>
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={SIDEBAR_PANEL_PROPS} /></DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای live report contract draft از sticky panel استفاده کنید']} dontItems={['محاسبات payroll داخل SidebarPanel انجام ندهید']} />
      </DocSection>
    </DocPageShell>
  );
}
