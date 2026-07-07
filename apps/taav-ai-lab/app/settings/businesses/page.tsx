import { listAllBusinessesForAdmin } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { BusinessesSettingsClient } from '@/components/settings/BusinessesSettingsClient';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';

export default async function BusinessesSettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const businesses = await listAllBusinessesForAdmin();

  return (
    <AiLabShell
      pathname="/settings/businesses"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <BusinessesSettingsClient businesses={businesses} />
      </SettingsClientShell>
    </AiLabShell>
  );
}
