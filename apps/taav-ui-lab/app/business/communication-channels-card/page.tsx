'use client';

import { TaavCommunicationChannelsCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

// Keep the showcase module hot-reloadable when the shared UI package is rebuilt.

const PROPS = [
  { name: 'title / primaryLabel', type: 'ReactNode', description: 'عنوان کارت و سوییچ ارتباط اصلی' },
  { name: 'primaryEnabled / onPrimaryChange', type: 'boolean / function', description: 'وضعیت و رویداد سوییچ' },
  { name: 'location / postalCode / mapLabel / onMapClick', type: 'ReactNode / ReactNode / string / function', description: 'مکان، کدپستی و دسترسی نقشه' },
  { name: 'items', type: 'TaavCommunicationChannelsCardItem[]', description: 'فهرست راه‌های ارتباطی' },
  { name: 'phoneBadge', type: 'ReactNode', description: 'نشان روی آیکون تلفن همراه' },
  { name: 'disabled / loading / themeMode', type: 'boolean / boolean / string', description: 'وضعیت‌ها و تم کارت' },
];

export default function CommunicationChannelsCardPage() {
  return <div dir="rtl" className="text-right"><DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'کارت راه‌های ارتباطی' }]}><DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="کارت راه‌های ارتباطی" description="کارت مستقل مدیریت راه‌های ارتباطی دفتر فنی و دفتر مرکزی سازمان." importCode={`import { TaavCommunicationChannelsCard } from '@repo/ui/taav/business';`} /><DocSection title="نمونه‌های روشن"><div className="grid gap-6 justify-items-center"><DocPreview label="دفتر فنی"><TaavCommunicationChannelsCard className="min-h-[489px] w-[430px]" themeMode="light" primaryEnabled onPrimaryChange={() => undefined} /></DocPreview><DocPreview label="دفتر مرکزی سازمان"><TaavCommunicationChannelsCard className="min-h-[489px] w-[430px]" themeMode="light" title="دفتر مرکزی سازمان" location="شیراز دروازه قرآن" postalCode="۷۱۷۱۷۱۶۶۵" phoneBadge="۲" onPrimaryChange={() => undefined} /></DocPreview></div></DocSection><DocSection title="حالت تیره"><DocPreview label="تم تیره"><TaavCommunicationChannelsCard className="min-h-[489px] w-[430px]" themeMode="dark" primaryEnabled onPrimaryChange={() => undefined} /></DocPreview></DocSection><DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection></DocPageShell></div>;
}
