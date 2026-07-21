'use client';

import { useState, type ReactNode } from 'react';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

function LightPreview({ children }: { children: ReactNode }) {
  return <div data-taav-theme="light" className="bg-[#f5f7f8]">{children}</div>;
}

const REFERENCE_OPTIONS = [
  { label: 'مسکونی ۱', value: 'residential' },
  { label: 'تجاری ۰', value: 'commercial' },
  { label: 'اداری ۰', value: 'office' },
  { label: 'پارکینگ ۰', value: 'parking' },
  { label: 'انباری ۰', value: 'storage' },
  { label: 'رفاهی ۰', value: 'amenities' },
];

const CHIP_SIZE_CLASS = {
  sm: 'h-[32px] px-3 text-xs',
  md: 'h-[36px] px-[14px] text-[14px] leading-5',
  lg: 'h-10 px-4 text-sm',
} as const;

const COMPONENTS_CHOICE_CHIP_PROPS = [
  { name: 'options', type: 'TaavChoiceChipOption[]', required: true, description: 'لیست عنوان و مقدار چیپ‌ها' },
  { name: 'selectionMode', type: "'single' | 'multiple'", defaultValue: 'single', description: 'در single تیک و عدد نمایش داده نمی‌شود' },
  { name: 'value / defaultValue', type: 'string | string[]', description: 'مقدار انتخاب‌شده در حالت کنترل‌شده یا اولیه' },
  { name: 'onValueChange', type: '(value: string | string[]) => void', description: 'دریافت مقدار جدید انتخاب' },
  { name: 'label / description', type: 'ReactNode', description: 'عنوان و توضیح اختیاری گروه' },
  { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'غیرفعال‌کردن گروه یا گزینه' },
  { name: 'ariaLabel', type: 'string', description: 'برچسب دسترسی برای گروه بدون عنوان نمایشی' },
];

function ChipCheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0"><path d="M1.75 8.25 5.7 12 14.25 3.75" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function VisualChip({ title, number, selected, showCheck = false, size = 'md', onClick }: { title: string; number?: string; selected: boolean; showCheck?: boolean; size?: keyof typeof CHIP_SIZE_CLASS; onClick: () => void }) {
  return (
    <button
      type="button"
      dir="rtl"
      aria-pressed={selected}
      onClick={onClick}
      style={{ paddingInline: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px', fontWeight: 500 }}
      className={`inline-flex ${CHIP_SIZE_CLASS[size]} box-border flex-row items-center justify-center gap-1.5 rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80cbd3] ${selected ? 'border-[#b2dfe5] bg-[#b2dfe5] text-[#41565a]' : 'border-[#505050] bg-[#fafafa] text-[#4b4b4b]'}`}
    >
      {showCheck ? <ChipCheckIcon /> : null}
      {number ? <span>{number}</span> : null}
      <span>{title}</span>
    </button>
  );
}

function ReferenceChipRow({ selected = [], mode = 'multi', size = 'md' }: { selected?: string[]; mode?: 'single' | 'multi'; size?: keyof typeof CHIP_SIZE_CLASS }) {
  const [active, setActive] = useState(selected);
  return (
    <div dir="rtl" className="flex w-full flex-row flex-wrap justify-start gap-2 bg-[#f5f7f8] px-5 py-3">
      {REFERENCE_OPTIONS.map((option) => {
        const isSelected = active.includes(option.value);
        const title = option.label.replace(/ [۰-۹]+$/, '');
        const number = option.label.match(/[۰-۹]+$/)?.[0] ?? '۰';
        return <VisualChip key={option.value} title={title} number={mode === 'single' ? undefined : number} showCheck={mode === 'multi' && isSelected} selected={isSelected} size={size} onClick={() => setActive((current) => mode === 'single' ? [option.value] : isSelected ? current.filter((value) => value !== option.value) : [...current, option.value])} />;
      })}
    </div>
  );
}

export default function ComponentsChoiceChipDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Components', href: '/business-components' },
        { label: 'chips' },
      ]}
    >
      <DocPageHeader
        eyebrow="Components"
        title="chips"
        description="انتخاب محدود کسب‌وکار — نوع شرکت، نوع قرارداد، وضعیت ساده. جایگزین Dropdown برای گزینه‌های کوتاه و قابل مشاهده در فرم‌های DastRanj و VahedYek."
        importCode={`import { TaavChoiceChipGroup } from "@repo/ui/taav/forms";`}
      />
      <DocSection title="کامپوننت اصلی">
        <LightPreview>
          <ReferenceChipRow selected={['residential']} />
        </LightPreview>
      </DocSection>
      <DocSection title="Single selection">
        <LightPreview>
          <ReferenceChipRow selected={['residential']} mode="single" />
        </LightPreview>
      </DocSection>
      <DocApiNote />

      <DocSection title="توضیح الگو">
        <DocCodeBlock>{`تک‌انتخابی (single): پس‌زمینه فیروزه‌ای + بدون تیک
چندانتخابی (multiple): پس‌زمینه فیروزه‌ای + تیک سمت راست متن در RTL

label و description اختیاری هستند و داخل خود کامپوننت رندر می‌شوند.
برای tag/removable از TaavChip و برای وضعیت از TaavStatusBadge استفاده کنید.`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Multiple selection"><LightPreview><ReferenceChipRow selected={['residential', 'commercial', 'office', 'parking']} /></LightPreview></DocSection>
      <DocSection title="Props"><DocPropsTable rows={COMPONENTS_CHOICE_CHIP_PROPS} /></DocSection>
      <DocSection title="Design specs">
        <DocSpecGrid items={[
          { label: 'Shell', value: 'No outer border', hint: 'فقط چیپ‌ها border دارند' },
          { label: 'Gap md', value: 'var(--taav-choice-chip-group-gap-md)' },
          { label: 'Single select', value: 'Fill only — no check icon', hint: 'selectionMode="single"' },
          { label: 'Multiple select', value: 'Fill + check on right (RTL)', hint: 'selectionMode="multiple"' },
        ]} />
      </DocSection>
      <DocSection title="Accessibility notes">
        <DocGuidelines items={[
          'در حالت single از role="radiogroup" و role="radio" اعلام می‌شود.',
          'در حالت multiple هر چیپ با role="checkbox" اعلام می‌شود.',
          'اگر label مرئی دارید، ariaLabel لازم نیست؛ در غیر این صورت ariaLabel بدهید.',
          'description با aria-describedby به گروه متصل می‌شود.',
        ]} />
      </DocSection>
      <DocSection title="Do / Don\'t">
        <DocDoDont
          doItems={[
            'برای انتخاب‌های محدود کسب‌وکار فقط از TaavChoiceChipGroup استفاده کنید.',
            'برای عنوان و توضیح از props داخلی label و description استفاده کنید.',
            'داخل TaavFieldBlock می‌توانید label را به FieldBlock بسپارید و روی گروه ariaLabel بگذارید.',
          ]}
          dontItems={[
            'chips جداگانه نسازید — فقط TaavChoiceChipGroup export شده است.',
            'Dropdown را برای انتخاب‌های محدود و قابل مشاهده ترجیح ندهید.',
            'border کلی دور گروه اضافه نکنید.',
            'business logic یا validation داخل کامپوننت ننویسید.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
