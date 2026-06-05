import { getSessionContext } from '../../../lib/auth';
import { listClientStorageStates } from '../../../lib/client-storage-persistence';
import { NamingPatternsClient } from './_components/NamingPatternsClient';

export default async function NamingPatternsPage() {
  const session = await getSessionContext();
  const tenantId = session?.tenantId ?? null;
  const storageStates = await listClientStorageStates(tenantId);
  return <NamingPatternsClient tenantId={tenantId} storageStates={storageStates} />;
}

