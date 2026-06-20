import { Check, Info } from 'lucide-react';
import { TaavBadge, TaavTooltip } from '@repo/ui/taav/primitives';
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
import { BADGE_PROPS } from '@/lib/docs/component-props';

const tones = ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'purple'] as const;
const variants = ['solid', 'soft', 'outline', 'subtle'] as const;

export default function BadgeDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'کامپوننت‌ها', href: '/components' },
        { label: 'نشان' },
      ]}
    >
      <DocPageHeader
        eyebrow="Primitive"
        title="TaavBadge"
        description="نشان وضعیت و chip با عرض استاندارد، تراز RTL و toneهای معنادار."
        importCode={`import { TaavBadge } from '@repo/ui';`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavBadge tone="brand" iconStart={<Check className="h-3 w-3" />}>
            تایید شده
          </TaavBadge>
        </DocPreview>
        <DocCodeBlock>{`<TaavBadge tone="brand" iconStart={<Check />}>تایید شده</TaavBadge>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Tones & Variants">
        <DocPreview>
          <div className="grid gap-4">
            {variants.map((variant) => (
              <div key={variant} className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <TaavBadge key={`${variant}-${tone}`} tone={tone} variant={variant}>
                    {tone}
                  </TaavBadge>
                ))}
              </div>
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Width modes">
        <DocPreview>
          <div className="grid max-w-md gap-3">
            <TaavBadge tone="brand">auto — عرض محتوا</TaavBadge>
            <TaavBadge width="fixed" tone="neutral">
              fixed — عرض ثابت
            </TaavBadge>
            <TaavBadge width="full" tone="info">
              full — تمام عرض
            </TaavBadge>
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={BADGE_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Height md', value: 'var(--taav-badge-height-md)' },
            { label: 'Fixed width', value: 'var(--taav-badge-width-fixed)' },
            { label: 'Radius pill', value: 'var(--taav-radius-pill)' },
            { label: 'Font', value: 'var(--taav-text-xs)' },
          ]}
        />
        <TaavTooltip content="fixed برای ستون‌های جدول با chip هم‌عرض مناسب است">
          <TaavBadge tone="info" variant="outline" iconStart={<Info className="h-3 w-3" />}>
            width: fixed
          </TaavBadge>
        </TaavTooltip>
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'متن badge باید کوتاه و معنادار باشد.',
            'رنگ به‌تنهایی نباید تنها نشانه وضعیت باشد — متن یا آیکون اضافه کنید.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['tone را مطابق وضعیت انتخاب کنید', 'برای جدول از width=fixed استفاده کنید']}
          dontItems={['رنگ سفارشی ندهید', 'متن طولانی داخل badge نگذارید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
