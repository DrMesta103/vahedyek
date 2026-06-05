import { listClientStorageStates } from '../../../lib/client-storage-persistence';
import { PayrollSettingsEntry } from '../_components/PayrollSettingsEntry';

export default async function PayrollAttendanceSettingsPage() {
  const storageStates = await listClientStorageStates(null);
  return <PayrollSettingsEntry mode="admin" storageStates={storageStates} />;
}
