import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { listPolicies } from '../../../lib/data';
import {
  POLICY_VARIANTS,
  findPolicyByFamilyKey,
  getPolicyFamilyMeta,
  getPolicySectionValues,
  listPoliciesByFamilyKey,
  type PolicyFamilyKey,
} from '../../../lib/policy-workspaces';
import { savePolicyWorkspaceAction } from '../../../lib/actions';
import { PolicyFamilyNav, PolicyPageShell, PolicySectionCard, PolicyFieldLabel } from '../_components/PolicyWorkspaceShell';
import { ArrowLeft, Check, Info } from 'lucide-react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('h-12 rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400/60', props.className)} />;
}

function FieldTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-7 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-400/60', props.className)} />;
}

function FieldSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('h-12 rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition-colors focus:border-indigo-400/60', props.className)} />;
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
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-100" />
      <p className="m-0">{text}</p>
    </div>
  );
}

function VariantTabs({
  familyKey,
  variant,
}: {
  familyKey: PolicyFamilyKey;
  variant: string;
}) {
  const variants = POLICY_VARIANTS[familyKey];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {variants.map((item) => {
        const active = item.key === variant;
        const href = item.key === 'default' ? `/policies/${familyKey}` : `/policies/${familyKey}?variant=${item.key}`;
        return (
          <Link
            key={item.key}
            href={href}
            className={cn(
              'rounded-2xl border px-4 py-4 text-right transition-all',
              active
                ? 'border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.18)]'
                : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/55',
            )}
          >
            <div className="grid gap-1">
              <div className="text-sm font-extrabold text-white">{item.title}</div>
              <div className="text-xs leading-6 text-slate-400">{item.subtitle}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SectionActions() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href="/policies"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 text-sm font-bold text-slate-100 transition-colors hover:border-white/20 hover:bg-slate-800/80"
      >
        <ArrowLeft className="h-4 w-4" />
        لغو / بازگشت
      </Link>
      <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500">
        <Check className="h-4 w-4" />
        ویرایش
      </button>
    </div>
  );
}

export default async function PolicyFamilyPage({
  params,
  searchParams,
}: {
  params: Promise<{ family: string }>;
  searchParams?: Promise<{ variant?: string; policyId?: string; mode?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const familyMeta = getPolicyFamilyMeta(resolvedParams.family);
  if (!familyMeta) notFound();

  const familyKey = familyMeta.key;
  const requestedVariant = resolvedSearchParams?.variant ?? POLICY_VARIANTS[familyKey][0]?.key ?? 'default';
  const policies = await listPolicies();
  const familyPolicies = listPoliciesByFamilyKey(policies, familyKey);
  const policy =
    resolvedSearchParams?.mode === 'new'
      ? null
      : resolvedSearchParams?.policyId
        ? policies.find((item) => item.id === resolvedSearchParams.policyId) ?? null
        : findPolicyByFamilyKey(policies, familyKey);
  const policyId = policy?.id ?? '';
  const sectionValues = getPolicySectionValues(policy);
  const availableVariants = POLICY_VARIANTS[familyKey].map((item) => item.key as string);
  const activeVariant =
    typeof sectionValues.variant === 'string' && availableVariants.includes(sectionValues.variant)
      ? (sectionValues.variant as string)
      : availableVariants.includes(requestedVariant)
        ? requestedVariant
        : availableVariants[0] ?? 'default';

  const defaults = {
    title: typeof sectionValues.title === 'string' ? sectionValues.title : familyMeta.title,
    description: typeof sectionValues.description === 'string' ? sectionValues.description : familyMeta.subtitle,
    startTime: typeof sectionValues.startTime === 'string' ? sectionValues.startTime : '',
    endTime: typeof sectionValues.endTime === 'string' ? sectionValues.endTime : '',
    requiredMinutes: typeof sectionValues.requiredMinutes === 'number' ? sectionValues.requiredMinutes : 0,
    workStartWindow: typeof sectionValues.workStartWindow === 'string' ? sectionValues.workStartWindow : '',
    workEndWindow: typeof sectionValues.workEndWindow === 'string' ? sectionValues.workEndWindow : '',
    corePresence: typeof sectionValues.corePresence === 'string' ? sectionValues.corePresence : '',
    maxDelayMinutes: typeof sectionValues.maxDelayMinutes === 'number' ? sectionValues.maxDelayMinutes : 0,
    breakMode: typeof sectionValues.breakMode === 'string' ? sectionValues.breakMode : 'fixed',
    breakStart: typeof sectionValues.breakStart === 'string' ? sectionValues.breakStart : '',
    breakEnd: typeof sectionValues.breakEnd === 'string' ? sectionValues.breakEnd : '',
    breakDuration: typeof sectionValues.breakDuration === 'number' ? sectionValues.breakDuration : 30,
    endsNextDay: Boolean(sectionValues.endsNextDay),
    breakDeduct: Boolean(sectionValues.breakDeduct),
    bufferMinutes: typeof sectionValues.bufferMinutes === 'number' ? sectionValues.bufferMinutes : 0,
    monthlyLimit: typeof sectionValues.monthlyLimit === 'number' ? sectionValues.monthlyLimit : 0,
    approvalMode: typeof sectionValues.approvalMode === 'string' ? sectionValues.approvalMode : 'manager',
    requireAttachment: Boolean(sectionValues.requireAttachment),
    geofenceRadius: typeof sectionValues.geofenceRadius === 'number' ? sectionValues.geofenceRadius : 0,
    allowRemote: Boolean(sectionValues.allowRemote),
    allowManualApproval: Boolean(sectionValues.allowManualApproval),
    allowOutsideShift: Boolean(sectionValues.allowOutsideShift),
    manualEntryEnabled: Boolean(sectionValues.manualEntryEnabled),
    requiresManagerApproval: Boolean(sectionValues.requiresManagerApproval),
    maxMissionHours: typeof sectionValues.maxMissionHours === 'number' ? sectionValues.maxMissionHours : 0,
    nightStart: typeof sectionValues.nightStart === 'string' ? sectionValues.nightStart : '',
    nightEnd: typeof sectionValues.nightEnd === 'string' ? sectionValues.nightEnd : '',
    cycleCount: typeof sectionValues.cycleCount === 'number' ? sectionValues.cycleCount : 2,
    cycleType: typeof sectionValues.cycleType === 'string' ? sectionValues.cycleType : 'daily',
    note: typeof sectionValues.note === 'string' ? sectionValues.note : '',
  };

  return (
    <PolicyPageShell
      title={familyMeta.pageTitle}
      subtitle={familyMeta.pageHint}
      breadcrumb={[
        { label: 'دسترنج', href: '/' },
        { label: 'تنظیمات کسب و کار', href: '/business-settings' },
        { label: 'سیاست های کاری', href: '/policies' },
        { label: familyMeta.pageTitle },
      ]}
      banner={familyMeta.infoBanner}
      actionHref="/policies"
      actionLabel="بازگشت به سیاست‌ها"
    >
      <PolicyFamilyNav activeFamily={familyKey} />

      {familyPolicies.length > 0 ? (
        <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.3)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="grid gap-1 text-right">
              <h2 className="text-xl font-black text-white">سیاست‌های این خانواده</h2>
              <p className="text-sm leading-7 text-slate-400">ویرایش مستقیم، ایجاد رکورد جدید و مدیریت چند سیاست مستقل</p>
            </div>
            <Link
              href={`${familyMeta.route}?mode=new`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500"
            >
              ثبت جدید
            </Link>
          </div>

          <div className="grid gap-3">
            {familyPolicies.map((item) => (
              <Link
                key={item.id}
                href={`${familyMeta.route}?policyId=${item.id}`}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-indigo-400/40 hover:bg-slate-900/75"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1 text-right">
                    <div className="text-sm font-black text-white">{item.title}</div>
                    <div className="text-xs leading-6 text-slate-400">{item.description ?? familyMeta.subtitle}</div>
                  </div>
                  <div className="rounded-full border border-indigo-400/30 bg-indigo-500/12 px-3 py-1 text-xs font-bold text-indigo-200">
                    ویرایش
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <form action={savePolicyWorkspaceAction} className="grid gap-5">
        <input type="hidden" name="familyKey" value={familyKey} />
        <input type="hidden" name="variant" value={activeVariant} />
        <input type="hidden" name="policyId" value={policyId} />
        <PolicySectionCard title={familyMeta.title} description={familyMeta.subtitle}>
          {familyKey === 'work' ? (
            <div className="grid gap-5">
              <InfoStrip text="در سیاست کاری فقط پارامترهای پایه و قواعد سازمانی قابل تنظیم است و سایر خانواده‌ها از آن تبعیت می‌کنند." />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="عنوان سیاست کاری" required hint="نام نمایشی سیاست سازمان" />
                  <FieldInput name="title" defaultValue={defaults.title} required />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="توضیحات" hint="توضیح کوتاه و قابل‌فهم برای مدیران" />
                  <FieldTextarea name="description" rows={3} defaultValue={defaults.description} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="فرجه ورود" required hint="مدت مجاز برای شروع کار در روز" />
                  <FieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="فرجه خروج" required hint="مدت مجاز برای پایان کار در روز" />
                  <FieldInput name="endTime" type="time" defaultValue={defaults.endTime || '17:00'} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="حداکثر تاخیر برای غیبت" required hint="اگر بیش از این مقدار ثبت نشود، غیبت محسوب می‌شود." />
                  <FieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes || 60} />
                </label>
                <ToggleField name="requireAttachment" label="الزام به پیوست فایل" hint="برای ثبت‌های خاص پیوست اجباری باشد." defaultChecked={defaults.requireAttachment} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleField name="allowManualApproval" label="محاسبه خودکار" hint="در صورت فعال بودن، قواعد به صورت خودکار اعمال شوند." defaultChecked={defaults.allowManualApproval} />
                <ToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="بعضی کسرها در سطح سیاست کاری قابل محاسبه است." defaultChecked={defaults.breakDeduct} />
              </div>
              <SectionActions />
            </div>
          ) : null}

          {familyKey === 'shift' ? (
            <div className="grid gap-5">
              <VariantTabs familyKey={familyKey} variant={activeVariant} />

              <InfoStrip text="در شیفت ثابت، زمان ورود و خروج یک بازه ثابت دارند. در حالت شناور، ساعت کار موظفی و بازه‌های ورود/خروج قابل تنظیم است." />

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-3">
                    <PolicyFieldLabel label="عنوان شیفت" required hint="عنوان نمایشی این سیاست" />
                    <FieldInput name="title" defaultValue={defaults.title} required />
                  </label>
                  <label className="grid gap-3">
                    <PolicyFieldLabel label="توضیحات" hint="متن توضیحی برای مدیران و اپراتورها" />
                    <FieldInput name="description" defaultValue={defaults.description} />
                  </label>
                </div>

                {activeVariant === 'fixed' ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="شروع شیفت" required hint="ساعت شروع حضور موظفی" />
                        <FieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="پایان شیفت" required hint="ساعت پایان حضور موظفی" />
                        <FieldInput name="endTime" type="time" defaultValue={defaults.endTime || '16:30'} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="ساعت کار موظفی" hint="مقدار استاندارد روزانه" />
                        <FieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 510} />
                      </label>
                      <ToggleField name="endsNextDay" label="پایان در روز بعد" hint="اگر پایان از شروع عبور کند یا روز بعد باشد فعال شود." defaultChecked={defaults.endsNextDay} />
                    </div>
                    <ToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت‌هایی که باید از ساعات کار کسر شوند." defaultChecked={defaults.breakDeduct} />
                  </>
                ) : null}

                {activeVariant === 'floating-day' ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="شروع بازه ورود" required hint="کف مجاز ورود برای روز جاری" />
                        <FieldInput name="workStartWindow" type="time" defaultValue={defaults.workStartWindow || '08:00'} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="پایان بازه ورود" required hint="سقف مجاز ورود" />
                        <FieldInput name="workEndWindow" type="time" defaultValue={defaults.workEndWindow || '09:30'} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="ساعت کار موظفی" hint="مدت لازم برای ثبت کامل روز" />
                        <FieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 510} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="هسته حضور" hint="بازه‌ای که باید داخل روز جاری باشد" />
                        <FieldInput name="corePresence" type="time" defaultValue={defaults.corePresence || '10:00'} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <ToggleField name="endsNextDay" label="پایان در روز بعد" hint="اگر بازه خروج به روز بعد منتقل شود." defaultChecked={defaults.endsNextDay} />
                      <ToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت‌های قابل کسر از ساعت موظفی." defaultChecked={defaults.breakDeduct} />
                    </div>
                  </>
                ) : null}

                {activeVariant === 'floating-absolute' ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="شروع بازه ورود" required hint="حداقل زمان ورود" />
                        <FieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="پایان بازه ورود" required hint="حداکثر زمان ورود" />
                        <FieldInput name="endTime" type="time" defaultValue={defaults.endTime || '10:30'} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="ساعت کار موظفی" hint="مقدار لازم برای تکمیل روز" />
                        <FieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 510} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="حداکثر تاخیر" hint="حداکثر مقدار دیرکرد" />
                        <FieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes || 30} />
                      </label>
                    </div>
                  </>
                ) : null}

                {activeVariant === 'split' ? (
                  <div className="grid gap-5">
                    <InfoStrip text="در شیفت دو تکه، تکه اول و شروع تکه دوم نباید وارد روز بعد شوند." />
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="شروع تکه اول" required />
                        <FieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="پایان تکه اول" required />
                        <FieldInput name="endTime" type="time" defaultValue={defaults.endTime || '12:00'} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="شروع تکه دوم" required />
                        <FieldInput name="workStartWindow" type="time" defaultValue={defaults.workStartWindow || '13:00'} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="پایان تکه دوم" required />
                        <FieldInput name="workEndWindow" type="time" defaultValue={defaults.workEndWindow || '17:00'} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <ToggleField name="endsNextDay" label="پایان در روز بعد" hint="برای هیچ‌کدام از دو تکه نباید فعال باشد مگر در شرایط خاص." defaultChecked={defaults.endsNextDay} />
                      <ToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت هر تکه جداگانه محاسبه شود." defaultChecked={defaults.breakDeduct} />
                    </div>
                  </div>
                ) : null}

                {activeVariant === 'rotate' ? (
                  <div className="grid gap-5">
                    <InfoStrip text="در شیفت چرخشی، نوع شیفت و تعداد تکرار هر تکه تعیین می‌شود و آیتم‌ها می‌توانند جابه‌جا شوند." />
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="نوع شیفت" required />
                        <FieldSelect name="cycleType" defaultValue={defaults.cycleType}>
                          <option value="daily">روزانه</option>
                          <option value="weekly">هفتگی</option>
                          <option value="custom">سفارشی</option>
                        </FieldSelect>
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="تعداد تکرار" required />
                        <FieldInput name="cycleCount" type="number" defaultValue={defaults.cycleCount || 2} />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="شروع شیفت" required />
                        <FieldInput name="startTime" type="time" defaultValue={defaults.startTime || '06:00'} />
                      </label>
                      <label className="grid gap-3">
                        <PolicyFieldLabel label="پایان شیفت" required />
                        <FieldInput name="endTime" type="time" defaultValue={defaults.endTime || '14:00'} />
                      </label>
                    </div>
                  </div>
                ) : null}

                <SectionActions />
              </div>
            </div>
          ) : null}

          {familyKey === 'leave' ? (
            <div className="grid gap-5">
              <VariantTabs familyKey={familyKey} variant={activeVariant} />
              <InfoStrip text="در مرخصی، سیاست‌ها فقط محدوده مصرف، نیاز به تایید و قواعد ثبت را مشخص می‌کنند." />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="عنوان سیاست" required hint="برای نمونه: مرخصی استحقاقی" />
                  <FieldInput name="title" defaultValue={defaults.title} required />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="توضیحات" hint="متن کوتاه برای راهنمایی مدیر" />
                  <FieldInput name="description" defaultValue={defaults.description} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="حداکثر استفاده از سهمیه در ماه" required hint="برحسب روز" />
                  <FieldInput name="monthlyLimit" type="number" defaultValue={defaults.monthlyLimit || 0} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="نحوه محاسبه" required hint="مدل تایید یا کسر" />
                  <FieldSelect name="approvalMode" defaultValue={defaults.approvalMode}>
                    <option value="manager">تایید مدیر</option>
                    <option value="automatic">خودکار</option>
                    <option value="workflow">جریان چندمرحله‌ای</option>
                  </FieldSelect>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleField name="requireAttachment" label="الزام به پیوست فایل" hint="برای ثبت‌های خاص پیوست الزامی باشد." defaultChecked={defaults.requireAttachment} />
                <ToggleField name="allowOutsideShift" label="خارج از شیفت مجاز" hint="اگر کاربران بدون شیفت ثبت داشته باشند." defaultChecked={defaults.allowOutsideShift} />
              </div>
              <SectionActions />
            </div>
          ) : null}

          {familyKey === 'mission' ? (
            <div className="grid gap-5">
              <InfoStrip text="در ماموریت، بازه زمانی، حداقل ساعات و محدودیت مکانی ثبت و تایید می‌شود." />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="فرجه ورود" required />
                  <FieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="فرجه خروج" required />
                  <FieldInput name="endTime" type="time" defaultValue={defaults.endTime || '18:00'} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="محدوده مکانی (Geofence)" required />
                  <FieldInput name="geofenceRadius" type="number" defaultValue={defaults.geofenceRadius || 100} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="حداقل ساعات حضور" required />
                  <FieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 120} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleField name="requireAttachment" label="پیوست اجباری" hint="برای درخواست ماموریت سند یا فایل ضمیمه شود." defaultChecked={defaults.requireAttachment} />
                <ToggleField name="allowManualApproval" label="محاسبه و تایید خودکار" hint="در صورت فعال شدن، ماموریت به طور خودکار بررسی شود." defaultChecked={defaults.allowManualApproval} />
              </div>
              <SectionActions />
            </div>
          ) : null}

          {familyKey === 'manual' ? (
            <div className="grid gap-5">
              <InfoStrip text="در تردد دستی، ثبت به‌صورت دستی انجام می‌شود و تایید مدیر یا سرپرست می‌تواند الزامی باشد." />
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleField name="manualEntryEnabled" label="فعال‌سازی تردد دستی" hint="اجازه ثبت ورود/خروج دستی برای کاربران" defaultChecked={defaults.manualEntryEnabled} />
                <ToggleField name="requiresManagerApproval" label="نیاز به تایید مدیر" hint="ثبت بدون تایید مدیر نهایی نشود" defaultChecked={defaults.requiresManagerApproval} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="حداکثر کار مجاز در تعطیل" required />
                  <FieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes || 0} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="الزام به پیوست" hint="در صورت نیاز به فایل یا دلیل" />
                  <FieldInput name="note" defaultValue={defaults.note || ''} />
                </label>
              </div>
              <ToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="ثبت دستی نیز می‌تواند از ساعت موظفی کسر شود." defaultChecked={defaults.breakDeduct} />
              <SectionActions />
            </div>
          ) : null}

          {familyKey === 'night' ? (
            <div className="grid gap-5">
              <InfoStrip text="در شب‌کاری، فقط بازه زمانی، قواعد حضور و محاسبه‌ی تاخیر تنظیم می‌شود." />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="فرجه ورود" required />
                  <FieldInput name="nightStart" type="time" defaultValue={defaults.nightStart || '22:00'} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="فرجه خروج" required />
                  <FieldInput name="nightEnd" type="time" defaultValue={defaults.nightEnd || '06:00'} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-3">
                  <PolicyFieldLabel label="حداکثر کار مجاز در تعطیل" required />
                  <FieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes || 15} />
                </label>
                <label className="grid gap-3">
                  <PolicyFieldLabel label="نحوه محاسبه تاخیر" required />
                  <FieldSelect name="approvalMode" defaultValue={defaults.approvalMode}>
                    <option value="manager">مدیر</option>
                    <option value="automatic">خودکار</option>
                    <option value="manual">دستی</option>
                  </FieldSelect>
                </label>
              </div>
              <ToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت شب‌کاری نیز می‌تواند از ساعت موظفی کسر شود." defaultChecked={defaults.breakDeduct} />
              <SectionActions />
            </div>
          ) : null}
        </PolicySectionCard>
      </form>
    </PolicyPageShell>
  );
}
