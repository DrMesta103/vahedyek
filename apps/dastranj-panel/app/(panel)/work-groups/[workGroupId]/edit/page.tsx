import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { getWorkGroup, listEmployees, listLocations, listPolicies } from '../../../../lib/data';
import { WorkGroupStepperForm } from '../../new/_components/WorkGroupStepperForm';
import { getWorkGroupAccess, requireWorkGroupAccess } from '../../../../lib/work-group-access';
import { changeWorkGroupLocationAction, changeWorkGroupPolicyAction } from '../../../../lib/actions';

type EditWorkGroupPageProps = {
  params: Promise<{
    workGroupId: string;
  }>;
};

export default async function EditWorkGroupPage({ params }: EditWorkGroupPageProps) {
  await requireWorkGroupAccess('edit');
  const access = await getWorkGroupAccess();
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
      <ModulePageHeader title="ویرایش گروه کاری" />

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
        policies={policies.filter((item) => item.isActive || item.id === workGroup.policyId).map((item) => ({
          id: item.id,
          title: item.isActive ? item.title : `${item.title} (غیرفعال — اتصال فعلی)`,
          description: item.description ?? '',
          calendarTitle: item.calendar?.title ?? '',
          calendarYearLabel: item.calendar?.yearLabel ?? '',
        }))}
      />

      <section className="work-group-context-change-legacy grid gap-4 lg:grid-cols-2">
        {access.canPolicyChange ? <form action={changeWorkGroupPolicyAction} className="rounded-2xl border border-white/10 p-5">
          <h2>تغییر تاریخی سیاست کاری</h2>
          <p>سیاست فعلی: {workGroup.policy?.title ?? 'ثبت نشده'} · اعضای متأثر: {currentMembers.length.toLocaleString('fa-IR')}</p>
          <input type="hidden" name="id" value={workGroup.id} />
          <label>سیاست جدید<select name="policyId" required defaultValue=""> <option value="" disabled>انتخاب کنید</option>{policies.filter((item) => item.isActive && item.id !== workGroup.policyId).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>تاریخ اثرگذاری<input name="effectiveDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label>تاریخ اتمام اثر<input name="effectiveEndDate" type="date" /></label>
          <label>دلیل<textarea name="reason" required /></label>
          <button type="submit" className="primary-button">تأیید تغییر سیاست</button>
        </form> : null}
        {access.canLocationChange ? <form action={changeWorkGroupLocationAction} className="rounded-2xl border border-white/10 p-5">
          <h2>تغییر تاریخی محل کار</h2>
          <p>محل فعلی: {workGroup.location?.title ?? 'ثبت نشده'} · اعضای متأثر: {currentMembers.length.toLocaleString('fa-IR')}</p>
          <input type="hidden" name="id" value={workGroup.id} />
          <label>محل جدید<select name="locationId" required defaultValue=""> <option value="" disabled>انتخاب کنید</option>{locations.filter((item) => item.isActive && item.id !== workGroup.locationId).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>تاریخ اثرگذاری<input name="effectiveDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label>تاریخ اتمام اثر<input name="effectiveEndDate" type="date" /></label>
          <label>دلیل<textarea name="reason" required /></label>
          <button type="submit" className="primary-button">تأیید تغییر محل</button>
        </form> : null}
      </section>
    </div>
  );
}
