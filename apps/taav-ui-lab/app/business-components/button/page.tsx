'use client';

import { TaavButton } from '@repo/ui/taav/primitives';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

function MainButtonPreview() {
  return (
    <div dir="rtl" data-taav-theme="light" className="flex min-h-[60px] w-full items-center justify-center bg-white p-2">
      <TaavButton
        width="auto"
        size="md"
        variant="primary"
        tone="brand"
        unsafeClassName="!h-[40px] !w-[299px] !rounded-[8px] !border-[#009c9f] !bg-[#009c9f] !text-white hover:!border-[#008b8e] hover:!bg-[#008b8e] hover:!shadow-[0_2px_6px_rgba(0,139,142,0.24)]"
      >
        ثبت فرایند
      </TaavButton>
    </div>
  );
}

export default function ComponentsButtonDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'button' }]}>
      <DocPageHeader
        eyebrow="Components"
        title="button"
        description="دکمه اصلی برای اجرای یک اقدام مشخص در جریان کاربر."
        importCode={`import { TaavButton } from "@repo/ui/taav/primitives";`}
      />

      <section className="lab-doc-section">
        <div className="bg-white p-2">
          <div className="lab-doc-section-head">
            <h2 className="!text-[#4f5357]">کامپوننت اصلی</h2>
          </div>
          <MainButtonPreview />
        </div>
      </section>

      <DocApiNote />

      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavButton
  width="auto"
  size="md"
  variant="primary"
  tone="brand"
  unsafeClassName="!h-[40px] !w-[299px] !rounded-[8px] !border-[#009c9f] !bg-[#009c9f] !text-white hover:!border-[#008b8e] hover:!bg-[#008b8e]"
>
  ثبت فرایند
</TaavButton>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines items={[
          'متن دکمه باید اقدام انجام‌شده را به‌صورت واضح بیان کند.',
          'دکمه با صفحه‌کلید و حالت focus-visible قابل استفاده است.',
          'برای عملیات زمان‌بر از وضعیت loading استفاده کنید.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
