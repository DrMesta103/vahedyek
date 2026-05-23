import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../../../components/module-page/module-breadcrumbs';
import { getWorkGroup, listEmployees, listLocations, listPolicies } from '../../../../lib/data';
import { WorkGroupStepperForm } from '../../new/_components/WorkGroupStepperForm';

type EditWorkGroupPageProps = {
  params: Promise<{
    workGroupId: string;
  }>;
};

export default async function EditWorkGroupPage({ params }: EditWorkGroupPageProps) {
  const { workGroupId } = await params;
  const [workGroup, employees, locations, policies] = await Promise.all([
    getWorkGroup(workGroupId),
    listEmployees(),
    listLocations(),
    listPolicies(),
  ]);

  if (!workGroup) {
    notFound();
  }

  const currentMembers = workGroup.members.filter((member) => member.isCurrent);

  return (
    <div className="work-group-create-page module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('ویرایش گروه کاری')}
        title="ویرایش گروه کاری"
      />

      <WorkGroupStepperForm
        mode="edit"
        initialValues={{
          id: workGroup.id,
          title: workGroup.title,
          description: workGroup.description ?? '',
          tags: Array.isArray(workGroup.tags) ? workGroup.tags.map((tag) => String(tag)).filter(Boolean) : [],
          locationId: workGroup.locationId ?? '',
          selectedPolicyId: workGroup.policyId ?? '',
          selectedEmployees: currentMembers.map((member) => ({
            id: member.employee.id,
            name: `${member.employee.firstName} ${member.employee.lastName}`.trim() || member.employee.mobile1 || member.employee.email || 'کارمند',
            currentGroupName: null,
            joinedAt: member.joinedAt.toISOString().slice(0, 10),
            accessLevel: member.accessLevel,
            transferFromGroup: false,
          })),
        }}
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
