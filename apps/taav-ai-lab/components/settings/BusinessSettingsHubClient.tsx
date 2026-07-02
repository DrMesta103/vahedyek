'use client';

import { Briefcase, Coins, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  TaavBusinessIntroCard,
  TaavModuleCard,
  TaavModuleCardGrid,
  TaavModuleCardGridItem,
} from '@repo/ui/taav/business';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';

const SETTINGS_MODULES = [
  {
    id: 'token-pricing',
    title: 'تنظیمات قیمت‌گذاری توکن‌ها',
    description: 'مدل‌های ChatGPT، Gemini، Grok و DeepSeek — قیمت هر ۱۰۰ توکن و API keyها',
    href: '/settings/token-pricing',
    icon: <Coins className="h-5 w-5" strokeWidth={2.1} />,
    tooltip: AI_LAB_TOOLTIPS.settings.tokenPricing,
  },
  {
    id: 'usd-rate',
    title: 'تنظیمات قیمت دلار',
    description: 'نرخ تبدیل دلار به تومان ایران برای شبیه‌سازی هزینه‌ها',
    href: '/settings/usd-rate',
    icon: <DollarSign className="h-5 w-5" strokeWidth={2.1} />,
    tooltip: AI_LAB_TOOLTIPS.settings.usdRate,
  },
] as const;

export function BusinessSettingsHubClient() {
  const router = useRouter();

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <TaavBusinessIntroCard
        layout="hub"
        size="lg"
        width="full"
        themeMode="auto"
        eyebrow="مرکز کنترل تنظیمات"
        badge={`${SETTINGS_MODULES.length} بخش`}
        title={
          <span className="inline-flex items-center gap-2">
            تنظیمات تاو ادمین
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.hub} label="راهنمای تنظیمات" />
          </span>
        }
        description="این تنظیمات سراسری است و برای همه کسب‌وکارها یکسان اعمال می‌شود. قیمت مدل‌ها و نرخ دلار را مشاهده کنید؛ برای ویرایش یا دسترسی به API key نیاز به تأیید مدیر دارید."
        footnote="داده‌های این بخش فقط شبیه‌سازی هستند و در پایگاه داده ذخیره نمی‌شوند."
        icon={<Briefcase strokeWidth={2.1} />}
      />

      <TaavModuleCardGrid columns={2} gap="md" className="business-settings-module-grid">
        {SETTINGS_MODULES.map((module) => (
          <TaavModuleCardGridItem key={module.id}>
            <TaavModuleCard
              title={
                <span className="inline-flex items-center gap-1.5">
                  {module.title}
                  <AiLabTooltipIcon
                    content={module.tooltip}
                    label={`راهنمای ${module.title}`}
                    triggerElement="span"
                  />
                </span>
              }
              description={module.description}
              themeMode="auto"
              width="full"
              icon={module.icon}
              onClick={() => router.push(module.href)}
            />
          </TaavModuleCardGridItem>
        ))}
      </TaavModuleCardGrid>
    </div>
  );
}
