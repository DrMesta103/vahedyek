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
};

const overviewSections: OverviewSection[] = [
  {
    title: 'نوع مالکیت و اطلاعات پایه',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    href: BUSINESS_PROFILE_OWNERSHIP,
    span: 'full',
  },
  {
    title: 'شماره حساب',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    href: BUSINESS_PROFILE_BANK_ACCOUNTS,
    span: 'full',
  },
  {
    title: 'لوگو و مهر',
    description: 'فایل‌های رسمی برند را برای استفاده در خروجی‌ها و اسناد ثبت کنید',
    href: BUSINESS_PROFILE_BRANDING,
    span: 'full',
  },
];

function OverviewSectionCard({ title, description, href, span = 'half' }: OverviewSection) {
  return (
    <Link
      href={href}
      className={`business-profile-section-card${span === 'full' ? ' is-full' : ''}`}
    >
      <div className="business-profile-section-card-head">
        <div className="business-profile-section-card-pattern" aria-hidden="true" />
        <ChevronLeft className="business-profile-section-card-arrow" aria-hidden="true" />
        <h2>{title}</h2>
      </div>

      <div className="business-profile-section-card-body">
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

  const businessName =
    store.ownership.companyName.trim() ||
    store.ownership.brandName.trim() ||
    meta.businessName.trim() ||
    'دسترنج';
  const avatarText = store.ownership.brandName.trim().charAt(0) || businessName.charAt(0) || meta.brandCode || 'د';
  const summaryItems = [
    { label: 'نام شرکت', value: businessName },
    { label: 'مالک کسب‌وکار', value: meta.owner.fullName || 'ثبت نشده' },
    { label: 'موبایل مالک', value: meta.owner.mobile || 'ثبت نشده' },
  ];

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
              این بخش خلاصه اطلاعات پایه کسب‌وکار و داده‌هایی را نشان می‌دهد که در ثبت‌نام، خرید و تنظیمات
              پروفایل ثبت شده‌اند.
            </p>
          </div>
        </div>

        <div className="business-profile-summary-grid">
          {summaryItems.map((item) => (
            <div key={item.label} className="business-profile-summary-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <p className="business-profile-overview-note">
        در پروفایل کسب‌وکار اطلاعات هویتی، حقوقی، مالی و تماس شرکت ثبت می‌شود تا مبنای قراردادها، پروژه‌ها و ارتباطات رسمی
        در سیستم باشد.
      </p>

      <div className="business-profile-sections-grid">
        {overviewSections.map((section) => (
          <OverviewSectionCard key={section.title} {...section} />
        ))}
      </div>
    </section>
  );
}
