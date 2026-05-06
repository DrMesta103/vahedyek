import { listDraftTemplates } from '../../lib/data';
import { draftTemplateLabels } from '../../lib/constants';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function DraftTemplatesPage() {
  const items = await listDraftTemplates();

  return (
    <div className="page-stack">
      <PageIntro title="قالب‌های پیش‌نویس" description="مدیریت قالب‌های قرارداد و فرایندهای منابع انسانی." action={<PrimaryLink href="/draft-templates/new">افزودن قالب</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="قالبی ثبت نشده" description="برای قراردادها و فرایندهای تکراری از این بخش استفاده کنید." action={<PrimaryLink href="/draft-templates/new">ایجاد قالب</PrimaryLink>} />
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="catalog-card">
              <div className="catalog-card-head">
                <span className={`catalog-pill ${item.isActive ? 'is-success' : 'is-muted'}`}>{item.isActive ? 'فعال' : 'غیرفعال'}</span>
                <h3>{item.title}</h3>
                <p>{item.description ?? 'بدنه و نسخه این قالب آماده توسعه و استفاده مجدد است.'}</p>
              </div>
              <div className="catalog-card-metrics">
                <div>
                  <span>دسته</span>
                  <strong>{draftTemplateLabels[item.category]}</strong>
                </div>
                <div>
                  <span>نسخه</span>
                  <strong>{item.version}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
