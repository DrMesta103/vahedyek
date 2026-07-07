import { getGlobalSettings, listAiProviderAccounts } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { AiAccountsSettingsClient } from '@/components/settings/AiAccountsSettingsClient';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';

export default async function AiAccountsSettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const [{ accounts, summary }, globalSettings] = await Promise.all([
    listAiProviderAccounts(),
    getGlobalSettings(),
  ]);

  return (
    <AiLabShell
      pathname="/settings/ai-accounts"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <AiAccountsSettingsClient
          initialAccounts={accounts}
          initialSummary={summary}
          usdToToman={globalSettings.usdToToman}
        />
      </SettingsClientShell>
    </AiLabShell>
  );
}
