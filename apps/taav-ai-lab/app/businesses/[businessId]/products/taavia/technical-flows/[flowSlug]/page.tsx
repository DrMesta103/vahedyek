import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTaaviaTechnicalFlowBySlug } from '@/app/lib/taavia-technical-flows';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TaavButton } from '@repo/ui/taav/primitives';

export default async function TaaviaTechnicalFlowPlaceholderPage({
  params,
}: {
  params: Promise<{ businessId: string; flowSlug: string }>;
}) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, flowSlug } = await params;
  const flow = getTaaviaTechnicalFlowBySlug(flowSlug);

  if (!flow) {
    notFound();
  }

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
          description="از فهرست کسب‌وکارها یکی از tenantهای خودتان را انتخاب کنید."
        />
      </AiLabShell>
    );
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/technical-flows/${flow.slug}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage eyebrow="فلوهای ارتباطی فنی" title={flow.title} description={flow.description}>
        <Link href={`/businesses/${business.id}/products/taavia/technical-flows`}>
          <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به فلوهای ارتباطی فنی
          </TaavButton>
        </Link>
      </AiLabPage>
    </AiLabShell>
  );
}
