import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { savePolicyWorkspaceAction } from '../../../lib/actions';
import { listCalendars } from '../../../lib/data';
import { PolicyPageShell } from '../_components/PolicyWorkspaceShell';

export default async function NewPolicyPage() {
  const calendars = await listCalendars();

  return (
    <PolicyPageShell
      title="ثبت سیاست کاری جدید"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
      breadcrumb={[
        { label: 'دسترنج', href: '/' },
        { label: 'تنظیمات کسب و کار', href: '/business-settings' },
        { label: 'سیاست‌های کاری', href: '/policies' },
        { label: 'افزودن سیاست کاری' },
      ]}
    >
      <form action={savePolicyWorkspaceAction} className="mx-auto grid w-full max-w-[760px] gap-6">
        <input type="hidden" name="familyKey" value="work" />
        <input type="hidden" name="variant" value="default" />

        <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)] sm:p-6">
          <div className="mb-6 text-right">
            <h2 className="text-xl font-black text-white">اطلاعات پایه</h2>
          </div>

          <div className="grid gap-6">
            <label className="grid gap-3 text-right">
              <span className="text-sm font-bold text-slate-100">
                عنوان <span className="text-rose-400">*</span>
              </span>
              <input
                name="title"
                required
                className="h-12 rounded-2xl border border-white/15 bg-slate-950/40 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400/60"
              />
              <span className="text-xs leading-6 text-slate-400">عنوان قالب پیش‌نویس قرارداد</span>
            </label>

            <label className="grid gap-3 text-right">
              <span className="text-sm font-bold text-slate-100">توضیحات</span>
              <textarea
                name="description"
                rows={4}
                className="resize-none rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-sm leading-7 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400/60"
              />
              <span className="text-xs leading-6 text-slate-400">توضیحات تکمیلی برای این قالب (اختیاری)</span>
            </label>

            <label className="grid gap-3 text-right">
              <span className="text-sm font-bold text-slate-100">
                انتخاب تقویم کاری <span className="text-rose-400">*</span>
              </span>
              <span className="relative">
                <select
                  name="calendarId"
                  required
                  defaultValue=""
                  className="h-12 w-full appearance-none rounded-2xl border border-white/15 bg-slate-950/40 px-4 pl-10 text-sm text-white outline-none transition-colors focus:border-indigo-400/60"
                >
                  <option value="" disabled>
                    انتخاب کنید
                  </option>
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.title} {calendar.yearLabel ? `- ${calendar.yearLabel}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </span>
              <span className="text-xs leading-6 text-slate-400">این تنظیم بعد از ذخیره سیاست غیرقابل تغییر است</span>
            </label>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3">
          <Link
            href="/policies"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-500/80 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-500"
          >
            لغو/بازگشت
          </Link>
          <button
            type="submit"
            disabled={calendars.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            ایجاد قالبی
          </button>
        </div>

        {calendars.length === 0 ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-right text-sm leading-7 text-amber-100">
            برای ثبت سیاست کاری ابتدا باید یک تقویم کاری ثبت شده باشد.
          </div>
        ) : null}
      </form>
    </PolicyPageShell>
  );
}
