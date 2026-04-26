import { listShiftTemplates } from '../../lib/data';
import { shiftTypeLabels } from '../../lib/constants';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '../../components/ui';

export default async function ShiftTemplatesPage() {
  const items = await listShiftTemplates();

  return (
    <div className="page-stack">
      <PageIntro title="قالب‌های شیفت" description="الگوهای شیفت برای استفاده در تقویم و سیاست‌های کاری." action={<PrimaryLink href="/shift-templates/new">افزودن قالب</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="قالبی ثبت نشده" description="شیفت پایه را از اینجا تعریف کنید." action={<PrimaryLink href="/shift-templates/new">ایجاد قالب</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'نوع', 'روزهای هفته', 'وضعیت']} rows={items.map((item) => [item.title, shiftTypeLabels[item.type], Array.isArray(item.weekDays) ? item.weekDays.join('، ') : '-', item.isActive ? 'فعال' : 'غیرفعال'])} />
      )}
    </div>
  );
}
