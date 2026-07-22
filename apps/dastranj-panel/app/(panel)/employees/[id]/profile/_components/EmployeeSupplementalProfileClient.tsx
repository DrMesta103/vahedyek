'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { upsertClientStorageStateAction } from '../../../../../lib/client-storage-actions';
import { deactivateEmployeeInterestAction, deactivateEmployeeSkillAction, reviewEmployeeProfileApprovalAction, saveEmployeeEmergencyContactAction, saveEmployeeHealthProfileAction, saveEmployeeInterestAction, saveEmployeeSkillAction, saveEmployeeWorkPreferencesAction } from '../../../../../lib/actions';
import {
  getEmployeeSupplementalStorageKey,
  getDefaultEmployeeSupplementalProfile,
  normalizeEmployeeSupplementalProfile,
  type EmployeeSupplementalProfile,
} from '../../../../../lib/employee-contract-drafts';
import type { HydratedClientStorageState } from '../../../../../lib/client-storage-persistence';
import { EmployeeSupplementalProfileEditor } from '../../_components/EmployeeSupplementalProfileEditor';
import { EmployeeSupplementalProfileView } from '../../_components/EmployeeSupplementalProfileView';
import { buildEmployeeCategoryMatrix } from '../../../../../lib/employee-supplemental-fields';

type EmployeeProfileEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  maritalStatus: string;
  childrenCount: number;
  mobile1?: string | null;
  hasBank?: boolean;
  hasOrganization?: boolean;
  hasAccess?: boolean;
  employmentStartDate?: string | null;
};

const categoryStatusLabel: Record<string, string> = { NOT_STARTED: 'شروع نشده', SUBMITTED: 'ارسال شده', APPROVED: 'تأیید شده', COMPLETE: 'کامل', INCOMPLETE: 'ناقص', DUE_SOON: 'مهلت نزدیک', EXPIRED: 'مهلت گذشته', PENDING_APPROVAL: 'در انتظار تأیید', REJECTED: 'رد شده', NEEDS_REVIEW: 'نیازمند بررسی', OPTIONAL_INCOMPLETE: 'اختیاری', COMING_SOON: 'در دست توسعه' };

function getStorageValue(storageStates: HydratedClientStorageState[], storageKey: string) {
  return storageStates.find((item) => item.storageKey === storageKey)?.value ?? null;
}

function readEmployeeSupplementalProfilesFromStorageStates(
  storageStates: HydratedClientStorageState[],
  tenantId?: string | null,
) {
  const raw = getStorageValue(storageStates, getEmployeeSupplementalStorageKey(tenantId));
  if (!raw) return {} as Record<string, EmployeeSupplementalProfile>;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {} as Record<string, EmployeeSupplementalProfile>;
    return Object.entries(parsed).reduce<Record<string, EmployeeSupplementalProfile>>((result, [key, value]) => {
      result[key] = normalizeEmployeeSupplementalProfile(value);
      return result;
    }, {});
  } catch {
    return {} as Record<string, EmployeeSupplementalProfile>;
  }
}

export function EmployeeSupplementalProfileClient({
  employee,
  tenantId,
  storageStates,
  categoryData,
}: {
  employee: EmployeeProfileEmployee;
  tenantId: string | null;
  storageStates: HydratedClientStorageState[];
  categoryData: { skills: Array<{ id: string; title: string; category: string; level: string; description: string | null }>; interests: Array<{ id: string; title: string; category: string; description: string | null }>; preferences: { values: unknown } | null; health: { physicalHealthNotes: string | null; mobilityLimitations: string | null; specialMedicalConsiderations: string | null; workplaceAccommodationNeeds: string | null; mentalHealthNotes: string | null } | null; healthApproval: { status: 'NOT_STARTED'|'SUBMITTED'|'PENDING_APPROVAL'|'APPROVED'|'REJECTED'; reviewNote: string | null } | null; emergencyContacts: Array<{ id: string; name: string; relation: string; mobile: string }>; canUpdate: boolean; canSensitiveView: boolean; canSensitiveUpdate: boolean; canHealthView: boolean; canHealthUpdate: boolean; historyCount: number } | null;
}) {
  const [supplemental, setSupplemental] = useState<EmployeeSupplementalProfile>(() => {
    const profiles = readEmployeeSupplementalProfilesFromStorageStates(storageStates, tenantId);
    return profiles[employee.id] ?? getDefaultEmployeeSupplementalProfile();
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingInterestId, setEditingInterestId] = useState<string | null>(null);
  const [editingEmergencyContactId, setEditingEmergencyContactId] = useState<string | null>(null);
  const [emergencyContactError, setEmergencyContactError] = useState<string | null>(null);
  const categories = categoryData;
  const matrix = buildEmployeeCategoryMatrix({ supplemental, employee, skills: categories?.skills.length ?? 0, interests: categories?.interests.length ?? 0, hasPreferences: Boolean(categories?.preferences), hasHealthAccess: Boolean(categories?.canHealthView), hasHealth: Boolean(categories?.health), healthApprovalStatus: categories?.healthApproval?.status, historyCount: categories?.historyCount ?? 0 });
  const requiredCategories = matrix.filter((item) => item.totalRequiredFields > 0);
  const completionPercent = requiredCategories.length ? Math.round(requiredCategories.reduce((sum, item) => sum + item.completionPercent, 0) / requiredCategories.length) : 0;
  const gaps = [...matrix.flatMap((item) => item.missingFields.map((field) => ({ ...item, field }))), ...matrix.filter((item) => item.status === 'REJECTED').map((item) => ({ ...item, field: 'اصلاح و ارسال مجدد' }))].sort((a, b) => a.level - b.level);
  const currentLevel = ([1, 2, 3, 4] as const).reduce((highest, level) => { const requiredItems = matrix.filter((item) => item.level === level && item.totalRequiredFields > 0); return requiredItems.length && requiredItems.every((item) => item.status === 'COMPLETE') ? level : highest; }, 0);
  const nextLevel = currentLevel < 4 ? currentLevel + 1 : null;
  const nextLevelMissing = nextLevel ? gaps.filter((gap) => gap.level === nextLevel).map((gap) => gap.field) : [];

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

  const saveProfile = (value: EmployeeSupplementalProfile) => {
    const normalized = normalizeEmployeeSupplementalProfile(value);
    const profiles = readEmployeeSupplementalProfilesFromStorageStates(storageStates, tenantId);
    const next = { ...profiles, [employee.id]: normalized };
    void upsertClientStorageStateAction(getEmployeeSupplementalStorageKey(tenantId), JSON.stringify(next));
    setSupplemental(normalized);
    setEditorOpen(false);
  };

  const submitEmergencyContact = async (formData: FormData) => {
    setEmergencyContactError(null);
    const result = await saveEmployeeEmergencyContactAction(formData);
    if (result.ok === false) setEmergencyContactError(result.error);
  };

  return (
    <div className="employee-supplemental-profile-page" dir="rtl" lang="fa">
      <div className="employee-supplemental-profile-toolbar">
        <Link href={`/employees/${employee.id}`} className="draft-template-flow-action is-secondary">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          بازگشت به جزئیات کارمند
        </Link>
        <button type="button" className="draft-template-flow-action is-primary" onClick={() => setEditorOpen(true)}>
          ویرایش مشخصات
        </button>
      </div>

      <EmployeeSupplementalProfileView
        employeeName={employeeName}
        employee={{
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        supplemental={supplemental}
        onEdit={() => setEditorOpen(true)}
        defaultExpanded
      />

      <EmployeeSupplementalProfileEditor
        open={editorOpen}
        employeeName={employeeName}
        value={supplemental}
        employeeMeta={{
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        onCancel={() => setEditorOpen(false)}
        onSubmit={saveProfile}
      />

      <section className="employee-detail-section">
        <div className="employee-detail-section-head"><h2>دسته‌های پرونده</h2><p>اطلاعات اختیاری، تکمیل اجباری پرونده را کاهش نمی‌دهند.</p></div>
        <div className="employee-detail-grid">
          {['اطلاعات شخصی','تماس و اضطراری','خانوادگی','تحصیلات','سوابق شغلی','مهارت‌ها','سازمانی و استخدامی','نظام وظیفه','آدرس','علایق','ترجیحات کاری','مدارک','اطلاعات بانکی','آموزش','دسترسی‌ها','تاریخچه'].map((title) => <article className="employee-detail-tile" key={title}><div className="employee-detail-tile-copy"><h3>{title}</h3><p>{title === 'مدارک' || title === 'آموزش' ? 'این قابلیت در دست توسعه است.' : 'منبع داده واقعی پرونده کارمند'}</p></div></article>)}
          {categories?.canHealthView ? <article className="employee-detail-tile"><div className="employee-detail-tile-copy"><h3>سلامت و رفاه</h3><p>اطلاعات حساس؛ فقط برای افراد مجاز نمایش داده می‌شود.</p></div></article> : null}
        </div>
      </section>

      <section className="employee-detail-section" id="completion"><div className="employee-detail-section-head"><h2>وضعیت تکمیل پرونده</h2><p>{completionPercent}% تکمیل الزامی · سطح فعلی: {currentLevel || 'شروع'}{nextLevel ? ` · نیاز سطح ${nextLevel}: ${nextLevelMissing.join('، ') || 'آماده'}` : ' · تمام سطح‌ها تکمیل است'}</p></div><div className="employee-detail-grid">{[1,2,3,4].map((level) => { const items = matrix.filter((item) => item.level === level && item.availability !== 'HIDDEN'); const complete = items.filter((item) => item.status === 'COMPLETE').length; return <article className="employee-detail-tile" key={level}><div className="employee-detail-tile-copy"><h3>سطح {level}</h3><p>{complete} از {items.length} دسته کامل</p></div></article>; })}</div></section>
      {gaps.length ? <section className="employee-detail-section" id="gaps"><div className="employee-detail-section-head"><h2>نواقص پرونده</h2></div><div className="employee-detail-grid employee-detail-grid--single">{gaps.map((gap) => <article className="employee-detail-tile" key={`${gap.categoryKey}-${gap.field}`}><div className="employee-detail-tile-copy"><h3>{gap.field} ثبت نشده است.</h3><p>{gap.title} · اهمیت {gap.level === 1 ? 'بحرانی' : gap.level === 2 ? 'مهم' : 'عادی'}</p></div>{gap.actionHref ? <Link href={`/employees/${employee.id}${gap.actionHref}`} className="employee-detail-action-btn">{gap.actionLabel ?? 'تکمیل'}</Link> : null}</article>)}</div></section> : null}
      <section className="employee-detail-section" id="categories"><div className="employee-detail-section-head"><h2>ماتریس دسته‌های پرونده</h2></div><div className="employee-detail-grid">{matrix.filter((item) => item.availability !== 'HIDDEN').map((item) => <article className="employee-detail-tile" key={item.categoryKey}><div className="employee-detail-tile-copy"><h3>{item.title}</h3><p>{item.availability === 'COMING_SOON' ? 'این قابلیت در دست توسعه است.' : `${item.completionPercent}% · ${item.missingFields.length} مورد ناقص · ${categoryStatusLabel[item.status] ?? item.status}`}{item.deadlineAt ? ` · مهلت: ${new Date(item.deadlineAt).toLocaleDateString('fa-IR')}` : ''}</p></div>{item.actionHref ? <Link href={`/employees/${employee.id}${item.actionHref}`} className="employee-detail-action-btn">{item.actionLabel ?? 'مشاهده'}</Link> : null}</article>)}</div></section>

      {categories?.canUpdate ? <section className="employee-detail-section"><div className="employee-detail-section-head"><h2>مهارت‌ها</h2></div><div className="employee-detail-grid employee-detail-grid--single">{categories.skills.map((skill) => <article className="employee-detail-tile" key={skill.id}><div className="employee-detail-tile-copy"><h3>{skill.title} · {skill.level}</h3><p>{skill.category}</p></div><button type="button" onClick={() => setEditingSkillId(skill.id)}>ویرایش</button><form action={deactivateEmployeeSkillAction}><input type="hidden" name="employeeId" value={employee.id}/><input type="hidden" name="id" value={skill.id}/><button>غیرفعال‌سازی</button></form></article>)}</div>{(() => { const skill = categories.skills.find((item) => item.id === editingSkillId); return <form action={saveEmployeeSkillAction} className="employee-add-fields-grid"><input type="hidden" name="employeeId" value={employee.id}/>{skill ? <input type="hidden" name="id" value={skill.id}/> : null}<input name="title" required placeholder="عنوان مهارت" defaultValue={skill?.title ?? ''}/><select name="category" defaultValue={skill?.category ?? 'TECHNICAL'}><option value="TECHNICAL">فنی</option><option value="SOFT">نرم</option><option value="COMPUTER">رایانه‌ای</option><option value="LANGUAGE">زبان</option><option value="MANAGEMENT">مدیریتی</option><option value="COMMUNICATION">ارتباطی</option><option value="ARTISTIC">هنری</option><option value="SPORT">ورزشی</option></select><select name="level" defaultValue={skill?.level ?? 'BEGINNER'}><option value="BEGINNER">مبتدی</option><option value="INTERMEDIATE">متوسط</option><option value="ADVANCED">پیشرفته</option><option value="EXPERT">متخصص</option></select><input name="description" placeholder="توضیح" defaultValue={skill?.description ?? ''}/><button>{skill ? 'ذخیره ویرایش' : 'افزودن مهارت'}</button>{skill ? <button type="button" onClick={() => setEditingSkillId(null)}>انصراف</button> : null}</form>; })()}</section> : null}

      {categories?.canUpdate ? <section className="employee-detail-section"><div className="employee-detail-section-head"><h2>علایق</h2></div>{categories.interests.map((item) => <article className="employee-detail-tile" key={item.id}><div className="employee-detail-tile-copy"><h3>{item.title}</h3><p>{item.category}</p></div><button type="button" onClick={() => setEditingInterestId(item.id)}>ویرایش</button><form action={deactivateEmployeeInterestAction}><input type="hidden" name="employeeId" value={employee.id}/><input type="hidden" name="id" value={item.id}/><button>غیرفعال‌سازی</button></form></article>)}{(() => { const item = categories.interests.find((entry) => entry.id === editingInterestId); return <form action={saveEmployeeInterestAction} className="employee-add-fields-grid"><input type="hidden" name="employeeId" value={employee.id}/>{item ? <input type="hidden" name="id" value={item.id}/> : null}<input name="title" required placeholder="عنوان علاقه" defaultValue={item?.title ?? ''}/><select name="category" defaultValue={item?.category ?? 'OTHER'}><option value="SPORT">ورزش</option><option value="ART">هنر</option><option value="READING">مطالعه</option><option value="TRAVEL">سفر</option><option value="SOCIAL">اجتماعی</option><option value="LEARNING">یادگیری</option><option value="VOLUNTEERING">داوطلبانه</option><option value="OTHER">سایر</option></select><input name="description" placeholder="توضیح" defaultValue={item?.description ?? ''}/><button>{item ? 'ذخیره ویرایش' : 'افزودن علاقه'}</button>{item ? <button type="button" onClick={() => setEditingInterestId(null)}>انصراف</button> : null}</form>; })()}</section> : null}

      {categories?.canSensitiveView ? <section className="employee-detail-section" id="emergency-contact"><div className="employee-detail-section-head"><h2>تماس اضطراری</h2><p>این اطلاعات اختیاری است و در امتیاز تکمیل اجباری پرونده اثر ندارد.</p></div><div className="employee-detail-grid employee-detail-grid--single">{categories.emergencyContacts.map((contact) => <article className="employee-detail-tile" key={contact.id}><div className="employee-detail-tile-copy"><h3>{contact.name}</h3><p>{contact.relation} · {contact.mobile}</p></div>{categories.canSensitiveUpdate ? <button type="button" onClick={() => { setEmergencyContactError(null); setEditingEmergencyContactId(contact.id); }}>ویرایش</button> : null}</article>)}</div>{categories.canSensitiveUpdate ? (() => { const contact = categories.emergencyContacts.find((item) => item.id === editingEmergencyContactId); return <form action={submitEmergencyContact} className="employee-add-fields-grid"><input type="hidden" name="employeeId" value={employee.id}/>{contact ? <input type="hidden" name="id" value={contact.id}/> : null}<input name="name" required minLength={2} maxLength={120} placeholder="نام فرد تماس اضطراری" defaultValue={contact?.name ?? ''}/><input name="relation" required minLength={2} maxLength={80} placeholder="نسبت با کارمند" defaultValue={contact?.relation ?? ''}/><input name="mobile" required inputMode="tel" placeholder="شماره تماس اضطراری" defaultValue={contact?.mobile ?? ''}/><button>{contact ? 'ذخیره ویرایش' : 'افزودن تماس اضطراری'}</button>{contact ? <button type="button" onClick={() => { setEmergencyContactError(null); setEditingEmergencyContactId(null); }}>انصراف</button> : null}{emergencyContactError ? <p role="alert">{emergencyContactError}</p> : null}</form>; })() : <p>مجوز مشاهده وجود دارد، اما مجوز ویرایش تماس اضطراری ندارید.</p>}</section> : null}
      {categories?.canUpdate ? <section className="employee-detail-section"><div className="employee-detail-section-head"><h2>ترجیحات کاری</h2><p>این موارد ترجیح کارمند هستند و تعهد قطعی محسوب نمی‌شوند.</p></div><form action={saveEmployeeWorkPreferencesAction} className="employee-add-fields-grid"><input type="hidden" name="employeeId" value={employee.id}/>{['prefersOvertime','prefersFridayWork','prefersBusinessTravel','canRelocate','prefersRemote','prefersOnSite','prefersHybrid','prefersTeamWork','prefersIndividualWork','prefersManagementRole','prefersExecutionRole'].map((key) => <label key={key}><input type="checkbox" name={key} value="true"/> {key}</label>)}<button>ذخیره ترجیحات</button></form></section> : null}
      {categories?.canHealthView ? <section className="employee-detail-section" id="health"><div className="employee-detail-section-head"><h2>سلامت و رفاه</h2><p>وضعیت بررسی: {categoryStatusLabel[categories.healthApproval?.status ?? 'NOT_STARTED']}</p>{categories.healthApproval?.reviewNote ? <p>یادداشت بررسی: {categories.healthApproval.reviewNote}</p> : null}</div>{categories.canHealthUpdate ? <><form action={saveEmployeeHealthProfileAction} className="employee-add-fields-grid"><input type="hidden" name="employeeId" value={employee.id}/><textarea name="physicalHealthNotes" defaultValue={categories.health?.physicalHealthNotes ?? ''} placeholder="ملاحظات سلامت جسمی"/><textarea name="mobilityLimitations" defaultValue={categories.health?.mobilityLimitations ?? ''} placeholder="محدودیت حرکتی"/><textarea name="specialMedicalConsiderations" defaultValue={categories.health?.specialMedicalConsiderations ?? ''} placeholder="ملاحظات پزشکی"/><textarea name="workplaceAccommodationNeeds" defaultValue={categories.health?.workplaceAccommodationNeeds ?? ''} placeholder="نیازهای محیط کار"/><textarea name="mentalHealthNotes" defaultValue={categories.health?.mentalHealthNotes ?? ''} placeholder="یادداشت اختیاری سلامت روان"/><button>ذخیره و ارسال برای بررسی</button></form>{categories.healthApproval ? <div className="employee-detail-grid"><form action={reviewEmployeeProfileApprovalAction}><input type="hidden" name="employeeId" value={employee.id}/><input type="hidden" name="categoryKey" value="HEALTH"/><input type="hidden" name="status" value="PENDING_APPROVAL"/><button>ارسال به صف تأیید</button></form><form action={reviewEmployeeProfileApprovalAction}><input type="hidden" name="employeeId" value={employee.id}/><input type="hidden" name="categoryKey" value="HEALTH"/><input type="hidden" name="status" value="APPROVED"/><button>تأیید</button></form><form action={reviewEmployeeProfileApprovalAction}><input type="hidden" name="employeeId" value={employee.id}/><input type="hidden" name="categoryKey" value="HEALTH"/><input type="hidden" name="status" value="REJECTED"/><input name="reviewNote" maxLength={1000} placeholder="دلیل رد (اختیاری)"/><button>رد</button></form></div> : null}</> : <p>مجوز ویرایش اطلاعات سلامت ندارید.</p>}</section> : null}
    </div>
  );
}
