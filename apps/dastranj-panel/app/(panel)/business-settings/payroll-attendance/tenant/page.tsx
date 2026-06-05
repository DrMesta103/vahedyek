import { getSessionContext } from '../../../../lib/auth';
import { listClientStorageStates } from '../../../../lib/client-storage-persistence';
import { PayrollSettingsEntry } from '../../_components/PayrollSettingsEntry';

export default async function TenantPayrollAttendanceSettingsPage() {
  const session = await getSessionContext();
  const storageStates = await listClientStorageStates(session?.tenantId ?? null);

  return <PayrollSettingsEntry mode="tenant" tenantId={session?.tenantId ?? null} storageStates={storageStates} />;
}
