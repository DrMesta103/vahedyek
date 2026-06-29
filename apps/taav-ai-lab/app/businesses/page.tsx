import { getTenantsForUser } from '@/app/lib/simulator-store';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { BusinessesClient } from '@/components/BusinessesClient';

export default async function BusinessesPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const businesses = await getTenantsForUser(session.userId);

  return (
    <AiLabShell
      pathname="/businesses"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <AiLabPage
        eyebrow="آزمایشگاه هوش مصنوعی تاو"
        title="مدیریت کسب‌وکارها"
        description="فهرست tenantهای متعلق به حساب فعلی برای تست مستقل قابلیت‌های هوش مصنوعی."
        badge="فاز ۱"
      >
        <BusinessesClient businesses={businesses} />
      </AiLabPage>
    </AiLabShell>
  );
}
