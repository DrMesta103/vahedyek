'use client';

import { ChartNoAxesCombined, CircleDollarSign, Percent, SlidersHorizontal, UserRoundCog, WalletCards, CalendarDays } from 'lucide-react';
import { TaavBusinessIconChoiceGroup } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const items = [
  { value: 'regular', label: 'اقساط منظم', icon: <CalendarDays className="h-6 w-6" /> },
  { value: 'irregular', label: 'اقساط نامنظم', icon: <SlidersHorizontal className="h-6 w-6" /> },
  { value: 'progress', label: 'اقساط مبتنی بر پیشرفت فیزیکی', icon: <ChartNoAxesCombined className="h-6 w-6" /> },
];
const fourItems = [
  { value: 'percentage', label: 'درصدی', icon: <Percent className="h-6 w-6" /> },
  { value: 'fixed', label: 'مبلغ ثابت', icon: <WalletCards className="h-6 w-6" /> },
  { value: 'mixed', label: 'ترکیبی', icon: <SlidersHorizontal className="h-6 w-6" /> },
  { value: 'manager', label: 'اختیار مدیر فروش', icon: <UserRoundCog className="h-6 w-6" /> },
];
const twoItems = [
  { value: 'regular', label: 'اقساط منظم', icon: <CalendarDays className="h-6 w-6" /> },
  { value: 'progress', label: 'اقساط مبتنی بر پیشرفت فیزیکی', icon: <ChartNoAxesCombined className="h-6 w-6" /> },
];
const PROPS = [
  { name: 'items', type: 'TaavBusinessIconOption[]', description: 'گزینه‌های آیکون‌دار و data-driven' },
  { name: 'selected / defaultSelected', type: 'string', description: 'گزینه‌ی انتخاب‌شده یا مقدار اولیه' },
  { name: 'onSelectedChange', type: '(value) => void', description: 'اعلام تغییر انتخاب به والد' },
  { name: 'themeMode', type: "'auto' | 'light' | 'dark'", description: 'تم کامپوننت' },
];

export default function IconOptionSelectorPage() {
  return <div dir="rtl" className="text-right"><DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'انتخاب گزینه آیکون‌دار' }]}><DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="انتخاب گزینه آیکون‌دار" description="انتخاب یک گزینه از میان گزینه‌های آیکون‌دار با پشتیبانی از ۲، ۳ و ۴ آیتم." importCode={`import { TaavBusinessIconChoiceGroup } from '@repo/ui/taav/business';`} /><DocSection title="نمونه‌های روشن"><div className="grid gap-6"><DocPreview label="۲ گزینه"><TaavBusinessIconChoiceGroup themeMode="light" items={twoItems} defaultSelected="regular" /></DocPreview><DocPreview label="۳ گزینه"><TaavBusinessIconChoiceGroup themeMode="light" items={items} defaultSelected="regular" /></DocPreview><DocPreview label="۴ گزینه"><TaavBusinessIconChoiceGroup themeMode="light" items={fourItems} defaultSelected="percentage" /></DocPreview></div></DocSection><DocSection title="حالت تیره"><DocPreview label="تم تیره"><TaavBusinessIconChoiceGroup themeMode="dark" items={fourItems} defaultSelected="fixed" /></DocPreview></DocSection><DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection></DocPageShell></div>;
}
