import Link from 'next/link';
import { listCalendars, listPolicies } from '../../../lib/data';
import { getPolicyBlueprint } from '../../../lib/policy-blueprints';
import { getPolicyAccess } from '../../../lib/policy-access';
import { getPolicyFamilyKey, getPolicySectionValues } from '../../../lib/policy-workspaces';
import { PolicyInfoStrip, PolicyNavLink, PolicyPageShell } from '../_components/PolicyWorkspaceShell';
import { PolicyOverviewCard } from './_components/PolicyOverviewCard';

type WorkPolicyPageProps = {
  searchParams?: { policyId?: string; created?: string; cloned?: string; mode?: string } | Promise<{ policyId?: string; created?: string; cloned?: string; mode?: string }>;
};

export default async function WorkPolicyOverviewPage({ searchParams }: WorkPolicyPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const readOnly = resolvedSearchParams.mode === 'view';
  const [policies, calendars, access] = await Promise.all([listPolicies(), listCalendars(), getPolicyAccess()]);
  if (!access.canView) return <div className="page-stack module-page" dir="rtl" lang="fa"><div className="module-empty-state"><h2>دسترسی به جزئیات سیاست کاری ندارید.</h2><p>برای مشاهدهٔ این بخش به نقش مالک، مدیر یا مدیر منابع انسانی نیاز است.</p></div></div>;
  const selectedPolicy =
    (resolvedSearchParams.policyId ? policies.find((item) => item.id === resolvedSearchParams.policyId) : null) ??
    policies.find((item) => getPolicyFamilyKey(item) === 'work') ??
    policies.find((item) => !getPolicyFamilyKey(item)) ??
    null;

  const sectionValues = getPolicySectionValues(selectedPolicy);
  const title = typeof sectionValues.title === 'string' ? sectionValues.title : selectedPolicy?.title ?? 'سیاست کاری';
  const description =
    typeof sectionValues.description === 'string' ? sectionValues.description : selectedPolicy?.description ?? '';
  const policyId = selectedPolicy?.id ?? '';
  const calendarYearLabel = selectedPolicy?.calendar?.yearLabel ?? '-';
  const calendarTitle = selectedPolicy?.calendar?.title ?? '';
  const blueprint = getPolicyBlueprint(sectionValues.blueprintKey);
  const text = (value: unknown, fallback = 'ثبت نشده') => typeof value === 'string' && value ? value : fallback;
  const yesNo = (value: unknown) => value === true ? 'اجباری' : value === false ? 'اختیاری' : 'ثبت نشده';
  const locationLabel = sectionValues.locationRule === 'workplace_only' || sectionValues.requireGeofence === true ? 'فقط در محل کار' : sectionValues.locationRule === 'unrestricted' ? 'بدون محدودیت مکانی' : 'ثبت نشده';
  const overtimeLabel = sectionValues.overtimeRule === 'manager_approval' ? 'فقط با تأیید مدیر' : sectionValues.overtimeRule === 'automatic' || sectionValues.overtimeFromAttendance === true ? 'فعال، بدون تأیید مدیر' : sectionValues.overtimeRule === 'disabled' ? 'غیرفعال' : 'ثبت نشده';
  const requestLabel = sectionValues.requestRule === 'leave_and_correction' ? 'مرخصی و اصلاح تردد' : sectionValues.requestRule === 'leave_only' ? 'فقط مرخصی' : sectionValues.requestRule === 'correction_only' ? 'فقط اصلاح تردد' : sectionValues.requestRule === 'none' ? 'غیرفعال' : sectionValues.requestEnabled === true ? 'فعال' : 'ثبت نشده';

  const sectionLinks = [
    { title: 'سیاست‌های شیفت', href: policyId ? `/policies/shift?policyId=${policyId}` : '/policies/shift' },
    { title: 'سیاست‌های شب‌کاری', href: policyId ? `/policies/night?policyId=${policyId}` : '/policies/night' },
    { title: 'سیاست‌های مرخصی', href: policyId ? `/policies/leave?policyId=${policyId}` : '/policies/leave' },
    { title: 'سیاست‌های اضافه‌کاری', href: policyId ? `/policies/work/base?policyId=${policyId}&section=overtime` : '/policies/work/base?section=overtime' },
    { title: 'سیاست‌های تردد دستی', href: policyId ? `/policies/manual?policyId=${policyId}` : '/policies/manual' },
    { title: 'سیاست‌های دورکاری', href: policyId ? `/policies/remote?policyId=${policyId}` : '/policies/remote' },
    { title: 'سایر سیاست‌ها', href: policyId ? `/policies/work/base?policyId=${policyId}&section=other` : '/policies/work/base?section=other' },
  ];

  return (
    <PolicyPageShell
      title={readOnly ? 'جزئیات سیاست کاری' : 'ویرایش سیاست کاری'}
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
    >
      <div className="policy-work-layout">
        {resolvedSearchParams.created === '1' ? <PolicyInfoStrip text="سیاست کاری با موفقیت ایجاد شد." /> : null}
        {resolvedSearchParams.cloned === '1' ? <PolicyInfoStrip text="کپی سیاست کاری با موفقیت ایجاد شد." /> : null}
        {selectedPolicy ? (
          <PolicyOverviewCard
            policyId={policyId}
            title={title}
            description={description}
            calendarYearLabel={calendarYearLabel}
            calendarTitle={calendarTitle}
            calendarId={selectedPolicy?.calendarId ?? ''}
            calendars={calendars.filter((item) => item.status === 'active' || item.id === selectedPolicy.calendarId).map((item) => ({ id: item.id, title: item.title, yearLabel: item.yearLabel }))}
            groupCount={selectedPolicy.groupCount}
            readOnly={readOnly}
          />
        ) : (
          <PolicyInfoStrip text="هنوز سیاست کاری پایه‌ای ثبت نشده است. از فهرست سیاست‌ها یک سیاست جدید ایجاد کنید." />
        )}

        {selectedPolicy ? <>
          <section className="policy-section-card"><header className="policy-section-card-header"><h2>جزئیات خواندنی سیاست</h2><p>این اطلاعات از داده ذخیره‌شده سیاست خوانده می‌شود.</p></header><div className="policy-detail-grid">
            <div><span>Blueprint</span><strong>{blueprint?.title ?? text(sectionValues.blueprintTitle)}</strong></div><div><span>وضعیت</span><strong>{selectedPolicy.isActive ? 'فعال' : 'غیرفعال'}</strong></div><div><span>نوع</span><strong>{selectedPolicy.isDefault ? 'پیش‌فرض' : 'عادی'}</strong></div><div><span>تقویم</span><strong>{calendarTitle || 'ثبت نشده'}</strong></div>
            <div><span>تاریخ ایجاد</span><strong>{selectedPolicy.createdAt.toLocaleDateString('fa-IR')}</strong></div><div><span>آخرین ویرایش</span><strong>{selectedPolicy.updatedAt.toLocaleDateString('fa-IR')}</strong></div><div><span>توضیحات</span><strong>{selectedPolicy.description?.trim() || 'ثبت نشده'}</strong></div><div><span>وضعیت استفاده</span><strong>{selectedPolicy.groupCount > 0 ? 'استفاده‌شده' : 'بدون استفاده'}</strong></div>
            <div><span>ثبت ورود</span><strong>{yesNo(sectionValues.entryRequired)}</strong></div><div><span>ثبت خروج</span><strong>{yesNo(sectionValues.exitRequired)}</strong></div><div><span>محدوده تردد</span><strong>{locationLabel}</strong></div><div><span>فرجه ورود</span><strong>{typeof sectionValues.entryGraceMinutes === 'number' ? `${sectionValues.entryGraceMinutes.toLocaleString('fa-IR')} دقیقه` : 'ثبت نشده'}</strong></div>
            <div><span>فرجه خروج</span><strong>{typeof sectionValues.exitGraceMinutes === 'number' ? `${sectionValues.exitGraceMinutes.toLocaleString('fa-IR')} دقیقه` : 'ثبت نشده'}</strong></div><div><span>قاعده تأخیر</span><strong>{sectionValues.delayCalculationMode === 'strict' ? 'سخت‌گیرانه' : sectionValues.delayCalculationMode === 'lenient' ? 'با فرجه' : typeof sectionValues.maxDelayMinutes === 'number' ? `حداکثر ${sectionValues.maxDelayMinutes.toLocaleString('fa-IR')} دقیقه` : 'ثبت نشده'}</strong></div><div><span>خروج زودهنگام</span><strong>{sectionValues.earlyLeaveCalculationMode === 'strict' ? 'سخت‌گیرانه' : sectionValues.earlyLeaveCalculationMode === 'lenient' ? 'با فرجه' : typeof sectionValues.maxEarlyLeaveMinutes === 'number' ? `حداکثر ${sectionValues.maxEarlyLeaveMinutes.toLocaleString('fa-IR')} دقیقه` : 'ثبت نشده'}</strong></div><div><span>قاعده غیبت</span><strong>{sectionValues.consecutiveAbsenceWarning === true ? `هشدار پس از ${typeof sectionValues.maxConsecutiveAbsenceDays === 'number' ? sectionValues.maxConsecutiveAbsenceDays.toLocaleString('fa-IR') : 'چند'} روز` : 'قاعده اختصاصی ثبت نشده'}</strong></div>
            <div><span>تردد ناقص</span><strong>{sectionValues.incompleteAttendanceRule === 'correction_required' ? 'نیازمند اصلاح' : sectionValues.incompleteAttendanceRule === 'warning_only' ? 'فقط هشدار' : 'ثبت نشده'}</strong></div><div><span>اضافه‌کاری عملیاتی</span><strong>{overtimeLabel}</strong></div><div><span>درخواست‌های پایه Policy</span><strong>{requestLabel}</strong></div><div><span>درخواست‌های واقعی سامانه</span><strong>مرخصی، مأموریت، اصلاح تردد، اضافه‌کاری و دورکاری</strong></div>
          </div></section>
          <section className="policy-section-card"><header className="policy-section-card-header"><h2>استفاده و اثر</h2><p>{selectedPolicy.groupCount.toLocaleString('fa-IR')} گروه و {selectedPolicy.employeeCount.toLocaleString('fa-IR')} کارمند یکتا تحت پوشش‌اند.</p></header><div className="policy-linked-groups">{selectedPolicy.workGroups.length ? selectedPolicy.workGroups.map((group) => <Link key={group.id} href={`/work-groups/${group.id}/edit`} className="policy-linked-group"><strong>{group.title}</strong><span>{group.members.length.toLocaleString('fa-IR')} عضو جاری</span></Link>) : <p>این سیاست کاری هنوز به هیچ گروه کاری متصل نشده است.</p>}</div></section>
        </> : null}

        {!readOnly ? <nav className="policy-work-sections" aria-label="بخش‌های سیاست کاری">
          {sectionLinks.map((item) => (
            <PolicyNavLink key={item.title} href={item.href} title={item.title} />
          ))}
        </nav> : null}

        <div className="policy-work-footer">
          <Link href="/policies" className="policy-btn policy-btn-secondary">
            بازگشت به فهرست
          </Link>
        </div>
      </div>
    </PolicyPageShell>
  );
}
