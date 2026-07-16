'use client';

import { useState } from 'react';
import { TaavCommunicationChannels, TaavCommunicationChannelsCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'channels', type: 'TaavCommunicationChannel[]', description: 'کانال‌های ارتباطی قابل نمایش' },
  { name: 'expandedId / defaultExpandedId', type: 'string', defaultValue: 'social', description: 'کانال بازشده' },
  { name: 'onExpandedChange', type: '(channelId) => void', description: 'رویداد باز و بسته شدن کانال' },
  { name: 'content / emptyText', type: 'ReactNode', description: 'محتوای کانال یا پیام حالت خالی' },
  { name: 'onBack / backLabel', type: 'function / string', description: 'دکمه‌ی بازگشت' },
  { name: 'disabled / themeMode', type: 'boolean / string', description: 'وضعیت غیرفعال و تم روشن/تیره' },
];

function InteractiveChannels() {
  const [expandedId, setExpandedId] = useState('social');
  return <TaavCommunicationChannels themeMode="light" expandedId={expandedId} onExpandedChange={setExpandedId} onBack={() => undefined} />;
}

export default function CommunicationChannelsPage() {
  return <div dir="rtl" className="text-right"><DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'اطلاعات تماس' }]}><DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="اطلاعات تماس" description="مدیریت اطلاعات تماس و راه‌های ارتباطی کسب‌وکار در قالبی راست‌چین." importCode={`import { TaavCommunicationChannels } from '@repo/ui/taav/business';`} /><DocSection title="نمونه‌ی تعاملی"><DocPreview label="حالت روشن"><InteractiveChannels /></DocPreview></DocSection><DocSection title="کارت راه‌های ارتباطی به‌عنوان زیرمجموعه"><div className="grid gap-6 justify-items-center"><DocPreview label="دفتر فنی"><TaavCommunicationChannelsCard className="min-h-[489px] w-[430px]" themeMode="light" primaryEnabled onPrimaryChange={() => undefined} /></DocPreview><DocPreview label="دفتر مرکزی سازمان"><TaavCommunicationChannelsCard className="min-h-[489px] w-[430px]" themeMode="light" title="دفتر مرکزی سازمان" location="شیراز دروازه قرآن" postalCode="۷۱۷۱۷۱۶۶۵" phoneBadge="۲" onPrimaryChange={() => undefined} /></DocPreview></div></DocSection><DocSection title="حالت تیره"><DocPreview label="تم تیره"><TaavCommunicationChannels themeMode="dark" onBack={() => undefined} /></DocPreview></DocSection><DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection></DocPageShell></div>;
}
