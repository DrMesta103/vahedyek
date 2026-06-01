import { getSessionContext } from '../../../../lib/auth';
import { NamingPatternBuilderClient } from '../_components/NamingPatternBuilderClient';

export default async function NewNamingPatternPage() {
  const session = await getSessionContext();
  return <NamingPatternBuilderClient mode="create" tenantId={session?.tenantId ?? null} />;
}

