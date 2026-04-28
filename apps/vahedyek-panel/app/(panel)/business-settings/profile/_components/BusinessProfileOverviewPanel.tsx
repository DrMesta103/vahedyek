'use client';

import { useEffect, useState } from 'react';
import { BusinessSettingsCard, type BusinessSettingsCardProps } from '../../_components/BusinessSettingsCard';
import { fetchProfileStore, type OwnershipKind } from './profileStorage';

type ProfileSection = BusinessSettingsCardProps & {
  span?: 'full' | 'half';
  onlyFor?: OwnershipKind;
};

const baseSections: ProfileSection[] = [
  {
    title: 'نوع مالکیت و اطلاعات پایه',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 'full',
    href: '/business-settings/profile/ownership',
  },
  {
    title: 'سهامداران اصلی',
    description: 'مدیریت و تنظیم قراردادها، فرم‌های رسمی و اطلاعیه‌ها',
    span: 'half',
    onlyFor: 'legal',
    href: '/business-settings/profile/shareholders',
  },
  {
    title: 'نماینده قانونی',
    description: 'مدیریت و تنظیم قراردادها، فرم‌های رسمی و اطلاعیه‌ها',
    span: 'half',
    href: '/business-settings/profile/representatives',
  },
  {
    title: 'شماره حساب',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 'full',
    href: '/business-settings/profile/bank-accounts',
  },
  {
    title: 'اسناد',
    description: '(در حال توسعه) این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
  },
  {
    title: 'لوگو و مهر',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    href: '/business-settings/profile/branding',
  },
  {
    title: 'ارز پایه',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/currency',
  },
  {
    title: 'زبان های فعال',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/languages',
  },
  {
    title: 'تقویم',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/calendar',
  },
  {
    title: 'واحد اندازه گیری',
    description: 'این اطلاعات می‌تواند فرآیند عقد قرارداد را بهبود ببخشد',
    href: '/business-settings/profile/measurement',
  },
  {
    title: 'راه های ارتباطی',
    description: '(در حال توسعه) در این بخش می‌توانید آدرس ها و شماره های تماس سازمان خود را ثبت نمایید',
    span: 'full',
  },
];

export function BusinessProfileOverviewPanel() {
  const [ownershipKind, setOwnershipKind] = useState<OwnershipKind>('legal');

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setOwnershipKind(store.ownershipKind);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const sections = baseSections
    .filter((section) => !section.onlyFor || section.onlyFor === ownershipKind)
    .map((section) => {
      if (section.title === 'نماینده قانونی' && ownershipKind !== 'legal') {
        return { ...section, span: 'full' as const };
      }
      return section;
    });

  return (
    <section className="business-profile-page">
      <header className="business-profile-intro">
        <p>در پروفایل کسب‌وکار اطلاعات هویتی، حقوقی، مالی و تماس شرکت ثبت می‌شود تا مبنای قراردادها، پروژه‌ها و ارتباطات رسمی در سیستم باشد.</p>
      </header>

      <div className="business-profile-grid">
        {sections.map((section) => (
          <BusinessSettingsCard
            key={section.title}
            title={section.title}
            description={section.description}
            href={section.href}
            className={section.span === 'full' ? 'business-profile-card-full' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
