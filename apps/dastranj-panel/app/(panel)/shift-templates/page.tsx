import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { shiftTypeLabels } from '../../lib/constants';
import { listShiftTemplates } from '../../lib/data';

export default async function ShiftTemplatesPage() {
  const items = await listShiftTemplates();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('قالب شیفت')}
        title="قالب‌های شیفت"
        subtitle="الگوهای شیفت برای استفاده در تقویم و سیاست‌های کاری."
        addHref="/shift-templates/new"
        addLabel="افزودن قالب"
      />

      <div className="module-page-grid">
        {items.map((item) => (
          <article key={item.id} className="module-grid-card">
            <div className="module-grid-card-top">
              <div className="module-grid-card-body">
                <h3>{item.title}</h3>
                <p>{item.description ?? 'الگوی شیفت بدون توضیح تکمیلی.'}</p>
              </div>
              <span className={`module-status-pill ${item.isActive ? 'is-active' : 'is-inactive'}`}>{item.isActive ? 'فعال' : 'غیرفعال'}</span>
            </div>
            <div className="module-card-metrics">
              <div className="module-metric-panel">
                <span>نوع</span>
                <strong>{shiftTypeLabels[item.type]}</strong>
              </div>
              <div className="module-metric-panel">
                <span>روزهای هفته</span>
                <strong>{Array.isArray(item.weekDays) ? item.weekDays.join('، ') : '-'}</strong>
              </div>
            </div>
          </article>
        ))}
        <ModuleAddTile href="/shift-templates/new" label="برای افزودن قالب شیفت کلیک کنید." />
      </div>
    </div>
  );
}
