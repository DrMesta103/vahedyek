import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
import { listEmployees, listLocations, listPolicies } from '../../../lib/data';
import { WorkGroupStepperForm } from './_components/WorkGroupStepperForm';

export default async function NewWorkGroupPage() {
  const [employees, locations, policies] = await Promise.all([listEmployees(), listLocations(), listPolicies()]);

  return (
    <div className="work-group-create-page module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('افزودن گروه کاری')}
        title="افزودن گروه کاری"
      />

      <WorkGroupStepperForm
        locations={locations.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? '',
          radius: item.radius,
        }))}
        employees={employees.map((item) => ({
          id: item.id,
          name: `${item.firstName} ${item.lastName}`.trim() || item.mobile1 || item.email || 'کارمند',
          currentGroupName: item.workGroupMemberships.find((membership) => membership.isCurrent)?.workGroup.title ?? null,
        }))}
        policies={policies.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? '',
          calendarTitle: item.calendar?.title ?? '',
          calendarYearLabel: item.calendar?.yearLabel ?? '',
        }))}
      />
    </div>
  );
}
