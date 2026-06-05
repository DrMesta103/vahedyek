import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, FileSpreadsheet } from 'lucide-react';
import { getSessionContext } from '../../../lib/auth';
import { listEmployeeImportJobsForTenant } from '../../../lib/employee-import-jobs';
import type { QuickEmployeeImportJobStatus, QuickEmployeeImportJobType } from '../_components/quick-setup.types';

async function getTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return session.tenantId;
}

function jobTypeLabel(type: QuickEmployeeImportJobType) {
  return type === 'excel_add' ? 'افزودن لیستی با اکسل' : 'افزودن لیستی با اکسل و ارسال لینک تکمیل اطلاعات';
}

function jobStatusLabel(status: QuickEmployeeImportJobStatus) {
  switch (status) {
    case 'queued':
      return 'در صف پردازش';
    case 'processing':
      return 'در حال پردازش';
    case 'completed':
      return 'تکمیل‌شده';
    case 'completed_with_errors':
      return 'تکمیل‌شده با خطا';
    case 'failed':
      return 'ناموفق';
    default:
      return 'در صف پردازش';
  }
}

function jobStatusClass(status: QuickEmployeeImportJobStatus) {
  switch (status) {
    case 'queued':
      return 'border-slate-400/20 bg-slate-500/10 text-slate-100';
    case 'processing':
      return 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100';
    case 'completed':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';
    case 'completed_with_errors':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-100';
    case 'failed':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-100';
    default:
      return 'border-slate-400/20 bg-slate-500/10 text-slate-100';
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'ثبت نشده';
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default async function EmployeeImportJobsPage() {
  const tenantId = await getTenantId();
  const jobs = await listEmployeeImportJobsForTenant(tenantId, 100);
  const totals = jobs.reduce(
    (acc, job) => {
      acc.total += 1;
      if (job.status === 'processing' || job.status === 'queued') acc.processing += 1;
      if (job.status === 'completed_with_errors' || job.status === 'failed') acc.withErrors += 1;
      if (job.status === 'completed') acc.completed += 1;
      return acc;
    },
    { total: 0, processing: 0, withErrors: 0, completed: 0 },
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 sm:p-4 lg:p-4" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-[28px] border border-indigo-500/20 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_35%),linear-gradient(135deg,rgba(11,18,40,0.98),rgba(9,14,34,0.92))] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs font-bold text-slate-200">
                <FileSpreadsheet className="h-4 w-4 text-indigo-300" />
                فایل‌های اکسل کارکنان
              </div>
              <h1 className="text-2xl font-black text-white">فایل‌های اکسل کارکنان</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                وضعیت فایل‌های بارگذاری‌شده، پردازش ردیف‌ها و نتیجه ثبت کارکنان را اینجا مشاهده کنید.
              </p>
            </div>
            <Link
              href="/quick-setup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به راه‌اندازی سریع
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">کل فایل‌ها</div>
            <div className="mt-2 text-2xl font-black text-white">{totals.total}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">در حال پردازش</div>
            <div className="mt-2 text-2xl font-black text-white">{totals.processing}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">تکمیل‌شده</div>
            <div className="mt-2 text-2xl font-black text-white">{totals.completed}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">دارای خطا</div>
            <div className="mt-2 text-2xl font-black text-white">{totals.withErrors}</div>
          </div>
        </section>

        {jobs.length ? (
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="min-w-full text-right">
                <thead className="border-b border-white/10 bg-slate-950/40 text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">نام فایل</th>
                    <th className="px-4 py-3 font-medium">نوع عملیات</th>
                    <th className="px-4 py-3 font-medium">وضعیت فایل</th>
                    <th className="px-4 py-3 font-medium">خلاصه ردیف‌ها</th>
                    <th className="px-4 py-3 font-medium">تاریخ بارگذاری</th>
                    <th className="px-4 py-3 font-medium">اقدام</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const errorCount = job.duplicateCount + job.invalidCount + job.failedCount;
                    return (
                      <tr key={job.id} className="border-b border-white/5 last:border-b-0">
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-1">
                            <div className="font-bold text-white">{job.fileName}</div>
                            <div className="text-xs text-slate-400">کل ردیف‌ها: {job.totalCount}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-300">{jobTypeLabel(job.type)}</td>
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${jobStatusClass(job.status)}`}>
                            {jobStatusLabel(job.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-slate-200">ثبت‌شده {job.createdCount}</span>
                            <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-slate-200">قبلاً ثبت‌شده {job.existingCount}</span>
                            <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-slate-200">تکراری در فایل {job.duplicateCount}</span>
                            <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-slate-200">نامعتبر {job.invalidCount}</span>
                            <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-slate-200">خطادار {errorCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-300">{formatDateTime(job.updatedAt)}</td>
                        <td className="px-4 py-4 align-top">
                          <Link
                            href={`/quick-setup/employee-imports/${job.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-100 transition-colors hover:bg-indigo-500/20"
                          >
                            مشاهده جزئیات
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-dashed border-white/15 bg-slate-950/25 p-6 text-right">
            <div className="text-lg font-bold text-white">هنوز فایل اکسل بارگذاری نشده است.</div>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
              پس از بارگذاری فایل از مرحله ۴ راه‌اندازی سریع، اینجا می‌توانید وضعیت پردازش و نتیجه هر ردیف را ببینید.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
