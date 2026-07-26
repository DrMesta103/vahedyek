import { notFound } from "next/navigation";
import { getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getInitialBuildReadModel, getKnowledgeBaseOverviewReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { AiLabShell } from "@/components/AiLabShell";
import { TaaviaKnowledgeBaseOverviewClient } from "@/components/taavia/knowledge-base/TaaviaKnowledgeBaseOverviewClient";
import { InitialKnowledgeBuildPanel } from "@/components/taavia/knowledge-base/InitialKnowledgeBuildPanel";

export default async function TaaviaBrandKnowledgeBasePage({ params }: { params: Promise<{ businessId: string; brandId: string }> }) {
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

  const [overview, initialBuild] = await Promise.all([getKnowledgeBaseOverviewReadModel(session.userId, business.id, brand.id), getInitialBuildReadModel(session.userId, business.id, brand.id)]);
  if (!overview) notFound();

  return (
    <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={business.id} currentTenantName={business.name}>
      {initialBuild ? <InitialKnowledgeBuildPanel businessId={business.id} brandId={brand.id} build={initialBuild} /> : <TaaviaKnowledgeBaseOverviewClient businessId={business.id} brandId={brand.id} brandName={brand.name} brandStatus={brand.status} brandIcon={brand.icon?.previewData ?? null} initialOverview={overview} />}
    </AiLabShell>
  );
}
