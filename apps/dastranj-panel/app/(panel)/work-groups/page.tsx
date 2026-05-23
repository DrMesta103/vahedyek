import Link from 'next/link';
import { MoreVertical, Plus, Search, UsersRound } from 'lucide-react';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { workGroupAccessLabels } from '../../lib/constants';
import { listCalendars, listEmployees, listLocations, listPolicies, listWorkGroups } from '../../lib/data';
import { WorkGroupFiltersSidebar } from './_components/WorkGroupFiltersSidebar';

type WorkGroupsPageProps = {
  searchParams?: Promise<{
    employeeId?: string;
    locationId?: string;
    policyId?: string;
    calendarId?: string;
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
  };
  const employeeId = normalizeId(resolvedSearchParams.employeeId);
  const locationId = normalizeId(resolvedSearchParams.locationId);
  const policyId = normalizeId(resolvedSearchParams.policyId);
  const calendarId = normalizeId(resolvedSearchParams.calendarId);

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
    if (employeeId && !item.members.some((member) => member.employee.id === employeeId)) return false;
    if (locationId && item.location?.id !== locationId) return false;
    if (policyId && item.policy?.id !== policyId) return false;
    if (calendarId && item.policy?.calendar?.id !== calendarId) return false;
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
          breadcrumbs={panelBreadcrumbs('گروه کاری')}
          title="گروه‌های کاری"
          subtitle="مدیریت گروه‌های کاری، اعضا، سیاست‌ها و محل‌های کار"
          addHref="/work-groups/new"
          addLabel="افزودن گروه کاری"
        />

        <div className="work-groups-list-toolbar" aria-hidden>
          <Search className="work-groups-list-search-icon" />
        </div>

        <div className="work-groups-list">
          {filteredItems.map((item) => {
            const memberNames = item.members
              .map((member) => `${member.employee.firstName} ${member.employee.lastName} (${workGroupAccessLabels[member.accessLevel]})`)
              .join('، ');

            return (
              <article key={item.id} className="work-group-card">
                <button type="button" className="work-group-card-menu" aria-label="منوی عملیات">
                  <MoreVertical />
                </button>

                <div className="work-group-card-body">
                  <h3>{item.title}</h3>
                  <p>توضیحات: {item.description?.trim() ? item.description : 'ثبت نشده است'}</p>
                  <p>محل های کاری: {item.location?.title ?? 'ثبت نشده است'}</p>
                  <p>سیاست های کاری: {item.policy?.title ?? 'ثبت نشده است'}{item.policy?.calendar?.yearLabel ? ` (تقویم ${item.policy.calendar.yearLabel})` : ''}</p>
                  {memberNames ? <p>اعضا: {memberNames}</p> : null}
                </div>

                <div className="work-group-card-avatar">
                  <UsersRound />
                  <span>{formatMemberCount(item.members.length)}</span>
                </div>
              </article>
            );
          })}

          <Link href="/work-groups/new" className="work-group-add-card">
            <span className="work-group-add-copy">برای افزودن گروه کاری کلیک کنید.</span>
            <span className="work-group-add-icon" aria-hidden>
              <Plus />
            </span>
          </Link>

          {filteredItems.length === 0 ? <div className="work-groups-empty">گروه کاری مطابق فیلترهای انتخاب‌شده پیدا نشد.</div> : null}
        </div>
      </div>
    </div>
  );
}
