import { listAiProviderAccountsV2 } from '@/app/lib/repositories/ai-provider-accounts-v2';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { AiAccountsSettingsV2Client } from '@/components/settings/AiAccountsSettingsV2Client';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';

export default async function AiAccountsSettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const initialData = await listAiProviderAccountsV2();

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
        <AiAccountsSettingsV2Client initialData={initialData} />
      </SettingsClientShell>
    </AiLabShell>
  );
}
