import Link from 'next/link';
import { Search, Users2, UserCheck, UserX } from 'lucide-react';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { businessSettingsBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { listEmployees } from '../../lib/data';
import { EmployeeCard } from './_components/EmployeeCard';

type EmployeesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    assignment?: string;
    from?: string;
    to?: string;
  }>;
};

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
    if (value && value.trim()) next.set(key, value.trim());
    else next.delete(key);
  });
  const query = next.toString();
  return query ? `?${query}` : '/employees';
}

function FilterChip({
  label,
  value,
  current,
  baseQuery,
}: {
  label: string;
  value: string;
  current: string;
  baseQuery: Record<string, string>;
}) {
  const href = mergeQuery(baseQuery, { status: value });
  return (
    <Link href={href} className={`employees-filter-chip${current === value ? ' is-active' : ''}`}>
      {label}
    </Link>
  );
}

function AssignmentChip({
  label,
  value,
  current,
  baseQuery,
}: {
  label: string;
  value: string;
  current: string;
  baseQuery: Record<string, string>;
}) {
  const href = mergeQuery(baseQuery, { assignment: value });
  return (
    <Link href={href} className={`employees-filter-chip${current === value ? ' is-active' : ''}`}>
      {label}
    </Link>
  );
}

function createEmployeeSummary(items: Awaited<ReturnType<typeof listEmployees>>) {
  return {
    total: items.length,
    active: items.filter((item) => item.isActive).length,
    inactive: items.filter((item) => !item.isActive).length,
    withAssignments: items.filter((item) => item.organizationUnits.length || item.workGroupMemberships.length).length,
  };
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams ?? {})) as {
    q?: string;
    status?: string;
    assignment?: string;
    from?: string;
    to?: string;
  };

  const query = normalizeText(resolvedSearchParams.q);
  const status = normalizeFilter(resolvedSearchParams.status, ['active', 'inactive']);
  const assignment = normalizeFilter(resolvedSearchParams.assignment, ['assigned', 'unassigned']);
  const from = normalizeText(resolvedSearchParams.from);
  const to = normalizeText(resolvedSearchParams.to);

  const items = await listEmployees({
    search: query,
    status,
    assignment,
    createdFrom: from,
    createdTo: to,
  });
  const summary = createEmployeeSummary(items);
  const baseQuery = {
    ...(query ? { q: query } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(assignment !== 'all' ? { assignment } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  return (
    <div className="page-stack module-page employees-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={businessSettingsBreadcrumbs('کارمندان')}
        title="کارمندان"
        subtitle="مدیریت اطلاعات کارمندان، فیلترهای سریع و دسترسی مستقیم به عملیات مربوط به اعضای تیم."
      />

      <div className="employees-layout" dir="ltr">
        <aside className="employees-filters" dir="rtl" lang="fa">
          <form className="employees-filters-form" method="get">
            <input type="hidden" name="q" value={query} />

            <section className="employees-filter-section">
              <div className="employees-filter-title">فیلتر</div>
              <div className="employees-filter-group">
                <FilterChip label="همه" value="all" current={status} baseQuery={baseQuery} />
                <FilterChip label="کارمند فعال" value="active" current={status} baseQuery={baseQuery} />
                <FilterChip label="کارمند غیرفعال" value="inactive" current={status} baseQuery={baseQuery} />
              </div>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">وضعیت پرونده</div>
              <div className="employees-filter-group">
                <AssignmentChip label="همه" value="all" current={assignment} baseQuery={baseQuery} />
                <AssignmentChip label="دارای واحد/گروه" value="assigned" current={assignment} baseQuery={baseQuery} />
                <AssignmentChip label="بدون تخصیص" value="unassigned" current={assignment} baseQuery={baseQuery} />
              </div>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">تاریخ</div>
              <label className="employees-filter-field">
                <span>از تاریخ</span>
                <input name="from" type="date" defaultValue={from} />
              </label>
              <label className="employees-filter-field">
                <span>تا تاریخ</span>
                <input name="to" type="date" defaultValue={to} />
              </label>
            </section>

            <section className="employees-filter-section">
              <div className="employees-filter-title">جستجو</div>
              <label className="employees-filter-field">
                <span>نام / موبایل / کد</span>
                <input name="q" type="search" defaultValue={query} placeholder="جستجو..." />
              </label>
            </section>

            <div className="employees-filter-actions">
              <button type="submit" className="employees-filter-submit">
                اعمال فیلتر
              </button>
              <Link href="/employees" className="employees-filter-reset">
                پاک کردن
              </Link>
            </div>
          </form>
        </aside>

        <main className="employees-main" dir="rtl" lang="fa">
          <div className="employees-topbar">
            <form className="employees-search employees-search--hero" method="get">
              <input type="hidden" name="status" value={status !== 'all' ? status : ''} />
              <input type="hidden" name="assignment" value={assignment !== 'all' ? assignment : ''} />
              <input type="hidden" name="from" value={from} />
              <input type="hidden" name="to" value={to} />
              <Search className="employees-search-icon h-4 w-4" aria-hidden />
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="جستجو در نام، موبایل، ایمیل، کد پرسنلی، واحد یا گروه کاری"
                aria-label="جستجو در کارمندان"
              />
              <button type="submit" className="employees-search-submit">
                جستجو
              </button>
            </form>

            <Link href="/employees/new" className="employees-add-btn">
              <span aria-hidden>+</span>
              افزودن کارمند
            </Link>
          </div>

          <div className="employees-summary">
            <span className="employees-summary-chip">
              <Users2 className="h-4 w-4" />
              <strong>{summary.total.toLocaleString('fa-IR')}</strong>
              <span>کل کارمندان</span>
            </span>
            <span className="employees-summary-chip is-active">
              <UserCheck className="h-4 w-4" />
              <strong>{summary.active.toLocaleString('fa-IR')}</strong>
              <span>فعال</span>
            </span>
            <span className="employees-summary-chip is-inactive">
              <UserX className="h-4 w-4" />
              <strong>{summary.inactive.toLocaleString('fa-IR')}</strong>
              <span>غیرفعال</span>
            </span>
          </div>

          {items.length ? (
            <div className="employees-list">
              {items.map((item) => (
                <EmployeeCard
                  key={item.id}
                  employee={{
                    id: item.id,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    personnelCode: item.personnelCode,
                    email: item.email,
                    mobile1: item.mobile1,
                    mobile2: item.mobile2,
                    avatarUrl: item.avatarUrl,
                    isActive: item.isActive,
                    createdAt: item.createdAt.toISOString(),
                    organizationUnits: item.organizationUnits.map((item) => ({
                      id: item.organizationUnit.id,
                      title: item.organizationUnit.title,
                    })),
                    workGroups: item.workGroupMemberships.map((item) => ({
                      id: item.workGroup.id,
                      title: item.workGroup.title,
                    })),
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="employees-empty-state">
              <Users2 className="h-10 w-10" />
              <h2>{query ? 'کارمندی با این جستجو پیدا نشد' : 'هنوز کارمندی ثبت نشده است'}</h2>
              <p>
                {query
                  ? 'عبارت جستجو یا فیلترها را تغییر دهید.'
                  : 'برای شروع، یک کارمند جدید اضافه کنید تا اطلاعات پایه و عملیات تیم را مدیریت کنید.'}
              </p>
              <div className="employees-empty-actions">
                {query || status !== 'all' || assignment !== 'all' || from || to ? (
                  <Link href="/employees" className="employees-empty-link">
                    پاک کردن فیلترها
                  </Link>
                ) : null}
                <Link href="/employees/new" className="employees-empty-link is-primary">
                  افزودن کارمند
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
