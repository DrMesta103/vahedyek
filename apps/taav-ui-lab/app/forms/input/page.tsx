'use client';

import { Mail, Search } from 'lucide-react';
import { TaavInput } from '@repo/ui/taav/forms';
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
import { INPUT_PROPS } from '@/lib/docs/component-props';

export default function InputDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Forms', href: '/forms' },
        { label: 'ورودی' },
      ]}
    >
      <DocPageHeader
        eyebrow="Form Primitive"
        title="TaavInput"
        description="ورودی متنی استاندارد با variant، tone، prefix/suffix و حالت‌های invalid/disabled/loading."
        importCode={`import { TaavInput } from "@repo/ui/taav";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavInput placeholder="نام کسب‌وکار" />
        </DocPreview>
        <DocCodeBlock>{`<TaavInput placeholder="نام کسب‌وکار" />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Sizes">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavInput size="sm" placeholder="sm" />
            <TaavInput size="md" placeholder="md" />
            <TaavInput size="lg" placeholder="lg" />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Variants">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            {(['default', 'filled', 'soft', 'ghost'] as const).map((variant) => (
              <TaavInput key={variant} variant={variant} placeholder={variant} />
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavInput invalid placeholder="invalid" />
            <TaavInput disabled defaultValue="disabled" />
            <TaavInput readOnly defaultValue="readOnly" />
            <TaavInput loading placeholder="loading" />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Icons & affixes">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavInput iconStart={<Search className="h-4 w-4" />} placeholder="جستجو" />
            <TaavInput iconEnd={<Mail className="h-4 w-4" />} placeholder="ایمیل" />
            <TaavInput prefix="+98" placeholder="موبایل" dir="ltr" />
            <TaavInput suffix="تومان" placeholder="مبلغ" />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={INPUT_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Height md', value: 'var(--taav-input-height-md)' },
            { label: 'Padding', value: 'var(--taav-input-px-md)' },
            { label: 'Focus', value: 'var(--taav-input-focus-ring)' },
            { label: 'Invalid', value: 'var(--taav-input-focus-ring-danger)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'همیشه label مرتبط با htmlFor/id داشته باشید — ترجیحاً via TaavFormField',
            'invalid باعث aria-invalid می‌شود',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['از TaavFormField برای label و error استفاده کنید']}
          dontItems={['inputClassName برای تغییر رنگ/ارتفاع ندهید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
