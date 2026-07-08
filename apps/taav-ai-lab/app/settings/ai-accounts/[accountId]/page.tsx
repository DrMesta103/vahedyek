import { notFound } from 'next/navigation';
import { getAiProviderAccountDetail, getGlobalSettings } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { AiAccountModelsClient } from '@/components/settings/AiAccountModelsClient';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AiAccountModelsPage({ params }: PageProps) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { accountId } = await params;
  const [detail, globalSettings] = await Promise.all([
    getAiProviderAccountDetail(accountId),
    getGlobalSettings(),
  ]);

  if (!detail) {
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
        <AiAccountModelsClient
          accountId={accountId}
          initialDetail={detail}
          usdToToman={globalSettings.usdToToman}
        />
      </SettingsClientShell>
    </AiLabShell>
  );
}
