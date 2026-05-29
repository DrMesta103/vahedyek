import { getSessionContext } from '../../../lib/auth';
import { ContractDraftTemplateBuilder } from '../../business-settings/_components/ContractDraftTemplateBuilder';

export default async function DraftTemplateBuilderPage() {
  const session = await getSessionContext();

  return <ContractDraftTemplateBuilder tenantId={session?.tenantId ?? null} />;
}
