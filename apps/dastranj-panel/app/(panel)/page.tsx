import Link from 'next/link';
import { getDashboardData } from '../lib/data';
import { PageIntro, StatGrid } from '@repo/ui/server';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const setupStatus = data.profile?.quickSetupStatus ?? 'pending';
  const setupStatusLabel =
    setupStatus === 'completed' ? 'تکمیل شده' : setupStatus === 'in_progress' ? 'در حال انجام' : 'شروع نشده';

  return (
    <div className="page-stack">
      <PageIntro
        title="داشبورد دسترنج"
        description="نمای کلی از دامنه‌های اصلی کسب‌وکار، منابع انسانی، تقویم، سیاست‌ها و پیش‌نویس‌ها."
        action={
          <div className="inline-actions">
            <Link href="/quick-setup" className="primary-link">
              راه‌اندازی سریع
            </Link>
            <Link href="/business-settings" className="secondary-link">
              تنظیمات
            </Link>
          </div>
        }
      />

      <StatGrid items={data.stats} />

      <section className="dashboard-grid">
        <article className="dashboard-spotlight">
          <div className="dashboard-spotlight-head">
            <div>
              <p className="eyebrow">پروفایل کسب‌وکار</p>
              <h3>{data.profile?.brandName ?? 'هنوز پروفایلی ثبت نشده'}</h3>
            </div>
            <span className={`status-chip status-chip-${setupStatus}`}>{setupStatusLabel}</span>
          </div>
          <p>
            {data.profile
              ? `${data.profile.legalName ?? data.profile.brandName} با وضعیت راه‌اندازی ${setupStatusLabel} در حال استفاده از دسترنج است.`
              : 'برای شروع، پروفایل کسب‌وکار را تکمیل کنید و سپس راه‌اندازی سریع را پیش ببرید تا تقویم، سیاست و کارمندان شما آماده شوند.'}
          </p>
          <div className="metric-inline-row">
            <div className="metric-inline-card">
              <span>ایمیل تماس</span>
              <strong>{data.profile?.contactEmail ?? 'ثبت نشده'}</strong>
            </div>
            <div className="metric-inline-card">
              <span>تلفن</span>
              <strong>{data.profile?.phone ?? 'ثبت نشده'}</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-actions-card">
          <div className="dashboard-actions-head">
            <h3>میانبرهای مدیریتی</h3>
            <p>مسیرهای پرتکرار را بدون جابه‌جایی در منو ادامه دهید.</p>
          </div>
          <div className="action-tile-grid">
            <Link href="/locations/new" className="action-tile">
              <strong>ثبت محل کار</strong>
              <span>تعریف موقعیت و شعاع مجاز</span>
            </Link>
            <Link href="/calendars/new" className="action-tile">
              <strong>تقویم کاری</strong>
              <span>ساخت سال کاری و تعطیلات</span>
            </Link>
            <Link href="/employees/new" className="action-tile">
              <strong>افزودن کارمند</strong>
              <span>ساخت پرونده پرسنلی</span>
            </Link>
            <Link href="/work-groups/new" className="action-tile">
              <strong>گروه کاری</strong>
              <span>اتصال اعضا، محل و سیاست</span>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
