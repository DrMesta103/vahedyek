import { notFound, redirect } from "next/navigation";
import { getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getActiveKnowledgeBaseId, getInitialBuildReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { AiLabShell } from "@/components/AiLabShell";
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

  const [activeKnowledgeBaseId, initialBuild] = await Promise.all([getActiveKnowledgeBaseId(session.userId, business.id, brand.id), getInitialBuildReadModel(session.userId, business.id, brand.id)]);
  if (activeKnowledgeBaseId) redirect(`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/${activeKnowledgeBaseId}`);

  return (
    <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={business.id} currentTenantName={business.name}>
      {initialBuild ? <InitialKnowledgeBuildPanel businessId={business.id} brandId={brand.id} build={initialBuild} /> : <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-6 text-right text-sm text-[var(--taav-text-muted)]">برای این برند هنوز Knowledge Base فعالی وجود ندارد.</div>}
    </AiLabShell>
  );
}
