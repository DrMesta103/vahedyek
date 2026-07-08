import { notFound } from 'next/navigation';
import {
  getOrCreateAdminAgentConversation,
  getTaaviaBrandForTenant,
  getTenantForUser,
} from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { TAAVIA_ALL_USE_CASE_KEYS } from '@/app/lib/taavia-use-cases';
import { AiLabShell } from '@/components/AiLabShell';
import { TaaviaBrandWorkspaceClient } from '@/components/taavia/TaaviaBrandWorkspaceClient';

export default async function TaaviaBrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string; brandId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, brandId } = await params;
  const { mode } = await searchParams;
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
        <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-6 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
          این کسب‌وکار برای شما در دسترس نیست.
        </div>
      </AiLabShell>
    );
  }

  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();

  const conversation = await getOrCreateAdminAgentConversation(session.userId, business.id, brandId);
  const initialView = mode === 'ai' ? 'chat' : 'auto';

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <TaaviaBrandWorkspaceClient
        tenantId={business.id}
        brand={brand}
        selectedUseCases={TAAVIA_ALL_USE_CASE_KEYS}
        setupComplete
        initialView={initialView}
        initialConversationId={conversation?.id ?? null}
        initialMessages={conversation?.messages ?? []}
      />
    </AiLabShell>
  );
}
