import { listCalendars } from '../../lib/data';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '../../components/ui';

export default async function CalendarsPage() {
  const items = await listCalendars();

  return (
    <div className="page-stack">
      <PageIntro title="تقویم‌های کاری" description="مدیریت بازه‌ها، تعطیلات و ارتباط تقویم با سیاست‌های کاری." action={<PrimaryLink href="/calendars/new">افزودن تقویم</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="تقویمی ثبت نشده" description="برای مرحله دوم راه‌اندازی باید حداقل یک تقویم تعریف شود." action={<PrimaryLink href="/calendars/new">تعریف تقویم</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'سال', 'شیفت', 'تعطیلی', 'وضعیت']} rows={items.map((item) => [item.title, item.yearLabel, item.shiftTitle, item.holidayCount, item.status])} />
      )}
    </div>
  );
}
