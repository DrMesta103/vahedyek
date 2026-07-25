'use client';

import { TaavModuleCard, TaavModuleCardGrid, TaavModuleCardGridItem } from '@repo/ui/taav/business';
import { OWNERSHIP_MODULE_CARDS, SETUP_MODULE_CARDS } from '@/lib/demo/module-card-demo';

type ModuleCardPreviewFrameProps = {
  theme: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
};

export function ModuleCardPreviewFrame({ theme, children, className }: ModuleCardPreviewFrameProps) {
  return (
    <div dir="rtl" data-taav-theme={theme} className={className}>
      {children}
    </div>
  );
}

function ModuleCardsGrid({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <TaavModuleCardGrid columns={2} gap="md">
      {SETUP_MODULE_CARDS.map((card) => (
        <TaavModuleCardGridItem key={card.id}>
          <TaavModuleCard
            title={card.title}
            description={card.description}
            themeMode={theme}
            width="full"
            onClick={() => undefined}
          />
        </TaavModuleCardGridItem>
      ))}
    </TaavModuleCardGrid>
  );
}

export function ModuleCardDarkSetupDemo() {
  return (
    <ModuleCardPreviewFrame theme="dark">
      <ModuleCardsGrid theme="dark" />
    </ModuleCardPreviewFrame>
  );
}

export function ModuleCardLightSetupDemo() {
  return (
    <ModuleCardPreviewFrame theme="light">
      <ModuleCardsGrid theme="light" />
    </ModuleCardPreviewFrame>
  );
}

export function ModuleCardMixedOwnershipDemo() {
  return (
    <ModuleCardPreviewFrame theme="light">
      <TaavModuleCardGrid columns={2} gap="md">
        {OWNERSHIP_MODULE_CARDS.map((card) => (
          <TaavModuleCardGridItem key={card.id} span={card.span ?? 1}>
            <TaavModuleCard
              title={card.title}
              description={card.description}
              themeMode="light"
              size="md"
              variant="setup"
              headerPattern="geometric"
              width="full"
              onClick={() => undefined}
            />
          </TaavModuleCardGridItem>
        ))}
      </TaavModuleCardGrid>
    </ModuleCardPreviewFrame>
  );
}

export function ModuleCardStatusGallery() {
  return (
    <div dir="rtl" className="grid gap-4 md:grid-cols-2">
      <TaavModuleCard title="پیش‌فرض" description="کارت ماژول در حالت عادی" onClick={() => undefined} />
      <TaavModuleCard title="فعال" description="مرحله فعلی راه‌اندازی" status="active" selected onClick={() => undefined} />
      <TaavModuleCard title="تکمیل‌شده" description="اطلاعات این بخش ثبت شده است" status="complete" onClick={() => undefined} />
      <TaavModuleCard title="تکمیل‌نشده" description="اطلاعات ضروری هنوز وارد نشده است" status="incomplete" onClick={() => undefined} />
      <TaavModuleCard title="هشدار" description="نیاز به بازبینی قبل از ادامه" status="warning" onClick={() => undefined} />
      <TaavModuleCard title="خطا" description="اطلاعات این بخش نامعتبر است" status="error" onClick={() => undefined} />
    </div>
  );
}

export function ModuleCardDisabledGallery() {
  return (
    <div dir="rtl" className="grid gap-4 md:grid-cols-2">
      <TaavModuleCard title="قفل‌شده" description="ابتدا مرحله قبلی را تکمیل کنید" status="locked" onClick={() => undefined} />
      <TaavModuleCard title="غیرفعال" description="دسترسی به این بخش برای شما فعال نیست" disabled onClick={() => undefined} />
      <TaavModuleCard title="در حال بارگذاری" description="..." loading />
    </div>
  );
}

export function ModuleCardBasicUsage() {
  return (
    <div dir="rtl" className="max-w-md">
      <TaavModuleCard title="پروفایل کسب‌وکار" description="ورود اطلاعات پایه کسب‌وکار برای تنظیم قراردادها" href="#module-profile" />
    </div>
  );
}

export function ModuleCardTwoColumnGridDemo() {
  return (
    <div dir="rtl">
      <ModuleCardsGrid theme="light" />
    </div>
  );
}
