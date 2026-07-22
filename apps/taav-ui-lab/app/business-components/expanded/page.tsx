'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

function MainExpandedPreview() {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" data-taav-theme="light" className="bg-white p-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-[44px] w-full items-center justify-between rounded-[9px] border border-[#aebdca] bg-[#f4f5f6] px-3 text-right text-[14px] font-medium text-[#4f5357] transition-colors hover:bg-[#eef1f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5e8da5]"
      >
        <span>- (ندارد) -</span>
        <ChevronDown className={`h-4 w-4 text-[#56636c] transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.8} aria-hidden />
      </button>
      {open ? <div className="border-x border-b border-[#aebdca] px-3 py-3 text-right text-[13px] text-[#61676c]">جزئیات این بخش در این قسمت نمایش داده می‌شود.</div> : null}
    </div>
  );
}

export default function ComponentsExpandedDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'expanded' }]}>
      <DocPageHeader
        eyebrow="Components"
        title="expanded"
        description="ردیف بازشونده برای نمایش یا پنهان‌کردن جزئیات مرتبط."
        importCode={`import { TaavExpanded } from "@repo/ui/taav";`}
      />

      <DocSection title="کامپوننت اصلی">
        <MainExpandedPreview />
      </DocSection>

      <DocApiNote />

      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavExpanded
  label="- (ندارد) -"
  defaultOpen={false}
>
  جزئیات این بخش
</TaavExpanded>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines items={[
          'وضعیت باز یا بسته با aria-expanded اعلام می‌شود.',
          'برای باز و بسته‌کردن ردیف از دکمه‌ی قابل استفاده با صفحه‌کلید استفاده کنید.',
          'متن عنوان باید خلاصه و بیانگر محتوای جزئیات باشد.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
