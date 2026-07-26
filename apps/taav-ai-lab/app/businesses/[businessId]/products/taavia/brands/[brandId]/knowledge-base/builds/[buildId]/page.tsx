import { notFound, redirect } from "next/navigation";
import { getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { getKnowledgeBaseBuildReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { AiLabShell } from "@/components/AiLabShell";
import { InitialKnowledgeBuildPanel } from "@/components/taavia/knowledge-base/InitialKnowledgeBuildPanel";

export default async function KnowledgeBaseBuildPage({ params }: { params: Promise<{ businessId: string; brandId: string; buildId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, brandId, buildId } = await params;
  const business = await getTenantForUser(session.userId, businessId);
  if (!business) notFound();
  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();
  const build = await getKnowledgeBaseBuildReadModel(session.userId, business.id, brand.id, buildId);
  if (!build) notFound();
  if (build.status === "COMPLETED" && build.knowledgeBaseId) redirect(`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/${build.knowledgeBaseId}`);
  return <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={currentTenant?.id ?? business.id} currentTenantName={currentTenant?.name ?? business.name}><InitialKnowledgeBuildPanel businessId={business.id} brandId={brand.id} build={build} /></AiLabShell>;
}
