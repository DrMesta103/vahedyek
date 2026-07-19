'use client';

import { TaavProjectStructureCard } from '@repo/ui/taav/business';
import type { ReactNode } from 'react';
import { useState } from 'react';

const usageTypes = [
  { key: 'residential', label: 'مسکونی', tone: 'blue' as const },
  { key: 'commercial', label: 'تجاری', tone: 'orange' as const },
  { key: 'administrative', label: 'اداری' },
  { key: 'parking', label: 'پارکینگ' },
  { key: 'warehouse', label: 'انباری' },
  { key: 'welfare', label: 'رفاهی' },
];

const progressReport = {
  title: 'گزارش مالی و پیشرفت فیزیکی پروژه',
  description: 'برای شروع می‌توانید اطلاعات پیشرفت را ثبت کنید.',
  statusLabel: 'تکمیل نشده',
  status: 'incomplete' as const,
};

export function ProjectStructureCardShowcase() {
  const [lastAction, setLastAction] = useState('');
  const action = (message: string) => setLastAction(message);
  const reportWithAction = { ...progressReport, onClick: () => action('گزارش پیشرفت انتخاب شد'), onMoreClick: () => action('جزئیات بیشتر گزارش انتخاب شد') };
  const menuActions = (name: string) => [
    { key: 'edit', label: 'ویرایش', icon: 'edit' as const, onClick: () => action(`ویرایش ${name}`) },
    { key: 'copy', label: 'کپی', icon: 'copy' as const, onClick: () => action(`کپی ${name}`) },
    { key: 'delete', label: 'حذف', icon: 'delete' as const, onClick: () => action(`حذف ${name}`) },
  ];
  const usageAction = (label: string) => action(`نوع کاربری «${label}» انتخاب شد`);

  const commonActions = { onUsageTypeClick: (usage: (typeof usageTypes)[number]) => usageAction(usage.label) };
  return <div dir="rtl" className="space-y-8">
    <section className="space-y-3">
      <h3 className="m-0 text-lg font-bold text-[#3f4d55]">کامپوننت اصلی</h3>
      <p className="m-0 text-sm leading-6 text-[#68757c]">همه‌ی توکن‌ها از همین کامپوننت پایه ساخته می‌شوند و اکشن‌های کارت و چیپ‌ها از props کنترل می‌شوند.</p>
      <div className="max-w-[390px]">
        <TaavProjectStructureCard {...commonActions} variant="full" tone="teal" entityType="plate" title="۵ هخج ۸" subtitle="پلاک اصلی ۱ پلاک فرعی ۱۵" usageTypes={usageTypes} activeUsageType="residential" progressReport={reportWithAction} showMenu menuActions={menuActions('پلاک')} showNavigate onNavigate={() => action('جزئیات پلاک انتخاب شد')} />
      </div>
    </section>
    <section className="space-y-4">
      <h3 className="m-0 text-lg font-bold text-[#3f4d55]">توکن‌ها و variantها</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Token title="variant: compact"><TaavProjectStructureCard {...commonActions} variant="compact" tone="teal" entityType="floor" title="۱" subtitle="پلاک اصلی ۱ پلاک فرعی ۱۵" usageTypes={usageTypes} activeUsageType="residential" showMenu menuActions={menuActions('طبقه')} /></Token>
        <Token title="variant: usageOnly"><TaavProjectStructureCard {...commonActions} variant="usageOnly" tone="gold" entityType="unit" title="الغلا" usageTypes={usageTypes} activeUsageType="commercial" showMenu menuActions={menuActions('واحد')} /></Token>
        <Token title="variant: report"><TaavProjectStructureCard {...commonActions} variant="report" tone="teal" entityType="block" title="۵ هخج ۱۰" subtitle="پلاک اصلی ۱ پلاک فرعی ۱۵" progressReport={reportWithAction} showNavigate onNavigate={() => action('جزئیات بلوک انتخاب شد')} /></Token>
        <Token title="variant: minimal"><TaavProjectStructureCard {...commonActions} variant="minimal" tone="gold" entityType="area" title="۶" usageTypes={usageTypes} activeUsageType="commercial" showMenu menuActions={menuActions('فضا')} /></Token>
      </div>
    </section>
    {lastAction && <p role="status" className="m-0 rounded-xl bg-[#eef7f8] px-4 py-3 text-sm font-medium text-[#3f7784]">{lastAction}</p>}
  </div>;
}

function Token({ title, children }: { title: string; children: ReactNode }) {
  return <div className="space-y-2"><h4 className="m-0 text-sm font-semibold text-[#5d6a70]">{title}</h4>{children}</div>;
}
