import { notFound } from 'next/navigation';
import { getAdminAgentSetupState, getTaaviaBrandForTenant, getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { CreateBrandPageClient } from '@/components/taavia/CreateBrandPageClient';

export default async function TaaviaBrandCreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId } = await params;
  const { edit } = await searchParams;
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

  const isEditMode = Boolean(edit);
  const brand = isEditMode ? await getTaaviaBrandForTenant(session.userId, business.id, edit!) : null;
  if (isEditMode && !brand) {
    notFound();
  }

  const setup = isEditMode ? await getAdminAgentSetupState(session.userId, business.id, edit!) : null;

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/brands/new`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="تاویا"
        title="ثبت برند جدید"
        description="برند جدید را بدون دیالوگ و در یک صفحه مستقل ثبت کن."
      >
        <CreateBrandPageClient
          tenantId={business.id}
          businessId={business.id}
          mode={isEditMode ? 'edit' : 'create'}
          initialBrand={brand}
          initialSelectedUseCases={setup?.selectedUseCases ?? []}
        />
      </AiLabPage>
    </AiLabShell>
  );
}
