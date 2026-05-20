import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, ChevronLeft, Info } from 'lucide-react';
import { listPolicies } from '../../../lib/data';
import { getPolicyFamilyKey, getPolicySectionValues } from '../../../lib/policy-workspaces';
import { PolicyPageShell } from '../_components/PolicyWorkspaceShell';

type WorkPolicyPageProps = {
  searchParams?: { policyId?: string } | Promise<{ policyId?: string }>;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fa-IR');
}

export default async function WorkPolicyOverviewPage({ searchParams }: WorkPolicyPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const policies = await listPolicies();
  const selectedPolicy =
    (resolvedSearchParams.policyId ? policies.find((item) => item.id === resolvedSearchParams.policyId) : null) ??
    policies.find((item) => getPolicyFamilyKey(item) === 'work') ??
    policies.find((item) => !getPolicyFamilyKey(item)) ??
    null;

  const sectionValues = getPolicySectionValues(selectedPolicy);
  const title = typeof sectionValues.title === 'string' ? sectionValues.title : selectedPolicy?.title ?? 'سیاست کاری';
  const description =
    typeof sectionValues.description === 'string' ? sectionValues.description : selectedPolicy?.description ?? 'بدون توضیحات';
  const yearLabel = selectedPolicy?.calendar?.yearLabel ?? '-';
  const holidayCount = typeof selectedPolicy?.calendar?.holidayCount === 'number' ? selectedPolicy.calendar.holidayCount : 0;
  const policyId = selectedPolicy?.id ?? '';

  const sectionLinks = [
    { title: 'سیاست های شیفت', href: policyId ? `/policies/shift?policyId=${policyId}` : '/policies/shift' },
    { title: 'سیاستهای شب کاری', href: policyId ? `/policies/night?policyId=${policyId}` : '/policies/night' },
    { title: 'سیاستهای مرخصی', href: policyId ? `/policies/leave?policyId=${policyId}` : '/policies/leave' },
    { title: 'سیاستهای ماموریت', href: policyId ? `/policies/mission?policyId=${policyId}` : '/policies/mission' },
    { title: 'سیاستهای اضافه‌کاری', href: policyId ? `/policies/work/base?policyId=${policyId}&section=overtime` : '/policies/work/base?section=overtime' },
    { title: 'سیاستهای تردد دستی', href: policyId ? `/policies/manual?policyId=${policyId}` : '/policies/manual' },
    { title: 'سیاستهای روز تعطیل', href: policyId ? `/policies/work/base?policyId=${policyId}&section=holiday` : '/policies/work/base?section=holiday' },
    { title: 'سایر سیاستها', href: policyId ? `/policies/work/base?policyId=${policyId}&section=other` : '/policies/work/base?section=other' },
  ];

  return (
    <PolicyPageShell
      title="ویرایش سیاست کاری"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
      breadcrumb={[
        { label: 'دسترنج', href: '/' },
        { label: 'تنظیمات کسب و کار', href: '/business-settings' },
        { label: 'سیاست های کاری', href: '/policies' },
        { label: 'ویرایش سیاست کاری' },
      ]}
    >
      <section className="mx-auto grid w-full max-w-[780px] gap-5">
        <article className="rounded-[26px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)]">
          <div className="flex items-start justify-between gap-4">
            <Link
              href={policyId ? `/policies/work/base?policyId=${policyId}` : '/policies/work/base'}
              className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              ویرایش
            </Link>

            <div className="grid gap-2 text-right">
              <div className="text-3xl font-black text-white">{yearLabel}</div>
              <div className="text-sm text-slate-400">{description || 'بدون توضیحات'}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-5">
            <div className="grid gap-3 text-right">
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-1">
                  <div className="text-2xl font-black text-white">{title}</div>
                  <div className="text-sm text-slate-400">توضیحات: {description || 'ثبت نشده'}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-[1fr_auto_1fr]">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>روزهای کاری / شیفت ها</span>
                    <span>{selectedPolicy?.employeeCount ?? 0}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 w-2/3 rounded-full bg-slate-500" />
                  </div>
                </div>

                <div className="flex items-center justify-center text-slate-500">|</div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>رویداد ها / روز های تعطیل</span>
                    <span>{holidayCount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 w-1/2 rounded-full bg-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-3">
          {sectionLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex h-[58px] items-center justify-between rounded-[20px] border border-white/10 bg-slate-900/60 px-5 text-white transition-colors hover:border-indigo-400/35 hover:bg-slate-900/75"
            >
              <ChevronLeft className="h-5 w-5 text-slate-300" />
              <span className="text-base font-bold">{item.title}</span>
            </Link>
          ))}
        </div>

        {!selectedPolicy ? (
          <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-right text-sm leading-7 text-slate-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-white" />
            <p className="m-0">هنوز سیاست کاری پایه‌ای برای این تقویم ثبت نشده است. ابتدا از بخش ویرایش، اطلاعات پایه را کامل کنید.</p>
          </div>
        ) : null}

        <div className="flex justify-start">
          <Link
            href="/policies"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 text-sm font-bold text-slate-100 transition-colors hover:border-white/20 hover:bg-slate-800/80"
          >
            <ArrowLeft className="h-4 w-4" />
            لغو/بازگشت
          </Link>
        </div>
      </section>
    </PolicyPageShell>
  );
}
