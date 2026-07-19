'use client';

import { useMemo, useState } from 'react';
import { createPolicyAction } from '../../../lib/actions';
import { POLICY_BLUEPRINTS, type PolicyBlueprintDefaults, type PolicyBlueprintKey } from '../../../lib/policy-blueprints';
import { PolicyFieldInput, PolicyFieldLabel, PolicyFieldSelect, PolicyFieldTextarea, PolicyFormActions, PolicyInfoStrip, PolicySectionCard } from '../_components/PolicyWorkspaceShell';

type CalendarOption = { id: string; title: string; yearLabel: string; status: string };

const labels = {
  locationRule: { workplace_only: 'فقط در محل کار', unrestricted: 'بدون محدودیت مکانی' },
  incompleteAttendanceRule: { correction_required: 'ثبت ناقص و نیازمند درخواست اصلاح', warning_only: 'فقط ثبت هشدار' },
  overtimeRule: { manager_approval: 'فعال، فقط با تأیید مدیر', automatic: 'فعال، بدون تأیید مدیر', disabled: 'غیرفعال' },
  requestRule: { leave_and_correction: 'مرخصی و اصلاح تردد', leave_only: 'فقط مرخصی', correction_only: 'فقط اصلاح تردد', none: 'هیچ‌کدام' },
} as const;

export function PolicyCreateForm({ calendars }: { calendars: CalendarOption[] }) {
  const initial = POLICY_BLUEPRINTS.find((item) => item.key === 'office')!;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [blueprintKey, setBlueprintKey] = useState<PolicyBlueprintKey>('office');
  const [rules, setRules] = useState<PolicyBlueprintDefaults>(initial.defaults!);
  const selectedBlueprint = POLICY_BLUEPRINTS.find((item) => item.key === blueprintKey)!;
  const calendar = calendars.find((item) => item.id === calendarId);
  const setRule = <K extends keyof PolicyBlueprintDefaults>(key: K, value: PolicyBlueprintDefaults[K]) => setRules((current) => ({ ...current, [key]: value }));
  const summary = useMemo(() => [
    `سیاست کاری «${title.trim() || 'بدون عنوان'}» با Blueprint ${selectedBlueprint.title}${calendar ? ` بر اساس ${calendar.title}` : ''} اجرا می‌شود.`,
    `ثبت ورود ${rules.entryRequired ? 'اجباری' : 'اختیاری'} و ثبت خروج ${rules.exitRequired ? 'اجباری' : 'اختیاری'} است.`,
    `ثبت تردد: ${labels.locationRule[rules.locationRule]}. فرجه ورود ${rules.entryGraceMinutes === 0 ? 'ندارد' : `${rules.entryGraceMinutes.toLocaleString('fa-IR')} دقیقه است`}.`,
    `${labels.incompleteAttendanceRule[rules.incompleteAttendanceRule]}. اضافه‌کاری: ${labels.overtimeRule[rules.overtimeRule]}.`,
    `درخواست‌های فعال: ${labels.requestRule[rules.requestRule]}.`,
  ], [calendar, rules, selectedBlueprint.title, title]);

  return <form action={createPolicyAction as never} className="policy-form-stack">
    <input type="hidden" name="blueprintKey" value={blueprintKey} />
    <PolicySectionCard title="۱. اطلاعات پایه"><div className="policy-form-card policy-field-grid policy-field-grid-2">
      <label className="policy-field-stack"><PolicyFieldLabel label="عنوان سیاست کاری" required /><PolicyFieldInput name="title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={120} required /></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="توضیحات" hint="اختیاری، حداکثر ۱۰۰۰ نویسه" /><PolicyFieldTextarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={3} /></label>
    </div></PolicySectionCard>
    <PolicySectionCard title="۲. تقویم کاری" description="تقویم کاری مبنای تشخیص روزهای کاری، تعطیلات و روزهای غیرکاری در این سیاست است."><div className="policy-form-card"><label className="policy-field-stack"><PolicyFieldLabel label="این سیاست بر اساس کدام تقویم کاری اجرا شود؟" required /><PolicyFieldSelect name="calendarId" value={calendarId} onChange={(event) => setCalendarId(event.target.value)} required><option value="">انتخاب کنید</option>{calendars.filter((item) => item.status === 'active').map((item) => <option key={item.id} value={item.id}>{item.title} {item.yearLabel ? `- ${item.yearLabel}` : ''}</option>)}</PolicyFieldSelect></label></div></PolicySectionCard>
    <PolicySectionCard title="۳. انتخاب Blueprint"><div className="policy-form-card policy-blueprint-grid">{POLICY_BLUEPRINTS.map((item) => <button key={item.key} type="button" disabled={!item.available} className={`policy-blueprint-option ${blueprintKey === item.key ? 'is-selected' : ''}`} onClick={() => { if (!item.defaults) return; setBlueprintKey(item.key); setRules(item.defaults); }}><strong>{item.title}</strong><span>{item.description}</span>{!item.available ? <em>در دست توسعه</em> : null}</button>)}</div></PolicySectionCard>
    <PolicySectionCard title="۴. قواعد ضروری"><div className="policy-form-card policy-field-grid policy-field-grid-2">
      <label className="policy-field-stack"><PolicyFieldLabel label="آیا ثبت ورود کارکنان اجباری است؟" /><PolicyFieldSelect name="entryRequired" value={String(rules.entryRequired)} onChange={(e) => setRule('entryRequired', e.target.value === 'true')}><option value="true">بله</option><option value="false" disabled>خیر — در دست توسعه</option></PolicyFieldSelect></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="آیا ثبت خروج کارکنان اجباری است؟" /><PolicyFieldSelect name="exitRequired" value={String(rules.exitRequired)} onChange={(e) => setRule('exitRequired', e.target.value === 'true')}><option value="true">بله</option><option value="false" disabled>خیر — در دست توسعه</option></PolicyFieldSelect></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="کارمند از کجا اجازه ثبت تردد دارد؟" /><PolicyFieldSelect name="locationRule" value={rules.locationRule} onChange={(e) => setRule('locationRule', e.target.value as PolicyBlueprintDefaults['locationRule'])}><option value="workplace_only">فقط در محل کار</option><option value="unrestricted">بدون محدودیت مکانی</option><option disabled>محل کار یا مأموریت — در دست توسعه</option><option disabled>خارج از محل با تأیید مدیر — در دست توسعه</option></PolicyFieldSelect></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="فرجه ورود چقدر باشد؟" /><PolicyFieldInput name="entryGraceMinutes" type="number" min={0} max={240} step={1} value={rules.entryGraceMinutes} onChange={(e) => setRule('entryGraceMinutes', Number(e.target.value))} /></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="اگر ورود یا خروج کامل ثبت نشود، سیستم چه کند؟" /><PolicyFieldSelect name="incompleteAttendanceRule" value={rules.incompleteAttendanceRule} onChange={(e) => setRule('incompleteAttendanceRule', e.target.value as PolicyBlueprintDefaults['incompleteAttendanceRule'])}><option value="correction_required">تردد ناقص و درخواست اصلاح لازم باشد</option><option value="warning_only">فقط هشدار ثبت شود</option><option disabled>برای مدیر ارسال شود — در دست توسعه</option></PolicyFieldSelect></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="آیا اضافه‌کاری در این سیاست فعال باشد؟" hint="نرخ و محاسبات مالی در حقوق و دستمزد مدیریت می‌شود." /><PolicyFieldSelect name="overtimeRule" value={rules.overtimeRule} onChange={(e) => setRule('overtimeRule', e.target.value as PolicyBlueprintDefaults['overtimeRule'])}><option value="manager_approval">فعال، فقط با تأیید مدیر</option><option value="automatic">فعال، بدون تأیید مدیر</option><option value="disabled">غیرفعال</option></PolicyFieldSelect></label>
      <label className="policy-field-stack"><PolicyFieldLabel label="آیا درخواست مرخصی و اصلاح تردد فعال باشد؟" /><PolicyFieldSelect name="requestRule" value={rules.requestRule} onChange={(e) => { const next = e.target.value as PolicyBlueprintDefaults['requestRule']; setRules((current) => ({ ...current, requestRule: next, incompleteAttendanceRule: (next === 'leave_only' || next === 'none') && current.incompleteAttendanceRule === 'correction_required' ? 'warning_only' : current.incompleteAttendanceRule })); }}><option value="leave_and_correction">هر دو فعال</option><option value="leave_only">فقط مرخصی</option><option value="correction_only">فقط اصلاح تردد</option><option value="none">هیچ‌کدام</option></PolicyFieldSelect></label>
    </div></PolicySectionCard>
    <PolicySectionCard title="۵. خلاصه پیش از ایجاد"><div className="policy-form-card"><PolicyInfoStrip text={summary.join(' ')} /></div></PolicySectionCard>
    {!calendars.some((item) => item.status === 'active') ? <PolicyInfoStrip text="برای ثبت سیاست، ابتدا یک تقویم کاری فعال ایجاد کنید." /> : null}
    <PolicyFormActions cancelHref="/policies" submitLabel="ایجاد سیاست کاری" disabled={!calendars.some((item) => item.status === 'active')} />
  </form>;
}
