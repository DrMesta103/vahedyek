'use client';

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
import {
  ChoiceChipMultipleSelectionGallery,
  ChoiceChipScreenshotDemo,
  ChoiceChipSingleSelectionGallery,
  ChoiceChipSizeGallery,
  ChoiceChipStateGallery,
  ChoiceChipThemePreview,
  ChoiceChipToneGallery,
} from '@/components/lab/ChoiceChipShowcase';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { CHOICE_CHIP_GROUP_PROPS } from '@/lib/docs/component-props';

export default function BusinessChoiceChipDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'چیپ انتخابی' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavChoiceChipGroup"
        description="انتخاب محدود کسب‌وکار — نوع شرکت، نوع قرارداد، وضعیت ساده. جایگزین Dropdown برای گزینه‌های کوتاه و قابل مشاهده در فرم‌های DastRanj و VahedYek."
        importCode={`import { TaavChoiceChipGroup } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="توضیح الگو">
        <DocCodeBlock>{`تک‌انتخابی (single): پس‌زمینه فیروزه‌ای + بدون تیک
چندانتخابی (multiple): پس‌زمینه فیروزه‌ای + تیک سمت راست متن در RTL

label و description اختیاری هستند و داخل خود کامپوننت رندر می‌شوند.
برای tag/removable از TaavChip و برای وضعیت از TaavStatusBadge استفاده کنید.`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Screenshot-like RTL demo" description="نمای مرجع برای فرم‌های RTL">
        <DocPreview label="Persian company type" meta="pill / label + chips">
          <ChoiceChipScreenshotDemo />
        </DocPreview>
        <DocCodeBlock>{`<TaavChoiceChipGroup
  label="نوع شخصیت حقوقی"
  description="نوع ساختار حقوقی کسب‌وکار را انتخاب کنید."
  options={options}
  value={value}
  onValueChange={setValue}
  size="lg"
  tone="brand"
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Single selection">
        <DocPreview label="radiogroup / بدون تیک">
          <ChoiceChipSingleSelectionGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="Multiple selection">
        <DocPreview label="group / با تیک">
          <ChoiceChipMultipleSelectionGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview label="single / multiple / invalid">
          <ChoiceChipStateGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="Sizes">
        <DocPreview label="sm / md / lg">
          <ChoiceChipSizeGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="Tones">
        <DocPreview label="neutral / brand / semantic">
          <ChoiceChipToneGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="Light / Dark preview">
        <ChoiceChipThemePreview />
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={CHOICE_CHIP_GROUP_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Shell', value: 'No outer border', hint: 'فقط چیپ‌ها border دارند' },
            { label: 'Gap md', value: 'var(--taav-choice-chip-group-gap-md)' },
            { label: 'Single select', value: 'Fill only — no check icon', hint: 'selectionMode="single"' },
            { label: 'Multiple select', value: 'Fill + check on right (RTL)', hint: 'selectionMode="multiple"' },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility notes">
        <DocGuidelines
          items={[
            'در حالت single از role="radiogroup" و role="radio" استفاده می‌شود.',
            'در حالت multiple هر چیپ با role="checkbox" اعلام می‌شود.',
            'اگر label مرئی دارید، ariaLabel لازم نیست؛ در غیر این صورت ariaLabel بدهید.',
            'description با aria-describedby به گروه متصل می‌شود.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای انتخاب‌های محدود کسب‌وکار فقط از TaavChoiceChipGroup استفاده کنید.',
            'برای عنوان و توضیح از props داخلی label و description استفاده کنید.',
            'داخل TaavFieldBlock می‌توانید label را به FieldBlock بسپارید و روی گروه ariaLabel بگذارید.',
          ]}
          dontItems={[
            'چیپ انتخابی جداگانه نسازید — فقط TaavChoiceChipGroup export شده است.',
            'Dropdown را برای انتخاب‌های محدود و قابل مشاهده ترجیح ندهید.',
            'border کلی دور گروه اضافه نکنید.',
            'business logic یا validation داخل کامپوننت ننویسید.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
