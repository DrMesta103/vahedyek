'use client';

import { useState } from 'react';
import { TaavFormField, TaavInput } from '@repo/ui/taav/forms';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { FORM_FIELD_PROPS } from '@/lib/docs/component-props';

export default function FormFieldDocPage() {
  const [value, setValue] = useState('');
  const error = value.length > 0 && value.length < 3 ? 'نام باید حداقل ۳ کاراکتر باشد.' : undefined;

  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Forms', href: '/forms' },
        { label: 'فیلد فرم' },
      ]}
    >
      <DocPageHeader
        eyebrow="Form Composition"
        title="TaavFormField"
        description="ترکیب label، description، control و message — بدون React Hook Form."
        importCode={`import { TaavFormField, TaavInput } from "@repo/ui/taav";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="Interactive RTL example">
          <TaavFormField
            label="نام کسب‌وکار"
            required
            htmlFor="business-name"
            description="این نام در اسناد و تنظیمات نمایش داده می‌شود."
            error={error}
          >
            <TaavInput
              id="business-name"
              placeholder="مثلاً شرکت تاو"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              invalid={Boolean(error)}
            />
          </TaavFormField>
        </DocPreview>
        <DocCodeBlock>{`<TaavFormField label="نام کسب‌وکار" required error={errors.name}>
  <TaavInput invalid={Boolean(errors.name)} />
</TaavFormField>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Optional field">
        <DocPreview>
          <TaavFormField label="نام مستعار" optional description="در صورت تمایل">
            <TaavInput placeholder="اختیاری" />
          </TaavFormField>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={FORM_FIELD_PROPS} />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'htmlFor روی label و id روی input باید match کنند',
            'error با role=alert در TaavFormMessage نمایش داده می‌شود',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['validation logic در app بماند — فقط UI از TaavUI']}
          dontItems={['React Hook Form در این فاز اضافه نکنید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
