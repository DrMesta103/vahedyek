import Link from 'next/link';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ArrowLeft, Check, Info } from 'lucide-react';
import { savePolicyWorkspaceAction } from '../../../../lib/actions';
import { listPolicies } from '../../../../lib/data';
import { findPolicyByFamilyKey, getPolicySectionValues } from '../../../../lib/policy-workspaces';
import { PolicyFamilyNav, PolicyFieldLabel, PolicyPageShell, PolicySectionCard } from '../../_components/PolicyWorkspaceShell';

type WorkPolicyBasePageProps = {
  searchParams?: { policyId?: string; section?: string } | Promise<{ policyId?: string; section?: string }>;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-12 rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400/60',
        props.className,
      )}
    />
  );
}

function FieldTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-7 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400/60',
        props.className,
      )}
    />
  );
}

function ToggleField({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3">
      <span className="grid gap-1 text-right">
        <span className="text-sm font-bold text-white">{label}</span>
        {hint ? <span className="text-xs leading-6 text-slate-400">{hint}</span> : null}
      </span>
      <span className="relative inline-flex h-7 w-12 items-center">
        <input name={name} type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-slate-600 transition-colors peer-checked:bg-indigo-500" />
        <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function InfoStrip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/35 bg-indigo-500/10 px-4 py-3 text-right text-sm leading-7 text-slate-200">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-100" />
      <p className="m-0">{text}</p>
    </div>
  );
}

export default async function WorkPolicyBasePage({ searchParams }: WorkPolicyBasePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const policies = await listPolicies();
  const policy =
    (resolvedSearchParams.policyId ? policies.find((item) => item.id === resolvedSearchParams.policyId) : null) ??
    findPolicyByFamilyKey(policies, 'work');
  const sectionValues = getPolicySectionValues(policy);

  const defaults = {
    title: typeof sectionValues.title === 'string' ? sectionValues.title : policy?.title ?? 'سیاست کاری',
    description: typeof sectionValues.description === 'string' ? sectionValues.description : policy?.description ?? 'تنظیمات پایه و سطح سازمانی',
    startTime: typeof sectionValues.startTime === 'string' ? sectionValues.startTime : '08:00',
    endTime: typeof sectionValues.endTime === 'string' ? sectionValues.endTime : '17:00',
    maxDelayMinutes: typeof sectionValues.maxDelayMinutes === 'number' ? sectionValues.maxDelayMinutes : 60,
    requireAttachment: Boolean(sectionValues.requireAttachment),
    allowManualApproval: Boolean(sectionValues.allowManualApproval),
    breakDeduct: Boolean(sectionValues.breakDeduct),
  };

  const sectionHint =
    resolvedSearchParams.section === 'overtime'
      ? 'این صفحه فعلا با همان تنظیمات پایه موجود کار می‌کند و به بخش سیاست‌های اضافه‌کاری متصل شده است.'
      : resolvedSearchParams.section === 'holiday'
        ? 'این صفحه فعلا با همان تنظیمات پایه موجود کار می‌کند و برای تنظیمات روز تعطیل استفاده می‌شود.'
        : resolvedSearchParams.section === 'other'
          ? 'این صفحه فعلا با همان تنظیمات پایه موجود کار می‌کند و برای سایر سیاست‌ها استفاده می‌شود.'
          : 'در سیاست کاری فقط پارامترهای پایه و قواعد سازمانی قابل تنظیم است و سایر خانواده‌ها از آن تبعیت می‌کنند.';

  return (
    <PolicyPageShell
      title="ویرایش سیاست کاری"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
      breadcrumb={[
        { label: 'دسترنج', href: '/' },
        { label: 'تنظیمات کسب و کار', href: '/business-settings' },
        { label: 'سیاست های کاری', href: '/policies' },
        { label: 'ویرایش سیاست کاری', href: `/policies/work${policy?.id ? `?policyId=${policy.id}` : ''}` },
        { label: 'اطلاعات پایه' },
      ]}
      banner="در سیاست کاری فقط پارامترهای هسته‌ای و قواعد عمومی سازمان تنظیم می‌شود."
      actionHref={policy?.id ? `/policies/work?policyId=${policy.id}` : '/policies/work'}
      actionLabel="بازگشت به سیاست کاری"
    >
      <PolicyFamilyNav activeFamily="work" />

      <form action={savePolicyWorkspaceAction} className="grid gap-5">
        <input type="hidden" name="familyKey" value="work" />
        <input type="hidden" name="variant" value="default" />
        <input type="hidden" name="policyId" value={policy?.id ?? ''} />
        <input type="hidden" name="calendarId" value={policy?.calendarId ?? ''} />

        <PolicySectionCard title="سیاست کاری" description="تنظیمات پایه و سطح سازمانی">
          <div className="grid gap-5">
            <InfoStrip text={sectionHint} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-3">
                <PolicyFieldLabel label="عنوان سیاست کاری" required hint="نام نمایشی سیاست سازمان" />
                <FieldInput name="title" defaultValue={defaults.title} required />
              </label>
              <label className="grid gap-3">
                <PolicyFieldLabel label="توضیحات" hint="توضیح کوتاه و قابل فهم برای مدیران" />
                <FieldTextarea name="description" rows={3} defaultValue={defaults.description} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-3">
                <PolicyFieldLabel label="فرجه ورود" required hint="مدت مجاز برای شروع کار در روز" />
                <FieldInput name="startTime" type="time" defaultValue={defaults.startTime} />
              </label>
              <label className="grid gap-3">
                <PolicyFieldLabel label="فرجه خروج" required hint="مدت مجاز برای پایان کار در روز" />
                <FieldInput name="endTime" type="time" defaultValue={defaults.endTime} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-3">
                <PolicyFieldLabel label="حداکثر تاخیر برای غیبت" required hint="اگر بیش از این مقدار ثبت نشود، غیبت محسوب می‌شود." />
                <FieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes} />
              </label>
              <ToggleField
                name="requireAttachment"
                label="الزام به پیوست فایل"
                hint="برای ثبت‌های خاص پیوست اجباری باشد."
                defaultChecked={defaults.requireAttachment}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                name="allowManualApproval"
                label="محاسبه خودکار"
                hint="در صورت فعال بودن، قواعد به صورت خودکار اعمال شوند."
                defaultChecked={defaults.allowManualApproval}
              />
              <ToggleField
                name="breakDeduct"
                label="کسر از ساعات کاری"
                hint="بعضی کسرها در سطح سیاست کاری قابل محاسبه است."
                defaultChecked={defaults.breakDeduct}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                href={policy?.id ? `/policies/work?policyId=${policy.id}` : '/policies/work'}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 text-sm font-bold text-slate-100 transition-colors hover:border-white/20 hover:bg-slate-800/80"
              >
                <ArrowLeft className="h-4 w-4" />
                لغو / بازگشت
              </Link>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500"
              >
                <Check className="h-4 w-4" />
                ویرایش
              </button>
            </div>
          </div>
        </PolicySectionCard>
      </form>
    </PolicyPageShell>
  );
}
