import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, Building2, ChevronLeft, CircleAlert, Clock3, Network, UsersRound } from "lucide-react";
import { saveOrganizationRoadmapAction, setOrganizationUnitStatusAction, setPositionStatusAction } from "../../../lib/actions";
import { getOrganizationMemory, getOrganizationUnitProfile } from "../../../lib/data";
import { getOrganizationUnitAccess } from "../../../lib/organization-unit-access";
import { ArchiveAction } from "../_components/ArchiveAction";

const unitType: Record<string, string> = { DEPARTMENT: "واحد", DIVISION: "مدیریت", TEAM: "تیم", BRANCH: "شعبه" };
const lifecycle: Record<string, string> = { ACTIVE: "فعال", INACTIVE: "غیرفعال", ARCHIVED: "آرشیوی" };
const capacityLabel: Record<string, string> = { WITHOUT_ASSIGNEE: "بدون متصدی", HAS_AVAILABLE_CAPACITY: "ظرفیت خالی", FULL: "تکمیل ظرفیت", OVER_CAPACITY: "بیش از ظرفیت", INACTIVE: "غیرفعال", ARCHIVED: "آرشیوی" };

export default async function OrganizationUnitProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; success?: string; from?: string; to?: string; eventType?: string; employeeId?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const routeAccess = await getOrganizationUnitAccess();
  if (!routeAccess.canView)
    return (
      <section className="org-section-empty" dir="rtl" lang="fa">
        <CircleAlert />
        <h1>دسترسی مشاهده پروفایل واحد را ندارید</h1>
        <Link href="/organization-units">بازگشت</Link>
      </section>
    );
  const unit = await getOrganizationUnitProfile(id);
  if (!unit) notFound();
  const tab = ["overview", "children", "positions", "employees", "authority", "history"].includes(query.tab ?? "") ? query.tab! : "overview";
  const memory = tab === "history" ? await getOrganizationMemory(id, query) : null;
  const responsibilities = Array.isArray(unit.mainResponsibilities) ? unit.mainResponsibilities.filter((item): item is string => typeof item === "string") : [];
  const managerHasAssignment = unit.managerId ? unit.employees.some((assignment) => assignment.employeeId === unit.managerId) : true;
  const defects = [!unit.manager && "مدیر یا مسئول واحد تعیین نشده است.", !unit.mission && "مأموریت واحد تکمیل نشده است.", !responsibilities.length && "وظایف اصلی واحد ثبت نشده‌اند.", !unit.positions.length && "سمتی تعریف نشده است.", unit.summary.unassignedCount > 0 && `${unit.summary.unassignedCount} سمت بدون متصدی است.`, unit.summary.overCapacityCount > 0 && `${unit.summary.overCapacityCount} سمت بیش از ظرفیت است.`].filter(Boolean) as string[];
  const tabs = [
    ["overview", "نمای کلی"],
    ["children", "زیرواحدها"],
    ["positions", "سمت‌ها و مشاغل"],
    ["employees", "کارکنان منصوب‌شده"],
    ["authority", "اختیارات و ارتباطات"],
    ["history", "اسناد و تاریخچه"],
  ];
  return (
    <main className="org-profile-page" dir="rtl" lang="fa">
      <nav className="org-breadcrumb" aria-label="مسیر ساختاری">
        <Link href="/organization-units">واحدها و سمت‌های سازمانی</Link>
        <ChevronLeft />
        {unit.parent?.parent && (
          <>
            <Link href={`/organization-units/${unit.parent.parent.id}`}>{unit.parent.parent.title}</Link>
            <ChevronLeft />
          </>
        )} {unit.parent && (
          <>
            <Link href={`/organization-units/${unit.parent.id}`}>{unit.parent.title}</Link>
            <ChevronLeft />
          </>
        )}
        <span>{unit.title}</span>
      </nav>
      {query.success && (
        <div className="org-success" role="status">
          تغییرات با موفقیت ثبت شد.
        </div>
      )}
      <header className="org-profile-header">
        <div>
          <p>پروفایل واحد سازمانی</p>
          <h1>{unit.title}</h1>
          <div className="org-profile-meta">
            <span>{unit.code || "بدون کد"}</span>
            <span>{unitType[unit.type] || unit.type}</span>
            <span className={`is-${unit.status.toLowerCase()}`}>{lifecycle[unit.status]}</span>
            <span>آخرین تغییر: {new Date(unit.updatedAt).toLocaleDateString("fa-IR")}</span>
          </div>
          <p>مدیریت اطلاعات ساختاری، زیرواحدها، سمت‌ها، کارکنان و ارتباطات سازمانی این واحد</p>
        </div>
        <div className="org-profile-actions">
          <Link href="/organization-units">بازگشت به فهرست</Link>
          {unit.access.canUpdateUnit && unit.status !== "ARCHIVED" && <Link href={`/organization-units/${unit.id}/edit`}>ویرایش واحد</Link>}
          {unit.access.canCreateUnit && unit.status === "ACTIVE" && <Link href={`/organization-units?create=1&parent=${unit.id}`}>افزودن زیرواحد</Link>}
          {unit.access.canCreatePosition && unit.status === "ACTIVE" && <Link href={`/organization-units?positionUnit=${unit.id}`}>افزودن سمت</Link>}
          {unit.access.canUpdateUnit && unit.status !== "ARCHIVED" && (
            <form action={setOrganizationUnitStatusAction}>
              <input type="hidden" name="id" value={unit.id} />
              <input type="hidden" name="status" value={unit.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"} />
              <button>{unit.status === "ACTIVE" ? "غیرفعال‌سازی" : "فعال‌سازی"}</button>
            </form>
          )}
          {unit.access.canUpdateUnit && unit.status !== "ARCHIVED" && (
            <ArchiveAction action={setOrganizationUnitStatusAction} id={unit.id} label="آرشیو واحد" message={`واحد «${unit.title}» با وضعیت «${lifecycle[unit.status]}» انتخاب شده است. وابستگی‌ها: ${unit.summary.childCount} زیرواحد، ${unit.summary.positionCount} سمت و ${unit.summary.activeAssignmentCount} انتصاب فعال. Server فقط در صورت نبود وابستگی فعال اجازه آرشیو می‌دهد. ادامه می‌دهید؟`} />
          )}
        </div>
      </header>
      {!managerHasAssignment && (
        <aside className="org-warning">
          <CircleAlert />
          <span>مدیر انتخاب‌شده انتصاب فعال در این واحد ندارد. این هشدار مانع ثبت مدیر نیست.</span>
        </aside>
      )}
      <section className="org-profile-summary" aria-label="خلاصه واحد">
        {[
          ["زیرواحد مستقیم", unit.summary.childCount],
          ["سمت", unit.summary.positionCount],
          ["ظرفیت کل", unit.summary.totalCapacity],
          ["انتصاب فعال", unit.summary.activeAssignmentCount],
          ["کارمند فعال یکتا", unit.summary.uniqueEmployeeCount],
          ["ظرفیت خالی", unit.summary.remainingCapacity],
          ["بدون متصدی", unit.summary.unassignedCount],
          ["بیش از ظرفیت", unit.summary.overCapacityCount],
        ].map(([label, count]) => (
          <article key={label as string}>
            <span>{label}</span>
            <strong>{Number(count).toLocaleString("fa-IR")}</strong>
          </article>
        ))}
      </section>
      <nav className="org-profile-tabs" aria-label="بخش‌های پروفایل">
        {tabs.map(([key, label]) => (
          <Link key={key} href={`/organization-units/${unit.id}?tab=${key}`} aria-current={tab === key ? "page" : undefined} className={tab === key ? "is-active" : ""}>
            {label}
          </Link>
        ))}
      </nav>
      {tab === "overview" && (
        <section className="org-profile-grid">
          <article className="org-profile-card">
            <h2>اطلاعات پایه</h2>
            <dl>
              <div>
                <dt>واحد بالادست</dt>
                <dd>{unit.parent?.title || "ریشه سازمان"}</dd>
              </div>
              <div>
                <dt>مدیر یا مسئول واحد</dt>
                <dd>{unit.manager ? `${unit.manager.firstName} ${unit.manager.lastName}` : "تعیین نشده"}</dd>
              </div>
              <div>
                <dt>تاریخ ایجاد</dt>
                <dd>{new Date(unit.createdAt).toLocaleDateString("fa-IR")}</dd>
              </div>
              <div>
                <dt>توضیحات</dt>
                <dd>{unit.description || "ثبت نشده"}</dd>
              </div>
            </dl>
          </article>
          <article className="org-profile-card">
            <h2>مأموریت واحد</h2>
            <p>{unit.mission || "مأموریت این واحد هنوز ثبت نشده است."}</p>
            <h3>وظایف اصلی</h3>
            {responsibilities.length ? (
              <ul>
                {responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="org-muted">وظیفه‌ای ثبت نشده است.</p>
            )}
          </article>
          <article className="org-profile-card">
            <h2>نواقص قابل محاسبه</h2>
            {defects.length ? (
              <ul className="org-defect-list">
                {defects.map((item) => (
                  <li key={item}>
                    <CircleAlert />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="org-success-inline">اطلاعات اصلی این واحد کامل است.</p>
            )}
          </article>
        </section>
      )}
      {tab === "children" && (
        <section className="org-profile-card">
          <header>
            <div>
              <h2>زیرواحدها</h2>
              <p>واحدهای مستقیم زیرمجموعه این واحد</p>
            </div>
            {unit.access.canCreateUnit && unit.status === "ACTIVE" && <Link href={`/organization-units?create=1&parent=${unit.id}`}>افزودن زیرواحد</Link>}
          </header>
          {unit.children.length ? (
            <div className="org-detail-list">
              {unit.children.map((child) => (
                <article key={child.id}>
                  <Building2 />
                  <div>
                    <Link href={`/organization-units/${child.id}`}>
                      <strong>{child.title}</strong>
                    </Link>
                    <span>
                      {child.code || "بدون کد"} · {unitType[child.type] || child.type} · {lifecycle[child.status]}
                    </span>
                    <small>
                      {child.manager ? `${child.manager.firstName} ${child.manager.lastName}` : "بدون مدیر"} · {child._count.positions} سمت · {child._count.employees} انتصاب · {child._count.children} زیرواحد
                    </small>
                  </div>
                  {unit.access.canUpdateUnit && child.status !== "ARCHIVED" && <Link href={`/organization-units/${child.id}/edit`}>ویرایش</Link>}
                </article>
              ))}
            </div>
          ) : (
            <div className="org-section-empty">
              <Network />
              <p>زیرواحدی ثبت نشده است.</p>
            </div>
          )}
        </section>
      )}
      {tab === "positions" && (
        <section className="org-profile-card">
          <header>
            <div>
              <h2>سمت‌ها و مشاغل</h2>
              <p>Lifecycle، ظرفیت و تکمیل پروفایل هر سمت</p>
            </div>
            {unit.access.canCreatePosition && unit.status === "ACTIVE" && <Link href={`/organization-units?positionUnit=${unit.id}`}>افزودن سمت</Link>}
          </header>
          {unit.positions.length ? (
            <div className="org-position-table">
              {unit.positions.map((position) => (
                <article key={position.id}>
                  <div>
                    <BriefcaseBusiness />
                    <div>
                      <Link href={`/positions/${position.id}`}>
                        <strong>{position.title}</strong>
                      </Link>
                      <span>
                        {position.code || "بدون کد"} · {position.jobProfile?.title || "بدون پروفایل شغلی"}
                      </span>
                    </div>
                  </div>
                  <span>{lifecycle[position.status]}</span>
                  <span>
                    ظرفیت {position.capacity} / منصوب {position.activeAssignmentCount}
                  </span>
                  <span>{capacityLabel[position.capacityStatus]}</span>
                  <span>
                    تکمیل {position.completion.completed} از {position.completion.total}
                  </span>
                  <div>
                    {unit.access.canUpdatePosition && <Link href={`/positions/${position.id}`}>مشاهده و ویرایش</Link>}
                    {unit.access.canArchivePosition && position.status !== "ARCHIVED" && (
                      <ArchiveAction action={setPositionStatusAction} id={position.id} label="آرشیو" message={position.activeAssignmentCount > 0 ? `سمت «${position.title}» دارای ${position.activeAssignmentCount} انتصاب فعال است و Server اجازه آرشیو نمی‌دهد.` : `آیا از آرشیو سمت «${position.title}» با وضعیت «${lifecycle[position.status]}» اطمینان دارید؟`} />
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="org-section-empty">
              <BriefcaseBusiness />
              <p>هنوز سمتی برای این واحد ثبت نشده است.</p>
            </div>
          )}
        </section>
      )}
      {tab === "employees" && (
        <section className="org-profile-card">
          <h2>کارکنان منصوب‌شده</h2>
          <p>
            تعداد انتصاب فعال: {unit.summary.activeAssignmentCount} · کارکنان یکتا: {unit.summary.uniqueEmployeeCount}
          </p>
          {!unit.canSeePeople ? (
            <div className="org-section-empty">
              <UsersRound />
              <p>برای مشاهده اطلاعات افراد، مجوز کارکنان و مشاهده انتصاب سمت لازم است. شمارنده‌های غیرشخصی همچنان قابل مشاهده‌اند.</p>
            </div>
          ) : unit.employees.length ? (
            <div className="org-detail-list">
              {unit.employees.map((assignment) => (
                <article key={assignment.id}>
                  <UsersRound />
                  <div>
                    <Link href={`/employees/${assignment.employee.id}`}>
                      <strong>
                        {assignment.employee.firstName} {assignment.employee.lastName}
                      </strong>
                    </Link>
                    <span>
                      {assignment.employee.personnelCode || "بدون کد پرسنلی"} · {assignment.position?.title || "انتصاب بدون سمت"}
                    </span>
                    <small>
                      شروع: {assignment.startDate || "ثبت نشده"} · پایان: {assignment.endDate || "ادامه‌دار"} · وضعیت: {assignment.status}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="org-section-empty">
              <UsersRound />
              <p>انتصاب فعالی در این واحد وجود ندارد.</p>
            </div>
          )}
        </section>
      )}
      {tab === "authority" && (
        <section className="org-profile-card">
          <h2>اختیارات و ارتباطات</h2>
          <div className="org-section-empty">
            <CircleAlert />
            <p>زیرساخت مستقل Authority Mapping و Workflow Usage در Repository وجود ندارد. داشتن سمت به‌تنهایی مجوز نرم‌افزاری ایجاد نمی‌کند.</p>
          </div>
        </section>
      )}
      {tab === "history" && (
        <section className="org-memory-stack">
          <article className="org-profile-card">
            <header><div><h2>تاریخچه و گزارش‌ها</h2><p>رویدادهای واقعی ثبت‌شده از زمان فعال‌شدن حافظه سازمانی؛ داده گذشته به‌صورت ساختگی بازسازی نشده است.</p></div></header>
            <form className="org-memory-filters" method="get"><input type="hidden" name="tab" value="history" /><label>از تاریخ<input type="date" name="from" defaultValue={query.from} /></label><label>تا تاریخ<input type="date" name="to" defaultValue={query.to} /></label><label>نوع رویداد<select name="eventType" defaultValue={query.eventType || ""}><option value="">همه رویدادها</option>{memory?.eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><button type="submit">اعمال فیلتر</button></form>
          </article>
          <article className="org-profile-card">
            <h2>Timeline کسب‌وکار</h2>
            {!memory?.access.canViewHistory ? <div className="org-section-empty"><CircleAlert /><p>مجوز مشاهده تاریخچه سازمانی را ندارید.</p></div> : memory.events.length ? <ol className="org-timeline">{memory.events.map((event) => <li key={event.id}><Clock3 /><div><strong>{event.description}</strong><span>{event.eventType} · {new Date(event.occurredAt).toLocaleString("fa-IR")}</span>{event.effectiveAt && <small>تاریخ اثرگذاری: {new Date(event.effectiveAt).toLocaleDateString("fa-IR")}</small>}<details><summary>جزئیات تغییر</summary><pre>{JSON.stringify({ before: event.previousValue, after: event.newValue, actor: event.actorUserId, role: event.actorRole, reason: event.reason, reference: event.referenceId }, null, 2)}</pre></details></div></li>)}</ol> : <div className="org-section-empty"><Clock3 /><p>هنوز تغییر مهمی برای این واحد ثبت نشده است.</p></div>}
          </article>
          <article className="org-profile-card"><h2>تاریخچه مدیریت واحد</h2>{!memory?.access.canViewHistory ? <div className="org-section-empty"><CircleAlert /><p>مجوز مشاهده تاریخچه را ندارید.</p></div> : memory.managerHistory.length ? <div className="org-memory-table">{memory.managerHistory.map((item) => <div key={item.id}><strong>{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : "مدیر حذف‌شده"}</strong><span>{item.managementType}</span><span>{new Date(item.startDate).toLocaleDateString("fa-IR")}</span><span>{item.endDate ? new Date(item.endDate).toLocaleDateString("fa-IR") : "ادامه‌دار"}</span><span>{item.current ? "جاری" : "پایان‌یافته"}</span></div>)}</div> : <div className="org-section-empty"><UsersRound /><p>تغییر مدیر واقعی از زمان فعال‌شدن تاریخچه ثبت نشده است.</p></div>}</article>
          <article className="org-profile-card">
            <h2>گزارش ظرفیت و کارکنان</h2>
            {!memory?.access.canViewReports ? <div className="org-section-empty"><CircleAlert /><p>مجوز مشاهده گزارش‌های سازمانی را ندارید.</p></div> : <><div className="org-profile-summary"><article><span>کارکنان جاری</span><strong>{memory.reports.currentEmployees}</strong></article><article><span>کارکنان سابق</span><strong>{memory.reports.formerEmployees}</strong></article><article><span>کل ظرفیت</span><strong>{memory.reports.positions.reduce((sum, item) => sum + item.capacity, 0)}</strong></article><article><span>ظرفیت خالی</span><strong>{memory.reports.positions.reduce((sum, item) => sum + item.emptyCapacity, 0)}</strong></article></div><div className="org-memory-table">{memory.reports.positions.map((position) => <div key={position.id}><strong>{position.title}</strong><span>ظرفیت {position.capacity}</span><span>منصوب {position.activeAssignments}</span><span>خالی {position.emptyCapacity}</span><span>{position.status}</span></div>)}</div></>}
          </article>
          <article className="org-profile-card">
            <h2>Roadmap مبتنی بر واقعیت</h2>
            {!memory?.access.canViewRoadmap ? <div className="org-section-empty"><CircleAlert /><p>مجوز مشاهده Roadmap سازمانی را ندارید.</p></div> : <div className="org-roadmap-grid"><section><h3>برنامه ساختاری آینده</h3>{memory.roadmapItems.length ? memory.roadmapItems.map((item) => <form key={item.id} action={saveOrganizationRoadmapAction} className="org-roadmap-form"><input type="hidden" name="id" value={item.id}/><input type="hidden" name="organizationUnitId" value={unit.id}/><input name="title" defaultValue={item.title} disabled={!unit.access.canUpdateUnit}/><textarea name="description" defaultValue={item.description ?? ""} disabled={!unit.access.canUpdateUnit}/><input name="targetDate" type="date" defaultValue={item.targetDate.toISOString().slice(0,10)} disabled={!unit.access.canUpdateUnit}/><select name="status" defaultValue={item.status} disabled={!unit.access.canUpdateUnit}><option value="PLANNED">برنامه‌ریزی‌شده</option><option value="IN_PROGRESS">در حال اجرا</option><option value="DONE">انجام‌شده</option><option value="CANCELLED">لغوشده</option></select>{unit.access.canUpdateUnit && <button type="submit">ذخیره</button>}</form>) : <p className="org-muted">برنامه ساختاری واقعی ثبت نشده است.</p>}{unit.access.canUpdateUnit && <form action={saveOrganizationRoadmapAction} className="org-roadmap-form"><input type="hidden" name="organizationUnitId" value={unit.id}/><input name="title" required maxLength={200} placeholder="عنوان برنامه ساختاری"/><textarea name="description" placeholder="توضیحات"/><input name="targetDate" type="date" required/><select name="status" defaultValue="PLANNED"><option value="PLANNED">برنامه‌ریزی‌شده</option><option value="IN_PROGRESS">در حال اجرا</option><option value="DONE">انجام‌شده</option><option value="CANCELLED">لغوشده</option></select><button type="submit">افزودن برنامه</button></form>}</section><section><h3>مسیر شغلی کارکنان</h3>{memory.career.length ? memory.career.map((item) => <div key={item.employee.id}><strong>{item.employee.firstName} {item.employee.lastName}</strong><p>{item.steps.map((step) => step.position).join(" ← ")}</p></div>) : <p className="org-muted">سابقه انتساب واقعی برای ترسیم مسیر شغلی وجود ندارد.</p>}</section></div>}
          </article>
          <article className="org-profile-card">
            <h2>منابع در دسترس نیست</h2><ul className="org-defect-list"><li><CircleAlert />{memory?.blockers.contractOrder}</li><li><CircleAlert />{memory?.blockers.document}</li></ul>
          </article>
        </section>
      )}
    </main>
  );
}
