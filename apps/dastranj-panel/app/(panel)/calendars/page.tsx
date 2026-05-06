import { CalendarYearFilter } from '../../components/CalendarYearFilter';
import { CardMenu } from '../../components/CardMenu';
import { listCalendars } from '../../lib/data';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

function statusMeta(status: string) {
  if (status === 'active') {
    return { label: 'فعال', className: 'is-active' };
  }

  return { label: 'غیرفعال', className: 'is-inactive' };
}

type CalendarsPageProps = {
  searchParams?: Promise<{
    year?: string;
  }>;
};

export default async function CalendarsPage({ searchParams }: CalendarsPageProps) {
  const items = await listCalendars();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedYear = resolvedSearchParams?.year ?? '1405';
  const yearOptions = Array.from({ length: 6 }, (_, index) => String(1405 - index));
  const filteredItems = selectedYear === 'all' ? items : items.filter((item) => item.yearLabel === selectedYear);

  return (
    <div className="page-stack">
      <PageIntro
        title="تقویم‌های کاری"
        description="تقویم‌ها، بازه‌های زمانی و الگوهای شیفت را در یک نمای جمع‌وجور و خوانا مرور کنید."
        action={<PrimaryLink href="/calendars/new">افزودن تقویم</PrimaryLink>}
      />

      <section className="calendar-filter-bar">
        <CalendarYearFilter value={selectedYear} options={yearOptions} />
      </section>

      {filteredItems.length === 0 ? (
        <EmptyState
          title={selectedYear === 'all' ? 'تقویمی ثبت نشده' : `برای سال ${selectedYear} تقویمی ثبت نشده`}
          description={selectedYear === 'all' ? 'هنوز تقویمی برای این کسب‌وکار ثبت نشده است.' : 'فیلتر سال را تغییر دهید یا یک تقویم جدید برای این سال ثبت کنید.'}
          action={<PrimaryLink href="/calendars/new">تعریف تقویم</PrimaryLink>}
        />
      ) : (
        <div className="calendar-grid">
          {filteredItems.map((item) => {
            const status = statusMeta(item.status);

            return (
              <article key={item.id} className="calendar-card">
                <div className="calendar-card-top">
                  <div className="calendar-card-top-copy">
                    <div className="calendar-card-kicker">سال کاری {item.yearLabel}</div>
                    <h3>{item.title}</h3>
                    <p>{item.description ?? 'برای این تقویم توضیحی ثبت نشده است.'}</p>
                  </div>

                  <div className="calendar-card-top-actions">
                    <span className={`calendar-status-pill ${status.className}`}>{status.label}</span>
                    <CardMenu
                      items={[
                        { kind: 'link', href: '/calendars/new', label: 'تقویم جدید' },
                        { kind: 'link', href: '/policies', label: 'سیاست‌ها' },
                      ]}
                    />
                  </div>
                </div>

                <div className="calendar-card-hero">
                  <div className="calendar-card-hero-main">
                    <span>شیفت پایه</span>
                    <strong>{item.shiftTitle || 'بدون شیفت پیش‌فرض'}</strong>
                    <small>{item.shiftTypeLabel || 'الگوی شیفت مشخص نشده است.'}</small>
                  </div>

                  <div className="calendar-card-badges">
                    <span className="calendar-metric-badge">{item.holidayCount} تعطیلی</span>
                    <span className="calendar-metric-badge">{item.totalEventDays} رویداد</span>
                    <span className="calendar-metric-badge">{item.totalShiftDays} روز کاری</span>
                  </div>
                </div>

                <div className="calendar-date-rail">
                  <div className="calendar-date-node">
                    <span>شروع</span>
                    <strong>{item.startDate}</strong>
                  </div>
                  <div className="calendar-date-line" />
                  <div className="calendar-date-node">
                    <span>پایان</span>
                    <strong>{item.endDate}</strong>
                  </div>
                </div>

                <div className="calendar-card-body">
                  <div className="calendar-card-stat">
                    <span>نوع شیفت</span>
                    <strong>{item.shiftTypeLabel || '-'}</strong>
                  </div>
                  <div className="calendar-card-stat">
                    <span>آخرین وضعیت</span>
                    <strong>{status.label}</strong>
                  </div>
                  <div className="calendar-card-stat">
                    <span>تعطیلات هفتگی</span>
                    <strong>{Array.isArray(item.weekends) ? item.weekends.length : 0}</strong>
                  </div>
                  <div className="calendar-card-stat">
                    <span>بازه ثبت‌شده</span>
                    <strong>{item.yearLabel}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
