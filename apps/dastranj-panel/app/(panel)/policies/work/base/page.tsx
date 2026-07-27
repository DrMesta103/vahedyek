import { savePolicyWorkspaceAction } from '../../../../lib/actions';
import { listPolicies } from '../../../../lib/data';
import { getPolicyAccess } from '../../../../lib/policy-access';
import { findPolicyByFamilyKey, getPolicySectionValues } from '../../../../lib/policy-workspaces';
import { OvertimePolicyEditor } from '../../_components/OvertimePolicyEditor';
import { OtherPolicyEditor } from '../../_components/OtherPolicyEditor';
import { PolicyImpactForm } from '../../_components/PolicyImpactForm';
import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFieldTextarea,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyPageShell,
  PolicySectionCard,
  PolicyToggleField,
} from '../../_components/PolicyWorkspaceShell';

type WorkPolicyBasePageProps = {
  searchParams?: { policyId?: string; section?: string } | Promise<{ policyId?: string; section?: string }>;
};

function boolDefault(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export default async function WorkPolicyBasePage({ searchParams }: WorkPolicyBasePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const section = resolvedSearchParams.section ?? '';
  const [policies, access] = await Promise.all([listPolicies(), getPolicyAccess()]);
  if (!access.canManage) return <div className="page-stack module-page" dir="rtl" lang="fa"><div className="module-empty-state"><h2>دسترسی ویرایش سیاست کاری ندارید.</h2><p>برای این عملیات به نقش مالک، مدیر یا مدیر منابع انسانی نیاز است.</p></div></div>;
  const policy =
    (resolvedSearchParams.policyId ? policies.find((item) => item.id === resolvedSearchParams.policyId) : null) ??
    findPolicyByFamilyKey(policies, 'work');
  const sectionValues = getPolicySectionValues(policy);
  const policyId = policy?.id ?? '';
  const backHref = policyId ? `/policies/work?policyId=${policyId}` : '/policies/work';

  const defaults = {
    title: typeof sectionValues.title === 'string' ? sectionValues.title : policy?.title ?? 'سیاست کاری',
    description:
      typeof sectionValues.description === 'string' ? sectionValues.description : policy?.description ?? 'تنظیمات پایه و سطح سازمانی',
    startTime: typeof sectionValues.startTime === 'string' ? sectionValues.startTime : '08:00',
    endTime: typeof sectionValues.endTime === 'string' ? sectionValues.endTime : '17:00',
    maxDelayMinutes: typeof sectionValues.maxDelayMinutes === 'number' ? sectionValues.maxDelayMinutes : 60,
    requireAttachment: Boolean(sectionValues.requireAttachment),
    allowManualApproval: Boolean(sectionValues.allowManualApproval),
    breakDeduct: Boolean(sectionValues.breakDeduct),
    overtimeFromAttendance: boolDefault(sectionValues.overtimeFromAttendance),
    overtimeRequireAttachment: boolDefault(sectionValues.overtimeRequireAttachment),
    overtimeBeforeShift: boolDefault(sectionValues.overtimeBeforeShift),
    overtimeAfterShift: boolDefault(sectionValues.overtimeAfterShift),
    dailyLimitHours: typeof sectionValues.dailyLimitHours === 'number' ? sectionValues.dailyLimitHours : 4,
    overtimeRule: (
      sectionValues.overtimeRule === 'manager_approval' || sectionValues.overtimeRule === 'automatic' || sectionValues.overtimeRule === 'disabled'
        ? sectionValues.overtimeRule
        : boolDefault(sectionValues.overtimeFromAttendance) ? 'automatic' : 'disabled'
    ) as 'manager_approval' | 'automatic' | 'disabled',
    requestRule: (
      sectionValues.requestRule === 'leave_and_correction' || sectionValues.requestRule === 'leave_only' || sectionValues.requestRule === 'correction_only' || sectionValues.requestRule === 'none'
        ? sectionValues.requestRule
        : sectionValues.requestEnabled === true ? 'leave_and_correction' : 'none'
    ) as 'leave_and_correction' | 'leave_only' | 'correction_only' | 'none',
  };

  const otherDefaults = {
    locationRule: sectionValues.locationRule === 'unrestricted' ? 'unrestricted' as const : 'workplace_only' as const,
    requireGeofence: boolDefault(sectionValues.requireGeofence),
    faceRecognitionInFlow: boolDefault(sectionValues.faceRecognitionInFlow),
    consecutiveAbsenceWarning: boolDefault(sectionValues.consecutiveAbsenceWarning),
    maxConsecutiveAbsenceDays:
      typeof sectionValues.maxConsecutiveAbsenceDays === 'number' ? sectionValues.maxConsecutiveAbsenceDays : 0,
  };

  if (section === 'other') {
    return (
      <PolicyPageShell
        titleHref={backHref}
        title="ویرایش سایر سیاست‌ها"
        subtitle="تنظیمات تکمیلی حضور و غیاب"
        actionHref={backHref}
        actionLabel="بازگشت به سیاست کاری"
      >
        <PolicyImpactForm action={savePolicyWorkspaceAction} groupCount={policy?.groupCount ?? 0} className="policy-form-stack">
          <input type="hidden" name="familyKey" value="work" />
          <input type="hidden" name="variant" value="default" />
          <input type="hidden" name="policyId" value={policyId} />
          <input type="hidden" name="calendarId" value={policy?.calendarId ?? ''} />
          <input type="hidden" name="workSection" value="other" />

          <PolicySectionCard
            title="سایر سیاست‌ها"
            description="تنظیمات تکمیلی حضور و غیاب که در سایر تب‌ها پوشش داده نشده‌اند"
          >
            <OtherPolicyEditor backHref={backHref} policyId={policyId} {...otherDefaults} />
          </PolicySectionCard>
        </PolicyImpactForm>
      </PolicyPageShell>
    );
  }

  if (section === 'overtime') {
    return (
      <PolicyPageShell
        titleHref={backHref}
        title="ویرایش سیاست‌های اضافه‌کاری"
        subtitle="تعریف قوانین ثبت و محاسبه اضافه‌کاری"
        actionHref={backHref}
        actionLabel="بازگشت به سیاست کاری"
      >
        <PolicyImpactForm action={savePolicyWorkspaceAction} groupCount={policy?.groupCount ?? 0} className="policy-form-stack">
          <input type="hidden" name="familyKey" value="work" />
          <input type="hidden" name="variant" value="default" />
          <input type="hidden" name="policyId" value={policyId} />
          <input type="hidden" name="calendarId" value={policy?.calendarId ?? ''} />
          <input type="hidden" name="workSection" value="overtime" />

          <PolicySectionCard title="سیاست‌های اضافه‌کاری" description="تعریف قوانین ثبت و محاسبه اضافه‌کاری">
            <OvertimePolicyEditor
              backHref={backHref}
              policyId={policyId}
              overtimeFromAttendance={defaults.overtimeFromAttendance}
              overtimeRequireAttachment={defaults.overtimeRequireAttachment}
              overtimeBeforeShift={defaults.overtimeBeforeShift}
              overtimeAfterShift={defaults.overtimeAfterShift}
              dailyLimitHours={defaults.dailyLimitHours}
              overtimeRule={defaults.overtimeRule}
              requestRule={defaults.requestRule}
            />
          </PolicySectionCard>
        </PolicyImpactForm>
      </PolicyPageShell>
    );
  }

  const sectionHint =
    'در سیاست کاری فقط پارامترهای پایه و قواعد سازمانی قابل تنظیم است و سایر خانواده‌ها از آن تبعیت می‌کنند.';

  return (
    <PolicyPageShell
      titleHref={backHref}
      title="ویرایش سیاست کاری"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
      actionHref={backHref}
      actionLabel="بازگشت به سیاست کاری"
    >
      <PolicyImpactForm action={savePolicyWorkspaceAction} groupCount={policy?.groupCount ?? 0} className="policy-form-stack">
        <input type="hidden" name="familyKey" value="work" />
        <input type="hidden" name="variant" value="default" />
        <input type="hidden" name="policyId" value={policyId} />
        <input type="hidden" name="calendarId" value={policy?.calendarId ?? ''} />
        <input type="hidden" name="workSection" value="base" />

        <PolicySectionCard title="سیاست کاری" description="تنظیمات پایه و سطح سازمانی">
          <div className="policy-form-card">
            <PolicyInfoStrip text={sectionHint} />

            <div className="policy-field-grid policy-field-grid-2">
              <label className="policy-field-stack">
                <PolicyFieldLabel label="عنوان سیاست کاری" required hint="نام نمایشی سیاست سازمان" />
                <PolicyFieldInput name="title" defaultValue={defaults.title} required />
              </label>
              <label className="policy-field-stack">
                <PolicyFieldLabel label="توضیحات" hint="توضیح کوتاه و قابل فهم برای مدیران" />
                <PolicyFieldTextarea name="description" rows={3} defaultValue={defaults.description} />
              </label>
            </div>

            <div className="policy-field-grid policy-field-grid-2">
              <label className="policy-field-stack">
                <PolicyFieldLabel label="فرجه ورود" required hint="مدت مجاز برای شروع کار در روز" />
                <PolicyFieldInput name="startTime" type="time" defaultValue={defaults.startTime} />
              </label>
              <label className="policy-field-stack">
                <PolicyFieldLabel label="فرجه خروج" required hint="مدت مجاز برای پایان کار در روز" />
                <PolicyFieldInput name="endTime" type="time" defaultValue={defaults.endTime} />
              </label>
            </div>

            <div className="policy-field-grid policy-field-grid-2">
              <label className="policy-field-stack">
                <PolicyFieldLabel label="حداکثر تاخیر برای غیبت" required hint="اگر بیش از این مقدار ثبت نشود، غیبت محسوب می‌شود." />
                <PolicyFieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes} />
              </label>
              <PolicyToggleField
                name="requireAttachment"
                label="الزام به پیوست فایل"
                hint="برای ثبت‌های خاص پیوست اجباری باشد."
                defaultChecked={defaults.requireAttachment}
              />
            </div>

            <div className="policy-field-grid policy-field-grid-2">
              <PolicyToggleField
                name="allowManualApproval"
                label="محاسبه خودکار"
                hint="در صورت فعال بودن، قواعد به صورت خودکار اعمال شوند."
                defaultChecked={defaults.allowManualApproval}
              />
              <PolicyToggleField
                name="breakDeduct"
                label="کسر از ساعات کاری"
                hint="بعضی کسرها در سطح سیاست کاری قابل محاسبه است."
                defaultChecked={defaults.breakDeduct}
              />
            </div>

            <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
          </div>
        </PolicySectionCard>
      </PolicyImpactForm>
    </PolicyPageShell>
  );
}
