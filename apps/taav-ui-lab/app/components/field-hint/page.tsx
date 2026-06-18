import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { TaavBadge, TaavFieldHint, TaavTooltip } from '@repo/ui/taav/primitives';
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
import { FIELD_HINT_PROPS } from '@/lib/docs/component-props';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;

export default function FieldHintDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'کامپوننت‌ها', href: '/components' },
        { label: 'راهنمای فیلد' },
      ]}
    >
      <DocPageHeader
        eyebrow="Primitive"
        title="TaavFieldHint"
        description="بلوک راهنما، اطلاعات، موفقیت، هشدار یا خطا کنار فیلدهای فرم."
        importCode={`import { TaavFieldHint } from '@repo/ui';`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavFieldHint tone="info" title="راهنما" icon={<Info className="h-4 w-4" />}>
            شماره موبایل باید با 09 شروع شود.
          </TaavFieldHint>
        </DocPreview>
        <DocCodeBlock>{`<TaavFieldHint tone="info" title="راهنما" icon={<Info />}>...</TaavFieldHint>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Tones">
        <DocPreview>
          <div className="grid gap-3">
            {tones.map((tone) => (
              <TaavFieldHint
                key={tone}
                tone={tone}
                title={tone}
                icon={
                  tone === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : tone === 'danger' || tone === 'warning' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )
                }
              >
                پیام نمونه برای tone={tone}
              </TaavFieldHint>
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={FIELD_HINT_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Gap', value: 'var(--taav-field-hint-gap)' },
            { label: 'Padding md', value: 'var(--taav-field-hint-padding-md)' },
            { label: 'Radius', value: 'var(--taav-field-hint-radius)' },
            { label: 'Font md', value: 'var(--taav-text-sm)' },
          ]}
        />
        <TaavTooltip content="FieldHint جایگزین validation logic نیست">
          <TaavBadge tone="info" variant="outline" iconStart={<Info className="h-3 w-3" />}>
            helper only
          </TaavBadge>
        </TaavTooltip>
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'از role=note برای پیام‌های تکمیلی استفاده می‌شود.',
            'برای خطا، title کوتاه و children توضیحی باشد.',
            'در VahedYek زیر فیلدهای حساس مالی از tone=warning استفاده کنید.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['tone را مطابق نوع پیام انتخاب کنید']}
          dontItems={['این کامپوننت را جایگزین validation logic نکنید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
