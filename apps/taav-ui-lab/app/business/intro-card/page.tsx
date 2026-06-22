'use client';

import {
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import {
  BusinessIntroCardDarkDemo,
  BusinessIntroCardDisabledActionDemo,
  BusinessIntroCardHubDemo,
  BusinessIntroCardLightDemo,
  BusinessIntroCardLoadingDemo,
  BusinessIntroCardWithActionDemo,
  BusinessIntroCardWithoutActionDemo,
} from '@/components/lab/BusinessIntroCardShowcase';
import { BUSINESS_INTRO_CARD_PROPS } from '@/lib/docs/component-props';

function StateNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
      {children}
    </p>
  );
}

export default function BusinessIntroCardDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'کارت معرفی بخش' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavBusinessIntroCard"
        description="کارت معرفی کوتاه یک بخش بیزینسی در ابتدای صفحه — شامل آیکون، عنوان، توضیح و اکشن اختیاری برگشت یا ورود."
        importCode={`import { TaavBusinessIntroCard } from "@repo/ui/taav/business";`}
      />

      <DocSection title="راهنمای استفاده">
        <StateNote>
          این کامپوننت برای معرفی کوتاه یک بخش بیزینسی در ابتدای صفحه استفاده می‌شود و شامل آیکون، عنوان، توضیح و اکشن
          اختیاری برگشت یا ورود است. route، permission و business logic باید از اپ (DastRanj / VahedYek) پاس داده شود.
        </StateNote>
      </DocSection>

      <DocSection title="الگوی hub — مرکز تنظیمات">
        <StateNote>
          برای صفحات مرکزی مثل «تنظیمات کسب‌وکار» با eyebrow، badge، footnote و پس‌زمینه decorative — بدون اکشن.
        </StateNote>
        <DocPreview label="layout=hub · business settings hub">
          <BusinessIntroCardHubDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="تم روشن — نمونه نزدیک اسکرین‌شات">
        <DocPreview label="light · با اکشن برگشت">
          <BusinessIntroCardLightDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="تم تیره">
        <DocPreview label="dark · با اکشن برگشت">
          <BusinessIntroCardDarkDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="با اکشن">
        <StateNote>با `href` یا `onAction` — فقط دکمه اکشن تعاملی است، نه کل کارت.</StateNote>
        <DocPreview label="onAction · actionLabel">
          <BusinessIntroCardWithActionDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="بدون اکشن">
        <DocPreview label="non-interactive intro">
          <BusinessIntroCardWithoutActionDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="بارگذاری">
        <DocPreview label="loading skeleton">
          <BusinessIntroCardLoadingDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="اکشن غیرفعال">
        <DocPreview label="disabled · action hidden">
          <BusinessIntroCardDisabledActionDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={BUSINESS_INTRO_CARD_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Layout', value: 'RTL افقی — آیکون راست، متن وسط/راست، اکشن چپ' },
            { label: 'Width', value: 'normal 720px · wide 960px · full' },
            { label: 'Icon container', value: 'مربع گرد teal — token: --taav-business-intro-card-icon-bg' },
            { label: 'Title', value: 'font-black · --taav-business-intro-card-title-md' },
            { label: 'Description', value: 'muted · --taav-business-intro-card-description-md' },
            { label: 'Border / radius', value: '--taav-business-intro-card-border / --taav-business-intro-card-radius' },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <DocGuidelines
          items={[
            'اکشن آیکونی باید actionLabel داشته باشد — پیش‌فرض «بازگشت»',
            'focus-visible روی دکمه/لینک اکشن با --taav-focus-ring',
            'disabled و loading اکشن را غیرفعال می‌کند',
            'عنوان با h2 رندر می‌شود — سطح heading صفحه را از اپ کنترل کنید',
            'متن و آیکون در RTL خوانا بمانند',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای معرفی بخش بیزینسی نزدیک بالای صفحه استفاده کنید',
            'عنوان و توضیح را کوتاه نگه دارید',
            'رفتار اکشن (href / onAction) را از اپ پاس دهید',
            'actionLabel معنادار برای screen reader بدهید',
          ]}
          dontItems={[
            'به‌عنوان کارت عمومی استفاده نکنید',
            'routing یا business logic داخل کامپوننت ننویسید',
            'این layout را با CSS محلی بازسازی نکنید',
            'برای کارت‌های گرید ماژول از TaavModuleCard استفاده کنید',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
