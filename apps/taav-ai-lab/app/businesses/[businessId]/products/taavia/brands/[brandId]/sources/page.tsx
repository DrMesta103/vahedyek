import { notFound } from "next/navigation";
import { getTaaviaBrandForTenant, getTenantForUser } from "@/app/lib/data";
import { getCurrentTenant, requireSession } from "@/app/lib/session";
import { getBrandSourcesPageData } from "@/app/lib/services/taavia-brand-sources-read-service";
import { AiLabShell } from "@/components/AiLabShell";
import { TaaviaBrandSourcesClient } from "@/components/taavia/TaaviaBrandSourcesClient";

export default async function TaaviaBrandSourcesPage({ params }: { params: Promise<{ businessId: string; brandId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, brandId } = await params;
  const business = await getTenantForUser(session.userId, businessId);
  if (!business)
    return (
      <AiLabShell pathname="/businesses" fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null} currentTenantName={currentTenant?.name ?? null}>
        <p dir="rtl">این کسب‌وکار برای شما در دسترس نیست.</p>
      </AiLabShell>
    );
  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();
  const data = await getBrandSourcesPageData(session.userId, business.id, brand.id);
  if (!data) notFound();
  return (
    <AiLabShell pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}/sources`} fullName={session.fullName} email={session.email} mobile={session.mobile} currentTenantId={business.id} currentTenantName={business.name} currentBrandName={brand.name}>
      <TaaviaBrandSourcesClient data={data} />
    </AiLabShell>
  );
}
