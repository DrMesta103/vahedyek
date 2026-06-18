'use client';

import { useState } from 'react';
import { TaavButton } from '@repo/ui/taav/primitives';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
  TaavDialogTrigger,
} from '@repo/ui/taav/overlays';
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
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { DIALOG_PROPS } from '@/lib/docs/component-props';

export default function DialogDocPage() {
  const [name, setName] = useState('');

  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Overlays', href: '/overlays' }, { label: 'دیالوگ' }]}>
      <DocPageHeader
        eyebrow="Overlay Primitive"
        title="TaavDialog"
        description="Modal accessible با focus trap — تأیید، هشدار danger و فرم کوتاه."
        importCode={`import { TaavDialog, TaavDialogTrigger, TaavDialogContent } from "@repo/ui/taav/overlays";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavDialog>
            <TaavDialogTrigger asChild>
              <TaavButton>باز کردن دیالوگ</TaavButton>
            </TaavDialogTrigger>
            <TaavDialogContent size="md">
              <TaavDialogHeader>
                <TaavDialogTitle>ذخیره تغییرات؟</TaavDialogTitle>
                <TaavDialogDescription>تغییرات ذخیره‌نشده از بین می‌روند.</TaavDialogDescription>
              </TaavDialogHeader>
              <TaavDialogFooter>
                <TaavButton variant="outline" tone="neutral">
                  انصراف
                </TaavButton>
                <TaavButton>تأیید</TaavButton>
              </TaavDialogFooter>
            </TaavDialogContent>
          </TaavDialog>
        </DocPreview>
      </DocSection>

      <DocSection title="Danger confirmation">
        <DocPreview>
          <TaavDialog>
            <TaavDialogTrigger asChild>
              <TaavButton tone="danger" variant="soft">
                حذف رکورد
              </TaavButton>
            </TaavDialogTrigger>
            <TaavDialogContent size="sm" tone="danger">
              <TaavDialogHeader>
                <TaavDialogTitle>حذف دائمی</TaavDialogTitle>
                <TaavDialogDescription>این عمل قابل بازگشت نیست.</TaavDialogDescription>
              </TaavDialogHeader>
              <TaavDialogFooter>
                <TaavButton variant="outline" tone="neutral">
                  انصراف
                </TaavButton>
                <TaavButton tone="danger">حذف</TaavButton>
              </TaavDialogFooter>
            </TaavDialogContent>
          </TaavDialog>
        </DocPreview>
      </DocSection>

      <DocSection title="Form inside dialog">
        <DocPreview>
          <TaavDialog>
            <TaavDialogTrigger asChild>
              <TaavButton variant="secondary">ویرایش نام</TaavButton>
            </TaavDialogTrigger>
            <TaavDialogContent size="md">
              <TaavDialogHeader>
                <TaavDialogTitle>ویرایش نام کسب‌وکار</TaavDialogTitle>
              </TaavDialogHeader>
              <TaavFormField label="نام" htmlFor="dialog-name" required>
                <TaavInput id="dialog-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="شرکت تاو" />
              </TaavFormField>
              <TaavDialogFooter>
                <TaavButton>ذخیره</TaavButton>
              </TaavDialogFooter>
            </TaavDialogContent>
          </TaavDialog>
        </DocPreview>
        <DocCodeBlock>{`<TaavDialogContent size="md">
  <TaavFormField label="نام"><TaavInput /></TaavFormField>
</TaavDialogContent>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={DIALOG_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Width md', value: 'var(--taav-dialog-width-md)' },
            { label: 'Surface', value: 'var(--taav-overlay-surface)' },
            { label: 'Backdrop', value: 'var(--taav-overlay-backdrop)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['Title و Description الزامی برای screen reader', 'Escape و focus trap توسط Radix Dialog']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['برای confirmation و task کوتاه از TaavDialog استفاده کنید']}
          dontItems={['modal محلی با div fixed و z-index دستی نسازید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
