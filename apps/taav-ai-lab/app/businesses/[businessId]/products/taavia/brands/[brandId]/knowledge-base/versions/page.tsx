import { notFound } from "next/navigation";
import { getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getKnowledgeBaseVersionsReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { AiLabShell } from "@/components/AiLabShell";
import { TaaviaKnowledgeBaseVersionsClient } from "@/components/taavia/knowledge-base/TaaviaKnowledgeBaseVersionsClient";
export default async function Page({ params }: { params: Promise<{ businessId: string; brandId: string }> }) {
  const session = await requireSession();
  const current = await getCurrentTenant();
  const { businessId, brandId } = await params;
  const business = await getTenantForUser(session.userId, businessId);
  if (!business)
    return (
      <AiLabShell pathname="/businesses" fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={current?.id ?? session.activeTenantId ?? null} currentTenantName={current?.name ?? null}>
        <div>این کسب‌وکار برای شما در دسترس نیست.</div>
      </AiLabShell>
    );
  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();
  const data = await getKnowledgeBaseVersionsReadModel(session.userId, business.id, brand.id);
  if (!data) notFound();
  return (
    <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/versions`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={business.id} currentTenantName={business.name}>
      <TaaviaKnowledgeBaseVersionsClient businessId={business.id} brandId={brand.id} brandName={brand.name} brandStatus={brand.status} brandIcon={brand.icon?.previewData ?? null} initialData={data} />
    </AiLabShell>
  );
}
