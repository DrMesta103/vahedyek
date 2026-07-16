import { notFound } from 'next/navigation';
import { getTaaviaBrandForTenant, getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { TAAVIA_ALL_USE_CASE_KEYS } from '@/app/lib/taavia-use-cases';
import { AiLabShell } from '@/components/AiLabShell';
import { TaaviaTestWorkspaceClient } from '@/components/taavia/TaaviaTestWorkspaceClient';

export default async function TaaviaBrandTestPage({
  params,
}: {
  params: Promise<{ businessId: string; brandId: string }>;
}) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, brandId } = await params;
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

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/test`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <TaaviaTestWorkspaceClient
        businessId={business.id}
        brandId={brand.id}
        brandName={brand.name}
        selectedUseCases={TAAVIA_ALL_USE_CASE_KEYS}
      />
    </AiLabShell>
  );
}
