'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  span?: 'full' | 'half';
  badge: string;
  badgeTone: 'pending' | 'completed' | 'in_progress';
};

const overviewSections = (store: ProfileStore, meta: ProfileMeta): OverviewSection[] => {
  const displayBrandName = store.ownership.brandName.trim() && store.ownership.brandName.trim() !== 'دسترنج' ? store.ownership.brandName.trim() : '';
  const hasBaseInfo = Boolean(store.ownership.companyName.trim() || displayBrandName || meta.businessName.trim()) && Boolean(meta.owner.fullName.trim());
  const hasBankAccounts = store.bankAccounts.length > 0;
  const hasBrandingData = Boolean(store.branding.logoImage.trim() || store.branding.sealImage.trim() || store.branding.headerImage.trim() || store.branding.footerImage.trim());

  return [
    {
      title: 'اطلاعات پایه کسب‌وکار',
      description: 'اطلاعات هویتی و رسمی کسب‌وکار را برای استفاده در قراردادها، گزارش‌ها و خروجی‌های رسمی آماده کنید.',
      href: BUSINESS_PROFILE_OWNERSHIP,
      span: 'full',
      badge: hasBaseInfo ? 'تکمیل‌شده' : 'ناقص',
      badgeTone: hasBaseInfo ? 'completed' : 'pending',
    },
    {
      title: 'حساب‌های بانکی',
      description: 'حساب‌های بانکی کسب‌وکار را برای استفاده در قراردادها، گزارش‌ها و فرآیندهای مالی مدیریت کنید.',
      href: BUSINESS_PROFILE_BANK_ACCOUNTS,
      span: 'full',
      badge: hasBankAccounts ? 'تکمیل‌شده' : 'ناقص',
      badgeTone: hasBankAccounts ? 'completed' : 'pending',
    },
    {
      title: 'لوگو، مهر و سربرگ',
      description: 'فایل‌های رسمی برند و تنظیمات ظاهری خروجی‌های سازمانی را برای مراحل بعدی آماده نگه دارید.',
      href: BUSINESS_PROFILE_BRANDING,
      span: 'full',
      badge: hasBrandingData ? 'تکمیل‌شده' : 'ناقص',
      badgeTone: hasBrandingData ? 'completed' : 'pending',
    },
  ];
};

function OverviewSectionCard({ title, description, href, span = 'half', badge, badgeTone }: OverviewSection) {
  return (
    <Link href={href} className={`business-profile-section-card${span === 'full' ? ' is-full' : ''}`}>
      <div className="business-profile-section-card-head">
        <div className="business-profile-section-card-pattern" aria-hidden="true" />
        <ChevronLeft className="business-profile-section-card-arrow" aria-hidden="true" />
        <h2>{title}</h2>
      </div>

      <div className="business-profile-section-card-body">
        <div className="mb-3 flex justify-center">
          <span className={`status-chip ${badgeTone === 'completed' ? 'status-chip-completed' : badgeTone === 'in_progress' ? 'status-chip-in_progress' : 'status-chip-pending'}`}>
            {badge}
          </span>
        </div>
        <p>{description}</p>
      </div>
    </Link>
  );
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

  const summaryItems = [
    { label: 'نام کسب‌وکار', value: businessName, status: businessName === 'ثبت نشده' ? 'ثبت نشده' : 'ثبت شده' },
    { label: 'مالک اکانت کسب‌وکار', value: ownerName, status: ownerName === 'ثبت نشده' ? 'ثبت نشده' : 'نمایش داده شده' },
    { label: 'موبایل مالک', value: ownerMobile, status: ownerMobile === 'ثبت نشده' ? 'ثبت نشده' : 'نمایش داده شده' },
    { label: 'نوع کسب‌وکار', value: businessType, status: 'در پروفایل' },
    { label: 'وضعیت پروفایل', value: profileComplete ? 'تکمیل‌شده' : 'ناقص', status: profileComplete ? 'تکمیل‌شده' : 'ناقص' },
  ] as const;

  if (loading) {
    return <div className="profile-summary-card">در حال بارگذاری...</div>;
  }

  return (
    <section className="business-profile-overview">
      <section className="business-profile-summary-shell">
        <div className="business-profile-summary-head">
          <div className="business-profile-summary-avatar" aria-hidden="true">
            <span>{avatarText}</span>
          </div>

          <div className="business-profile-summary-copy">
            <h1>{businessName}</h1>
            <p>
              این بخش خلاصه اطلاعات پایه کسب‌وکار را نشان می‌دهد که در ثبت‌نام، تنظیمات پروفایل و خروجی‌های رسمی استفاده می‌شوند.
            </p>
          </div>
        </div>

        <div className="business-profile-summary-grid">
          {summaryItems.map((item) => (
            <div key={item.label} className="business-profile-summary-item">
              <div className="flex items-center justify-between gap-2">
                <span>{item.label}</span>
                <span className={`status-chip ${item.status === 'تکمیل‌شده' ? 'status-chip-completed' : item.status === 'نمایش داده شده' ? 'status-chip-in_progress' : 'status-chip-pending'}`}>
                  {item.status}
                </span>
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <p className="business-profile-overview-note">
        این بخش برای نمایش اطلاعات پایه کسب‌وکار، وضعیت حساب‌های بانکی و ارتباط آن‌ها با خروجی‌های رسمی تهیه شده است.
      </p>

      <div className="business-profile-sections-grid">
        {overviewSections(store, meta).map((section) => (
          <OverviewSectionCard key={section.title} {...section} />
        ))}
      </div>
    </section>
  );
}
