import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, ChevronLeft, CircleAlert, Clock3, UsersRound } from "lucide-react";
import { saveJobProfileAction, setPositionStatusAction, updatePositionAction } from "../../../lib/actions";
import { getPositionHistory, getPositionProfile } from "../../../lib/data";
import { getPositionAccess } from "../../../lib/organization-unit-access";
import { UnsavedChangesGuard } from "./_components/UnsavedChangesGuard";
import { JobTaskItems } from "./_components/JobTaskItems";
import { ArchiveAction } from "../../organization-units/_components/ArchiveAction";

const list = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "");
const lifecycle: Record<string, string> = { ACTIVE: "فعال", INACTIVE: "غیرفعال", ARCHIVED: "آرشیوی" };

export default async function PositionProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; tab?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const routeAccess = await getPositionAccess();
  if (!routeAccess.canView)
    return (
      <section className="org-section-empty" dir="rtl" lang="fa">
        <CircleAlert />
        <h1>دسترسی مشاهده پروفایل سمت را ندارید</h1>
        <Link href="/organization-units">بازگشت</Link>
      </section>
    );
  const position = await getPositionProfile(id);
  if (!position) notFound();
  const readOnly = position.status === "ARCHIVED" || !position.access.canUpdate;
  const history = query.tab === "history" ? await getPositionHistory(id) : undefined;
  return (
    <main className="org-profile-page" dir="rtl" lang="fa">
      <UnsavedChangesGuard formIds={["position-basic-form", "job-profile-form"]} />
      {query.success && (
        <div className="org-success" role="status">
          {query.success === "job" ? "پروفایل شغلی با موفقیت ذخیره شد." : "اطلاعات سمت با موفقیت ذخیره شد."}
        </div>
      )}
      <nav className="org-breadcrumb" aria-label="مسیر">
        <Link href="/organization-units">واحدها</Link>
        <ChevronLeft />
        <Link href={`/organization-units/${position.organizationUnit.id}?tab=positions`}>{position.organizationUnit.title}</Link>
        <ChevronLeft />
        <span>{position.title}</span>
      </nav>
      <header className="org-profile-header">
        <div>
          <p>پروفایل سمت سازمانی</p>
          <h1>{position.title}</h1>
          <div className="org-profile-meta">
            <span>{position.code || "بدون کد"}</span>
            <span>{lifecycle[position.status]}</span>
            <span>{position.organizationUnit.title}</span>
            <span>بازنگری شغل: {position.jobProfile?.revision ?? "—"}</span>
          </div>
          <p>اطلاعات جایگاه، ظرفیت، پروفایل شغلی و شرایط احراز</p>
        </div>
        <div className="org-profile-actions">
          <Link href={`/organization-units/${position.organizationUnit.id}?tab=positions`}>بازگشت به واحد</Link>
          {position.access.canArchive && position.status !== "ARCHIVED" && (
            <ArchiveAction action={setPositionStatusAction} id={position.id} label="آرشیو سمت" message={position.activeAssignmentCount > 0 ? `سمت «${position.title}» دارای ${position.activeAssignmentCount} انتصاب فعال است و امکان آرشیو ندارد.` : `آیا از آرشیو سمت «${position.title}» با وضعیت «${lifecycle[position.status]}» اطمینان دارید؟`} />
          )}
        </div>
      </header>
      {position.status === "ARCHIVED" && (
        <aside className="org-warning">
          <CircleAlert />
          <span>این سمت آرشیوی و فقط خواندنی است.</span>
        </aside>
      )}
      <section className="org-profile-summary">
        {[
          ["ظرفیت مصوب", position.capacity],
          ["انتصاب فعال", position.activeAssignmentCount],
          ["ظرفیت باقی‌مانده", position.remainingCapacity],
          ["تکمیل پروفایل", `${position.completion.completed}/${position.completion.total}`],
        ].map(([label, count]) => (
          <article key={label as string}>
            <span>{label}</span>
            <strong>{typeof count === "number" ? count.toLocaleString("fa-IR") : count}</strong>
          </article>
        ))}
      </section>
      <nav className="org-profile-tabs" aria-label="بخش‌های سمت"><Link href={`/positions/${id}`} className={query.tab !== "history" ? "is-active" : ""}>پروفایل</Link><Link href={`/positions/${id}?tab=history`} className={query.tab === "history" ? "is-active" : ""}>تاریخچه مستقل سمت</Link></nav>
      {query.tab === "history" && <section className="org-profile-card"><h2>Timeline سمت</h2>{!history?.allowed ? <div className="org-section-empty"><CircleAlert /><p>مجوز مشاهده تاریخچه سازمانی را ندارید.</p></div> : history.events.length ? <ol className="org-timeline">{history.events.map((event) => <li key={event.id}><Clock3 /><div><strong>{event.description}</strong><span>{event.eventType} · {new Date(event.occurredAt).toLocaleString("fa-IR")}</span>{event.effectiveAt && <small>اثرگذاری: {new Date(event.effectiveAt).toLocaleDateString("fa-IR")}</small>}<details><summary>مقادیر و مرجع</summary><pre>{JSON.stringify({ before: event.previousValue, after: event.newValue, actor: event.actorUserId, role: event.actorRole, reason: event.reason, reference: event.referenceId }, null, 2)}</pre></details></div></li>)}</ol> : <div className="org-section-empty"><Clock3 /><p>هنوز رویداد واقعی برای این سمت ثبت نشده است.</p></div>}</section>}
      <section className="org-profile-grid">
        <article className="org-profile-card">
          <h2>اطلاعات پایه و گزارش‌دهی</h2>
          <form id="position-basic-form" action={updatePositionAction} className="org-professional-form">
            <input type="hidden" name="id" value={position.id} />
            <label>
              <span>عنوان سمت *</span>
              <input name="title" required maxLength={200} defaultValue={position.title} disabled={readOnly} />
            </label>
            <label>
              <span>کد سمت</span>
              <input name="code" defaultValue={position.code ?? ""} disabled={readOnly} />
            </label>
            <label>
              <span>ظرفیت سمت</span>
              <input name="capacity" type="number" min="0" max="2147483647" defaultValue={position.capacity} disabled={readOnly} />
              <small>کمتر از {position.activeAssignmentCount} انتصاب فعال قابل ثبت نیست.</small>
            </label>
            <label>
              <span>وضعیت Lifecycle</span>
              <select name="status" defaultValue={position.status} disabled={readOnly}>
                <option value="ACTIVE">فعال</option>
                <option value="INACTIVE">غیرفعال</option>
              </select>
            </label>
            <label>
              <span>پروفایل شغلی</span>
              <select name="jobProfileId" defaultValue={position.jobProfileId ?? ""} disabled={readOnly}>
                <option value="">تعریف نشده</option>
                {position.jobProfiles.map((profile) => (
                  <option value={profile.id} key={profile.id}>
                    {profile.title}
                    {profile.code ? ` — ${profile.code}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>گزارش به سمت</span>
              <select name="reportsToPositionId" defaultValue={position.reportsToPositionId ?? ""} disabled={readOnly}>
                <option value="">تعریف نشده</option>
                {position.availablePositions.map((candidate) => (
                  <option value={candidate.id} key={candidate.id}>
                    {candidate.title} — {candidate.organizationUnit.title}
                  </option>
                ))}
              </select>
              <small>مدیر واحد با سمت بالادست یکی فرض نمی‌شود.</small>
            </label>
            <label className="full-span">
              <span>توضیحات اختصاصی جایگاه</span>
              <textarea name="description" rows={3} maxLength={10000} defaultValue={position.description ?? ""} disabled={readOnly} />
            </label>
            {!readOnly && (
              <button className="primary-button" type="submit">
                ذخیره اطلاعات سمت
              </button>
            )}
          </form>
        </article>
        <article className="org-profile-card">
          <h2>وضعیت تکمیل</h2>
          <div className="org-completion" role="progressbar" aria-valuemin={0} aria-valuemax={position.completion.total} aria-valuenow={position.completion.completed}>
            <span style={{ width: `${(position.completion.completed / position.completion.total) * 100}%` }} />
          </div>
          {position.completion.missingItems.length ? (
            <ul className="org-defect-list">
              {position.completion.missingItems.map((item) => (
                <li key={item}>
                  <CircleAlert />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="org-success-inline">ابعاد هسته پروفایل تکمیل است.</p>
          )}
          <p className="org-muted">طبقه‌بندی، بازه حقوقی و تجهیزات به دلیل نبود Source واقعی در Completion اجباری لحاظ نشده‌اند.</p>
        </article>
      </section>
      <section className="org-profile-card">
        <header>
          <div>
            <h2>شرح شغل و شرایط احراز</h2>
            <p>Job Profile مستقل و قابل استفاده مجدد؛ Assignment مستقیماً به Job متصل نیست.</p>
            <p className="org-muted">هر ذخیره شماره بازنگری را افزایش می‌دهد؛ تاریخچه Snapshot و قابلیت بازگردانی در زیرساخت فعلی وجود ندارد.</p>
          </div>
        </header>
        {position.jobProfile ? (
          <div className="org-muted">
            {position.jobProfile.classifications?.[0]
              ? `${position.jobProfile.classifications[0].family.name} / ${position.jobProfile.classifications[0].category?.name ?? 'بدون دسته'} / ${position.jobProfile.classifications[0].level.name} / ${position.jobProfile.classifications[0].title}`
              : 'برای این Job Profile طبقه‌بندی فعالی ثبت نشده است.'}
            <Link href="/job-classifications" className="org-inline-action">مدیریت طبقه‌بندی شغلی</Link>
          </div>
        ) : null}
        <form id="job-profile-form" action={saveJobProfileAction} className="org-professional-form">
          <input type="hidden" name="positionId" value={position.id} />
          <label>
            <span>عنوان شغلی *</span>
            <input name="jobTitle" required maxLength={200} defaultValue={position.jobProfile?.title ?? position.title} disabled={readOnly} />
          </label>
          <label>
            <span>کد شغلی</span>
            <input name="jobCode" defaultValue={position.jobProfile?.code ?? ""} disabled={readOnly} />
          </label>
          <label className="full-span">
            <span>هدف شغل</span>
            <textarea name="purpose" rows={3} maxLength={10000} defaultValue={position.jobProfile?.purpose ?? ""} disabled={readOnly} />
          </label>
          <label className="full-span">
            <span>شرح کلی مسئولیت</span>
            <textarea name="summary" rows={3} maxLength={10000} defaultValue={position.jobProfile?.summary ?? ""} disabled={readOnly} />
          </label>
          <JobTaskItems name="mainTasksJson" title="وظایف اصلی" value={position.jobProfile?.mainTasks} readOnly={readOnly} />
          <JobTaskItems name="periodicTasksJson" title="وظایف دوره‌ای" value={position.jobProfile?.periodicTasks} readOnly={readOnly} />
          {[
            ["reportingResponsibilities", "مسئولیت‌های گزارش‌دهی"],
            ["expectedOutputs", "خروجی‌های مورد انتظار"],
            ["internalRelations", "ارتباطات داخلی"],
            ["externalRelations", "ارتباطات خارجی"],
            ["suggestedKpis", "شاخص‌های عملکرد پیشنهادی"],
          ].map(([name, label]) => (
            <label key={name}>
              <span>{label}</span>
              <textarea name={name} rows={4} defaultValue={list(position.jobProfile?.[name as keyof typeof position.jobProfile])} disabled={readOnly} />
              <small>هر مورد را در یک خط وارد کنید.</small>
            </label>
          ))}
          <label>
            <span>محل خدمت پیشنهادی</span>
            <input name="suggestedWorkLocation" defaultValue={position.jobProfile?.suggestedWorkLocation ?? ""} disabled={readOnly} />
          </label>
          <label>
            <span>محیط کاری</span>
            <input name="workEnvironment" defaultValue={position.jobProfile?.workEnvironment ?? ""} disabled={readOnly} />
          </label>
          <label className="full-span">
            <span>ملاحظات</span>
            <textarea name="considerations" rows={2} defaultValue={position.jobProfile?.considerations ?? ""} disabled={readOnly} />
          </label>
          <h3 className="full-span">شرایط احراز</h3>
          <label>
            <span>حداقل مدرک</span>
            <input name="minimumEducation" defaultValue={position.jobProfile?.minimumEducation ?? ""} disabled={readOnly} />
          </label>
          <label>
            <span>حداقل سابقه (ماه)</span>
            <input name="minimumExperienceMonths" type="number" min="0" defaultValue={position.jobProfile?.minimumExperienceMonths ?? ""} disabled={readOnly} />
          </label>
          <label>
            <span>سطح تجربه</span>
            <input name="experienceLevel" defaultValue={position.jobProfile?.experienceLevel ?? ""} disabled={readOnly} />
          </label>
          {[
            ["relatedFields", "رشته‌های مرتبط"],
            ["technicalSkills", "مهارت‌های تخصصی"],
            ["softSkills", "مهارت‌های نرم"],
            ["certifications", "گواهینامه‌ها"],
            ["requiredSoftware", "نرم‌افزارهای موردنیاز"],
            ["languages", "زبان‌ها"],
          ].map(([name, label]) => (
            <label key={name}>
              <span>{label}</span>
              <textarea name={name} rows={3} defaultValue={list(position.jobProfile?.[name as keyof typeof position.jobProfile])} disabled={readOnly} />
              <small>هر مورد را در یک خط وارد کنید.</small>
            </label>
          ))}
          <label>
            <span>امکان مأموریت</span>
            <select name="travelRequired" defaultValue={position.jobProfile?.travelRequired === null || position.jobProfile?.travelRequired === undefined ? "" : String(position.jobProfile.travelRequired)} disabled={readOnly}>
              <option value="">تعیین نشده</option>
              <option value="true">بله</option>
              <option value="false">خیر</option>
            </select>
          </label>
          <label>
            <span>شرایط محل خدمت</span>
            <input name="workplaceConditions" defaultValue={position.jobProfile?.workplaceConditions ?? ""} disabled={readOnly} />
          </label>
          <label className="full-span">
            <span>ملاحظات خاص</span>
            <textarea name="specialRequirements" rows={2} defaultValue={position.jobProfile?.specialRequirements ?? ""} disabled={readOnly} />
          </label>
          {!readOnly && (
            <button className="primary-button" type="submit">
              ذخیره پروفایل شغلی
            </button>
          )}
        </form>
      </section>
      <section className="org-profile-card">
        <h2>افراد منصوب‌شده</h2>
        {!position.canSeePeople ? (
          <div className="org-section-empty">
            <UsersRound />
            <p>مجوز کارکنان و مشاهده انتصاب برای دریافت اطلاعات هویتی لازم است. تعداد انتصاب فعال: {position.activeAssignmentCount}</p>
          </div>
        ) : position.assignments.length ? (
          <div className="org-detail-list">
            {position.assignments.map((assignment) => (
              <article key={assignment.id}>
                <UsersRound />
                <div>
                  <Link href={`/employees/${assignment.employee.id}`}>
                    <strong>
                      {assignment.employee.firstName} {assignment.employee.lastName}
                    </strong>
                  </Link>
                  <span>
                    {assignment.employee.personnelCode || "بدون کد پرسنلی"} · {assignment.employee.isActive ? "همکاری فعال" : "غیرفعال"}
                  </span>
                  <small>
                    شروع: {assignment.startDate || "ثبت نشده"} · پایان: {assignment.endDate || "ادامه‌دار"} · انتصاب: {assignment.status}
                  </small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="org-section-empty">
            <UsersRound />
            <p>هیچ انتصابی برای این سمت وجود ندارد.</p>
          </div>
        )}
      </section>
      <section className="org-profile-grid">
        <article className="org-profile-card">
          <h2>طبقه‌بندی شغلی</h2>
          {position.jobProfile?.classifications?.[0] ? <div className="org-muted"><p>سمت</p><strong>{position.title}</strong><p>↓</p><p>پروفایل شغلی</p><strong>{position.jobProfile.title}</strong><p>↓</p><p>{position.jobProfile.classifications[0].family.name}{position.jobProfile.classifications[0].category ? ` / ${position.jobProfile.classifications[0].category.name}` : ''} / {position.jobProfile.classifications[0].level.name}</p><small>نسخه {position.jobProfile.classifications[0].version} — فقط خواندنی</small></div> : <p className="org-muted">برای پروفایل شغلی این سمت هنوز طبقه‌بندی فعالی ثبت نشده است.</p>}
        </article>
        <article className="org-profile-card">
          <h2>اسناد، فرآیند و تاریخچه</h2>
          <p className="org-muted">Document Entity Link، Workflow Usage و Audit عمومی مرتبط وجود ندارد؛ این بخش داده ساختگی نمایش نمی‌دهد.</p>
        </article>
      </section>
    </main>
  );
}
