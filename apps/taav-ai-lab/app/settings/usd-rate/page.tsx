import { getGlobalSettings } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';
import { UsdRateSettingsClient } from '@/components/settings/UsdRateSettingsClient';

export default async function UsdRateSettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const initialData = await getGlobalSettings();

  return (
    <AiLabShell
      pathname="/settings/usd-rate"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <UsdRateSettingsClient initialData={initialData} />
      </SettingsClientShell>
    </AiLabShell>
  );
}
