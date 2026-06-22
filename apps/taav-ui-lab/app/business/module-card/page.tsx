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
  ModuleCardBasicUsage,
  ModuleCardDarkSetupDemo,
  ModuleCardDisabledGallery,
  ModuleCardLightSetupDemo,
  ModuleCardMixedOwnershipDemo,
  ModuleCardStatusGallery,
  ModuleCardTwoColumnGridDemo,
} from '@/components/lab/ModuleCardShowcase';
import { MODULE_CARD_PROPS } from '@/lib/docs/component-props';

function StateNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
      {children}
    </p>
  );
}

export default function ModuleCardDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'کارت ماژول' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavModuleCard"
        description="کارت navigation تخصصی ERP برای ورود به ماژول، بخش تنظیمات، مرحله راه‌اندازی یا فرآیند سازمانی — presentation-only و جایگزین TaavCard عمومی نیست."
        importCode={`import { TaavModuleCard } from "@repo/ui/taav/business";`}
      />

      <DocSection title="راهنمای استفاده">
        <StateNote>
          این کارت برای ورود به یک ماژول، بخش تنظیمات، مرحله راه‌اندازی یا فرآیند سازمانی استفاده می‌شود. منطق route،
          permission، تکمیل‌بودن، فعال‌بودن یا قفل‌بودن باید از اپ اصلی (DastRanj / VahedYek) پاس داده شود — این
          کامپوننت نباید خودش داده fetch کند یا business logic داشته باشد.
        </StateNote>
      </DocSection>

      <DocSection title="استفاده پایه">
        <DocPreview label="href · RTL · الگوی setup">
          <ModuleCardBasicUsage />
        </DocPreview>
      </DocSection>

      <DocSection title="تم تیره — کارت‌های راه‌اندازی">
        <StateNote>نمونه نزدیک به اسکرین‌شات ERP تیره — پنج کارت دو ستونه با هدر الگویی.</StateNote>
        <DocPreview label="themeMode=dark · setup cards">
          <ModuleCardDarkSetupDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="تم روشن — کارت‌های راه‌اندازی">
        <DocPreview label="themeMode=light · setup cards">
          <ModuleCardLightSetupDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="عرض ترکیبی — تنظیمات مالکیت">
        <StateNote>ترکیب کارت full-width و دو ستونه — مانند بخش نوع مالکیت و شرکا در ERP.</StateNote>
        <DocPreview label="mixed span · incomplete status در description">
          <ModuleCardMixedOwnershipDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="وضعیت‌ها">
        <DocPreview label="status variants">
          <ModuleCardStatusGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="غیرفعال / قفل / بارگذاری">
        <DocPreview label="locked · disabled · loading">
          <ModuleCardDisabledGallery />
        </DocPreview>
      </DocSection>

      <DocSection title="گرید دو ستونه">
        <DocPreview label="با TaavModuleCardGrid">
          <ModuleCardTwoColumnGridDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="تفاوت با سایر کارت‌ها">
        <DocGuidelines
          items={[
            'TaavCard = سطح primitive عمومی — برای هر محتوای کارت‌مانند',
            'TaavModuleCard = کارت navigation بیزینسی ERP — هدر الگویی، فلش ورود، توضیح مرکزی',
            'TaavStatsCard = کارت metric/آمار — مقدار عددی و روند',
            'TaavOptionCard = کارت انتخابی فرم — radio/checkbox/selectable option',
          ]}
        />
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={MODULE_CARD_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Header height', value: '52px (md) — token: --taav-module-card-header-height' },
            { label: 'Header pattern', value: 'CSS geometric gradient — بدون asset تصویری' },
            { label: 'Title', value: 'راست‌چین در هدر RTL؛ فلش چپ' },
            { label: 'Body align', value: 'start (پیش‌فرض RTL راست‌چین) — center برای حالت‌های خاص' },
            { label: 'Border / radius', value: '--taav-module-card-border / --taav-module-card-radius' },
            { label: 'Themes', value: 'auto (shell) یا themeMode اجباری light/dark' },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <DocGuidelines
          items={[
            'کارت‌های clickable با <a> یا <button> رندر می‌شوند — keyboard accessible',
            'focus-visible با --taav-focus-ring',
            'disabled/locked با aria-disabled و بدون تعامل',
            'وضعیت فقط با رنگ منتقل نشود — از description یا statusLabel استفاده کنید',
            'در صورت نیاز ariaLabel بدهید',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'از TaavModuleCard برای ورود ماژول/تنظیمات/فرآیند استفاده کنید',
            'status، disabled، href و onClick را از اپ پاس دهید',
            'برای layout از TaavModuleCardGrid استفاده کنید',
            'تم را با themeMode یا tokenهای shell کنترل کنید',
          ]}
          dontItems={[
            'TaavCard خام را برای navigation ماژول ERP جایگزین نکنید',
            'route detection یا permission داخل کامپوننت ننویسید',
            'asset تصویری برای هدر پیش‌فرض اضافه نکنید',
            'clone محلی این الگو در apps نسازید',
          ]}
        />
      </DocSection>

      <DocSection title="راهنمای DastRanj و VahedYek">
        <DocGuidelines
          items={[
            'لیست کارت‌ها را از state/route اپ بسازید — نه داخل TaavUI',
            'متن «(تکمیل نشده)» را در description یا statusLabel از منطق تکمیل اپ بگذارید',
            'کارت قفل‌شده: status="locked" یا disabled — handler ندهید',
            'برای صفحات setup تیره DastRanj: themeMode="dark" یا shell تیره با themeMode="auto"',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
