import { Info } from 'lucide-react';
import { TaavBadge, TaavButton, TaavTooltip } from '@repo/ui/taav/primitives';
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
import { BUTTON_PROPS } from '@/lib/docs/component-props';

const variants = ['primary', 'secondary', 'outline', 'ghost', 'soft', 'danger', 'success', 'warning', 'link'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function ButtonDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'کامپوننت‌ها', href: '/components' },
        { label: 'دکمه' },
      ]}
    >
      <DocPageHeader
        eyebrow="Primitive"
        title="TaavButton"
        description="دکمه استاندارد برای اقدامات اصلی، ثانویه و خطرناک. ارتفاع، padding و رنگ فقط از props رسمی کنترل می‌شوند."
        importCode={`import { TaavButton } from '@repo/ui';`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview" meta="dark/light via toggle">
          <TaavButton>ذخیره تغییرات</TaavButton>
        </DocPreview>
        <DocCodeBlock>{`<TaavButton>ذخیره تغییرات</TaavButton>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Variants">
        <DocPreview>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => (
              <TaavButton key={variant} variant={variant}>
                {variant}
              </TaavButton>
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Sizes">
        <DocPreview>
          <div className="flex flex-wrap items-center gap-3">
            {sizes.map((size) => (
              <TaavButton key={size} size={size}>
                {size}
              </TaavButton>
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="flex flex-wrap gap-3">
            <TaavButton loading>در حال بارگذاری</TaavButton>
            <TaavButton disabled>غیرفعال</TaavButton>
            <TaavButton width="icon" aria-label="تنظیمات" iconStart={<Info className="h-4 w-4" />} />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={BUTTON_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Height md', value: 'var(--taav-btn-height-md)', hint: '40px' },
            { label: 'Padding md', value: 'var(--taav-btn-px-md)', hint: '16px' },
            { label: 'Radius md', value: 'var(--taav-btn-radius-md)' },
            { label: 'Focus', value: 'var(--taav-focus-ring)' },
            { label: 'Motion', value: 'var(--taav-duration-normal)' },
            { label: 'Icon gap', value: 'var(--taav-btn-gap)' },
          ]}
        />
        <TaavTooltip content="در RTL، iconStart سمت راست و iconEnd سمت چپ نمایش داده می‌شود">
          <TaavBadge tone="info" variant="outline" iconStart={<Info className="h-3 w-3" />}>
            RTL icons
          </TaavBadge>
        </TaavTooltip>
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'برای دکمه آیکونی حتماً aria-label بگذارید.',
            'loading باعث aria-busy و غیرفعال شدن تعامل می‌شود.',
            'focus-visible با توکن focus-ring مشخص است.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'از variant و tone رسمی برای معنا استفاده کنید',
            'برای عملیات async از loading استفاده کنید',
            'در VahedYek برای CTA اصلی از primary + brand استفاده کنید',
          ]}
          dontItems={[
            'className دلخواه برای رنگ یا padding ندهید',
            'اندازه خارج از size تعریف نکنید',
            'danger را برای اقدامات غیر بحرانی استفاده نکنید',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
