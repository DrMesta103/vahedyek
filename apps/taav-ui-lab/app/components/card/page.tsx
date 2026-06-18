import { Info } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard, TaavTooltip } from '@repo/ui/taav/primitives';
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
import { CARD_PROPS } from '@/lib/docs/component-props';

const variants = ['elevated', 'outlined', 'soft', 'ghost'] as const;

export default function CardDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'کامپوننت‌ها', href: '/components' },
        { label: 'کارت' },
      ]}
    >
      <DocPageHeader
        eyebrow="Primitive"
        title="TaavCard"
        description="سطح استاندارد برای گروه‌بندی محتوا با variant، padding و radius کنترل‌شده."
        importCode={`import { TaavCard } from '@repo/ui';`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavCard
            header={<strong className="text-[length:var(--taav-text-sm)] font-black">عنوان کارت</strong>}
            footer={<TaavButton size="sm">اقدام</TaavButton>}
          >
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
              محتوای کارت با padding استاندارد md
            </p>
          </TaavCard>
        </DocPreview>
        <DocCodeBlock>{`<TaavCard header={...} footer={...}>محتوا</TaavCard>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-4 md:grid-cols-2">
            {variants.map((variant) => (
              <TaavCard key={variant} variant={variant} padding="md" radius="lg">
                <strong className="text-[length:var(--taav-text-sm)] font-black">{variant}</strong>
                <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">نمونه سطح</p>
              </TaavCard>
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid gap-4 md:grid-cols-2">
            <TaavCard interactive padding="md" radius="lg">
              <p className="m-0 text-[length:var(--taav-text-sm)]">کارت تعاملی</p>
            </TaavCard>
            <TaavCard selected padding="md" radius="lg">
              <p className="m-0 text-[length:var(--taav-text-sm)]">کارت انتخاب‌شده</p>
            </TaavCard>
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={CARD_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Padding md', value: 'var(--taav-card-padding-md)' },
            { label: 'Header py', value: 'var(--taav-card-header-py)' },
            { label: 'Radius lg', value: 'var(--taav-radius-lg)' },
            { label: 'Shadow elevated', value: 'var(--taav-shadow-sm)' },
          ]}
        />
        <TaavTooltip content="interactive کارت را با hover shadow و translate ملایم نشان می‌دهد">
          <TaavBadge tone="info" variant="outline" iconStart={<Info className="h-3 w-3" />}>
            interactive
          </TaavBadge>
        </TaavTooltip>
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'برای کارت قابل کلیک از interactive استفاده کنید و محتوای دکمه جداگانه نگذارید مگر لازم باشد.',
            'در DastRanj برای پنل‌های تنظیمات از variant=outlined استفاده کنید.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['header/footer را برای ساختار منظم استفاده کنید']}
          dontItems={['border-radius دلخواه خارج از radius prop ندهید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
