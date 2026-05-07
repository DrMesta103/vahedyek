import { listShiftTemplates } from '../../lib/data';
import { shiftTypeLabels } from '../../lib/constants';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function ShiftTemplatesPage() {
  const items = await listShiftTemplates();

  return (
    <div className="page-stack">
      <PageIntro title="قالب‌های شیفت" description="الگوهای شیفت برای استفاده در تقویم و سیاست‌های کاری." action={<PrimaryLink href="/shift-templates/new">افزودن قالب</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="قالبی ثبت نشده" description="شیفت پایه را از اینجا تعریف کنید." action={<PrimaryLink href="/shift-templates/new">ایجاد قالب</PrimaryLink>} />
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="catalog-card">
              <div className="catalog-card-head">
                <span className={`catalog-pill ${item.isActive ? 'is-success' : 'is-muted'}`}>{item.isActive ? 'فعال' : 'غیرفعال'}</span>
                <h3>{item.title}</h3>
                <p>{item.description ?? 'الگوی شیفت بدون توضیح تکمیلی.'}</p>
              </div>
              <div className="catalog-card-metrics">
                <div>
                  <span>نوع</span>
                  <strong>{shiftTypeLabels[item.type]}</strong>
                </div>
                <div>
                  <span>روزهای هفته</span>
                  <strong>{Array.isArray(item.weekDays) ? item.weekDays.join('، ') : '-'}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
