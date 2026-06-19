'use client';

import { TaavBusinessIntroCard } from '@repo/ui/taav/business';
import { BUSINESS_INTRO_CARD_DEMO } from '@/lib/demo/business-intro-card-demo';

type BusinessIntroCardPreviewFrameProps = {
  theme: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
};

export function BusinessIntroCardPreviewFrame({ theme, children, className }: BusinessIntroCardPreviewFrameProps) {
  const isDark = theme === 'dark';

  return (
    <div
      dir="rtl"
      data-taav-theme={isDark ? 'dark' : 'light'}
      className={className}
      style={{
        backgroundColor: isDark
          ? 'var(--taav-business-intro-card-preview-bg-dark)'
          : 'var(--taav-business-intro-card-preview-bg-light)',
        backgroundImage: isDark
          ? 'var(--taav-business-intro-card-preview-pattern-dark)'
          : 'var(--taav-business-intro-card-preview-pattern-light)',
      }}
    >
      <div className="flex justify-center p-5 md:p-8">{children}</div>
    </div>
  );
}

export function BusinessIntroCardLightDemo() {
  return (
    <BusinessIntroCardPreviewFrame
      theme="light"
      className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]"
    >
      <TaavBusinessIntroCard
        title={BUSINESS_INTRO_CARD_DEMO.title}
        description={BUSINESS_INTRO_CARD_DEMO.description}
        themeMode="light"
        href="/business-settings/profile"
        actionLabel="بازگشت به تنظیمات کسب‌وکار"
      />
    </BusinessIntroCardPreviewFrame>
  );
}

export function BusinessIntroCardDarkDemo() {
  return (
    <BusinessIntroCardPreviewFrame
      theme="dark"
      className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]"
    >
      <TaavBusinessIntroCard
        title={BUSINESS_INTRO_CARD_DEMO.title}
        description={BUSINESS_INTRO_CARD_DEMO.description}
        themeMode="dark"
        href="/business-settings/profile"
        actionLabel="بازگشت به تنظیمات کسب‌وکار"
      />
    </BusinessIntroCardPreviewFrame>
  );
}

export function BusinessIntroCardWithActionDemo() {
  return (
    <div dir="rtl" className="flex justify-center">
      <TaavBusinessIntroCard
        title={BUSINESS_INTRO_CARD_DEMO.title}
        description={BUSINESS_INTRO_CARD_DEMO.description}
        onAction={() => undefined}
        actionLabel="بازگشت"
      />
    </div>
  );
}

export function BusinessIntroCardWithoutActionDemo() {
  return (
    <div dir="rtl" className="flex justify-center">
      <TaavBusinessIntroCard title={BUSINESS_INTRO_CARD_DEMO.title} description={BUSINESS_INTRO_CARD_DEMO.description} />
    </div>
  );
}

export function BusinessIntroCardLoadingDemo() {
  return (
    <div dir="rtl" className="flex justify-center">
      <TaavBusinessIntroCard
        title={BUSINESS_INTRO_CARD_DEMO.title}
        description={BUSINESS_INTRO_CARD_DEMO.description}
        loading
        href="/business-settings/profile"
        actionLabel="بازگشت"
      />
    </div>
  );
}

export function BusinessIntroCardDisabledActionDemo() {
  return (
    <div dir="rtl" className="flex justify-center">
      <TaavBusinessIntroCard
        title={BUSINESS_INTRO_CARD_DEMO.title}
        description={BUSINESS_INTRO_CARD_DEMO.description}
        disabled
        href="/business-settings/profile"
        actionLabel="بازگشت"
      />
    </div>
  );
}
