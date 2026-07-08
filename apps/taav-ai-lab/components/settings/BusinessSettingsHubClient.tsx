'use client';

import { Briefcase, Building2, DollarSign, KeyRound, UsersRound } from 'lucide-react';
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
    id: 'ai-accounts',
    title: 'مدیریت اکانت‌ها و API Keyهای هوش مصنوعی',
    description:
      'تعریف اکانت‌های OpenAI، DeepSeek، Gemini، Grok و سایر ارائه‌دهندگان برای مدیریت هزینه، قیمت توکن و کلیدهای دسترسی.',
    href: '/settings/ai-accounts',
    eyebrow: 'فاز ۱',
    statusLabel: 'مدیریت اکانت‌ها',
    icon: <KeyRound className="h-5 w-5" strokeWidth={2.1} />,
    tooltip: AI_LAB_TOOLTIPS.settings.aiAccounts,
  },
  {
    id: 'usd-rate',
    title: 'تنظیمات قیمت دلار',
    description: 'نرخ تبدیل دلار به تومان ایران برای شبیه‌سازی هزینه‌ها',
    href: '/settings/usd-rate',
    icon: <DollarSign className="h-5 w-5" strokeWidth={2.1} />,
    tooltip: AI_LAB_TOOLTIPS.settings.usdRate,
  },
  {
    id: 'businesses',
    title: 'فهرست کسب‌وکارها',
    description: 'مشاهده و مدیریت همه کسب‌وکارها و مصرف توکن آن‌ها در کل سیستم.',
    href: '/settings/businesses',
    icon: <Building2 className="h-5 w-5" strokeWidth={2.1} />,
    tooltip: AI_LAB_TOOLTIPS.settings.businesses,
    eyebrow: 'تاو ادمین',
    statusLabel: 'مشاهده فهرست',
  },
  {
    id: 'users',
    title: 'مدیریت کاربران',
    description: 'فهرست سراسری کاربران همه tenantها با جستجو، فیلتر و ثبت کاربر جدید در سطح تاو ادمین.',
    href: '/settings/users',
    icon: <UsersRound className="h-5 w-5" strokeWidth={2.1} />,
    tooltip: AI_LAB_TOOLTIPS.settings.users,
    eyebrow: 'تاو ادمین',
    statusLabel: 'ثبت و مدیریت کاربر',
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
            پنل تاو ادمین
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.hub} label="راهنمای تنظیمات" />
          </span>
        }
        description="این تنظیمات سراسری است و برای همه کسب‌وکارها یکسان اعمال می‌شود. اکانت‌های AI، مدل‌ها و نرخ دلار را از همین بخش مدیریت کنید."
        footnote="داده‌های این بخش در PostgreSQL ذخیره می‌شوند. API Keyها فقط به‌صورت masked نمایش داده می‌شوند."
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
              eyebrow={'eyebrow' in module ? module.eyebrow : undefined}
              statusLabel={'statusLabel' in module ? module.statusLabel : undefined}
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
