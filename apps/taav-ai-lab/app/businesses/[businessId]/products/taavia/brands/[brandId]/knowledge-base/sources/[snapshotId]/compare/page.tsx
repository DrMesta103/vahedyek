import { notFound } from "next/navigation";
import { getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getKnowledgeBaseSnapshotComparisonReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { AiLabShell } from "@/components/AiLabShell";
import { TaaviaKnowledgeBaseSourceComparisonClient } from "@/components/taavia/knowledge-base/TaaviaKnowledgeBaseSourceComparisonClient";

export default async function TaaviaBrandKnowledgeBaseSourceComparisonPage({ params }: { params: Promise<{ businessId: string; brandId: string; snapshotId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, brandId, snapshotId } = await params;
  const business = await getTenantForUser(session.userId, businessId);
  if (!business)
    return (
      <AiLabShell pathname="/businesses" fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null} currentTenantName={currentTenant?.name ?? null}>
        <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-6 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">این کسب‌وکار برای شما در دسترس نیست.</div>
      </AiLabShell>
    );
  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();
  const comparison = await getKnowledgeBaseSnapshotComparisonReadModel(session.userId, business.id, brand.id, snapshotId);
  if (!comparison) notFound();
  return (
    <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/sources/${comparison.snapshotId}/compare`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={business.id} currentTenantName={business.name}>
      <TaaviaKnowledgeBaseSourceComparisonClient businessId={business.id} brandId={brand.id} brandName={brand.name} brandStatus={brand.status} brandIcon={brand.icon?.previewData ?? null} comparison={comparison} />
    </AiLabShell>
  );
}
