import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import Link from 'next/link';
import { TaavButton } from '@repo/ui/taav/primitives';

export default async function BusinessWorkspacePage({ params }: { params: Promise<{ businessId: string }> }) {
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
        <AiLabPage
          eyebrow="عدم دسترسی"
          title="این کسب‌وکار برای شما در دسترس نیست"
          description="یا این tenant وجود ندارد، یا به کاربر دیگری تعلق دارد. از فهرست کسب‌وکارها یکی از فضاهای خودتان را انتخاب کنید."
        >
          <Link href="/businesses">
            <TaavButton>بازگشت به کسب‌وکارها</TaavButton>
          </Link>
        </AiLabPage>
      </AiLabShell>
    );
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    />
  );
}
