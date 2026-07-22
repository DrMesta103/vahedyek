'use client';

import { TaavDetailsLink } from '@repo/ui/taav/business';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

function MainLinkPreview() {
  return (
    <div dir="rtl" data-taav-theme="light" className="flex flex-col items-center gap-4 bg-white p-4">
      <TaavDetailsLink href="#payment-settings" tone="brand" size="md" underline="always" unsafeClassName="!text-[#2563eb] hover:!text-[#2563eb]">
        جزئیات تنظیمات پیش‌پرداخت
      </TaavDetailsLink>
      <TaavDetailsLink tone="neutral" size="md" underline="always" disabled>
        جزئیات تنظیمات پیش‌پرداخت
      </TaavDetailsLink>
    </div>
  );
}

export default function ComponentsLinkDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'link' }]}>
      <DocPageHeader
        eyebrow="Components"
        title="link"
        description="لینک جزئیات برای هدایت کاربر به اطلاعات یا تنظیمات مرتبط."
        importCode={`import { TaavDetailsLink } from "@repo/ui/taav/business";`}
      />

      <DocSection title="کامپوننت اصلی">
        <MainLinkPreview />
      </DocSection>

      <DocApiNote />

      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavDetailsLink
  href="#payment-settings"
  tone="brand"
  size="md"
  underline="always"
>
  جزئیات تنظیمات پیش‌پرداخت
</TaavDetailsLink>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="ویژگی‌ها">
        <DocGuidelines items={[
          'لینک در حالت فعال با رنگ برند و زیرخط نمایش داده می‌شود.',
          'برای هدایت به صفحه یا بخش دیگر از href استفاده کنید.',
          'برای اقدام داخل همان صفحه می‌توان از onClick استفاده کرد.',
          'متن لینک باید هدف مقصد را به‌صورت واضح بیان کند.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
