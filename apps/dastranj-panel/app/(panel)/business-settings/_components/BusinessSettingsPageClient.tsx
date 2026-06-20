'use client';

import { Briefcase } from 'lucide-react';
import { TaavBusinessIntroCard } from '@repo/ui/taav/business';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { DastRanjNavPath } from '../../../components/business-sidebar/DastRanjNavPathProvider';
import { BUSINESS_SETTINGS_CATEGORIES, type BusinessSettingsCategory } from '../../../lib/business-settings';
import type { TenantSetupHealth } from '../../../lib/setup-health';
import { SetupHealthCard } from '../../../components/setup-health/SetupHealthCard';
import { BusinessSettingsCategoryCards, BusinessSettingsItemCards } from './BusinessSettingsModuleCards';

type BusinessSettingsPageClientProps = {
  setupHealth: TenantSetupHealth | null;
};

export function BusinessSettingsPageClient({ setupHealth }: BusinessSettingsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategoryId = searchParams.get('category') as BusinessSettingsCategory['id'] | null;
  const selectedCategory = useMemo(
    () => BUSINESS_SETTINGS_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? null,
    [selectedCategoryId],
  );

  const openCategory = useCallback(
    (categoryId: BusinessSettingsCategory['id']) => {
      router.push(`/business-settings?category=${categoryId}`);
    },
    [router],
  );

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      {selectedCategory ? (
        <DastRanjNavPath
          tail={[
            {
              label: selectedCategory.title,
              id: `business-settings-category-${selectedCategory.id}`,
            },
          ]}
        />
      ) : null}

      {!selectedCategory ? (
        <>
          <TaavBusinessIntroCard
            layout="hub"
            size="lg"
            width="full"
            themeMode="auto"
            eyebrow="مرکز کنترل تنظیمات"
            badge={`${BUSINESS_SETTINGS_CATEGORIES.length} دسته`}
            title="تنظیمات کسب‌وکار"
            description="تنظیمات پایه، عملیاتی، منابع انسانی، تردد، قراردادها و حقوق و دستمزد کسب‌وکار را از اینجا مدیریت کنید."
            footnote="راه‌اندازی سریع فقط اطلاعات اولیه را ثبت می‌کند؛ در این بخش می‌توانید تنظیمات سازمان را کامل‌تر و دقیق‌تر مدیریت کنید."
            icon={<Briefcase strokeWidth={2.1} />}
          />

          {setupHealth?.nextReminder ? <SetupHealthCard setupHealth={setupHealth} /> : null}
        </>
      ) : null}

      <div className="business-settings-cards-wrap">
        {selectedCategory ? (
          <BusinessSettingsItemCards items={selectedCategory.items} setupHealth={setupHealth} />
        ) : (
          <BusinessSettingsCategoryCards categories={BUSINESS_SETTINGS_CATEGORIES} onCategorySelect={openCategory} />
        )}
      </div>
    </div>
  );
}
