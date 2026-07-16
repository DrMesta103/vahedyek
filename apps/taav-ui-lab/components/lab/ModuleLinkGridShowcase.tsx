'use client';

import { TaavBusinessModuleLinkGrid, type TaavBusinessModuleLinkItem } from '@repo/ui/taav/business';

function LineIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    report: 'M5 3.5h6l2 2v9H5z M8 7h3 M8 10h3 M8 13h2',
    blocks: 'M4 14.5h10 M5.5 14.5V6.5h7v8 M7.5 6.5V4h3v2 M7.5 9h3 M7.5 11.5h3',
    plots: 'M4 6h10 M4 10h10 M4 14h10 M6 4v12 M12 4v12',
    files: 'M5 3.5h5l3 3v8H5z M10 3.5v3h3',
    specs: 'M4 5h10 M4 9h10 M4 13h10 M7 3.5v3 M11 7.5v3 M6 11.5v3',
    address: 'M9 14s4-3.4 4-7a4 4 0 0 0-8 0c0 3.6 4 7 4 7z M9 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    units: 'M4 14.5h10 M5.5 14.5V6h7v8.5 M7.5 8h3 M7.5 11h3 M8 6V4h2v2',
    schedule: 'M4 5h10v9H4z M7 3.5v3 M11 3.5v3 M6 9h2 M10 9h2 M6 12h2',
  };
  return <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="h-[18px] w-[18px]"><path d={paths[kind] ?? paths.files} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const ITEMS: TaavBusinessModuleLinkItem[] = [
  { id: 'reports', title: 'گزارشات اطلاعات مجتمع', description: 'نمایش کلی از اطلاعات مجتمع مانند ثبت واحدها و طبقات مجتمع', icon: <LineIcon kind="report" /> },
  { id: 'blocks', title: 'فهرست بلوک‌ها', description: 'نمایش لیست بلوک‌های مجتمع', icon: <LineIcon kind="blocks" /> },
  { id: 'plots', title: 'پلاک اصلی / پلاک فرعی', description: 'پلاک اصلی: ۲ (پلاک فرعی ۱۵) و پلاک اصلی: ۲ (پلاک فرعی ۱۵)', icon: <LineIcon kind="plots" /> },
  { id: 'specifications', title: 'مشخصات فنی پروژه', description: 'مشخصات فنی شامل هرگونه اطلاعات مربوط به اجزا همراه با فروش واحد', icon: <LineIcon kind="specs" /> },
  { id: 'files', title: 'فایل‌ها', description: 'بارگذاری اسناد تکمیلی مانند نقشه‌ها، پروانه ساخت، گزارش‌های فنی و عکس‌های رسمی', icon: <LineIcon kind="files" /> },
  { id: 'address', title: 'آدرس', description: 'آدرس دقیق محل احداث پروژه؛ از این آدرس در مفاد قرارداد استفاده می‌گردد', icon: <LineIcon kind="address" /> },
  { id: 'units', title: 'تیپ‌های واحد', description: 'فهرست تیپ‌های واحد مجتمع', icon: <LineIcon kind="units" /> },
  { id: 'schedule', title: 'برنامه زمان‌بندی پیشرفت فیزیکی', description: 'لیست برنامه‌ها، مراحل، آمار و عملیات کنترل و حذف را مدیریت کنید.', icon: <LineIcon kind="schedule" /> },
];

export function ModuleLinkGridShowcase() {
  return (
    <div className="grid gap-6">
      <div
        dir="rtl"
        data-taav-theme="light"
        className="rounded-none bg-[var(--taav-bg)] px-5 py-4"
      >
        <p className="mb-3 text-sm font-semibold text-[var(--taav-text-muted)]">نمونه روشن</p>
        <TaavBusinessModuleLinkGrid items={ITEMS} />
      </div>
      <div
        dir="rtl"
        data-taav-theme="dark"
        className="rounded-none bg-[var(--taav-bg)] px-5 py-4"
      >
        <p className="mb-3 text-sm font-semibold text-[var(--taav-text-muted)]">نمونه تیره</p>
        <TaavBusinessModuleLinkGrid items={ITEMS} />
      </div>
    </div>
  );
}

export function ModuleLinkGridPatternShowcase() {
  return (
    <div
      dir="rtl"
      data-taav-theme="light"
      className="w-full bg-[var(--taav-bg)] px-5 py-4"
    >
      <TaavBusinessModuleLinkGrid items={ITEMS} columns={2} gap="md" />
    </div>
  );
}
