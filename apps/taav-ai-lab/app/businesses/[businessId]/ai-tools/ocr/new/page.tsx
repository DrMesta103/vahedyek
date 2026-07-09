import { getGlobalSettings, getTenantForUser, listActiveChatModels, listSystemOcrModels } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { OcrRegistrationClient } from '@/components/OcrRegistrationClient';

export default async function OcrNewPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId } = await params;
  const business = await getTenantForUser(session.userId, businessId);

  if (!business) {
    return (
      <AiLabShell
        pathname="/businesses"
        fullName={session.fullName}
        email={session.email}
        mobile={session.mobile}
        currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
        currentTenantName={currentTenant?.name ?? null}
      >
        <div className="grid gap-3">
          <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">این کسب‌وکار برای شما در دسترس نیست</h1>
        </div>
      </AiLabShell>
    );
  }

  const [ocrModels, chatModels, globalSettings] = await Promise.all([
    listSystemOcrModels(),
    listActiveChatModels(),
    getGlobalSettings(),
  ]);

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/ai-tools/ocr/new`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <OcrRegistrationClient
        businessId={business.id}
        initialOcrModels={ocrModels}
        initialChatModels={chatModels}
        usdToToman={globalSettings.usdToToman}
      />
    </AiLabShell>
  );
}
