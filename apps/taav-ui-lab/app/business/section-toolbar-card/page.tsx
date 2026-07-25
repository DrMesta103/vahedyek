'use client';

import type { ReactNode } from 'react';
import { TaavBusinessSectionToolbarCard } from '@repo/ui/taav/business';
import { TaavCard } from '@repo/ui/taav/primitives';
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
import { BusinessSectionToolbarCardGallery } from '@/components/lab/BusinessSectionToolbarCardShowcase';
import { SECTION_TOOLBAR_CARD_DEMO_ITEMS } from '@/lib/demo/business-section-toolbar-card-demo';
import { BUSINESS_SECTION_TOOLBAR_CARD_PROPS } from '@/lib/docs/component-props';

function StateNote({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
      {children}
    </p>
  );
}

export default function BusinessSectionToolbarCardDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'کارت سربرگ مدیریتی بخش' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavBusinessSectionToolbarCard"
        description="کارت سربرگ مدیریتی برای بخش‌هایی مثل نماینده قانونی، کارمندان و واحدها؛ شامل عنوان، توضیح، آیکن، فلش، جستجو و اکشن."
        importCode={`import { TaavBusinessSectionToolbarCard } from "@repo/ui/taav/business";`}
      />

      <DocSection title="راهنمای استفاده">
        <StateNote>
          این کامپوننت برای سربرگ‌های مدیریتیِ بخش‌های داخلی استفاده می‌شود. در این الگو، محتوای اصلی کارت
          نمایشی است و اکشن کمکی، جستجو و فلش ناوبری برای دسترسی سریع به مسیر بعدی یا عملیات مرتبط در نظر گرفته
          شده‌اند.
        </StateNote>
      </DocSection>

      <DocSection title="نمونه‌های مدیریتی">
        <DocPreview label="با اکشن · search + action">
          <BusinessSectionToolbarCardGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="تم روشن">
        <StateNote>همان الگوی مدیریتی در تم روشن هم باید قابل مشاهده باشد تا تضاد رنگی و مرزها در هر دو تم بررسی شوند.</StateNote>
        <DocPreview label="light theme">
          <div data-taav-theme="light" className="grid gap-4">
            <TaavBusinessSectionToolbarCard
              title={SECTION_TOOLBAR_CARD_DEMO_ITEMS[0].title}
              description={SECTION_TOOLBAR_CARD_DEMO_ITEMS[0].description}
              icon={SECTION_TOOLBAR_CARD_DEMO_ITEMS[0].icon}
              href="#"
              search={{
                placeholder: SECTION_TOOLBAR_CARD_DEMO_ITEMS[0].placeholder,
                onChange: () => undefined,
              }}
              action={{
                label: SECTION_TOOLBAR_CARD_DEMO_ITEMS[0].actionLabel,
                onClick: () => undefined,
              }}
            />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="بدون اکشن">
        <StateNote>
          در حالت حداقلی، کارت فقط عنوان، توضیح و آیکن را نمایش می‌دهد و فلش ناوبری و دکمه اکشن پایین کارت
          مخفی می‌شوند.
        </StateNote>
        <DocPreview label="non-interactive toolbar card">
          <TaavBusinessSectionToolbarCard
            title={SECTION_TOOLBAR_CARD_DEMO_ITEMS[1].title}
            description={SECTION_TOOLBAR_CARD_DEMO_ITEMS[1].description}
            icon={SECTION_TOOLBAR_CARD_DEMO_ITEMS[1].icon}
            showArrow={false}
          />
        </DocPreview>
      </DocSection>

      <DocSection title="بارگذاری">
        <StateNote>
          اگر داده‌های بخش هنوز آماده نشده باشند، باید اسکلتون یا placeholder هم‌ابعاد همین کارت نمایش داده شود تا
          جای صفحه ثابت بماند.
        </StateNote>
        <DocPreview label="loading skeleton">
          <TaavCard variant="outlined" padding="md" radius="lg">
            <div className="grid gap-3">
              <div className="h-5 w-1/3 animate-pulse rounded-full bg-[var(--taav-surface-muted)]" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-[var(--taav-surface-muted)]" />
              <div className="mt-2 h-10 w-full animate-pulse rounded-[14px] bg-[var(--taav-surface-muted)]" />
            </div>
          </TaavCard>
        </DocPreview>
      </DocSection>

      <DocSection title="اکشن غیرفعال">
        <StateNote>
          وقتی عملیات برای کاربر در دسترس نیست، دکمه اکشن باید hidden یا disabled شود و خود کارت همچنان قابل
          مشاهده باقی بماند.
        </StateNote>
        <DocPreview label="disabled · action hidden">
          <BusinessSectionToolbarCardGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={BUSINESS_SECTION_TOOLBAR_CARD_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Layout', value: 'RTL افقی — آیکن بخش در راست، عنوان/توضیح در میانه، فلش ناوبری در چپ' },
            { label: 'Width', value: 'full در مستندات · مشابه کارت‌های مدیریتی 696 تا 720px در نمونه‌های واقعی' },
            { label: 'Icon container', value: '56×56 با پس‌زمینه teal بسیار ملایم و radius نزدیک 17px' },
            { label: 'Title', value: '18px / 600 / راست‌چین / color نزدیک #3f3f46' },
            { label: 'Description', value: '12.5px / 400 / line-height 22px / color نزدیک #52657a' },
            { label: 'Border / radius', value: 'border نرم و radius حدود 15 تا 16px' },
          ]}
        />
      </DocSection>

      <DocSection title="راهنمای رفتاری">
        <DocGuidelines
          items={[
            'فلش ناوبری فقط برای رفتن به مسیر بعدی استفاده شود و اکشن کمکی داخل همان کارت مستقل بماند.',
            'اگر action داده نشده باشد، کارت همچنان readable و کامل بماند.',
            'در حالت loading، layout نباید تغییر کند و فقط محتوا skeleton شود.',
            'متن‌ها در RTL راست‌چین باقی بمانند و spacing بین icon, title, description و action ثابت بماند.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای سربرگ‌های مدیریتی بخش، از همین کارت استفاده کنید.',
            'action را برای عملیات مهم مثل افزودن یا مدیریت سریع بگذارید.',
            'اگر کارت فقط نمایشی است، دکمه اکشن را حذف کنید تا شلوغ نشود.',
          ]}
          dontItems={[
            'این کارت را برای ناوبری عمومی کل محصول استفاده نکنید.',
            'در متن‌ها و آیکن‌ها، RTL و هم‌راستایی را به‌هم نزنید.',
            'برای این الگو از clone محلی یا صفحه اختصاصی خارج از taav-ui استفاده نکنید.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
