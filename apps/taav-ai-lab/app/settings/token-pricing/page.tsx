import { getGlobalSettings } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';
import { TokenPricingSettingsClient } from '@/components/settings/TokenPricingSettingsClient';

export default async function TokenPricingSettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const initialData = await getGlobalSettings();

  return (
    <AiLabShell
      pathname="/settings/token-pricing"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <TokenPricingSettingsClient initialData={initialData} />
      </SettingsClientShell>
    </AiLabShell>
  );
}
