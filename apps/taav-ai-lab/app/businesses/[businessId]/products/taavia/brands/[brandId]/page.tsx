import { notFound, redirect } from "next/navigation";
import { canOpenTaaviaBrandDashboard, getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getInitialBuildReadModel, getTaaviaBrandDashboardReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { AiLabShell } from "@/components/AiLabShell";
import { TaaviaBrandWorkspaceClient } from "@/components/taavia/TaaviaBrandWorkspaceClient";

export default async function TaaviaBrandDetailPage({ params }: { params: Promise<{ businessId: string; brandId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, brandId } = await params;
  const business = await getTenantForUser(session.userId, businessId);

  if (!business) {
    return (
      <AiLabShell pathname="/businesses" fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null} currentTenantName={currentTenant?.name ?? null}>
        <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-6 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">این کسب‌وکار برای شما در دسترس نیست.</div>
      </AiLabShell>
    );
  }

  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();

  if (!(await canOpenTaaviaBrandDashboard(session.userId, business.id, brand.id))) {
    redirect(`/businesses/${business.id}/products/taavia/brands/${brand.id}/sources`);
  }

  const [overview, initialBuild] = await Promise.all([getTaaviaBrandDashboardReadModel(session.userId, business.id, brand.id), getInitialBuildReadModel(session.userId, business.id, brand.id)]);
  if (!overview) notFound();

  return (
    <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={business.id} currentTenantName={business.name} currentBrandName={brand.name}>
      <TaaviaBrandWorkspaceClient tenantId={business.id} brand={brand} overview={overview} initialBuild={initialBuild} />
    </AiLabShell>
  );
}
