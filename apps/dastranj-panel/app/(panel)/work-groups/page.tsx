import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { ModuleListRow } from '../../components/module-page/ModuleListRow';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { workGroupAccessLabels } from '../../lib/constants';
import { listWorkGroups } from '../../lib/data';

export default async function WorkGroupsPage() {
  const items = await listWorkGroups();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('گروه کاری')}
        title="گروه‌های کاری"
        subtitle="اتصال کارمندان، محل کار و سیاست‌ها در قالب گروه‌های اجرایی."
        addHref="/work-groups/new"
        addLabel="افزودن گروه"
      />

      <div className="module-page-list">
        {items.map((item) => (
          <ModuleListRow key={item.id} title={item.title} description={item.description ?? 'بدون توضیح'}>
            <div className="module-list-row-meta">
              <span>محل: {item.location?.title ?? '-'}</span>
              <span>سیاست: {item.policy?.title ?? '-'}</span>
              <span>
                اعضا:{' '}
                {item.members.map((member) => `${member.employee.firstName} ${member.employee.lastName} (${workGroupAccessLabels[member.accessLevel]})`).join('، ') || '-'}
              </span>
            </div>
          </ModuleListRow>
        ))}
      </div>
    </div>
  );
}
