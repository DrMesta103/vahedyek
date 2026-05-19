import { getQuickSetupChecklist } from '../../lib/data';
import { QuickSetupFlow } from './_components/QuickSetupFlow';

export default async function QuickSetupPage() {
  const data = await getQuickSetupChecklist();

  return (
    <QuickSetupFlow
      profileName={data.profile?.brandName ?? null}
      steps={data.steps}
      locationItems={data.locationItems}
      calendarItems={data.calendarItems}
      policyItems={data.policyItems}
      employeeItems={data.employeeItems}
      workGroupItems={data.workGroupItems}
      tenantId={data.tenantId}
    />
  );
}
