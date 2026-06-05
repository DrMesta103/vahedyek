import { getSessionContext } from '../../../lib/auth';
import { listClientStorageStates } from '../../../lib/client-storage-persistence';
import { listDraftTemplates } from '../../../lib/data';
import { ContractDraftTemplateBuilder } from '../../business-settings/_components/ContractDraftTemplateBuilder';

export default async function DraftTemplateBuilderPage({
  searchParams,
}: {
  searchParams?: Promise<{ templateId?: string }>;
}) {
  const session = await getSessionContext();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [templates, storageStates] = await Promise.all([
    listDraftTemplates(),
    listClientStorageStates(session?.tenantId ?? null),
  ]);

  return (
    <ContractDraftTemplateBuilder
      tenantId={session?.tenantId ?? null}
      templates={templates}
      selectedTemplateId={resolvedSearchParams.templateId ?? null}
      storageStates={storageStates}
    />
  );
}
