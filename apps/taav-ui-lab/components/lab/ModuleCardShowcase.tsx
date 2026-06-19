'use client';

import { TaavModuleCard, TaavModuleCardGrid, TaavModuleCardGridItem } from '@repo/ui/taav/business';
import { OWNERSHIP_MODULE_CARDS, SETUP_MODULE_CARDS } from '@/lib/demo/module-card-demo';

type ModuleCardPreviewFrameProps = {
  theme: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
};

export function ModuleCardPreviewFrame({ theme, children, className }: ModuleCardPreviewFrameProps) {
  const isDark = theme === 'dark';

  return (
    <div
      dir="rtl"
      data-taav-theme={isDark ? 'dark' : 'light'}
      className={className}
      style={{
        backgroundColor: isDark
          ? 'var(--taav-module-card-preview-bg-dark)'
          : 'var(--taav-module-card-preview-bg-light)',
        backgroundImage: isDark
          ? 'var(--taav-module-card-preview-pattern-dark)'
          : 'var(--taav-module-card-preview-pattern-light)',
      }}
    >
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

export function ModuleCardDarkSetupDemo() {
  return (
    <ModuleCardPreviewFrame theme="dark" className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]">
      <TaavModuleCardGrid columns={2} gap="md">
        {SETUP_MODULE_CARDS.map((card) => (
          <TaavModuleCardGridItem key={card.id} span={card.id === 'approval-process' ? 1 : 1}>
            <TaavModuleCard
              title={card.title}
              description={card.description}
              themeMode="dark"
              onClick={() => undefined}
            />
          </TaavModuleCardGridItem>
        ))}
      </TaavModuleCardGrid>
    </ModuleCardPreviewFrame>
  );
}

export function ModuleCardLightSetupDemo() {
  return (
    <ModuleCardPreviewFrame theme="light" className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]">
      <TaavModuleCardGrid columns={2} gap="md">
        {SETUP_MODULE_CARDS.map((card) => (
          <TaavModuleCardGridItem key={card.id}>
            <TaavModuleCard
              title={card.title}
              description={card.description}
              themeMode="light"
              onClick={() => undefined}
            />
          </TaavModuleCardGridItem>
        ))}
      </TaavModuleCardGrid>
    </ModuleCardPreviewFrame>
  );
}

export function ModuleCardMixedOwnershipDemo() {
  return (
    <ModuleCardPreviewFrame theme="light" className="overflow-hidden rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-border-subtle)]">
      <TaavModuleCardGrid columns={2} gap="md">
        {OWNERSHIP_MODULE_CARDS.map((card) => (
          <TaavModuleCardGridItem key={card.id} span={card.span ?? 1}>
            <TaavModuleCard
              title={card.title}
              description={card.description}
              status={card.status}
              themeMode="light"
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
      <TaavModuleCard
        title="تکمیل‌نشده"
        description="( تکمیل نشده ) اطلاعات ضروری هنوز وارد نشده"
        status="incomplete"
        onClick={() => undefined}
      />
      <TaavModuleCard title="هشدار" description="نیاز به بازبینی قبل از ادامه" status="warning" onClick={() => undefined} />
      <TaavModuleCard title="خطا" description="اطلاعات این بخش نامعتبر است" status="error" onClick={() => undefined} />
    </div>
  );
}

export function ModuleCardDisabledGallery() {
  return (
    <div dir="rtl" className="grid gap-4 md:grid-cols-2">
      <TaavModuleCard
        title="قفل‌شده"
        description="ابتدا مرحله قبلی را تکمیل کنید"
        status="locked"
        onClick={() => undefined}
      />
      <TaavModuleCard title="غیرفعال" description="دسترسی به این بخش برای شما فعال نیست" disabled onClick={() => undefined} />
      <TaavModuleCard title="در حال بارگذاری" description="..." loading />
    </div>
  );
}

export function ModuleCardBasicUsage() {
  return (
    <div dir="rtl" className="max-w-md">
      <TaavModuleCard
        title="پروفایل کسب‌وکار"
        description="ورود اطلاعات پایه کسب‌وکار برای تنظیم قراردادها"
        href="#module-profile"
      />
    </div>
  );
}

export function ModuleCardTwoColumnGridDemo() {
  return (
    <div dir="rtl">
      <TaavModuleCardGrid columns={2} gap="md">
        <TaavModuleCardGridItem>
          <TaavModuleCard title="تعریف پروژه" description="ثبت اطلاعات پروژه یا مجتمع" onClick={() => undefined} />
        </TaavModuleCardGridItem>
        <TaavModuleCardGridItem>
          <TaavModuleCard title="تنظیمات مالی" description="چارچوب مالی و قواعد قراردادی" onClick={() => undefined} />
        </TaavModuleCardGridItem>
      </TaavModuleCardGrid>
    </div>
  );
}
