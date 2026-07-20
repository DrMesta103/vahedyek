'use client';

import { TaavProjectStructureCard } from '@repo/ui/taav/business';

const usageTypes = [
  { key: 'residential', label: 'مسکونی' },
  { key: 'commercial', label: 'تجاری' },
  { key: 'administrative', label: 'اداری' },
  { key: 'parking', label: 'پارکینگ' },
  { key: 'warehouse', label: 'انباری' },
  { key: 'welfare', label: 'رفاهی' },
];

export function ProjectStructureCardShowcase() {
  const action = (_message: string) => undefined;
  const progressReport = {
    title: 'گزارش مالی و پیشرفت فیزیکی پروژه',
    description: 'برای شروع می‌توانید اطلاعات پیشرفت را ثبت کنید.',
    statusLabel: 'تکمیل نشده',
    status: 'incomplete' as const,
    onClick: () => action('گزارش پیشرفت انتخاب شد'),
    onMoreClick: () => action('جزئیات بیشتر گزارش انتخاب شد'),
  };

  return <div dir="rtl" className="space-y-8">
    <section className="space-y-3">
      <h3 className="m-0 text-lg font-bold text-[#3f4d55]">کارت بلوک</h3>
    <div className="max-w-[300px]">
      <TaavProjectStructureCard
        title="۵ هخج ۸"
        subtitle="پلاک اصلی ۱ پلاک فرعی ۱۵"
        usageTitle="نوع کاربری"
        usageTypes={usageTypes}
        activeUsageType="commercial"
        progressReport={progressReport}
        showMenu
        menuActions={[
          { key: 'edit', label: 'ویرایش', icon: 'edit', onClick: () => action('ویرایش کارت') },
          { key: 'copy', label: 'کپی', icon: 'copy', onClick: () => action('کپی کارت') },
          { key: 'delete', label: 'حذف', icon: 'delete', onClick: () => action('حذف کارت') },
        ]}
        onUsageTypeClick={(usage) => action(`نوع کاربری «${usage.label}» انتخاب شد`)}
        showNavigate
        onNavigate={() => action('جزئیات کارت انتخاب شد')}
      />
    </div>
    </section>
    <section className="space-y-3">
      <h3 className="m-0 text-lg font-bold text-[#3f4d55]">توکن طبقه</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[['۱', 'administrative'], ['۲', 'residential']].map(([title, activeUsageType]) => <TaavProjectStructureCard
          key={title}
          token="floor"
          title={title}
          usageTitle="نوع کاربری"
          usageTypes={usageTypes}
          activeUsageType={activeUsageType}
          showMenu
          menuActions={[
            { key: 'edit', label: 'ویرایش', icon: 'edit', onClick: () => action(`ویرایش طبقه ${title}`) },
            { key: 'copy', label: 'کپی', icon: 'copy', onClick: () => action(`کپی طبقه ${title}`) },
            { key: 'delete', label: 'حذف', icon: 'delete', onClick: () => action(`حذف طبقه ${title}`) },
          ]}
          onUsageTypeClick={(usage) => action(`نوع کاربری «${usage.label}» برای طبقه ${title} انتخاب شد`)}
        />)}
      </div>
    </section>
    <section className="space-y-3">
      <h3 className="m-0 text-lg font-bold text-[#3f4d55]">توکن واحد</h3>
      <TaavProjectStructureCard
        token="unit"
        title="۱۲"
        usageTitle="نوع کاربری تجاری"
        unitAreaText="متراژ ۵۶ متر مربع"
        usageTypes={[
          { key: 'bedroom', label: 'اتاق خواب ۲', tone: 'orange' },
          { key: 'balcony', label: 'بالکن ۲', tone: 'blue' },
          { key: 'parking', label: 'پارکینگ', tone: 'teal' },
          { key: 'warehouse', label: 'انباری', tone: 'purple' },
        ]}
        statusItems={[
          { key: 'sold', label: 'فروخته شده', tone: 'danger', icon: 'close' },
          { key: 'undelivered', label: 'تحویل داده نشده', tone: 'warning', icon: 'clock' },
        ]}
        showMenu
        menuActions={[
          { key: 'edit', label: 'ویرایش', icon: 'edit', onClick: () => action('ویرایش واحد') },
          { key: 'copy', label: 'کپی', icon: 'copy', onClick: () => action('کپی واحد') },
          { key: 'delete', label: 'حذف', icon: 'delete', onClick: () => action('حذف واحد') },
          { key: 'type', label: 'ثبت تیپ واحد', icon: 'custom', onClick: () => action('ثبت تیپ واحد') },
        ]}
        onUsageTypeClick={(usage) => action(`نوع کاربری «${usage.label}» برای واحد انتخاب شد`)}
      />
    </section>
  </div>;
}
