'use client';

import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
import { useState, type ReactNode } from 'react';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { FIELD_BLOCK_PROPS } from '@/lib/docs/component-props';

function LightPreview({ children }: { children: ReactNode }) {
  return <div data-taav-theme="light" dir="rtl" className="bg-[#f7f8f8] p-4">{children}</div>;
}

function FieldSupport({ children, count, maxLength }: { children: ReactNode; count: number; maxLength: number }) {
  return (
    <span dir="rtl" className="flex items-center justify-between gap-3 text-[12px] leading-4 text-[#707070]">
      <span>{children}</span>
      <span dir="ltr" className="shrink-0 text-[#777]">{count.toLocaleString('fa-IR')} / {maxLength.toLocaleString('fa-IR')}</span>
    </span>
  );
}

function MainFieldBlockPreview() {
  const [taxFileNumber, setTaxFileNumber] = useState('');
  const [economicCode, setEconomicCode] = useState('');
  const onlyDigits = (value: string) => value.replace(/[^0-9۰-۹]/g, '');

  return (
    <div className="mx-auto grid w-full max-w-[672px] gap-4 md:grid-cols-2">
      <TaavFieldBlock
        label="شماره پرونده مالیاتی"
        htmlFor="components-tax-file-number"
        supportText={<FieldSupport count={taxFileNumber.length} maxLength={50}>شماره اختصاصی در اداره مالیات</FieldSupport>}
        wrapperClassName="group gap-2"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="-mt-1 text-[12px] text-[#707070]"
      >
        <TaavInput
          id="components-tax-file-number"
          value={taxFileNumber}
          onChange={(event) => setTaxFileNumber(onlyDigits(event.target.value).slice(0, 50))}
          inputMode="numeric"
          maxLength={50}
          size="md"
          radius="md"
          wrapperClassName="h-[37px] min-h-0 border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] focus-within:!border-[#009da8] group-focus-within:!shadow-none focus-within:!shadow-none"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
      <TaavFieldBlock
        label="کد اقتصادی"
        required
        htmlFor="components-economic-code"
        supportText={<FieldSupport count={economicCode.length} maxLength={12}>کد اقتصادی ۱۲ رقمی صادر شده توسط سازمان امور مالیاتی</FieldSupport>}
        wrapperClassName="group gap-2"
        labelClassName="text-[16px] font-semibold text-[#555] group-focus-within:text-[#009da8]"
        controlClassName="min-h-0"
        supportClassName="-mt-1 text-[12px] text-[#707070]"
      >
        <TaavInput
          id="components-economic-code"
          value={economicCode}
          onChange={(event) => setEconomicCode(onlyDigits(event.target.value).slice(0, 12))}
          inputMode="numeric"
          maxLength={12}
          size="md"
          radius="md"
          wrapperClassName="h-[37px] min-h-0 border-[#505050] bg-white !shadow-none group-focus-within:!border-[#009da8] focus-within:!border-[#009da8] group-focus-within:!shadow-none focus-within:!shadow-none"
          inputClassName="text-[14px] leading-5 text-[#555]"
        />
      </TaavFieldBlock>
    </div>
  );
}

export default function ComponentsFieldBlockDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'field' }]}> 
      <DocPageHeader
        eyebrow="Components"
        title="field"
        description="کامپوننت اصلی برای ساخت فیلدهای استاندارد کسب‌وکار با برچسب، کنترل و متن راهنما."
        importCode={`import { TaavFieldBlock } from "@repo/ui/taav/forms";`}
      />
      <DocSection title="کامپوننت اصلی">
        <LightPreview>
          <MainFieldBlockPreview />
        </LightPreview>
      </DocSection>
      <DocApiNote />
      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavFieldBlock
  label="کد اقتصادی"
  required
  htmlFor="economic-code"
  supportText="کد اقتصادی ۱۲ رقمی صادر شده توسط سازمان امور مالیاتی"
>
  <TaavInput id="economic-code" />
</TaavFieldBlock>`}</DocCodeBlock>
      </DocSection>
      <DocSection title="Props">
        <DocPropsTable rows={FIELD_BLOCK_PROPS} />
      </DocSection>
      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines items={[
          'برای اتصال برچسب به کنترل، htmlFor و id را با یک مقدار یکتا تنظیم کنید.',
          'متن راهنما از طریق aria-describedby به کنترل فرزند متصل می‌شود.',
          'required بودن فیلد با API و نشانه‌ی بصری ستاره نمایش داده می‌شود.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
