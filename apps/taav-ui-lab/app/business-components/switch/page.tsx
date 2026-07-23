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

function CompactSwitchToken({ initialValue }: { initialValue: 'active' | 'inactive' }) {
  const [value, setValue] = useState(initialValue);
  const active = value === 'active';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'سوییچ فعال' : 'سوییچ غیرفعال'}
      onClick={() => setValue(active ? 'inactive' : 'active')}
      className="group relative inline-flex h-10 w-12 items-center justify-center rounded-[2px] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#89939a]"
    >
      <span className={`pointer-events-none absolute top-0 z-0 h-10 w-10 rounded-full bg-[#d9edef] opacity-0 transition-opacity group-hover:opacity-100 ${active ? 'left-0' : 'right-0'}`} aria-hidden />
      <span className={`relative block h-4 w-9 rounded-full transition-colors ${active ? 'bg-[#079ba0]' : 'bg-[#9da3aa]'}`}>
        <span className={`absolute top-[-2px] z-10 h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-transform ${active ? 'left-[-1px]' : 'right-[-1px]'}`} />
      </span>
    </button>
  );
}

function AmountModeToken() {
  const [value, setValue] = useState<'active' | 'inactive'>('active');

  return (
    <TaavActivationSwitch
      value={value}
      onValueChange={setValue}
      activeLabel="درصد"
      inactiveLabel="مبلغ ثابت"
      size="md"
      tone="brand"
      ariaLabel="شیوه نمایش مبلغ"
    />
  );
}

function PermissionStatusToken() {
  const [value, setValue] = useState<'active' | 'inactive'>('active');

  return (
    <div dir="ltr">
      <TaavActivationSwitch
        value={value}
        onValueChange={setValue}
        activeLabel="غیرمجاز"
        inactiveLabel="مجاز"
        size="md"
        tone="brand"
        ariaLabel="وضعیت مجوز"
      />
    </div>
  );
}

function ContractVisibilityToken() {
  const [value, setValue] = useState<'active' | 'inactive'>('active');

  return (
    <TaavActivationSwitch
      value={value}
      onValueChange={setValue}
      activeLabel="عدم نمایش قرارداد"
      inactiveLabel="نمایش قرارداد"
      size="md"
      tone="brand"
      ariaLabel="وضعیت نمایش قرارداد"
    />
  );
}

function YesNoToken() {
  const [value, setValue] = useState<'active' | 'inactive'>('active');

  return (
    <div dir="ltr">
      <TaavActivationSwitch
        value={value}
        onValueChange={setValue}
        activeLabel="خیر"
        inactiveLabel="بله"
        size="md"
        tone="brand"
        ariaLabel="انتخاب بله یا خیر"
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

      <DocSection title="توکن compact">
        <div dir="rtl" data-taav-theme="light" className="flex items-center justify-center bg-white p-3">
          <CompactSwitchToken initialValue="active" />
        </div>
      </DocSection>

      <DocSection title="ساختار توکن compact">
        <DocCodeBlock>{`<CompactSwitchToken value="active" />
<CompactSwitchToken value="inactive" />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="توکن amount-mode">
        <div dir="rtl" data-taav-theme="light" className="flex items-center justify-center bg-white p-3">
          <AmountModeToken />
        </div>
      </DocSection>

      <DocSection title="ساختار توکن amount-mode">
        <DocCodeBlock>{`<TaavActivationSwitch
  defaultValue="active"
  activeLabel="درصد"
  inactiveLabel="مبلغ ثابت"
  size="md"
  tone="brand"
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="توکن permission-status">
        <div dir="rtl" data-taav-theme="light" className="flex items-center justify-center bg-white p-3">
          <PermissionStatusToken />
        </div>
      </DocSection>

      <DocSection title="ساختار توکن permission-status">
        <DocCodeBlock>{`<TaavActivationSwitch
  defaultValue="active"
  activeLabel="غیرمجاز"
  inactiveLabel="مجاز"
  size="md"
  tone="brand"
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="توکن contract-visibility">
        <div dir="rtl" data-taav-theme="light" className="flex items-center justify-center bg-white p-3">
          <ContractVisibilityToken />
        </div>
      </DocSection>

      <DocSection title="ساختار توکن contract-visibility">
        <DocCodeBlock>{`<TaavActivationSwitch
  defaultValue="active"
  activeLabel="عدم نمایش قرارداد"
  inactiveLabel="نمایش قرارداد"
  size="md"
  tone="brand"
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="توکن yes-no">
        <div dir="rtl" data-taav-theme="light" className="flex items-center justify-center bg-white p-3">
          <YesNoToken />
        </div>
      </DocSection>

      <DocSection title="ساختار توکن yes-no">
        <DocCodeBlock>{`<TaavActivationSwitch
  defaultValue="active"
  activeLabel="خیر"
  inactiveLabel="بله"
  size="md"
  tone="brand"
/>`}</DocCodeBlock>
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
