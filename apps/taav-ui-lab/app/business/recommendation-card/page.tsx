'use client';

import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import {
  ActivationSwitchGallery,
  DetailsLinkGallery,
  RecommendationCardDisabledDemo,
  RecommendationCardInactiveDemo,
  RecommendationCardScreenshotDemo,
  RecommendationCardWithoutDetailsDemo,
} from '@/components/lab/BusinessRecommendationCardShowcase';
import {
  ACTIVATION_SWITCH_PROPS,
  BUSINESS_RECOMMENDATION_CARD_PROPS,
  DETAILS_LINK_PROPS,
} from '@/lib/docs/component-props';

export default function BusinessRecommendationCardDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'کارت پیشنهاد تنظیمات' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavBusinessRecommendationCard"
        description="برای نمایش یک تنظیم پیشنهادی یا وضعیت قابل فعال‌سازی در صفحات بیزینسی — شامل TaavActivationSwitch و TaavDetailsLink."
        importCode={`import {
  TaavBusinessRecommendationCard,
  TaavActivationSwitch,
  TaavDetailsLink,
} from "@repo/ui/taav/business";`}
      />

      <DocSection title="نمونه نزدیک اسکرین‌شات">
        <DocPreview label="active · details link · action chevron">
          <RecommendationCardScreenshotDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="غیرفعال">
        <DocPreview label="activationValue=inactive">
          <RecommendationCardInactiveDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="بدون لینک جزئیات">
        <DocPreview label="no detailsLabel">
          <RecommendationCardWithoutDetailsDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="disabled">
        <DocPreview label="disabled card">
          <RecommendationCardDisabledDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="TaavActivationSwitch">
        <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          برای انتخاب دقیق بین فعال و غیرفعال؛ جایگزین checkbox خام در این الگو.
        </p>
        <DocPreview label="active / inactive / disabled">
          <ActivationSwitchGallery />
        </DocPreview>
        <DocPropsTable rows={ACTIVATION_SWITCH_PROPS} />
      </DocSection>

      <DocSection title="TaavDetailsLink">
        <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          لینک استاندارد برای جزئیات مرتبط با تنظیم.
        </p>
        <DocPreview label="details link variants">
          <DetailsLinkGallery />
        </DocPreview>
        <DocPropsTable rows={DETAILS_LINK_PROPS} />
      </DocSection>

      <DocSection title="Props — TaavBusinessRecommendationCard">
        <DocPropsTable rows={BUSINESS_RECOMMENDATION_CARD_PROPS} />
      </DocSection>
    </DocPageShell>
  );
}
