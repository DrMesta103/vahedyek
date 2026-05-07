import { listRequestReasons } from '../../lib/data';
import { requestReasonLabels } from '../../lib/constants';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function RequestReasonsPage() {
  const items = await listRequestReasons();

  return (
    <div className="page-stack">
      <PageIntro title="دلایل درخواست" description="مدیریت دسته‌بندی و دلایل قابل‌استفاده در فرایندهای سازمانی." action={<PrimaryLink href="/request-reasons/new">افزودن دلیل</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="لیست خالی است" description="هنوز دلیلی ثبت نشده است." action={<PrimaryLink href="/request-reasons/new">افزودن</PrimaryLink>} />
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="catalog-card">
              <div className="catalog-card-head">
                <span className={`catalog-pill ${item.isActive ? 'is-success' : 'is-muted'}`}>{item.isActive ? 'فعال' : 'غیرفعال'}</span>
                <h3>{item.title}</h3>
                <p>{item.description ?? 'بدون توضیح تکمیلی'}</p>
              </div>
              <div className="catalog-card-metrics">
                <div>
                  <span>دسته</span>
                  <strong>{requestReasonLabels[item.category]}</strong>
                </div>
                <div>
                  <span>ترتیب</span>
                  <strong>{item.displayOrder}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
