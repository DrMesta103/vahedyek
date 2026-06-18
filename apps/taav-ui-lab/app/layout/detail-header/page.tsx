'use client';

import { User } from 'lucide-react';
import { TaavButton, TaavBadge } from '@repo/ui/taav/primitives';
import { TaavChip } from '@repo/ui/taav/data-display';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import { TaavDetailHeader } from '@repo/ui/taav/layout';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { DETAIL_HEADER_PROPS } from '@/lib/docs/component-props';

export default function DetailHeaderDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'سرصفحه جزئیات' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavDetailHeader" description="سرصفحه employee، contract، bank account و business profile." importCode={`import { TaavDetailHeader } from '@repo/ui/taav/layout';`} />
      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavDetailHeader
            variant="card"
            title="علی رضایی"
            subtitle="کارشناس منابع انسانی · واحد اداری"
            icon={<User className="h-6 w-6" />}
            status="active"
            meta={<><span>کد پرسنلی: ۱۰۲۴</span><span>شروع همکاری: ۱۴۰۱/۰۴/۱۰</span></>}
            tags={<><TaavChip tone="brand" size="sm">تمام‌وقت</TaavChip><TaavBadge tone="info" variant="subtle" size="sm">بیمه تأمین</TaavBadge></>}
            actions={<><TaavButton size="sm" variant="outline" tone="neutral">ویرایش</TaavButton><TaavButton size="sm">اقدام</TaavButton></>}
            tabs={
              <TaavTabs defaultValue="info">
                <TaavTabsList>
                  <TaavTabsTrigger value="info">اطلاعات</TaavTabsTrigger>
                  <TaavTabsTrigger value="contracts">قراردادها</TaavTabsTrigger>
                </TaavTabsList>
              </TaavTabs>
            }
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-6">
            <TaavDetailHeader variant="compact" title="Compact detail" status="draft" />
            <TaavDetailHeader variant="hero" title="Hero detail" subtitle="برای پروفایل برجسته" status="approved" />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Loading"><DocPreview><TaavDetailHeader loading /></DocPreview></DocSection>
      <DocSection title="Props"><DocPropsTable rows={DETAIL_HEADER_PROPS} /></DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['tabs را pass کنید اما routing را در parent مدیریت کنید']} dontItems={['منطق fetch/API داخل DetailHeader نگذارید']} />
      </DocSection>
    </DocPageShell>
  );
}
