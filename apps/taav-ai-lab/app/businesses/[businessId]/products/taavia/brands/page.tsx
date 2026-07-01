import { getTaaviaBrandsForTenant, getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TaaviaBrandsClient } from '@/components/taavia/TaaviaBrandsClient';

export default async function TaaviaBrandsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId } = await params;
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
        <AiLabPage eyebrow="عدم دسترسی" title="این کسب‌وکار برای شما در دسترس نیست" description="از فهرست کسب‌وکارها یکی از tenantهای خودتان را انتخاب کنید." />
      </AiLabShell>
    );
  }

  const brands = await getTaaviaBrandsForTenant(session.userId, business.id);

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/brands`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="تاویا"
        title="برندها"
        description="برندهای این کسب‌وکار را مدیریت کنید و برای هر برند ایجنت مدیریت را آغاز کنید."
      >
        <AiLabSectionCard title="فهرست برندها" description="پس از ایجاد برند، مستقیماً وارد ایجنت مدیریت برند می‌شوید.">
          <TaaviaBrandsClient tenantId={business.id} initialBrands={brands} />
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
