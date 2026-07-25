'use client';

import { useState } from 'react';
import { TaavBusinessOwnershipCard, type TaavBusinessOwnershipValue } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'title / description', type: 'ReactNode', defaultValue: 'نوع مالکیت و اطلاعات پایه', description: 'عنوان و توضیح کارت' },
  { name: 'value / defaultValue', type: "'individual' | 'legal'", defaultValue: 'individual', description: 'مقدار کنترل‌شده یا اولیه' },
  { name: 'onValueChange', type: '(value) => void', description: 'رویداد تغییر نوع مالکیت' },
  { name: 'individualLabel / legalLabel', type: 'ReactNode', description: 'برچسب گزینه‌های حقیقی و حقوقی' },
  { name: 'onInfoClick', type: '() => void', description: 'رویداد دکمه‌ی اطلاعات' },
  { name: 'continueHref / onContinue', type: 'string / () => void', description: 'مسیر یا رویداد ادامه' },
  { name: 'disabled / loading', type: 'boolean', description: 'وضعیت غیرفعال یا بارگذاری' },
];

function OwnershipInteractiveDemo() {
  const [value, setValue] = useState<TaavBusinessOwnershipValue>('individual');
  return <TaavBusinessOwnershipCard value={value} onValueChange={setValue} onInfoClick={() => undefined} onContinue={() => undefined} />;
}

function OwnershipLegalDemo() {
  return <TaavBusinessOwnershipCard value="legal" onInfoClick={() => undefined} onContinue={() => undefined} />;
}

export default function BusinessOwnershipCardPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'کارت نوع مالکیت و اطلاعات پایه' }]}>
        <DocPageHeader
          eyebrow="کامپوننت‌های کسب‌وکار"
          title="کارت نوع مالکیت و اطلاعات پایه"
          description="انتخاب نوع مالکیت حقیقی یا حقوقی برای تکمیل اطلاعات پایه‌ی قرارداد."
          importCode={`import { TaavBusinessOwnershipCard } from '@repo/ui/taav/business';`}
        />
        <DocSection title="نمونه‌ی تعاملی"><DocPreview label="انتخاب نوع مالکیت"><OwnershipInteractiveDemo /></DocPreview></DocSection>
        <DocSection title="حالت حقوقی انتخاب‌شده"><DocPreview label="حقوقی"><OwnershipLegalDemo /></DocPreview></DocSection>
        <DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection>
      </DocPageShell>
    </div>
  );
}
