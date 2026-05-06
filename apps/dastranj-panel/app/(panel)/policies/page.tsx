import { listPolicies } from '../../lib/data';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function PoliciesPage() {
  const items = await listPolicies();

  return (
    <div className="page-stack">
      <PageIntro title="سیاست‌های کاری" description="سیاست‌های حضور و غیاب، اضافه‌کاری، مرخصی و تردد." action={<PrimaryLink href="/policies/new">افزودن سیاست</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="سیاستی ثبت نشده" description="برای ادامه راه‌اندازی یک سیاست کاری نیاز است." action={<PrimaryLink href="/policies/new">ثبت سیاست</PrimaryLink>} />
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="catalog-card">
              <div className="catalog-card-head">
                <span className="catalog-pill">{item.calendar?.title ?? 'بدون تقویم'}</span>
                <h3>{item.title}</h3>
                <p>{item.description ?? 'برای این سیاست هنوز توضیحی ثبت نشده است.'}</p>
              </div>
              <div className="catalog-card-metrics">
                <div>
                  <span>کارمند</span>
                  <strong>{item.employeeCount}</strong>
                </div>
                <div>
                  <span>گروه</span>
                  <strong>{item.workGroups.length}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
