'use client';

import {
  TaavBusinessIntroCard,
  TaavModuleCard,
  TaavModuleCardGrid,
  TaavModuleCardGridItem,
  type TaavModuleCardStatus,
} from '@repo/ui/taav/business';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDefaultProfileStore, DEFAULT_PROFILE_META, type ProfileMeta, type ProfileStore } from '../profile.types';
import { fetchProfilePayload, loadProfileStore } from '../profileStorage';
import {
  BUSINESS_PROFILE_BANK_ACCOUNTS,
  BUSINESS_PROFILE_BRANDING,
  BUSINESS_PROFILE_OWNERSHIP,
  getSelectTenantPath,
} from '../routes';

type OverviewSection = {
  title: string;
  description: string;
  href: string;
  badgeTone: 'pending' | 'completed' | 'in_progress';
};

function overviewSections(store: ProfileStore, meta: ProfileMeta): OverviewSection[] {
  const displayBrandName = store.ownership.brandName.trim() && store.ownership.brandName.trim() !== 'دسترنج' ? store.ownership.brandName.trim() : '';
  const hasBaseInfo = Boolean(store.ownership.companyName.trim() || displayBrandName || meta.businessName.trim()) && Boolean(meta.owner.fullName.trim());
  const hasBankAccounts = store.bankAccounts.length > 0;
  const hasBrandingData = Boolean(store.branding.logoImage.trim() || store.branding.sealImage.trim() || store.branding.headerImage.trim() || store.branding.footerImage.trim());

  return [
    {
      title: 'اطلاعات پایه کسب‌وکار',
      description: 'اطلاعات هویتی و رسمی کسب‌وکار را برای استفاده در قراردادها، گزارش‌ها و خروجی‌های رسمی آماده کنید.',
      href: BUSINESS_PROFILE_OWNERSHIP,
      badgeTone: hasBaseInfo ? 'completed' : 'pending',
    },
    {
      title: 'حساب‌های بانکی',
      description: 'حساب‌های بانکی کسب‌وکار را برای استفاده در قراردادها، گزارش‌ها و فرآیندهای مالی مدیریت کنید.',
      href: BUSINESS_PROFILE_BANK_ACCOUNTS,
      badgeTone: hasBankAccounts ? 'completed' : 'pending',
    },
    {
      title: 'لوگو، مهر و سربرگ',
      description: 'فایل‌های رسمی برند و تنظیمات ظاهری خروجی‌های سازمانی را برای مراحل بعدی آماده نگه دارید.',
      href: BUSINESS_PROFILE_BRANDING,
      badgeTone: hasBrandingData ? 'completed' : 'pending',
    },
  ];
}

function resolveSectionStatus(badgeTone: OverviewSection['badgeTone']): TaavModuleCardStatus {
  if (badgeTone === 'completed') return 'complete';
  if (badgeTone === 'in_progress') return 'warning';
  return 'incomplete';
}

function resolveSectionDescription(description: string, status: TaavModuleCardStatus) {
  if (status === 'incomplete') {
    return `( تکمیل نشده ) ${description}`;
  }

  return description;
}

export default function AccountOverviewPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchProfilePayload();
        if (!mounted) return;
        setStore(payload.store);
        setMeta(payload.meta);
      } catch (error) {
        if (!mounted) return;
        if (error instanceof Error && error.message === 'unauthorized') {
          router.replace(getSelectTenantPath('/business-settings/profile'));
          return;
        }
        setStore(loadProfileStore());
        setMeta(DEFAULT_PROFILE_META);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const displayBrandName = store.ownership.brandName.trim() && store.ownership.brandName.trim() !== 'دسترنج' ? store.ownership.brandName.trim() : '';
  const businessName = store.ownership.companyName.trim() || displayBrandName || meta.businessName.trim() || 'ثبت نشده';
  const avatarText = displayBrandName.charAt(0) || store.ownership.companyName.trim().charAt(0) || meta.businessName.trim().charAt(0) || meta.brandCode || 'د';
  const ownerName = meta.owner.fullName.trim() || 'ثبت نشده';
  const ownerMobile = meta.owner.mobile?.trim() || 'ثبت نشده';
  const businessType = store.ownership.ownershipKind === 'natural' ? 'حقیقی' : 'حقوقی';
  const profileComplete =
    Boolean(store.ownership.companyName.trim() || store.ownership.brandName.trim() || meta.businessName.trim()) &&
    Boolean(meta.owner.fullName.trim()) &&
    Boolean(meta.owner.mobile?.trim());

  const summaryItems = useMemo(
    () =>
      [
        { label: 'نام کسب‌وکار', value: businessName, status: businessName === 'ثبت نشده' ? 'ثبت نشده' : 'ثبت شده' },
        { label: 'مالک اکانت کسب‌وکار', value: ownerName, status: ownerName === 'ثبت نشده' ? 'ثبت نشده' : 'نمایش داده شده' },
        { label: 'موبایل مالک', value: ownerMobile, status: ownerMobile === 'ثبت نشده' ? 'ثبت نشده' : 'نمایش داده شده' },
        { label: 'نوع کسب‌وکار', value: businessType, status: 'در پروفایل' },
        { label: 'وضعیت پروفایل', value: profileComplete ? 'تکمیل‌شده' : 'ناقص', status: profileComplete ? 'تکمیل‌شده' : 'ناقص' },
      ] as const,
    [businessName, businessType, ownerMobile, ownerName, profileComplete],
  );

  const sections = useMemo(() => overviewSections(store, meta), [meta, store]);

  return (
    <section className="business-profile-overview" dir="rtl" lang="fa">
      <TaavBusinessIntroCard
        layout="hub"
        size="lg"
        width="full"
        themeMode="auto"
        loading={loading}
        eyebrow="پروفایل کسب‌وکار"
        badge={profileComplete ? 'تکمیل‌شده' : 'ناقص'}
        title={businessName}
        description="این بخش خلاصه اطلاعات پایه کسب‌وکار را نشان می‌دهد که در ثبت‌نام، تنظیمات پروفایل و خروجی‌های رسمی استفاده می‌شوند."
        footnote="این بخش برای نمایش اطلاعات پایه کسب‌وکار، وضعیت حساب‌های بانکی و ارتباط آن‌ها با خروجی‌های رسمی تهیه شده است."
        icon={
          <span className="inline-flex h-full w-full items-center justify-center text-[length:var(--taav-text-lg)] font-black">
            {avatarText}
          </span>
        }
      >
        {!loading ? (
          <div className="business-profile-summary-grid">
            {summaryItems.map((item) => (
              <div key={item.label} className="business-profile-summary-item">
                <div className="flex items-center justify-between gap-2">
                  <span>{item.label}</span>
                  <span
                    className={`status-chip ${item.status === 'تکمیل‌شده' ? 'status-chip-completed' : item.status === 'نمایش داده شده' ? 'status-chip-in_progress' : 'status-chip-pending'}`}
                  >
                    {item.status}
                  </span>
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </TaavBusinessIntroCard>

      {!loading ? (
        <TaavModuleCardGrid columns={1} gap="md" className="business-settings-module-grid">
          {sections.map((section) => {
            const status = resolveSectionStatus(section.badgeTone);
            const description = resolveSectionDescription(section.description, status);

            return (
              <TaavModuleCardGridItem key={section.title}>
                <TaavModuleCard
                  title={section.title}
                  description={description}
                  status={status}
                  themeMode="auto"
                  width="full"
                  onClick={() => router.push(section.href)}
                />
              </TaavModuleCardGridItem>
            );
          })}
        </TaavModuleCardGrid>
      ) : null}
    </section>
  );
}
