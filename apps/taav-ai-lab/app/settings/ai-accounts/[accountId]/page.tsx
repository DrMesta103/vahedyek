import { notFound } from 'next/navigation';
import { getAiProviderAccountByIdV2 } from '@/app/lib/repositories/ai-provider-accounts-v2';
import { listAiProviderModelsV2 } from '@/app/lib/repositories/ai-provider-models-v2';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { AiAccountModelsV2Client } from '@/components/settings/AiAccountModelsV2Client';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AiAccountModelsPage({ params }: PageProps) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { accountId } = await params;
  const [account, models] = await Promise.all([
    getAiProviderAccountByIdV2(accountId),
    listAiProviderModelsV2({ accountId }),
  ]);

  if (!account) {
    notFound();
  }

  return (
    <AiLabShell
      pathname={`/settings/ai-accounts/${accountId}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <AiAccountModelsV2Client account={account} initialModels={models} />
      </SettingsClientShell>
    </AiLabShell>
  );
}
