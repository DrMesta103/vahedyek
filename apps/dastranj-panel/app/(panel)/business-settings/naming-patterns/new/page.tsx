import { getSessionContext } from '../../../../lib/auth';
import { listClientStorageStates } from '../../../../lib/client-storage-persistence';
import { NamingPatternBuilderClient } from '../_components/NamingPatternBuilderClient';

export default async function NewNamingPatternPage() {
  const session = await getSessionContext();
  const tenantId = session?.tenantId ?? null;
  const storageStates = await listClientStorageStates(tenantId);
  return <NamingPatternBuilderClient mode="create" tenantId={tenantId} storageStates={storageStates} />;
}

