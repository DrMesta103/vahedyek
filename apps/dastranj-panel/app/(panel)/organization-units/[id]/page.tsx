import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, Building2, ChevronLeft, CircleAlert, Network, UsersRound } from "lucide-react";
import { setOrganizationUnitStatusAction, setPositionStatusAction } from "../../../lib/actions";
import { getOrganizationUnitProfile } from "../../../lib/data";
import { getOrganizationUnitAccess } from "../../../lib/organization-unit-access";
import { ArchiveAction } from "../_components/ArchiveAction";

const unitType: Record<string, string> = { DEPARTMENT: "واحد", DIVISION: "مدیریت", TEAM: "تیم", BRANCH: "شعبه" };
const lifecycle: Record<string, string> = { ACTIVE: "فعال", INACTIVE: "غیرفعال", ARCHIVED: "آرشیوی" };
const capacityLabel: Record<string, string> = { WITHOUT_ASSIGNEE: "بدون متصدی", HAS_AVAILABLE_CAPACITY: "ظرفیت خالی", FULL: "تکمیل ظرفیت", OVER_CAPACITY: "بیش از ظرفیت", INACTIVE: "غیرفعال", ARCHIVED: "آرشیوی" };

export default async function OrganizationUnitProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; success?: string }> }) {
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
        <section className="org-profile-grid">
          <article className="org-profile-card">
            <h2>اسناد</h2>
            <div className="org-section-empty">
              <CircleAlert />
              <p>Document Center با Entity Link معتبر برای واحدها وجود ندارد.</p>
            </div>
          </article>
          <article className="org-profile-card">
            <h2>تاریخچه</h2>
            <div className="org-section-empty">
              <CircleAlert />
              <p>Audit framework عمومی Unit/Position وجود ندارد؛ زمان آخرین تغییر جایگزین تاریخچه نیست.</p>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
