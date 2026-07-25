'use client';

import { TaavBusinessOwnerCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'title / description', type: 'ReactNode', description: 'سربرگ اطلاع‌رسانی کارت' },
  { name: 'ownerName / phone / secondaryText', type: 'ReactNode', description: 'اطلاعات مالک و شماره تماس' },
  { name: 'avatar', type: 'ReactNode', description: 'آواتار یا تصویر سفارشی مالک' },
  { name: 'onEdit / onCall', type: '() => void', description: 'عملیات ویرایش و تماس' },
  { name: 'phoneBadge', type: 'ReactNode', description: 'نشان وضعیت روی آیکون تماس' },
  { name: 'disabled / loading', type: 'boolean', description: 'حالت‌های غیرفعال و بارگذاری' },
  { name: 'themeMode', type: "'auto' | 'light' | 'dark'", defaultValue: 'auto', description: 'حالت نمایش کارت' },
];

export default function BusinessOwnerCardPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'کارت مالک کسب‌وکار' }]}>
        <DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="کارت مالک کسب‌وکار" description="نمایش اطلاعات مالک کسب‌وکار، توضیح راهنما و عملیات ویرایش و تماس." importCode={`import { TaavBusinessOwnerCard } from '@repo/ui/taav/business';`} />
        <DocSection title="نمونه‌های کارت">
          <div className="grid gap-6">
            <DocPreview label="حالت روشن"><TaavBusinessOwnerCard themeMode="light" ownerName="محمد کاظم عباسی" phone="+98 9334442511" phoneBadge="1" onEdit={() => undefined} onCall={() => undefined} /></DocPreview>
            <DocPreview label="حالت تیره"><TaavBusinessOwnerCard themeMode="dark" ownerName="محمد کاظم عباسی" phone="+98 9334442511" phoneBadge="1" onEdit={() => undefined} onCall={() => undefined} /></DocPreview>
          </div>
        </DocSection>
        <DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection>
      </DocPageShell>
    </div>
  );
}
