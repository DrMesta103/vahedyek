import { CalendarYearFilter } from '../../components/CalendarYearFilter';
import { CardMenu } from '../../components/CardMenu';
import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { deleteCalendarAction } from '../../lib/actions';
import { listCalendars } from '../../lib/data';

function statusMeta(status: string) {
  if (status === 'active') {
    return { label: 'فعال', className: 'is-active' };
  }

  return { label: 'غیرفعال', className: 'is-inactive' };
}

function metricProgress(value: number, max: number) {
  if (max <= 0) return 8;
  return Math.min(100, Math.max(8, Math.round((value / max) * 100)));
}

type CalendarsPageProps = {
  searchParams?: Promise<{
    year?: string;
  }>;
};

export default async function CalendarsPage({ searchParams }: CalendarsPageProps) {
  const items = await listCalendars();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const yearOptions = Array.from(new Set(items.map((item) => item.yearLabel).filter(Boolean)));
  const fallbackYear = yearOptions[0] ?? 'all';
  const selectedYear = resolvedSearchParams?.year ?? fallbackYear;
  const filteredItems = selectedYear === 'all' ? items : items.filter((item) => item.yearLabel === selectedYear);

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('تقویم')}
        title="تقویم‌های کاری"
        subtitle="مدیریت شیفت‌ها و رویدادها برای سازمان شما."
        addHref="/calendars/new"
        addLabel="افزودن تقویم کاری"
      />

      {yearOptions.length > 0 ? (
        <div className="module-page-toolbar">
          <CalendarYearFilter value={selectedYear} options={yearOptions} />
        </div>
      ) : null}

      <div className="module-page-grid">
        {filteredItems.map((item) => {
          const status = statusMeta(item.status);

          return (
            <article key={item.id} className="module-grid-card">
              <div className="module-grid-card-top">
                <div className="module-grid-card-body">
                  <h3>{item.title}</h3>
                  <p>توضیحات : {item.description ?? 'ثبت نشده'}</p>
                </div>

                <div className="module-grid-card-top-actions">
                  <span className={`module-status-pill ${status.className}`}>{status.label}</span>
                  <CardMenu
                    items={[
                      { kind: 'link', href: '/calendars/new', label: 'تقویم جدید' },
                      { kind: 'link', href: '/policies', label: 'سیاست‌ها' },
                      {
                        kind: 'submit',
                        label: 'حذف تقویم',
                        tone: 'danger',
                        action: deleteCalendarAction,
                        hiddenFields: { id: item.id },
                        confirm: {
                          title: 'حذف تقویم کاری',
                          description: `آیا از حذف «${item.title}» مطمئن هستید؟ این تقویم از فهرست شما حذف می‌شود.`,
                          confirmLabel: 'بله، حذف شود',
                          cancelLabel: 'انصراف',
                        },
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="module-card-metrics">
                <div className="module-metric-panel">
                  <span>روز های کاری / شیفت ها</span>
                  <strong>{item.totalShiftDays}</strong>
                  <div className="module-metric-progress" aria-hidden>
                    <span style={{ width: `${metricProgress(item.totalShiftDays, 365)}%` }} />
                  </div>
                </div>

                <div className="module-metric-panel">
                  <span>رویداد ها / روز های تعطیل</span>
                  <strong>{item.totalEventDays}</strong>
                  <div className="module-metric-progress" aria-hidden>
                    <span style={{ width: `${metricProgress(item.totalEventDays, 50)}%` }} />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        <ModuleAddTile href="/calendars/new" label="برای افزودن تقویم کاری کلیک کنید." />
      </div>
    </div>
  );
}
