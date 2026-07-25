'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

type ExpandedRowProps = {
  value: string;
  defaultOpen?: boolean;
  resetValue?: string;
};

function ExpandedRow({ value, defaultOpen = false, resetValue = '- (ندارد) -' }: ExpandedRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      dir="rtl"
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setOpen((current) => !current);
        }
      }}
      className="group flex h-[44px] w-full cursor-pointer items-center justify-between rounded-[9px] border border-[#aebdca] bg-[#f4f5f6] px-3 text-right text-[14px] font-medium text-[#4f5357] shadow-none transition-colors hover:bg-[#eef1f3] hover:shadow-[0_1px_3px_rgba(79,83,87,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#89939a]"
    >
      <span>{open ? value : resetValue}</span>
      <span dir="ltr" className="flex shrink-0 items-center gap-1 text-[#56636c]">
        <ChevronDown className="h-4 w-4 transition-colors group-hover:text-[#4f5357]" strokeWidth={1.8} aria-hidden />
        {open ? (
          <button
            type="button"
            aria-label="بازگشت به حالت اصلی"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-[#e5e7e9] hover:text-[#4f5357] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#89939a]"
          >
            <X className="h-4 w-4" strokeWidth={1.7} aria-hidden />
          </button>
        ) : null}
      </span>
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
        <div dir="rtl" data-taav-theme="light" className="h-[60px] w-full bg-white p-2">
          <ExpandedRow value="قفسه بسپسیلی" defaultOpen />
        </div>
      </DocSection>

      <DocApiNote />

      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavExpanded
  value="قفسه بسپسیلی"
  defaultOpen={false}
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines items={[
          'وضعیت باز یا بسته با aria-expanded اعلام می‌شود.',
          'کل ردیف با صفحه‌کلید قابل فعال‌سازی است.',
          'در حالت باز، دکمه بستن جداگانه برای خروج سریع در دسترس است.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
