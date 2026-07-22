import Link from 'next/link';
import { CalendarDays, Check, Plus, Search, Users2 } from 'lucide-react';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { getSessionContext } from '../../lib/auth';
import { listEmployees, listOrganizationUnits, listWorkGroups, resolveEmployeeLifecycleStatus } from '../../lib/data';
import { getCurrentEmployeeContracts, getEndedEmployeeIds } from '../../lib/employee-contracts.server';
import { EmployeeCard } from './_components/EmployeeCard';

type EmployeeSearchParams = {
  q?: string;
  status?: string;
  profileStatus?: string;
  assignment?: string;
  contractStatus?: string;
  workGroupId?: string;
  organizationUnitId?: string;
  dateType?: string;
  datePreset?: string;
  from?: string;
  to?: string;
};

type EmployeesPageProps = { searchParams?: Promise<EmployeeSearchParams> };

type FilterValue<T extends string> = T | 'all';

function normalizeText(value?: string) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeFilter<T extends string>(value: string | undefined, allowed: readonly T[]): FilterValue<T> {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : 'all';
}

function mergeQuery(base: Record<string, string>, patch: Record<string, string | undefined>) {
  const next = new URLSearchParams(base);
  Object.entries(patch).forEach(([key, value]) => {
    if (value && value.trim() && value !== 'all') next.set(key, value.trim());
    else next.delete(key);
  });
  const query = next.toString();
  return query ? `?${query}` : '/employees';
}

function getDateRange(dateType: string, preset: string, from: string, to: string) {
  if (preset === 'custom' || preset === 'all') return { dateType, from, to };

  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today);
  if (preset === 'week') start.setDate(today.getDate() - ((today.getDay() + 1) % 7));
  else if (preset === 'month') start.setDate(1);
  else if (preset === 'quarter') start.setMonth(today.getMonth() - 3);
  else if (preset === 'year') start.setMonth(0, 1);

  return { dateType, from: preset === 'today' ? end : start.toISOString().slice(0, 10), to: end };
}

function FilterChip({
  label,
  value,
  current,
  baseQuery,
  param,
}: {
  label: string;
  value: string;
  current: string;
  baseQuery: Record<string, string>;
  param: string;
}) {
  const href = mergeQuery(baseQuery, { [param]: value });
  return (
    <Link href={href} className={`employees-filter-chip${current === value ? ' is-active' : ''}`}>
      {current === value ? <Check className="h-4 w-4" aria-hidden /> : null}
      <span>{label}</span>
    </Link>
  );
}

function createEmployeeSummary(items: Awaited<ReturnType<typeof listEmployees>>) {
  return {
    total: items.length,
    active: items.filter((item) => item.isActive).length,
    inactive: items.filter((item) => !item.isActive).length,
  };
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params: EmployeeSearchParams = (await searchParams) ?? {};
  const query = normalizeText(params.q);
  const status = normalizeFilter(params.status, ['active', 'inactive']);
  const profileStatus = normalizeFilter(params.profileStatus, ['complete', 'incomplete']);
  const assignment = normalizeFilter(params.assignment, ['assigned', 'unassigned']);
  const contractStatus = normalizeFilter(params.contractStatus, ['active', 'none', 'expiring', 'expired']);
  const workGroupId = normalizeText(params.workGroupId);
  const organizationUnitId = normalizeText(params.organizationUnitId);
  const dateType = normalizeFilter(params.dateType, ['employment_start', 'contract_start']);
  const datePreset = normalizeFilter(params.datePreset, ['today', 'week', 'month', 'quarter', 'year', 'custom']);
  const rawFrom = normalizeText(params.from);
  const rawTo = normalizeText(params.to);
  const dateRange = getDateRange(dateType, datePreset, rawFrom, rawTo);

  const session = await getSessionContext();
  const tenantId = session?.tenantId ?? null;
  const [itemsResult, workGroupsResult, organizationUnitsResult] = await Promise.allSettled([
    listEmployees({
      search: query,
      status,
      profileStatus,
      workGroupId,
      organizationUnitId,
      assignment,
      dateType,
      createdFrom: dateRange.from,
      createdTo: dateRange.to,
      contractStatus,
    }),
    listWorkGroups(),
    listOrganizationUnits(),
  ]);
  if (itemsResult.status === 'rejected') throw itemsResult.reason;
  const items = itemsResult.value;
  // Employee listing is the primary page flow. Optional filter taxonomies must not
  // take down the employee profile entry point when their setup is incomplete.
  const workGroups = workGroupsResult.status === 'fulfilled' ? workGroupsResult.value : [];
  const organizationUnits = organizationUnitsResult.status === 'fulfilled' ? organizationUnitsResult.value : [];
  const employeeIds = items.map((item) => item.id);
  const [currentContracts, endedEmployeeIds] = await Promise.all([
    getCurrentEmployeeContracts(employeeIds, tenantId),
    getEndedEmployeeIds(employeeIds, tenantId),
  ]);
  const summary = createEmployeeSummary(items);
  const baseQuery = {
    ...(query ? { q: query } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(profileStatus !== 'all' ? { profileStatus } : {}),
    ...(workGroupId ? { workGroupId } : {}),
    ...(organizationUnitId ? { organizationUnitId } : {}),
    ...(assignment !== 'all' ? { assignment } : {}),
    ...(dateType !== 'all' ? { dateType } : {}),
    ...(datePreset !== 'all' ? { datePreset } : {}),
    ...(dateRange.from ? { from: dateRange.from } : {}),
    ...(dateRange.to ? { to: dateRange.to } : {}),
    ...(contractStatus !== 'all' ? { contractStatus } : {}),
  };
  const hasFilters = Object.keys(baseQuery).length > 0;

  return (
    <div className="page-stack module-page employees-page" dir="rtl" lang="fa">
      <ModulePageHeader title="کارمندان" subtitle="مدیریت اطلاعات کارکنان، فیلترهای سریع و دسترسی مستقیم به عملیات مرتبط با اعضای تیم." />

      <div className="employees-layout" dir="ltr">
        <aside className="employees-filters employees-filter-sidebar" dir="rtl" lang="fa" aria-label="فیلتر کارکنان">
          <form className="employees-filters-form" method="get">
            <div className="employees-filters-heading">فیلتر</div>

            <section className="employees-filter-section">
              <div className="employees-filter-title">وضعیت همکاری</div>
              <div className="employees-filter-group">
                <FilterChip label="همه" value="all" current={status} baseQuery={baseQuery} param="status" />
                <FilterChip label="فعال" value="active" current={status} baseQuery={baseQuery} param="status" />
                <FilterChip label="غیرفعال" value="inactive" current={status} baseQuery={baseQuery} param="status" />
              </div>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">وضعیت پرونده</div>
              <div className="employees-filter-group">
                <FilterChip label="همه" value="all" current={profileStatus} baseQuery={baseQuery} param="profileStatus" />
                <FilterChip label="کامل" value="complete" current={profileStatus} baseQuery={baseQuery} param="profileStatus" />
                <FilterChip label="ناقص" value="incomplete" current={profileStatus} baseQuery={baseQuery} param="profileStatus" />
              </div>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">تخصیص سازمانی</div>
              <label className="employees-filter-field">
                <span>گروه کاری</span>
                <select name="workGroupId" defaultValue={workGroupId}>
                  <option value="">همه گروه‌های کاری</option>
                  {workGroups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
                </select>
              </label>
              <label className="employees-filter-field">
                <span>واحد سازمانی</span>
                <select name="organizationUnitId" defaultValue={organizationUnitId}>
                  <option value="">همه واحدهای سازمانی</option>
                  {organizationUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
                </select>
              </label>
              <div className="employees-filter-group">
                <FilterChip label="همه" value="all" current={assignment} baseQuery={baseQuery} param="assignment" />
                <FilterChip label="دارای تخصیص" value="assigned" current={assignment} baseQuery={baseQuery} param="assignment" />
                <FilterChip label="بدون تخصیص" value="unassigned" current={assignment} baseQuery={baseQuery} param="assignment" />
              </div>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">تاریخ</div>
              <label className="employees-filter-field">
                <span>نوع تاریخ</span>
                <select name="dateType" defaultValue={dateType === 'all' ? 'employment_start' : dateType}>
                  <option value="employment_start">شروع همکاری</option>
                  <option value="contract_start">شروع قرارداد</option>
                </select>
              </label>
              <label className="employees-filter-field">
                <span>بازه</span>
                <select name="datePreset" defaultValue={datePreset}>
                  <option value="all">همه</option>
                  <option value="today">امروز</option>
                  <option value="week">این هفته</option>
                  <option value="month">این ماه</option>
                  <option value="quarter">سه ماه اخیر</option>
                  <option value="year">امسال</option>
                  <option value="custom">دلخواه</option>
                </select>
              </label>
              <label className="employees-filter-field">
                <span>از تاریخ</span>
                <span className="employees-filter-input-wrap"><input name="from" type="date" defaultValue={rawFrom} /><CalendarDays className="employees-filter-input-icon h-4 w-4" aria-hidden /></span>
              </label>
              <label className="employees-filter-field">
                <span>تا تاریخ</span>
                <span className="employees-filter-input-wrap"><input name="to" type="date" defaultValue={rawTo} /><CalendarDays className="employees-filter-input-icon h-4 w-4" aria-hidden /></span>
              </label>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">وضعیت قرارداد</div>
              <div className="employees-filter-group">
                <FilterChip label="همه" value="all" current={contractStatus} baseQuery={baseQuery} param="contractStatus" />
                <FilterChip label="قرارداد فعال" value="active" current={contractStatus} baseQuery={baseQuery} param="contractStatus" />
                <FilterChip label="بدون قرارداد فعال" value="none" current={contractStatus} baseQuery={baseQuery} param="contractStatus" />
                <FilterChip label="رو به پایان" value="expiring" current={contractStatus} baseQuery={baseQuery} param="contractStatus" />
                <FilterChip label="منقضی" value="expired" current={contractStatus} baseQuery={baseQuery} param="contractStatus" />
              </div>
            </section>

            <div className="employees-filter-actions">
              <button type="submit" className="employees-filter-submit">اعمال فیلتر</button>
              <Link href="/employees" className="employees-filter-reset">پاک کردن</Link>
            </div>
          </form>
        </aside>

        <main className="employees-main" dir="rtl" lang="fa">
          <div className="employees-topbar">
            <form className="employees-search employees-search--hero" method="get">
              {Object.entries(baseQuery).filter(([key]) => key !== 'q').map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
              <Search className="employees-search-icon h-4 w-4" aria-hidden />
              <input name="q" type="search" defaultValue={query} placeholder="جستجو بر اساس نام، نام خانوادگی، موبایل، کد ملی یا ایمیل..." aria-label="جستجو در کارکنان" />
            </form>
            <Link href="/employees/new" className="employees-add-btn"><Plus className="h-4 w-4" aria-hidden />افزودن کارمند</Link>
          </div>

          <p className="employees-results-meta" aria-live="polite">{summary.total.toLocaleString('fa-IR')} کارمند{summary.active > 0 ? ` · ${summary.active.toLocaleString('fa-IR')} فعال` : ''}</p>

          {items.length ? (
            <div className="employees-list">
              {items.map((item) => (
                <EmployeeCard key={item.id} employee={{
                  id: item.id,
                  firstName: item.firstName,
                  lastName: item.lastName,
                  personnelCode: item.personnelCode,
                  nationalId: item.nationalId,
                  email: item.email,
                  mobile1: item.mobile1,
                  mobile2: item.mobile2,
                  avatarUrl: item.avatarUrl,
                  isActive: item.isActive,
                  profileStatus: item.profileStatus,
                  lifecycleStatus: resolveEmployeeLifecycleStatus({
                    isActive: item.isActive,
                    quickSetupStatus: item.quickSetupStatus,
                    quickSetupInvitationStatus: item.quickSetupInvitationStatus,
                    hasEndedContract: endedEmployeeIds.has(item.id),
                  }),
                  createdAt: item.createdAt.toISOString(),
                  organizationUnits: item.organizationUnits.map((row) => ({ id: row.organizationUnit.id, title: row.organizationUnit.title })),
                  workGroups: item.workGroupMemberships.map((row) => ({ id: row.workGroup.id, title: row.workGroup.title })),
                  currentContract: currentContracts.get(item.id) ?? null,
                }} />
              ))}
            </div>
          ) : (
            <div className="employees-empty-state">
              <Users2 className="h-10 w-10" aria-hidden />
              <h2>{query ? 'کارمندی با این جستجو پیدا نشد' : 'هنوز کارمندی در سیستم ثبت نشده است.'}</h2>
              <p>{query ? 'عبارت جستجو یا فیلترها را تغییر دهید.' : 'برای شروع می‌توانید کارمند را به‌صورت تکی اضافه کنید یا از فایل اکسل استفاده کنید.'}</p>
              <div className="employees-empty-actions">
                {hasFilters ? <Link href="/employees" className="employees-empty-link">پاک کردن فیلترها</Link> : null}
                <Link href="/employees/new" className="employees-empty-link is-primary">افزودن کارمند</Link>
                <Link href="/quick-setup" className="employees-empty-link">افزودن با اکسل</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
