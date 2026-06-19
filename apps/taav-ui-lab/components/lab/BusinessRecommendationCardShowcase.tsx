'use client';

import {
  TaavActivationSwitch,
  TaavBusinessRecommendationCard,
  TaavDetailsLink,
} from '@repo/ui/taav/business';
import { useState } from 'react';
import { RECOMMENDATION_CARD_DEMO } from '@/lib/demo/business-recommendation-card-demo';

type PreviewFrameProps = {
  theme: 'light' | 'dark';
  children: React.ReactNode;
};

function PreviewFrame({ theme, children }: PreviewFrameProps) {
  const isDark = theme === 'dark';

  return (
    <div
      dir="rtl"
      data-taav-theme={isDark ? 'dark' : 'light'}
      className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]"
      style={{
        backgroundColor: isDark
          ? 'var(--taav-recommendation-card-preview-bg-dark)'
          : 'var(--taav-recommendation-card-preview-bg-light)',
        backgroundImage: isDark
          ? 'var(--taav-recommendation-card-preview-pattern-dark)'
          : 'var(--taav-recommendation-card-preview-pattern-light)',
      }}
    >
      <div className="flex justify-center p-5 md:p-8">{children}</div>
    </div>
  );
}

export function RecommendationCardScreenshotDemo() {
  const [activation, setActivation] = useState<'active' | 'inactive'>('active');

  return (
    <PreviewFrame theme="light">
      <TaavBusinessRecommendationCard
        title={RECOMMENDATION_CARD_DEMO.title}
        description={RECOMMENDATION_CARD_DEMO.description}
        detailsLabel={RECOMMENDATION_CARD_DEMO.detailsLabel}
        detailsHref="#"
        activationValue={activation}
        onActivationChange={setActivation}
        href="#"
        actionLabel="مشاهده تنظیمات"
        themeMode="light"
        width="wide"
      />
    </PreviewFrame>
  );
}

export function RecommendationCardInactiveDemo() {
  return (
    <PreviewFrame theme="light">
      <TaavBusinessRecommendationCard
        title={RECOMMENDATION_CARD_DEMO.title}
        description={RECOMMENDATION_CARD_DEMO.description}
        detailsLabel={RECOMMENDATION_CARD_DEMO.detailsLabel}
        onDetailsClick={() => undefined}
        defaultActivationValue="inactive"
        themeMode="light"
        width="wide"
      />
    </PreviewFrame>
  );
}

export function RecommendationCardDisabledDemo() {
  return (
    <PreviewFrame theme="light">
      <TaavBusinessRecommendationCard
        title={RECOMMENDATION_CARD_DEMO.title}
        description={RECOMMENDATION_CARD_DEMO.description}
        detailsLabel={RECOMMENDATION_CARD_DEMO.detailsLabel}
        detailsHref="#"
        defaultActivationValue="active"
        disabled
        themeMode="light"
        width="wide"
      />
    </PreviewFrame>
  );
}

export function RecommendationCardWithoutDetailsDemo() {
  return (
    <PreviewFrame theme="light">
      <TaavBusinessRecommendationCard
        title={RECOMMENDATION_CARD_DEMO.title}
        description={RECOMMENDATION_CARD_DEMO.description}
        defaultActivationValue="active"
        themeMode="light"
        width="wide"
      />
    </PreviewFrame>
  );
}

export function ActivationSwitchGallery() {
  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-4">
      <TaavActivationSwitch defaultValue="active" />
      <TaavActivationSwitch defaultValue="inactive" />
      <TaavActivationSwitch defaultValue="active" disabled />
    </div>
  );
}

export function DetailsLinkGallery() {
  return (
    <div dir="rtl" className="grid gap-3">
      <TaavDetailsLink href="#">جزئیات تنظیمات پیش‌پرداخت</TaavDetailsLink>
      <TaavDetailsLink onClick={() => undefined}>جزئیات با onClick</TaavDetailsLink>
      <TaavDetailsLink href="#" disabled>
        لینک غیرفعال
      </TaavDetailsLink>
    </div>
  );
}
