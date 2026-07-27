import Link from 'next/link';
import { Plus, UsersRound } from 'lucide-react';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { listCalendars, listEmployees, listLocations, listPolicies, listWorkGroups } from '../../lib/data';
import { WorkGroupFiltersSidebar } from './_components/WorkGroupFiltersSidebar';
import { WorkGroupCardActions } from './_components/WorkGroupCardActions';
import { WorkGroupFiltersForm } from './_components/WorkGroupFiltersForm';
import { getWorkGroupAccess } from '../../lib/work-group-access';
import { formatPersianDate } from '../../lib/format-date';

type WorkGroupsPageProps = {
  searchParams?: Promise<{
    employeeId?: string;
    locationId?: string;
    policyId?: string;
    calendarId?: string;
    q?: string;
    status?: string;
  }>;
};

function normalizeId(value?: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function formatMemberCount(count: number) {
  return `${count.toLocaleString('fa-IR')} عضو`;
}

export default async function WorkGroupsPage({ searchParams }: WorkGroupsPageProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams ?? {})) as {
    employeeId?: string;
    locationId?: string;
    policyId?: string;
    calendarId?: string;
    q?: string;
    status?: string;
  };
  const employeeId = normalizeId(resolvedSearchParams.employeeId);
  const locationId = normalizeId(resolvedSearchParams.locationId);
  const policyId = normalizeId(resolvedSearchParams.policyId);
  const calendarId = normalizeId(resolvedSearchParams.calendarId);
  const q = normalizeId(resolvedSearchParams.q);
  const status = normalizeId(resolvedSearchParams.status);

  const access = await getWorkGroupAccess();
  if (!access.canView) return <div className="module-page" dir="rtl"><h1>دسترسی به گروه‌های کاری</h1><p>شما مجوز مشاهده گروه‌های کاری این کسب‌وکار را ندارید.</p></div>;

  const [items, employees, locations, calendars, policies] = await Promise.all([
    listWorkGroups(),
    listEmployees(),
    listLocations(),
    listCalendars(),
    listPolicies(),
  ]);

  const safeEmployees = employees.map((item) => ({
    id: item.id,
    name: `${item.firstName} ${item.lastName}`.trim() || item.mobile1 || item.email || 'کارمند',
    nationalId: item.nationalId ?? null,
    personnelCode: item.personnelCode ?? null,
  }));
  const safeLocations = locations.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? null,
    radius: item.radius,
  }));
  const safeCalendars = calendars.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? null,
    yearLabel: item.yearLabel ?? null,
    shiftTitle: item.shiftTitle ?? null,
  }));
  const safePolicies = policies.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? null,
    calendarTitle: item.calendar?.title ?? null,
    calendarYearLabel: item.calendar?.yearLabel ?? null,
  }));

  const filteredItems = items.filter((item) => {
    const currentMembers = item.members.filter((member) => member.isCurrent);
    if (employeeId && !currentMembers.some((member) => member.employee.id === employeeId)) return false;
    if (locationId && item.location?.id !== locationId) return false;
    if (policyId && item.policy?.id !== policyId) return false;
    if (calendarId && item.policy?.calendar?.id !== calendarId) return false;
    if (q && !item.title.includes(q)) return false;
    if (status && status !== 'ALL' && item.status !== status) return false;
    return true;
  });

  return (
    <div className="work-groups-page-shell" dir="ltr" lang="fa">
      <WorkGroupFiltersSidebar
        employees={safeEmployees}
        locations={safeLocations}
        calendars={safeCalendars}
        policies={safePolicies}
        initialFilters={{ employeeId, locationId, policyId, calendarId }}
      />

      <div className="work-groups-main module-page" dir="rtl">
        <ModulePageHeader
          title="گروه‌های کاری"
          subtitle="مدیریت گروه‌های کاری، اعضا، سیاست‌ها و محل‌های کار"
          addHref={access.canCreate ? "/work-groups/new" : undefined}
          addLabel={access.canCreate ? "افزودن گروه کاری" : undefined}
        />

        <div className="work-groups-list-toolbar">
          <WorkGroupFiltersForm query={q} status={status} />
        </div>

        <div className="work-groups-list">
          {access.canCreate ? <Link href="/work-groups/new" className="work-group-add-card">
            <span className="work-group-add-copy">برای افزودن گروه کاری کلیک کنید.</span>
            <span className="work-group-add-icon" aria-hidden>
              <Plus />
            </span>
          </Link> : null}

          {filteredItems.map((item) => {
            const currentMembers = item.members.filter((member) => member.isCurrent);

            return (
              <article key={item.id} className="work-group-card">
                <div className="work-group-card-body">
                  <h3>{item.title}</h3>
                  <p>توضیحات: {item.description?.trim() ? item.description : 'ثبت نشده است'}</p>
                  <p>محل‌های کاری: {item.location?.title ?? 'ثبت نشده است'}</p>
                  <p>
                    سیاست‌های کاری: {item.policy?.title ?? 'ثبت نشده است'}
                    {item.policy?.calendar?.yearLabel ? ` (تقویم ${item.policy.calendar.yearLabel})` : ''}
                  </p>
                  <p>وضعیت: {item.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'} · آخرین تغییر: {formatPersianDate(item.updatedAt)}</p>
                  <p>تکمیل: {item.completion.percent.toLocaleString('fa-IR')}٪ · {item.completion.requirements.filter((requirement) => !requirement.complete).map((requirement) => requirement.label).join('، ') || 'کامل'}</p>
                </div>

                <WorkGroupCardActions
                  id={item.id}
                  title={item.title}
                  members={item.members.map((member) => ({
                    id: member.id,
                    isCurrent: member.isCurrent,
                    status: member.status,
                    joinedAt: member.joinedAt.toISOString(),
                    leftAt: member.leftAt ? member.leftAt.toISOString() : null,
                    accessLevel: member.accessLevel,
                    employee: {
                      id: member.employee.id,
                      firstName: member.employee.firstName,
                      lastName: member.employee.lastName,
                      avatarUrl: member.employee.avatarUrl ?? null,
                      mobile1: member.employee.mobile1 ?? null,
                      email: member.employee.email ?? null,
                      personnelCode: member.employee.personnelCode ?? null,
                    },
                  }))}
                  status={item.status}
                  canEdit={access.canEdit}
                  canDisable={access.canDisable}
                />

                <div className="work-group-card-avatar">
                  <UsersRound />
                  <span>{formatMemberCount(currentMembers.length)}</span>
                </div>
              </article>
            );
          })}

          {filteredItems.length === 0 ? <div className="work-groups-empty">گروه کاری مطابق فیلترهای انتخاب‌شده پیدا نشد.</div> : null}
        </div>
      </div>
    </div>
  );
}
