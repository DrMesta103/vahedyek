import { getSessionContext } from '../../../../../lib/auth';
import { listClientStorageStates } from '../../../../../lib/client-storage-persistence';
import { NamingPatternBuilderClient } from '../../_components/NamingPatternBuilderClient';

export default async function EditNamingPatternPage({
  params,
}: {
  params: Promise<{ patternId: string }>;
}) {
  const [{ patternId }, session] = await Promise.all([params, getSessionContext()]);
  const tenantId = session?.tenantId ?? null;
  const storageStates = await listClientStorageStates(tenantId);
  return <NamingPatternBuilderClient mode="edit" patternId={patternId} tenantId={tenantId} storageStates={storageStates} />;
}

