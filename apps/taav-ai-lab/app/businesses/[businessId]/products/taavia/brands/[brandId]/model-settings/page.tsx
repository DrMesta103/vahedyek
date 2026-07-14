import { notFound } from 'next/navigation';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { getTaaviaBrandModelAssignments } from '@/app/lib/repositories/taavia-brand-model-assignments';
import { AiLabShell } from '@/components/AiLabShell';
import { TaaviaBrandModelSettingsPageClient } from '@/components/taavia/TaaviaBrandModelSettingsPageClient';

export default async function TaaviaBrandModelSettingsPage({
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

  let settings;
  try {
    settings = await getTaaviaBrandModelAssignments(session.userId, business.id, brandId);
  } catch {
    notFound();
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/brands/${brandId}/model-settings`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
        <TaaviaBrandModelSettingsPageClient
          tenantId={business.id}
          brandId={brandId}
          initialData={settings!}
        />
    </AiLabShell>
  );
}
