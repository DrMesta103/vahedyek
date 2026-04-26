import Link from 'next/link';
import { getDashboardData } from '../lib/data';
import { PageIntro, StatGrid } from '../components/ui';

export default async function DashboardPage() {
  const data = await getDashboardData();

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

      <section className="highlight-card">
        <div>
          <p className="eyebrow">پروفایل کسب‌وکار</p>
          <h3>{data.profile?.brandName ?? 'هنوز پروفایلی ثبت نشده'}</h3>
          <p>
            {data.profile
              ? `${data.profile.legalName ?? data.profile.brandName} با وضعیت راه‌اندازی ${data.profile.quickSetupStatus}`
              : 'برای شروع از صفحه راه‌اندازی سریع یا حساب کسب‌وکار استفاده کنید.'}
          </p>
        </div>
      </section>
    </div>
  );
}
