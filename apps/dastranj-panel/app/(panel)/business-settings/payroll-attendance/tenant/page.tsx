import { getSessionContext } from '../../../../lib/auth';
import { PayrollSettingsEntry } from '../../_components/PayrollSettingsEntry';

export default async function TenantPayrollAttendanceSettingsPage() {
  const session = await getSessionContext();

  return <PayrollSettingsEntry mode="tenant" tenantId={session?.tenantId ?? null} />;
}
