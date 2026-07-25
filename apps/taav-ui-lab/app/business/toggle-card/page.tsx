'use client';

import { SlidersHorizontal } from 'lucide-react';
import { TaavBusinessToggleCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'title / description', type: 'ReactNode', description: 'عنوان و توضیح وضعیت' },
  { name: 'variant', type: "'simple' | 'action'", description: 'الگوی ساده یا عملیاتی کارت' },
  { name: 'checked / defaultChecked', type: 'boolean', description: 'وضعیت کنترل‌شده یا مقدار اولیه' },
  { name: 'onCheckedChange', type: '(checked) => void', description: 'اعلام تغییر وضعیت به والد' },
  { name: 'disabled / themeMode', type: 'boolean / string', description: 'وضعیت غیرفعال و تم کارت' },
];

export default function ToggleCardPage() {
  return <div dir="rtl" className="text-right"><DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'کارت وضعیت' }]}><DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="کارت وضعیت" description="کارت دوحالته برای فعال‌سازی یا غیرفعال‌سازی قابلیت‌های کسب‌وکار در دو الگوی ساده و عملیاتی." importCode={`import { TaavBusinessToggleCard } from '@repo/ui/taav/business';`} /><DocSection title="نمونه‌های روشن"><div className="grid gap-6"><DocPreview label="الگوی ساده"><TaavBusinessToggleCard themeMode="light" title="فعال کردن محاسبه مالیات برای هزینه‌های جانبی" description="در صورت فعال بودن، مالیات مشخص‌شده روی هزینه تشکیل پرونده اعمال می‌شود." defaultChecked /></DocPreview><DocPreview label="الگوی عملیاتی"><TaavBusinessToggleCard themeMode="light" variant="action" title="فعال‌سازی هزینه تشکیل پرونده" description="با فعال‌سازی این گزینه، هزینه‌های مربوط به امور اداری و تشکیل پرونده به مبلغ قرارداد اضافه می‌شود." icon={<SlidersHorizontal className="h-6 w-6" />} defaultChecked onAction={() => undefined} /></DocPreview></div></DocSection><DocSection title="حالت تیره"><div className="grid gap-6"><DocPreview label="ساده"><TaavBusinessToggleCard themeMode="dark" title="فعال کردن محاسبه مالیات برای هزینه‌های جانبی" description="در صورت فعال بودن، مالیات مشخص‌شده روی هزینه تشکیل پرونده اعمال می‌شود." /></DocPreview><DocPreview label="عملیاتی"><TaavBusinessToggleCard themeMode="dark" variant="action" title="فعال‌سازی هزینه تشکیل پرونده" description="با فعال‌سازی این گزینه، هزینه‌های مربوط به امور اداری و تشکیل پرونده به مبلغ قرارداد اضافه می‌شود." onAction={() => undefined} /></DocPreview></div></DocSection><DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection></DocPageShell></div>;
}
