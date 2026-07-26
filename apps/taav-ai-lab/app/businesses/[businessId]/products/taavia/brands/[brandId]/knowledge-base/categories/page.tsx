import { notFound, redirect } from 'next/navigation';
import { getTaaviaBrandForTenant, getTenantForUser } from '@/app/lib/data';
import { getActiveKnowledgeBaseId } from '@/app/lib/services/taavia-knowledge-base-read-service';
import { requireSession } from '@/app/lib/session';

export default async function Page({ params }: { params: Promise<{ businessId: string; brandId: string }> }) {
  const session = await requireSession();
  const { businessId, brandId } = await params;
  const business = await getTenantForUser(session.userId, businessId);
  if (!business) notFound();
  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();
  const activeKnowledgeBaseId = await getActiveKnowledgeBaseId(session.userId, business.id, brand.id);
  redirect(activeKnowledgeBaseId ? `/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base/${activeKnowledgeBaseId}/categories` : `/businesses/${business.id}/products/taavia/brands/${brand.id}/knowledge-base`);
}
