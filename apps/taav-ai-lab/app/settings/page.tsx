import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { BusinessSettingsHubClient } from '@/components/settings/BusinessSettingsHubClient';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';

export default async function SettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();

  return (
    <AiLabShell
      pathname="/settings"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <BusinessSettingsHubClient />
      </SettingsClientShell>
    </AiLabShell>
  );
}
