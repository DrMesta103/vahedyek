'use client';

import { useState } from 'react';
import { TaavActivationSwitch } from '@repo/ui/taav/business';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const SWITCH_PROPS = [
  { name: 'value / defaultValue', type: "'active' | 'inactive'", description: 'مقدار کنترل‌شده یا مقدار اولیه سوییچ' },
  { name: 'onValueChange', type: "(value) => void", description: 'تابع دریافت تغییر وضعیت' },
  { name: 'activeLabel / inactiveLabel', type: 'ReactNode', description: 'عنوان وضعیت فعال و غیرفعال' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'اندازه سوییچ' },
  { name: 'tone', type: "'brand' | 'success' | 'warning' | 'danger' | 'neutral'", description: 'رنگ وضعیت انتخاب‌شده' },
];

function MainSwitchPreview() {
  const [value, setValue] = useState<'active' | 'inactive'>('active');

  return (
    <div dir="rtl" data-taav-theme="light" className="flex justify-center bg-white p-4">
      <TaavActivationSwitch
        value={value}
        onValueChange={setValue}
        activeLabel="فعال"
        inactiveLabel="غیرفعال"
        size="md"
        tone="brand"
        ariaLabel="وضعیت تنظیمات"
      />
    </div>
  );
}

export default function ComponentsSwitchDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'switch' }]}>
      <DocPageHeader
        eyebrow="Components"
        title="switch"
        description="کامپوننت دوحالته برای فعال‌سازی یا غیرفعال‌سازی تنظیمات در رابط کاربری روشن."
        importCode={`import { TaavActivationSwitch } from "@repo/ui/taav/business";`}
      />

      <DocSection title="کامپوننت اصلی">
        <MainSwitchPreview />
      </DocSection>

      <DocApiNote />

      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavActivationSwitch
  defaultValue="active"
  activeLabel="فعال"
  inactiveLabel="غیرفعال"
  onValueChange={setValue}
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Props">
        <div className="overflow-x-auto rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-elevated)]">
          <table className="lab-props-table">
            <thead><tr><th>Prop</th><th>نوع</th><th>توضیح</th></tr></thead>
            <tbody>{SWITCH_PROPS.map((prop) => <tr key={prop.name}><td>{prop.name}</td><td>{prop.type}</td><td>{prop.description}</td></tr>)}</tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines items={[
          'سوییچ با نقش radiogroup و radio، وضعیت فعال یا غیرفعال را برای فناوری‌های کمکی اعلام می‌کند.',
          'برای هر سوییچ ariaLabel معنادار تنظیم کنید.',
          'برای کنترل فرم، مقدار را با value و onValueChange مدیریت کنید.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
