'use client';

import { TaavModuleCard } from '@repo/ui/taav/business';
import { DocApiNote, DocCodeBlock, DocGuidelines, DocPageHeader, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ModuleCardMixedOwnershipDemo, ModuleCardTwoColumnGridDemo } from '@/components/lab/ModuleCardShowcase';
import { MODULE_CARD_GRID_ITEM_PROPS, MODULE_CARD_GRID_PROPS, MODULE_CARD_PROPS } from '@/lib/docs/component-props';

function MainCardPreview() {
  return (
    <div dir="rtl" data-taav-theme="light">
      <div className="mx-auto w-full max-w-[420px]">
        <TaavModuleCard
          title="پروفایل کسب‌وکار"
          description="ورود اطلاعات پایه کسب‌وکار برای تنظیم قراردادها"
          href="#module-profile"
          themeMode="light"
        />
      </div>
    </div>
  );
}

export default function ComponentsCardDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Components', href: '/business-components' }, { label: 'card' }]}>
      <DocPageHeader
        eyebrow="Components"
        title="card"
        description="کامپوننت اصلی کارت ناوبری برای ورود به ماژول‌ها و مراحل راه‌اندازی در تم روشن."
        importCode={`import { TaavModuleCard } from "@repo/ui/taav/business";`}
      />

      <DocSection title="کامپوننت اصلی">
        <MainCardPreview />
      </DocSection>

      <DocApiNote />

      <DocSection title="ساختار استاندارد">
        <DocCodeBlock>{`<TaavModuleCard
  title="پروفایل کسب‌وکار"
  description="ورود اطلاعات پایه کسب‌وکار برای تنظیم قراردادها"
  href="#module-profile"
  themeMode="light"
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="گرید کارت">
        <div dir="rtl" data-taav-theme="light" className="mx-auto w-full max-w-[856px]">
          <ModuleCardTwoColumnGridDemo />
        </div>
        <div className="mt-4">
          <DocCodeBlock>{`import { TaavModuleCard, TaavModuleCardGrid, TaavModuleCardGridItem } from "@repo/ui/taav/business";

<TaavModuleCardGrid columns={2} gap="md">
  <TaavModuleCardGridItem>
    <TaavModuleCard title="نماینده قانونی" description="مدیریت و تنظیم قراردادها" themeMode="light" />
  </TaavModuleCardGridItem>
  <TaavModuleCardGridItem>
    <TaavModuleCard title="شرکای اصلی" description="مدیریت اطلاعات مرتبط با کسب‌وکار" themeMode="light" />
  </TaavModuleCardGridItem>
</TaavModuleCardGrid>`}</DocCodeBlock>
        </div>
        <div className="mt-4">
          <div dir="rtl" data-taav-theme="light" className="mx-auto w-full max-w-[856px]">
            <ModuleCardMixedOwnershipDemo />
          </div>
        </div>
      </DocSection>

      <DocSection title="Props — Grid">
        <DocPropsTable rows={MODULE_CARD_GRID_PROPS} />
      </DocSection>

      <DocSection title="Props — Grid Item">
        <DocPropsTable rows={MODULE_CARD_GRID_ITEM_PROPS} />
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={MODULE_CARD_PROPS} />
      </DocSection>

      <DocSection title="دسترسی‌پذیری">
        <DocGuidelines items={[
          'برای کارت قابل کلیک از href یا onClick استفاده کنید تا تعامل صفحه‌کلید حفظ شود.',
          'عنوان و توضیح باید مسیر یا هدف کارت را به‌صورت روشن بیان کنند.',
          'برای هر کارت یک عنوان معنادار و یکتا در نظر بگیرید.',
        ]} />
      </DocSection>
    </DocPageShell>
  );
}
