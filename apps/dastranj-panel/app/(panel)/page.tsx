import Link from 'next/link';
import { PageIntro, StatGrid } from '@repo/ui/server';
import { getDashboardData } from '../lib/data';
import { formatFaNumber } from '../lib/format-fa';

const GOLD_CASH_PRICE = 18410950;
const MELTED_GOLD_AMOUNT = 1250000;

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
          <>
            <Link href="/quick-setup" className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-bold text-[#032029] shadow-[0_10px_22px_rgba(20,184,166,0.18)]">
              راه‌اندازی سریع
            </Link>
            <Link href="/business-settings" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/90">
              تنظیمات
            </Link>
          </>
        }
        aside={
          <aside className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-white/55">قیمت لحظه‌ای</p>
                <strong className="mt-2 block text-[28px] font-black leading-tight text-white">
                  {formatFaNumber(GOLD_CASH_PRICE)} تومان
                </strong>
                <p className="mt-2 text-xs leading-6 text-white/65">نمایش عددها با جداکننده‌ی سه‌رقمی برای خوانایی سریع‌تر.</p>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold text-emerald-200">
                طلای آب‌شده
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="text-[11px] font-bold text-white/55">قیمت نقدی</div>
                <div className="mt-2 text-lg font-black text-white">{formatFaNumber(GOLD_CASH_PRICE)} تومان</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="text-[11px] font-bold text-white/55">مقدار طلای آب‌شده</div>
                <div className="mt-2 text-lg font-black text-white">{formatFaNumber(MELTED_GOLD_AMOUNT)} گرم</div>
              </div>
            </div>
          </aside>
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
              : 'برای شروع، پروفایل کسب‌وکار را تکمیل کنید و سپس راه‌اندازی سریع را پیش ببرید تا تقویم، سیاست و کارکنان شما آماده شوند.'}
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
