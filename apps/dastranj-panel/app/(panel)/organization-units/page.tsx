import { ModuleListRow } from '../../components/module-page/ModuleListRow';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { deleteOrganizationUnitAction } from '../../lib/actions';
import { listOrganizationUnits } from '../../lib/data';

export default async function OrganizationUnitsPage() {
  const items = await listOrganizationUnits();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('واحد سازمانی')}
        title="واحدهای سازمانی"
        subtitle="فهرست ساده‌ای واحدهای سازمانی برای مدیریت سریع‌تر."
        addHref="/organization-units/new"
        addLabel="افزودن واحد سازمانی"
      />

      <div className="module-page-list">
        {items.map((item) => (
          <ModuleListRow
            key={item.id}
            title={item.title}
            description={item.description?.trim() ? `توضیحات : ${item.description}` : undefined}
            editHref={`/organization-units/${item.id}/edit`}
            deleteAction={deleteOrganizationUnitAction}
            deleteId={item.id}
            deleteTitle="حذف واحد سازمانی"
            deleteDescription={`آیا از حذف واحد «${item.title}» مطمئن هستید؟`}
          />
        ))}
      </div>
    </div>
  );
}
