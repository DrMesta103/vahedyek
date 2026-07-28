import { notFound, redirect } from 'next/navigation';
import { getTaaviaBrandForTenant, getTenantForUser } from '@/app/lib/data';
import {
  getActiveKnowledgeBaseId,
  getBuildingKnowledgeBaseCategoryDetailsPageData,
} from '@/app/lib/services/taavia-knowledge-base-read-service';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { TaaviaKnowledgeBaseCategoriesDetailsClient } from '@/components/taavia/knowledge-base/TaaviaKnowledgeBaseCategoriesDetailsClient';

export default async function Page({ params }: { params: Promise<{ businessId: string; brandId: string }> }) {
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
        <div>این کسب‌وکار برای شما در دسترس نیست.</div>
      </AiLabShell>
    );
  }
  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();

  const activeKnowledgeBaseId = await getActiveKnowledgeBaseId(session.userId, business.id, brand.id);
  if (activeKnowledgeBaseId) {
    redirect(
      `/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/${activeKnowledgeBaseId}/categories`,
    );
  }

  const buildingData = await getBuildingKnowledgeBaseCategoryDetailsPageData(
    session.userId,
    business.id,
    brand.id,
    brand.name,
  );
  if (buildingData) {
    return (
      <AiLabShell
        pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/categories`}
        fullName={session.fullName}
        email={session.email}
        mobile={session.mobile}
        currentTenantId={business.id}
        currentTenantName={business.name}
        currentBrandName={brand.name}
      >
        <TaaviaKnowledgeBaseCategoriesDetailsClient data={buildingData} />
      </AiLabShell>
    );
  }

  redirect(`/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base`);
}
