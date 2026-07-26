'use client';

import { useMemo, useState } from 'react';
import { createPolicyAction } from '../../../lib/actions';
import { POLICY_BLUEPRINTS, type PolicyBlueprintDefaults, type PolicyBlueprintKey } from '../../../lib/policy-blueprints';
import { PolicyFieldInput, PolicyFieldLabel, PolicyFieldSelect, PolicyFieldTextarea, PolicyFormActions, PolicyInfoStrip, PolicySectionCard, PolicyToggleField } from '../_components/PolicyWorkspaceShell';

type CalendarOption = { id: string; title: string; yearLabel: string; status: string; shiftTypes: string[] };

const labels = {
  locationRule: { workplace_only: 'فقط در محل کار', unrestricted: 'بدون محدودیت مکانی' },
  incompleteAttendanceRule: { correction_required: 'ثبت ناقص و نیازمند درخواست اصلاح', warning_only: 'فقط ثبت هشدار' },
  requestRule: { leave_and_correction: 'مرخصی و اصلاح تردد', leave_only: 'فقط مرخصی', correction_only: 'فقط اصلاح تردد', none: 'هیچ‌کدام' },
} as const;

export function PolicyCreateForm({ calendars }: { calendars: CalendarOption[] }) {
  const initial = POLICY_BLUEPRINTS.find((item) => item.key === 'office')!;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [blueprintKey, setBlueprintKey] = useState<PolicyBlueprintKey>('office');
  const [rules, setRules] = useState<PolicyBlueprintDefaults>(initial.defaults!);
  const [shiftOverrides, setShiftOverrides] = useState<Record<string, { entryRequired: boolean; exitRequired: boolean }>>({});
  const [creationMode, setCreationMode] = useState<'template' | 'custom' | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const selectedBlueprint = POLICY_BLUEPRINTS.find((item) => item.key === blueprintKey)!;
  const calendar = calendars.find((item) => item.id === calendarId);
  const shiftTypes = calendar?.shiftTypes ?? [];
  const setRule = <K extends keyof PolicyBlueprintDefaults>(key: K, value: PolicyBlueprintDefaults[K]) => setRules((current) => ({ ...current, [key]: value }));
  const summary = useMemo(() => [
    `سیاست کاری «${title.trim() || 'بدون عنوان'}» با Blueprint ${selectedBlueprint.title}${calendar ? ` بر اساس ${calendar.title}` : ''} اجرا می‌شود.`,
    `ثبت ورود ${rules.entryRequired ? 'اجباری' : 'اختیاری'} و ثبت خروج ${rules.exitRequired ? 'اجباری' : 'اختیاری'} است.`,
    `ثبت تردد: ${labels.locationRule[rules.locationRule]}. فرجه ورود ${rules.entryGraceMinutes === 0 ? 'ندارد' : `${rules.entryGraceMinutes.toLocaleString('fa-IR')} دقیقه است`}.`,
    `${labels.incompleteAttendanceRule[rules.incompleteAttendanceRule]}.`,
    `درخواست‌های فعال: ${labels.requestRule[rules.requestRule]}.`,
  ], [calendar, rules, selectedBlueprint.title, title]);

  const activeCalendar = calendars.find((item) => item.status === 'active');
  const isTemplate = creationMode === 'template';
  const templateTitle = `${selectedBlueprint.title} - سیاست کاری`;

  if (!creationMode) return <div className="policy-form-stack">
    <PolicySectionCard title="روش ایجاد سیاست کاری" description="ابتدا مشخص کنید سیاست را از یک قالب آماده بسازید یا همه اطلاعات را به‌صورت دستی وارد کنید.">
      <div className="policy-form-card policy-creation-mode-grid">
        <button type="button" className="policy-blueprint-option" onClick={() => { setCreationMode('template'); setBlueprintKey('office'); setRules(initial.defaults!); }}>
          <strong>استفاده از قالب آماده</strong><span>قواعد از پیش تنظیم‌شده را ببینید و سریع ثبت کنید.</span>
        </button>
        <button type="button" className="policy-blueprint-option" onClick={() => { setCreationMode('custom'); setStep(1); setBlueprintKey('custom'); setRules(POLICY_BLUEPRINTS.find((item) => item.key === 'custom')!.defaults!); }}>
          <strong>ایجاد بدون قالب</strong><span>اطلاعات پایه، تقویم و تمام قواعد را خودتان تنظیم کنید.</span>
        </button>
      </div>
    </PolicySectionCard>
    <PolicyFormActions cancelHref="/policies" submitLabel="ادامه" />
  </div>;

  return <form action={createPolicyAction as never} className="policy-form-stack">
    <input type="hidden" name="creationMode" value={creationMode} />
    <input type="hidden" name="blueprintKey" value={blueprintKey} />
    <input type="hidden" name="shiftPolicyOverrides" value={JSON.stringify(shiftOverrides)} />
    {!isTemplate ? <>
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="calendarId" value={calendarId} />
    </> : null}
    {isTemplate ? <>
      <input type="hidden" name="title" value={title || templateTitle} />
      <input type="hidden" name="description" value={description || selectedBlueprint.description} />
      <input type="hidden" name="calendarId" value={calendarId || activeCalendar?.id || ''} />
      <PolicySectionCard title="قالب آماده"><div className="policy-form-card policy-blueprint-grid">{POLICY_BLUEPRINTS.map((item) => <button key={item.key} type="button" disabled={!item.available} className={`policy-blueprint-option ${blueprintKey === item.key ? 'is-selected' : ''}`} onClick={() => { if (!item.defaults) return; setBlueprintKey(item.key); setRules(item.defaults); }}><strong>{item.title}</strong><span>{item.description}</span>{!item.available ? <em>در دست توسعه</em> : null}</button>)}</div></PolicySectionCard>
      <PolicySectionCard title="نمایش اطلاعات قالب"><div className="policy-form-card"><PolicyInfoStrip text={summary.join(' ')} /></div></PolicySectionCard>
    </> : <>
    {step === 1 ? <>
      <PolicySectionCard title="۱. اطلاعات پایه"><div className="policy-form-card policy-field-grid policy-field-grid-2">
        <label className="policy-field-stack"><PolicyFieldLabel label="عنوان سیاست کاری" required /><PolicyFieldInput name="customTitle" value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={120} required /></label>
        <label className="policy-field-stack"><PolicyFieldLabel label="توضیحات" hint="اختیاری، حداکثر ۱۰۰۰ نویسه" /><PolicyFieldTextarea name="customDescription" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={3} /></label>
      </div></PolicySectionCard>
      <PolicySectionCard title="۲. تقویم کاری"><div className="policy-form-card"><label className="policy-field-stack"><PolicyFieldLabel label="این سیاست بر اساس کدام تقویم کاری اجرا شود؟" required /><PolicyFieldSelect name="customCalendarId" value={calendarId} onChange={(event) => setCalendarId(event.target.value)} required><option value="">انتخاب کنید</option>{calendars.filter((item) => item.status === 'active').map((item) => <option key={item.id} value={item.id}>{item.title} {item.yearLabel ? `- ${item.yearLabel}` : ''}</option>)}</PolicyFieldSelect></label></div></PolicySectionCard>
    </> : null}
    {step === 2 ? null : null}
    {step === 1 ? <PolicySectionCard title="۳. انتخاب قواعد پایه"><div className="policy-form-card policy-blueprint-grid">{POLICY_BLUEPRINTS.filter((item) => item.key === 'custom').map((item) => <button key={item.key} type="button" className="policy-blueprint-option is-selected"><strong>سفارشی</strong><span>قواعد را در مرحله بعد تنظیم می‌کنید.</span></button>)}</div></PolicySectionCard> : null}
    {step === 2 ? <PolicySectionCard title="۳. قواعد سیاست کاری"><div className="policy-form-card"><PolicyInfoStrip text="قواعد سیاست کاری را در این مرحله بررسی و تنظیم کنید." /></div></PolicySectionCard> : null}
    </>}
    {(isTemplate || step === 2) ? <>
    <PolicySectionCard title="۴. قواعد ضروری"><div className="policy-form-card policy-field-grid policy-field-grid-2">
      {shiftTypes.map((type) => { const current = shiftOverrides[type] ?? { entryRequired: true, exitRequired: true }; return <div key={type} className="policy-field-stack">
        <PolicyFieldLabel label={type === 'fixed' ? 'شیفت ثابت' : type === 'float-day' ? 'شیفت شناور - شروع روز' : type === 'float-abs' ? 'شیفت شناور مطلق' : type === 'split' ? 'شیفت دو تکه' : type} hint="قواعد ثبت ورود و خروج برای همین نوع شیفت ذخیره می‌شود." />
        <PolicyToggleField name={`${type}.entryRequired`} label="آیا ثبت ورود کارکنان اجباری است؟" checked={current.entryRequired} onCheckedChange={(checked) => setShiftOverrides((all) => ({ ...all, [type]: { ...current, entryRequired: checked } }))} />
        <PolicyToggleField name={`${type}.exitRequired`} label="آیا ثبت خروج کارکنان اجباری است؟" checked={current.exitRequired} onCheckedChange={(checked) => setShiftOverrides((all) => ({ ...all, [type]: { ...current, exitRequired: checked } }))} />
      </div>; })}
      {shiftTypes.length === 0 ? <PolicyInfoStrip text="ابتدا حداقل یک شیفت واقعی به تقویم انتخاب‌شده اضافه کنید." /> : null}
    </div></PolicySectionCard>
    <PolicySectionCard title="۵. خلاصه پیش از ایجاد"><div className="policy-form-card"><PolicyInfoStrip text={summary.join(' ')} /></div></PolicySectionCard>
    {!calendars.some((item) => item.status === 'active') ? <PolicyInfoStrip text="برای ثبت سیاست، ابتدا یک تقویم کاری فعال ایجاد کنید." /> : null}
    </> : null}
    {!isTemplate && step === 1 ? <div className="policy-form-actions"><button type="button" className="policy-primary-action" onClick={() => setStep(2)}>ادامه به تنظیمات</button><a className="policy-secondary-action" href="/policies">انصراف</a></div> : <PolicyFormActions cancelHref="/policies" submitLabel="ایجاد سیاست کاری" disabled={!calendars.some((item) => item.status === 'active')} />}
  </form>;
}
