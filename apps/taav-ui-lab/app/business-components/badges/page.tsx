'use client';

import { Clock3, XCircle } from 'lucide-react';
import { TaavBadge } from '@repo/ui/taav/primitives';
import { DocPageHeader, DocPreview, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const USAGE_TYPE_TOKENS = [
  { label: 'مسکونی ۱', tone: 'info' as const, variant: 'outline' as const },
  { label: 'تجاری ۰', tone: 'neutral' as const, variant: 'outline' as const },
  { label: 'اداری ۰', tone: 'neutral' as const, variant: 'outline' as const },
  { label: 'پارکینگ ۰', tone: 'neutral' as const, variant: 'outline' as const },
  { label: 'انباری ۰', tone: 'neutral' as const, variant: 'outline' as const },
  { label: 'رفاهی ۰', tone: 'neutral' as const, variant: 'outline' as const },
];

const PROPERTY_FEATURE_TOKENS = [
  { label: 'اتاق خواب ۲', tone: 'warning' as const },
  { label: 'بالکن ۲', tone: 'brand' as const },
  { label: 'پارکینگ ۰', tone: 'info' as const },
  { label: 'انباری ۰', tone: 'purple' as const },
];

function BadgeTokenGallery() {
  return (
    <div dir="rtl" className="grid gap-5 bg-[var(--taav-bg)] p-5">
      <div className="flex flex-wrap justify-center gap-2">
        {USAGE_TYPE_TOKENS.map((token) => <TaavBadge key={token.label} tone={token.tone} variant={token.variant} size="md">{token.label}</TaavBadge>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {PROPERTY_FEATURE_TOKENS.map((token) => <TaavBadge key={token.label} tone={token.tone} variant="outline" size="md">{token.label}</TaavBadge>)}
      </div>
    </div>
  );
}

function SaleDeliveryStatusToken() {
  return (
    <div dir="rtl" className="flex flex-wrap justify-center gap-3 bg-[var(--taav-bg)] p-5">
      <TaavBadge tone="danger" variant="soft" size="md" iconStart={<XCircle className="h-4 w-4" aria-hidden="true" />} unsafeClassName="border-transparent">
        فروخته نشده
      </TaavBadge>
      <TaavBadge tone="warning" variant="soft" size="md" iconStart={<Clock3 className="h-4 w-4" aria-hidden="true" />} unsafeClassName="border-transparent">
        تحویل داده نشده
      </TaavBadge>
    </div>
  );
}

export default function BadgesPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'badges' }]}>
        <DocPageHeader
          eyebrow="Components"
          title="badges"
          description="Badge پایه برای نمایش وضعیت و Badge Token برای نمایش گزینه‌های تعاملی."
          importCode={`import { TaavBadge } from '@repo/ui/taav/primitives';`}
        />
        <DocSection title="کامپوننت اصلی">
          <div data-taav-theme="light">
          <DocPreview bare>
            <div dir="rtl" className="flex justify-center bg-[var(--taav-bg)] p-5">
              <TaavBadge tone="purple" variant="outline" size="md">انباری ۰</TaavBadge>
            </div>
          </DocPreview>
          </div>
        </DocSection>
        <DocSection title="توکن‌های Badge">
          <div data-taav-theme="light">
          <DocPreview bare>
            <BadgeTokenGallery />
          </DocPreview>
          </div>
        </DocSection>
        <DocSection title="توکن وضعیت فروش و تحویل">
          <div data-taav-theme="light">
          <DocPreview bare>
            <SaleDeliveryStatusToken />
          </DocPreview>
          </div>
        </DocSection>
        <DocSection title="قاعده‌ی فنی">
          <p className="m-0 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border)] bg-[var(--taav-surface)] p-4 text-sm leading-7 text-[var(--taav-text-body)]">
            Badge اصلی و تمام توکن‌های آن فقط وضعیت را نمایش می‌دهند و هیچ اکشن تعاملی ندارند. Badge پایه بدون آیکن است و در توکن‌های وضعیت، آیکن فقط نقش نشانه‌ی بصری وضعیت را دارد.
          </p>
        </DocSection>
      </DocPageShell>
    </div>
  );
}
