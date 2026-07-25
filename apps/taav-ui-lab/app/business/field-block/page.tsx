'use client';

import { useState } from 'react';
import { TaavChoiceChipGroup, TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import { TaavCard } from '@repo/ui/taav/primitives';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { FieldBlockThemePreview, FieldBlockUsageGallery, ScreenshotLikeBusinessForm } from '@/components/lab/FieldBlockShowcase';
import { FIELD_BLOCK_PROPS } from '@/lib/docs/component-props';

const companyTypeOptions = [
  { label: 'شرکت سهامی خاص', value: 'private-joint-stock' },
  { label: 'شرکت سهامی عام', value: 'public-joint-stock' },
  { label: 'شرکت با مسئولیت محدود', value: 'limited-liability' },
  { label: 'شرکت تضامنی', value: 'partnership' },
  { label: 'شرکت تعاونی', value: 'cooperative' },
];

export default function BusinessFieldBlockDocPage() {
  const [businessType, setBusinessType] = useState('private-joint-stock');

  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'field' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavFieldBlock"
        description="الگوی فیلد کسب‌وکاری استاندارد DastRanj و VahedYek — label بالای کنترل، متن راهنمای ثابت زیر فیلد، و اولویت بصری روشن برای خطا و وضعیت."
        importCode={`import { TaavFieldBlock, TaavInput, TaavChoiceChipGroup } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="تعریف Field Tooltip">
        <TaavCard variant="soft" padding="md" radius="lg">
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
            در TaavUI، <code className="lab-code">tooltip</code> برای <strong>متن راهنمای همیشه‌نمایان زیر فیلد</strong> استفاده
            می‌شود؛ نه tooltip شناور، نه آیکن راهنما، و نه hover interaction.
          </p>
        </TaavCard>
      </DocSection>

      <DocSection title="انتخاب محدود کسب‌وکار">
        <TaavCard variant="soft" padding="md" radius="lg">
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
            برای انتخاب‌های محدود و قابل مشاهده، از Choice Chip استفاده می‌شود؛ نه Dropdown. این باعث می‌شود گزینه‌ها سریع‌تر دیده
            و انتخاب شوند. از <code className="lab-code">TaavSelect</code> فقط برای لیست‌های بلند، پویا، یا گزینه‌هایی که جا نمی‌شوند
            استفاده کنید.
          </p>
        </TaavCard>
      </DocSection>

      <DocSection title="Screenshot-like RTL demo" description="چیدمان مرجع برای فرم‌های دو ستونه کسب‌وکار در VahedYek و DastRanj">
        <DocPreview label="RTL business form" meta="2-column">
          <ScreenshotLikeBusinessForm />
        </DocPreview>
        <DocCodeBlock>{`<TaavFieldBlock
  label="نام قانونی شرکت / کسب و کار"
  required
  tooltip="نام رسمی ثبت شده در اداره ثبت شرکت ها"
>
  <TaavInput size="lg" radius="xl" />
</TaavFieldBlock>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Required / Optional / Status states">
        <DocPreview label="Usage gallery">
          <FieldBlockUsageGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="Control variations">
        <DocPreview label="TaavInput / TaavChoiceChipGroup / TaavTextarea">
          <div dir="rtl" className="grid gap-6">
            <TaavFieldBlock
              label="نام مسئول"
              required
              tooltip="نام و نام خانوادگی نماینده پاسخ‌گو را وارد کنید."
              htmlFor="manager-name"
            >
              <TaavInput id="manager-name" radius="xl" />
            </TaavFieldBlock>

            <TaavFieldBlock
              label="نوع کسب‌وکار"
              tooltip="نوع ساختار حقوقی کسب‌وکار را انتخاب کنید."
            >
              <TaavChoiceChipGroup
                ariaLabel="نوع کسب‌وکار"
                options={companyTypeOptions}
                value={businessType}
                onValueChange={(next) => setBusinessType(Array.isArray(next) ? next[0] ?? '' : next)}
                size="md"
                tone="brand"
                gap="md"
              />
            </TaavFieldBlock>

            <TaavFieldBlock
              label="توضیح تکمیلی"
              tooltip="اگر جزئیات بیشتری لازم است، این بخش بهترین محل برای درج آن است."
              error="توضیح تکمیلی باید حداقل ۲۰ کاراکتر باشد."
              htmlFor="extra-notes"
            >
              <TaavTextarea
                id="extra-notes"
                radius="xl"
                minRows={4}
                invalid
              />
            </TaavFieldBlock>
          </div>
        </DocPreview>
        <DocCodeBlock>{`<TaavFieldBlock
  label="نوع کسب‌وکار"
  tooltip="نوع ساختار حقوقی کسب‌وکار را انتخاب کنید."
>
  <TaavChoiceChipGroup
    ariaLabel="نوع کسب‌وکار"
    options={companyTypeOptions}
    value={businessType}
    onValueChange={setBusinessType}
    size="md"
    tone="brand"
  />
</TaavFieldBlock>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Light / Dark preview">
        <FieldBlockThemePreview />
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={FIELD_BLOCK_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Label', value: 'Start-aligned by default', hint: 'labelAlign → start | center | end' },
            { label: 'Support text', value: 'Always visible below control', hint: 'tooltip / hint / supportText' },
            { label: 'State priority', value: 'Support text first, feedback after', hint: 'error overrides warning/success tone' },
            { label: 'Limited choices', value: 'TaavChoiceChipGroup', hint: 'Prefer chips over TaavSelect for short business option sets' },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <DocGuidelines
          items={[
            'از htmlFor روی TaavFieldBlock و id روی کنترل استفاده کنید تا label به ورودی متصل بماند.',
            'برای TaavChoiceChipGroup، ariaLabel را پاس دهید تا گروه انتخاب بدون label مرئی قابل فهم باشد.',
            'متن راهنما و خطا از طریق aria-describedby به کنترل متصل می‌شوند وقتی child قابل اتصال باشد.',
            'ستاره الزامی تنها نشانه نیست؛ وضعیت required در API و semantic field حفظ می‌شود.',
            'اگر error دارید، invalid را هم به کنترل TaavInput/TaavTextarea بدهید تا state بصری یکدست بماند.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای فرم‌های کسب‌وکاری با label بالا و helper ثابت از TaavFieldBlock استفاده کنید.',
            'برای انتخاب‌های محدود (نوع شرکت، نوع قرارداد، وضعیت ساده) از TaavChoiceChipGroup داخل FieldBlock استفاده کنید.',
            'tooltip را برای متن راهنمای ثابت زیر فیلد نگه دارید.',
            'برای پیام اعتبارسنجی از error استفاده کنید تا tone و hierarchy استاندارد بماند.',
          ]}
          dontItems={[
            'برای این الگو از TaavTooltip شناور یا آیکن tooltip استفاده نکنید.',
            'Dropdown را به‌عنوان الگوی پیش‌فرض برای انتخاب‌های محدود کسب‌وکار در FieldBlock نشان ندهید.',
            'ستاره قرمز را به‌صورت دستی کنار label ننویسید.',
            'layout محلی label / input / helper با Tailwind صفحه‌ای نسازید وقتی TaavFieldBlock کافی است.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
