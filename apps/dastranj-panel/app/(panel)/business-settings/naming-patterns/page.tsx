import { getSessionContext } from '../../../lib/auth';
import { NamingPatternsClient } from './_components/NamingPatternsClient';

export default async function NamingPatternsPage() {
  const session = await getSessionContext();
  return <NamingPatternsClient tenantId={session?.tenantId ?? null} />;
}

