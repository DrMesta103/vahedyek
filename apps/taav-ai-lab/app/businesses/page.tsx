import { getTenantsForUser } from '@/app/lib/simulator-store';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { BusinessesClient } from '@/components/BusinessesClient';

export default async function BusinessesPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const businesses = await getTenantsForUser(session.userId);

  return (
    <AiLabShell
      pathname="/businesses"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <BusinessesClient businesses={businesses} />
    </AiLabShell>
  );
}
