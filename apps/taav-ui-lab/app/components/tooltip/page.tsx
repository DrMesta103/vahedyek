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
import { TOOLTIP_PROPS } from '@/lib/docs/component-props';

export default function TooltipDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'کامپوننت‌ها', href: '/components' },
        { label: 'راهنمای شناور' },
      ]}
    >
      <DocPageHeader
        eyebrow="Primitive"
        title="TaavTooltip"
        description="راهنمای شناور دسترس‌پذیر مبتنی بر Radix با پشتیبانی RTL."
        importCode={`import { TaavTooltip, TaavTooltipProvider } from '@repo/ui';`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavTooltip content="این یک tooltip استاندارد TaavUI است">
            <TaavButton variant="outline" tone="neutral">
              نگه دارید
            </TaavButton>
          </TaavTooltip>
        </DocPreview>
        <DocCodeBlock>{`<TaavTooltip content="متن"><TaavButton>...</TaavButton></TaavTooltip>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Sides">
        <DocPreview>
          <div className="flex flex-wrap gap-4">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <TaavTooltip key={side} content={`side: ${side}`} side={side}>
                <TaavBadge tone="brand" variant="soft">
                  {side}
                </TaavBadge>
              </TaavTooltip>
            ))}
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={TOOLTIP_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Radius', value: 'var(--taav-tooltip-radius)' },
            { label: 'Padding', value: 'var(--taav-tooltip-padding-x/y)' },
            { label: 'Max width', value: 'var(--taav-tooltip-max-width)' },
            { label: 'Shadow', value: 'var(--taav-tooltip-shadow)' },
            { label: 'Z-index', value: 'var(--taav-z-tooltip)' },
          ]}
        />
        <TaavTooltip content="Provider را در root اپ یا Lab قرار دهید">
          <TaavBadge tone="info" variant="outline" iconStart={<Info className="h-3 w-3" />}>
            TaavTooltipProvider
          </TaavBadge>
        </TaavTooltip>
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines
          items={[
            'Tooltip جایگزین label اصلی نیست.',
            'متن باید کوتاه و تکمیلی باشد.',
            'Radix keyboard و focus management را مدیریت می‌کند.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['برای توضیح specs یا آیکون‌ها استفاده کنید']}
          dontItems={['متن طولانی یا فرم داخل tooltip نگذارید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
