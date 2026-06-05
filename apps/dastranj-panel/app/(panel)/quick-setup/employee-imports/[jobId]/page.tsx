import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, FileSpreadsheet } from 'lucide-react';
import { getSessionContext } from '../../../../lib/auth';
import { getEmployeeImportJobDetailsForTenant } from '../../../../lib/employee-import-jobs';
import type {
  QuickEmployeeImportJobDetails,
  QuickEmployeeImportJobInvitationChannel,
  QuickEmployeeImportJobRowStatus,
  QuickEmployeeImportJobType,
} from '../../_components/quick-setup.types';

async function getTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return session.tenantId;
}

function jobTypeLabel(type: QuickEmployeeImportJobType) {
  return type === 'excel_add' ? 'افزودن لیستی با اکسل' : 'افزودن لیستی با اکسل و ارسال لینک تکمیل اطلاعات';
}

function jobStatusLabel(status: QuickEmployeeImportJobDetails['status']) {
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

function rowStatusLabel(status: QuickEmployeeImportJobRowStatus) {
  switch (status) {
    case 'created':
      return 'اضافه شد';
    case 'existing_employee':
      return 'قبلاً ثبت شد';
    case 'duplicate_in_file':
      return 'تکراری در فایل';
    case 'invalid':
      return 'نامعتبر';
    case 'failed':
      return 'خطا در پردازش';
    case 'mock_invited':
      return 'دعوت mock ثبت شد';
    case 'mock_invite_failed':
      return 'دعوت mock ناموفق';
    default:
      return 'در انتظار';
  }
}

function jobBadgeClass(status: QuickEmployeeImportJobDetails['status']) {
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

function rowBadgeClass(status: QuickEmployeeImportJobRowStatus) {
  switch (status) {
    case 'created':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-100';
    case 'existing_employee':
      return 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100';
    case 'duplicate_in_file':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-100';
    case 'invalid':
      return 'border-red-400/20 bg-red-500/10 text-red-100';
    case 'failed':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-100';
    case 'mock_invited':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';
    case 'mock_invite_failed':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-100';
    default:
      return 'border-slate-400/20 bg-slate-500/10 text-slate-100';
  }
}

function invitationLabel(channel: QuickEmployeeImportJobInvitationChannel | null, type: QuickEmployeeImportJobType) {
  if (type !== 'excel_add_and_invite') return 'ثبت مستقیم';
  if (!channel) return 'ثبت شد';
  return channel === 'email' ? 'ایمیلی' : 'پیامی';
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'ثبت نشده';
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function contactDisplay(email: string | null, mobile: string | null) {
  return email || mobile || 'ثبت نشده';
}

export default async function EmployeeImportJobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const tenantId = await getTenantId();
  const job = await getEmployeeImportJobDetailsForTenant(tenantId, jobId);
  if (!job) notFound();

  const errorCount = job.duplicateCount + job.invalidCount + job.failedCount;
  const showInvitationColumn = job.type === 'excel_add_and_invite';

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 sm:p-4 lg:p-4" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-[28px] border border-indigo-500/20 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_35%),linear-gradient(135deg,rgba(11,18,40,0.98),rgba(9,14,34,0.92))] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs font-bold text-slate-200">
                <FileSpreadsheet className="h-4 w-4 text-indigo-300" />
                جزئیات فایل اکسل
              </div>
              <h1 className="text-2xl font-black text-white">جزئیات فایل اکسل</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                نتیجه پردازش فایل، وضعیت هر ردیف و خلاصه ثبت کارکنان را مشاهده کنید.
              </p>
            </div>
            <Link
              href="/quick-setup/employee-imports"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به فهرست فایل‌ها
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">نام فایل</div>
            <div className="mt-2 text-lg font-black text-white">{job.fileName}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">نوع عملیات</div>
            <div className="mt-2 text-lg font-black text-white">{jobTypeLabel(job.type)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">وضعیت</div>
            <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${jobBadgeClass(job.status)}`}>{jobStatusLabel(job.status)}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">آخرین بروزرسانی</div>
            <div className="mt-2 text-lg font-black text-white">{formatDateTime(job.updatedAt)}</div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">کل ردیف‌ها</div>
            <div className="mt-2 text-2xl font-black text-white">{job.totalCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">پردازش‌شده</div>
            <div className="mt-2 text-2xl font-black text-white">{job.processedCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">اضافه‌شده</div>
            <div className="mt-2 text-2xl font-black text-white">{job.createdCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">قبلاً ثبت‌شده</div>
            <div className="mt-2 text-2xl font-black text-white">{job.existingCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
            <div className="text-xs text-slate-400">خطادار</div>
            <div className="mt-2 text-2xl font-black text-white">{errorCount}</div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="border-b border-white/10 bg-slate-950/40 text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ردیف</th>
                  <th className="px-4 py-3 font-medium">نام و نام خانوادگی</th>
                  <th className="px-4 py-3 font-medium">ایمیل / موبایل</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="px-4 py-3 font-medium">توضیح</th>
                  {showInvitationColumn ? <th className="px-4 py-3 font-medium">وضعیت دعوت</th> : null}
                </tr>
              </thead>
              <tbody>
                {job.rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-4 align-top text-sm text-slate-300">{row.rowNumber}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-bold text-white">{`${row.firstName} ${row.lastName}`.trim() || 'ثبت نشده'}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-slate-300">{contactDisplay(row.email, row.mobile)}</td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${rowBadgeClass(row.status)}`}>{rowStatusLabel(row.status)}</span>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-slate-300">{row.message ?? '-'}</td>
                    {showInvitationColumn ? (
                      <td className="px-4 py-4 align-top text-sm text-slate-300">{invitationLabel(row.invitationChannel, job.type)}</td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
