import { getSessionContext } from '../../lib/auth';
import { listClientStorageStates } from '../../lib/client-storage-persistence';
import { listDraftTemplates } from '../../lib/data';
import { DraftTemplatesClient } from './DraftTemplatesClient';

export default async function DraftTemplatesPage() {
  const session = await getSessionContext();
  const [templates, storageStates] = await Promise.all([
    listDraftTemplates(),
    listClientStorageStates(session?.tenantId ?? null),
  ]);

  return <DraftTemplatesClient tenantId={session?.tenantId ?? null} templates={templates} storageStates={storageStates} />;
}
