import type { ReactNode } from 'react';

type SectionToolbarCardDemoItem = {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  actionLabel: string;
  icon: ReactNode;
};

function LegalRepresentativeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
      <path d="M5 20V10l7-4 7 4v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12.5h1.2M13.3 12.5h1.2M9.5 9.5h1.2M13.3 9.5h1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EmployeesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 20a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.8 20a4 4 0 0 1 6.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UnitsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
      <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 15.5 12 20l8-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export const SECTION_TOOLBAR_CARD_DEMO_ITEMS: SectionToolbarCardDemoItem[] = [
  {
    id: 'legal-representative',
    title: 'نماینده قانونی / صاحب امضا',
    description: 'ثبت و مدیریت اطلاعات نماینده قانونی، صاحب امضا و دسترسی‌های رسمی این بخش',
    placeholder: 'جستجوی نماینده قانونی',
    actionLabel: 'افزودن نماینده',
    icon: <LegalRepresentativeIcon />,
  },
  {
    id: 'employees',
    title: 'لیست کارمندان / اعضا',
    description: 'ثبت و مدیریت کارمندها و اعضای مرتبط با همین بخش، با دسترسی سریع به جستجو',
    placeholder: 'جستجوی کارمند',
    actionLabel: 'افزودن کارمند',
    icon: <EmployeesIcon />,
  },
  {
    id: 'units',
    title: 'فهرست واحدها',
    description: 'نمایش و مدیریت واحدهای زیرمجموعه با امکان جستجو و ثبت سریع واحد جدید',
    placeholder: 'جستجوی واحد',
    actionLabel: 'افزودن واحد',
    icon: <UnitsIcon />,
  },
];
