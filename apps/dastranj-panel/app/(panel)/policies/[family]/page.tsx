import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { listPolicies } from '../../../lib/data';
import {
  POLICY_VARIANTS,
  findPolicyByFamilyKey,
  getPolicyFamilyMeta,
  getPolicySectionValues,
  getShiftPolicyValues,
  listPoliciesByFamilyKey,
  type PolicyFamilyKey,
} from '../../../lib/policy-workspaces';
import { savePolicyWorkspaceAction } from '../../../lib/actions';
import { getPolicyAccess } from '../../../lib/policy-access';
import {
  PolicyFamilyList,
  PolicyFamilyListItem,
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFieldSelect,
  PolicyFieldTextarea,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyPageShell,
  PolicySectionCard,
  PolicyToggleField,
  PolicyVariantTabs,
} from '../_components/PolicyWorkspaceShell';
import { PolicyImpactForm } from '../_components/PolicyImpactForm';
import { LeavePolicyEditor } from '../_components/LeavePolicyEditor';
import { ManualPolicyEditor } from '../_components/ManualPolicyEditor';
import { NightPolicyEditor } from '../_components/NightPolicyEditor';
import { RemotePolicyEditor } from '../_components/RemotePolicyEditor';
import { FloatingShiftPolicyEditor } from '../_components/FloatingShiftPolicyEditor';
import { SplitShiftPolicyEditor } from '../_components/SplitShiftPolicyEditor';
import { SearchablePolicySelect } from '../_components/SearchablePolicySelect';
import { parseSplitShiftSegmentRules } from '../../../lib/split-shift-policy';
import { parseRemoteWorkPolicy } from '../../../lib/remote-work-policy';
import { listCalendarShifts, type CalendarShiftType, type StoredCalendarShift } from '../../../lib/calendar-shifts';
import { summarizeShiftForDayPanel } from '../../../lib/calendar-shift-display';

function fieldNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function fieldString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

const SHIFT_VARIANT_BY_TYPE: Record<CalendarShiftType, 'fixed' | 'floating-day' | 'floating-absolute' | 'split' | 'rotate'> = {
  fixed: 'fixed',
  'float-day': 'floating-day',
  'float-abs': 'floating-absolute',
  split: 'split',
  rotate: 'rotate',
};

function ShiftPolicyField({
  name,
  label,
  required,
  unit,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  unit: string;
  defaultValue: string | number;
  hint: string;
}) {
  return (
    <label className="policy-field-stack shift-policy-field">
      <PolicyFieldLabel label={label} required={required} />
      <div className="shift-policy-control-wrap">
        <PolicyFieldInput name={name} type="number" defaultValue={defaultValue} />
        <span className="shift-policy-unit">{unit}</span>
      </div>
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

function ShiftPolicySearchSelectField({
  name,
  label,
  required,
  value,
  options,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  options: Array<{ value: string; label: string }>;
  hint: string;
}) {
  return (
    <label className="policy-field-stack shift-policy-field">
      <PolicyFieldLabel label={label} required={required} />
      <SearchablePolicySelect name={name} value={value} options={options} placeholder={options[0]?.label ?? 'انتخاب'} />
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

function ShiftPolicyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="shift-policy-panel">
      <h2>{title}</h2>
      <div className="shift-policy-panel-grid">{children}</div>
    </section>
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
  const [policies, access] = await Promise.all([listPolicies(), getPolicyAccess()]);
  if (!access.canManage) return <div className="page-stack module-page" dir="rtl" lang="fa"><div className="module-empty-state"><h2>دسترسی ویرایش سیاست کاری ندارید.</h2><p>برای این عملیات به نقش مالک، مدیر یا مدیر منابع انسانی نیاز است.</p></div></div>;
  const familyPolicies = listPoliciesByFamilyKey(policies, familyKey);
  const defaultPolicyForFamily =
    familyKey === 'leave'
      ? findPolicyByFamilyKey(policies, 'work')
      : findPolicyByFamilyKey(policies, familyKey);
  const policy =
    resolvedSearchParams?.mode === 'new' && familyKey !== 'leave'
      ? null
      : resolvedSearchParams?.policyId
        ? policies.find((item) => item.id === resolvedSearchParams.policyId) ?? null
        : defaultPolicyForFamily;
  const policyId = policy?.id ?? '';
  const sectionValues = getPolicySectionValues(policy);
  const calendarShifts = policy?.calendar ? listCalendarShifts(policy.calendar.shiftConfig) : [];
  const shiftTypes = [...new Set(calendarShifts.map((shift) => SHIFT_VARIANT_BY_TYPE[shift.shiftType]).filter(Boolean))];
  const availableVariants = POLICY_VARIANTS[familyKey].map((item) => item.key as string);
  const activeVariant =
    typeof sectionValues.variant === 'string' && availableVariants.includes(sectionValues.variant)
      ? (sectionValues.variant as string)
      : availableVariants.includes(requestedVariant)
        ? requestedVariant
        : availableVariants[0] ?? 'default';
  const discoveredVariants = POLICY_VARIANTS.shift.filter((item) => shiftTypes.includes(item.key as typeof shiftTypes[number]));
  const effectiveShiftVariant = discoveredVariants.some((item) => item.key === activeVariant)
    ? activeVariant
    : discoveredVariants[0]?.key ?? activeVariant;
  const selectedCalendarShift: StoredCalendarShift | null = calendarShifts.find((shift) => SHIFT_VARIANT_BY_TYPE[shift.shiftType] === effectiveShiftVariant) ?? null;
  const selectedShiftSummary = selectedCalendarShift ? summarizeShiftForDayPanel(selectedCalendarShift) : null;
  const effectiveSectionValues = familyKey === 'shift'
    ? getShiftPolicyValues(sectionValues, effectiveShiftVariant)
    : sectionValues;

  const defaults = {
    title: typeof sectionValues.title === 'string' ? sectionValues.title : familyMeta.title,
    description: typeof sectionValues.description === 'string' ? sectionValues.description : familyMeta.subtitle,
    startTime: typeof effectiveSectionValues.startTime === 'string' ? effectiveSectionValues.startTime : '',
    endTime: typeof effectiveSectionValues.endTime === 'string' ? effectiveSectionValues.endTime : '',
    requiredMinutes: typeof sectionValues.requiredMinutes === 'number' ? sectionValues.requiredMinutes : 0,
    workStartWindow: typeof sectionValues.workStartWindow === 'string' ? sectionValues.workStartWindow : '',
    workEndWindow: typeof sectionValues.workEndWindow === 'string' ? sectionValues.workEndWindow : '',
    corePresence: typeof sectionValues.corePresence === 'string' ? sectionValues.corePresence : '',
    maxDelayMinutes: typeof effectiveSectionValues.maxDelayMinutes === 'number' ? effectiveSectionValues.maxDelayMinutes : 0,
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
    manualRequireReason: Boolean(sectionValues.manualRequireReason),
    manualPastDaysEnabled: Boolean(sectionValues.manualPastDaysEnabled),
    manualMaxPastDays:
      typeof sectionValues.manualMaxPastDays === 'number'
        ? sectionValues.manualMaxPastDays
        : typeof sectionValues.maxDelayMinutes === 'number'
          ? sectionValues.maxDelayMinutes
          : 0,
    manualMonthlyCapPerUser:
      typeof sectionValues.manualMonthlyCapPerUser === 'number'
        ? sectionValues.manualMonthlyCapPerUser
        : typeof sectionValues.monthlyLimit === 'number'
          ? sectionValues.monthlyLimit
          : 0,
    requiresManagerApproval: Boolean(sectionValues.requiresManagerApproval),
    maxMissionHours: typeof sectionValues.maxMissionHours === 'number' ? sectionValues.maxMissionHours : 0,
    nightEnabled:
      typeof sectionValues.nightEnabled === 'boolean'
        ? sectionValues.nightEnabled
        : Boolean(
            (typeof sectionValues.nightStart === 'string' && sectionValues.nightStart) ||
              (typeof sectionValues.nightEnd === 'string' && sectionValues.nightEnd),
          ),
    nightStart: typeof sectionValues.nightStart === 'string' ? sectionValues.nightStart : '',
    nightEnd: typeof sectionValues.nightEnd === 'string' ? sectionValues.nightEnd : '',
    cycleCount: typeof sectionValues.cycleCount === 'number' ? sectionValues.cycleCount : 2,
    cycleType: typeof sectionValues.cycleType === 'string' ? sectionValues.cycleType : 'daily',
    note: typeof sectionValues.note === 'string' ? sectionValues.note : '',
    entryGraceMinutes: fieldNumber(effectiveSectionValues.entryGraceMinutes, 0),
    exitGraceMinutes: fieldNumber(effectiveSectionValues.exitGraceMinutes, 0),
    maxEarlyLeaveMinutes: fieldNumber(effectiveSectionValues.maxEarlyLeaveMinutes, 0),
    delayCalculationMode: fieldString(effectiveSectionValues.delayCalculationMode, 'lenient'),
    earlyLeaveCalculationMode: fieldString(effectiveSectionValues.earlyLeaveCalculationMode, 'lenient'),
    bufferOverflowPolicy: fieldString(sectionValues.bufferOverflowPolicy, 'late-only'),
    requiredHours: fieldNumber(effectiveSectionValues.requiredHours, 0),
    dailyEntryExitLimit: fieldString(sectionValues.dailyEntryExitLimit, 'unlimited'),
  };
  const calculationOptions = [
    { value: 'lenient', label: 'ملایم', hint: 'فقط مازادِ فرجه به عنوان تاخیر یا تعجیل محاسبه می‌شود.' },
    { value: 'strict', label: 'سخت گیرانه', hint: 'کل تاخیر یا تعجیل از همان نقطه شروع محاسبه می‌شود.' },
  ];
  const splitShiftSegments = parseSplitShiftSegmentRules(effectiveSectionValues);
  const remoteWorkPolicy = parseRemoteWorkPolicy(sectionValues);

  const fromWorkHub =
    (familyKey === 'leave' || familyKey === 'manual' || familyKey === 'night' || familyKey === 'remote') &&
    Boolean(policyId);
  const backHref = fromWorkHub ? `/policies/work?policyId=${policyId}` : '/policies';

  return (
    <PolicyPageShell
      title={familyMeta.pageTitle}
      subtitle={familyMeta.pageHint}
      actionHref={fromWorkHub ? backHref : '/policies'}
      actionLabel={fromWorkHub ? 'بازگشت به سیاست کاری' : 'بازگشت به فهرست'}
    >
      {familyKey !== 'shift' && familyKey !== 'leave' && familyPolicies.length > 0 && !fromWorkHub ? (
        <PolicyFamilyList
          title="سیاست‌های این خانواده"
          description="ویرایش مستقیم، ایجاد رکورد جدید و مدیریت چند سیاست مستقل"
          addHref={`${familyMeta.route}?mode=new`}
        >
          {familyPolicies.map((item) => (
            <PolicyFamilyListItem
              key={item.id}
              href={`${familyMeta.route}?policyId=${item.id}`}
              title={item.title}
              description={item.description ?? familyMeta.subtitle}
            />
          ))}
        </PolicyFamilyList>
      ) : null}

      <PolicyImpactForm action={savePolicyWorkspaceAction} groupCount={policy?.groupCount ?? 0} className="policy-form-stack">
        <input type="hidden" name="familyKey" value={familyKey} />
        <input type="hidden" name="variant" value={familyKey === 'shift' ? effectiveShiftVariant : activeVariant} />
        <input type="hidden" name="policyId" value={policyId} />
        <input type="hidden" name="calendarId" value={policy?.calendarId ?? ''} />
        <PolicySectionCard title={familyMeta.title} description={familyMeta.subtitle}>
          {familyKey === 'work' ? (
            <div className="policy-form-card">
              <PolicyInfoStrip text="در سیاست کاری فقط پارامترهای پایه و قواعد سازمانی قابل تنظیم است و سایر خانواده‌ها از آن تبعیت می‌کنند." />
              <div className="policy-field-grid policy-field-grid-2">
                <label className="policy-field-stack">
                  <PolicyFieldLabel label="عنوان سیاست کاری" required hint="نام نمایشی سیاست سازمان" />
                  <PolicyFieldInput name="title" defaultValue={defaults.title} required />
                </label>
                <label className="policy-field-stack">
                  <PolicyFieldLabel label="توضیحات" hint="توضیح کوتاه و قابل‌فهم برای مدیران" />
                  <PolicyFieldTextarea name="description" rows={3} defaultValue={defaults.description} />
                </label>
              </div>
              <div className="policy-field-grid policy-field-grid-2">
                <label className="policy-field-stack">
                  <PolicyFieldLabel label="فرجه ورود" required hint="مدت مجاز برای شروع کار در روز" />
                  <PolicyFieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                </label>
                <label className="policy-field-stack">
                  <PolicyFieldLabel label="فرجه خروج" required hint="مدت مجاز برای پایان کار در روز" />
                  <PolicyFieldInput name="endTime" type="time" defaultValue={defaults.endTime || '17:00'} />
                </label>
              </div>
              <div className="policy-field-grid policy-field-grid-2">
                <label className="policy-field-stack">
                  <PolicyFieldLabel label="حداکثر تاخیر برای غیبت" required hint="اگر بیش از این مقدار ثبت نشود، غیبت محسوب می‌شود." />
                  <PolicyFieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes || 60} />
                </label>
                <PolicyToggleField name="requireAttachment" label="الزام به پیوست فایل" hint="برای ثبت‌های خاص پیوست اجباری باشد." defaultChecked={defaults.requireAttachment} />
              </div>
              <div className="policy-field-grid policy-field-grid-2">
                <PolicyToggleField name="allowManualApproval" label="محاسبه خودکار" hint="در صورت فعال بودن، قواعد به صورت خودکار اعمال شوند." defaultChecked={defaults.allowManualApproval} />
                <PolicyToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="بعضی کسرها در سطح سیاست کاری قابل محاسبه است." defaultChecked={defaults.breakDeduct} />
              </div>
              <PolicyFormActions cancelHref="/policies" submitLabel="ذخیره تغییرات" />
            </div>
          ) : null}

          {familyKey === 'shift' ? (
            <div className="policy-form-card shift-policy-editor">
              <input type="hidden" name="title" value={familyMeta.title} />
              <input type="hidden" name="description" value={familyMeta.subtitle} />
              {calendarShifts.length === 0 ? (
                <PolicyInfoStrip text="برای تنظیم سیاست‌های شیفت، ابتدا حداقل یک شیفت واقعی به تقویم کاری متصل به این سیاست اضافه کنید." />
              ) : (
                <>
                  <PolicyInfoStrip text={`نوع شیفت از تقویم «${policy?.calendar?.title ?? 'تقویم انتخاب‌شده'}» خوانده شده است؛ زمان‌بندی و ساختار شیفت فقط به‌صورت خواندنی نمایش داده می‌شود.`} />
                  {selectedShiftSummary ? <div className="policy-info-strip"><strong>{selectedCalendarShift?.title}</strong> · {selectedShiftSummary.shiftTypeLabel} · {selectedShiftSummary.timeRange || 'بازه زمانی در قالب شیفت ثبت نشده است'}</div> : null}
                  <PolicyVariantTabs familyKey={familyKey} variant={effectiveShiftVariant} variants={discoveredVariants.map((item) => ({ ...item, disabled: item.key === 'rotate' }))} />
                </>
              )}

              <div className="shift-policy-sections">
                {effectiveShiftVariant === 'rotate' ? (
                  <PolicyInfoStrip text="شیفت چرخشی تا زمان تکمیل Runtime در دست توسعه است و قابل ذخیره‌سازی نیست." />
                ) : effectiveShiftVariant === 'split' ? (
                  <SplitShiftPolicyEditor segments={splitShiftSegments} calculationOptions={calculationOptions} />
                ) : (
                  <>
                    {effectiveShiftVariant === 'fixed' ? (
                      <>
                        <ShiftPolicyPanel title="قوانین ورود">
                          <ShiftPolicyField name="entryGraceMinutes" label="فرجه مجاز ورود" required unit="دقیقه" defaultValue={defaults.entryGraceMinutes} hint="کارمند می‌تواند تا این مدت بعد از شروع شیفت وارد شود." />
                          <ShiftPolicySearchSelectField name="delayCalculationMode" label="نحوه محاسبه تاخیر" required value={defaults.delayCalculationMode} options={calculationOptions} hint="ملایم: فقط مازاد فرجه کسر می‌شود. سخت‌گیر: کل تاخیر کسر می‌شود." />
                          <ShiftPolicyField name="maxDelayMinutes" label="حداکثر تاخیر برای غیبت" required unit="دقیقه" defaultValue={defaults.maxDelayMinutes} hint="اگر تاخیر از این مقدار بیشتر شود، روز به صورت غیبت ثبت می‌شود." />
                        </ShiftPolicyPanel>
                        <ShiftPolicyPanel title="قوانین خروج">
                          <ShiftPolicyField name="exitGraceMinutes" label="فرجه مجاز خروج" required unit="دقیقه" defaultValue={defaults.exitGraceMinutes} hint="کارمند می‌تواند تا این مدت زودتر از پایان شیفت خارج شود بدون محاسبه تعجیل." />
                          <ShiftPolicySearchSelectField name="earlyLeaveCalculationMode" label="نحوه محاسبه تعجیل" required value={defaults.earlyLeaveCalculationMode} options={calculationOptions} hint="ملایم: فقط مازاد فرجه کسر می‌شود. سخت‌گیر: کل تعجیل کسر می‌شود." />
                        </ShiftPolicyPanel>
                      </>
                    ) : null}

                    {effectiveShiftVariant === 'floating-day' || effectiveShiftVariant === 'floating-absolute' ? (
                      <FloatingShiftPolicyEditor
                        variant={effectiveShiftVariant}
                        entryGraceMinutes={defaults.entryGraceMinutes}
                        delayCalculationMode={defaults.delayCalculationMode}
                        maxDelayMinutes={defaults.maxDelayMinutes}
                        preservedRequiredHours={
                          effectiveShiftVariant === 'floating-absolute' ? defaults.requiredHours : undefined
                        }
                      />
                    ) : null}

                    {effectiveShiftVariant !== 'floating-day' && effectiveShiftVariant !== 'floating-absolute' && effectiveShiftVariant !== 'rotate' ? (
                      <PolicyFormActions cancelHref="/policies" submitLabel="ویرایش" />
                    ) : null}
                  </>
                )}
              </div>
            </div>
          ) : null}

          {false && familyKey === 'shift' ? (
            <div className="policy-form-card">
              <PolicyVariantTabs familyKey={familyKey} variant={activeVariant} />

              <PolicyInfoStrip text="در شیفت ثابت، زمان ورود و خروج یک بازه ثابت دارند. در حالت شناور، ساعت کار موظفی و بازه‌های ورود/خروج قابل تنظیم است." />

              <div className="grid gap-4">
                <div className="policy-field-grid policy-field-grid-2">
                  <label className="policy-field-stack">
                    <PolicyFieldLabel label="عنوان شیفت" required hint="عنوان نمایشی این سیاست" />
                    <PolicyFieldInput name="title" defaultValue={defaults.title} required />
                  </label>
                  <label className="policy-field-stack">
                    <PolicyFieldLabel label="توضیحات" hint="متن توضیحی برای مدیران و اپراتورها" />
                    <PolicyFieldInput name="description" defaultValue={defaults.description} />
                  </label>
                </div>

                {activeVariant === 'fixed' ? (
                  <>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="شروع شیفت" required hint="ساعت شروع حضور موظفی" />
                        <PolicyFieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="پایان شیفت" required hint="ساعت پایان حضور موظفی" />
                        <PolicyFieldInput name="endTime" type="time" defaultValue={defaults.endTime || '16:30'} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="ساعت کار موظفی" hint="مقدار استاندارد روزانه" />
                        <PolicyFieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 510} />
                      </label>
                      <PolicyToggleField name="endsNextDay" label="پایان در روز بعد" hint="اگر پایان از شروع عبور کند یا روز بعد باشد فعال شود." defaultChecked={defaults.endsNextDay} />
                    </div>
                    <PolicyToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت‌هایی که باید از ساعات کار کسر شوند." defaultChecked={defaults.breakDeduct} />
                  </>
                ) : null}

                {activeVariant === 'floating-day' ? (
                  <>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="شروع بازه ورود" required hint="کف مجاز ورود برای روز جاری" />
                        <PolicyFieldInput name="workStartWindow" type="time" defaultValue={defaults.workStartWindow || '08:00'} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="پایان بازه ورود" required hint="سقف مجاز ورود" />
                        <PolicyFieldInput name="workEndWindow" type="time" defaultValue={defaults.workEndWindow || '09:30'} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="ساعت کار موظفی" hint="مدت لازم برای ثبت کامل روز" />
                        <PolicyFieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 510} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="هسته حضور" hint="بازه‌ای که باید داخل روز جاری باشد" />
                        <PolicyFieldInput name="corePresence" type="time" defaultValue={defaults.corePresence || '10:00'} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <PolicyToggleField name="endsNextDay" label="پایان در روز بعد" hint="اگر بازه خروج به روز بعد منتقل شود." defaultChecked={defaults.endsNextDay} />
                      <PolicyToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت‌های قابل کسر از ساعت موظفی." defaultChecked={defaults.breakDeduct} />
                    </div>
                  </>
                ) : null}

                {activeVariant === 'floating-absolute' ? (
                  <>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="شروع بازه ورود" required hint="حداقل زمان ورود" />
                        <PolicyFieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="پایان بازه ورود" required hint="حداکثر زمان ورود" />
                        <PolicyFieldInput name="endTime" type="time" defaultValue={defaults.endTime || '10:30'} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="ساعت کار موظفی" hint="مقدار لازم برای تکمیل روز" />
                        <PolicyFieldInput name="requiredMinutes" type="number" defaultValue={defaults.requiredMinutes || 510} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="حداکثر تاخیر" hint="حداکثر مقدار دیرکرد" />
                        <PolicyFieldInput name="maxDelayMinutes" type="number" defaultValue={defaults.maxDelayMinutes || 30} />
                      </label>
                    </div>
                  </>
                ) : null}

                {activeVariant === 'split' ? (
                  <div className="policy-form-card">
                    <PolicyInfoStrip text="در شیفت دو تکه، تکه اول و شروع تکه دوم نباید وارد روز بعد شوند." />
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="شروع تکه اول" required />
                        <PolicyFieldInput name="startTime" type="time" defaultValue={defaults.startTime || '08:00'} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="پایان تکه اول" required />
                        <PolicyFieldInput name="endTime" type="time" defaultValue={defaults.endTime || '12:00'} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="شروع تکه دوم" required />
                        <PolicyFieldInput name="workStartWindow" type="time" defaultValue={defaults.workStartWindow || '13:00'} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="پایان تکه دوم" required />
                        <PolicyFieldInput name="workEndWindow" type="time" defaultValue={defaults.workEndWindow || '17:00'} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <PolicyToggleField name="endsNextDay" label="پایان در روز بعد" hint="برای هیچ‌کدام از دو تکه نباید فعال باشد مگر در شرایط خاص." defaultChecked={defaults.endsNextDay} />
                      <PolicyToggleField name="breakDeduct" label="کسر از ساعات کاری" hint="استراحت هر تکه جداگانه محاسبه شود." defaultChecked={defaults.breakDeduct} />
                    </div>
                  </div>
                ) : null}

                {activeVariant === 'rotate' ? (
                  <div className="policy-form-card">
                    <PolicyInfoStrip text="در شیفت چرخشی، نوع شیفت و تعداد تکرار هر تکه تعیین می‌شود و آیتم‌ها می‌توانند جابه‌جا شوند." />
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="نوع شیفت" required />
                        <PolicyFieldSelect name="cycleType" defaultValue={defaults.cycleType}>
                          <option value="daily">روزانه</option>
                          <option value="weekly">هفتگی</option>
                          <option value="custom">سفارشی</option>
                        </PolicyFieldSelect>
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="تعداد تکرار" required />
                        <PolicyFieldInput name="cycleCount" type="number" defaultValue={defaults.cycleCount || 2} />
                      </label>
                    </div>
                    <div className="policy-field-grid policy-field-grid-2">
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="شروع شیفت" required />
                        <PolicyFieldInput name="startTime" type="time" defaultValue={defaults.startTime || '06:00'} />
                      </label>
                      <label className="policy-field-stack">
                        <PolicyFieldLabel label="پایان شیفت" required />
                        <PolicyFieldInput name="endTime" type="time" defaultValue={defaults.endTime || '14:00'} />
                      </label>
                    </div>
                  </div>
                ) : null}

                <PolicyFormActions cancelHref="/policies" submitLabel="ذخیره تغییرات" />
              </div>
            </div>
          ) : null}

          {familyKey === 'leave' ? (
            <LeavePolicyEditor
              familyKey={familyKey}
              variant={activeVariant}
              sectionValues={sectionValues}
            />
          ) : null}

          {familyKey === 'manual' ? (
            <ManualPolicyEditor
              backHref={backHref}
              policyId={policyId}
              manualEntryEnabled={defaults.manualEntryEnabled}
              manualRequireReason={defaults.manualRequireReason}
              requireAttachment={defaults.requireAttachment}
              manualPastDaysEnabled={defaults.manualPastDaysEnabled}
              manualMaxPastDays={defaults.manualMaxPastDays}
              manualMonthlyCapPerUser={defaults.manualMonthlyCapPerUser}
            />
          ) : null}

          {familyKey === 'night' ? (
            <NightPolicyEditor
              backHref={backHref}
              nightEnabled={defaults.nightEnabled}
              nightStart={defaults.nightStart}
              nightEnd={defaults.nightEnd}
            />
          ) : null}

          {familyKey === 'remote' ? (
            <RemotePolicyEditor backHref={backHref} policyId={policyId} policy={remoteWorkPolicy} />
          ) : null}
        </PolicySectionCard>
      </PolicyImpactForm>
    </PolicyPageShell>
  );
}
