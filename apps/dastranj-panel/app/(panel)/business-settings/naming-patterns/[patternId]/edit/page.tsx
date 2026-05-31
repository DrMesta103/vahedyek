import { getSessionContext } from '../../../../../lib/auth';
import { NamingPatternBuilderClient } from '../../_components/NamingPatternBuilderClient';

export default async function EditNamingPatternPage({
  params,
}: {
  params: Promise<{ patternId: string }>;
}) {
  const [{ patternId }, session] = await Promise.all([params, getSessionContext()]);
  return <NamingPatternBuilderClient mode="edit" patternId={patternId} tenantId={session?.tenantId ?? null} />;
}

