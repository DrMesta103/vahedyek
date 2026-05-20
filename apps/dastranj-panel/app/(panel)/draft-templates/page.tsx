import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { draftTemplateLabels } from '../../lib/constants';
import { listDraftTemplates } from '../../lib/data';

export default async function DraftTemplatesPage() {
  const items = await listDraftTemplates();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('پیش‌نویس')}
        title="قالب‌های پیش‌نویس"
        subtitle="مدیریت قالب‌های قرارداد و فرایندهای منابع انسانی."
        addHref="/draft-templates/new"
        addLabel="افزودن قالب"
      />

      <div className="module-page-grid">
        {items.map((item) => (
          <article key={item.id} className="module-grid-card">
            <div className="module-grid-card-top">
              <div className="module-grid-card-body">
                <h3>{item.title}</h3>
                <p>{item.description ?? 'بدنه و نسخه این قالب آماده توسعه و استفاده مجدد است.'}</p>
              </div>
              <span className={`module-status-pill ${item.isActive ? 'is-active' : 'is-inactive'}`}>{item.isActive ? 'فعال' : 'غیرفعال'}</span>
            </div>
            <div className="module-card-metrics">
              <div className="module-metric-panel">
                <span>دسته</span>
                <strong>{draftTemplateLabels[item.category]}</strong>
              </div>
              <div className="module-metric-panel">
                <span>نسخه</span>
                <strong>{item.version}</strong>
              </div>
            </div>
          </article>
        ))}
        <ModuleAddTile href="/draft-templates/new" label="برای افزودن قالب پیش‌نویس کلیک کنید." />
      </div>
    </div>
  );
}
