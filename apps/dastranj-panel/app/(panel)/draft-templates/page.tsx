import { getSessionContext } from '../../lib/auth';
import { DraftTemplatesClient } from './DraftTemplatesClient';

export default async function DraftTemplatesPage() {
  const session = await getSessionContext();

  return <DraftTemplatesClient tenantId={session?.tenantId ?? null} />;
}
