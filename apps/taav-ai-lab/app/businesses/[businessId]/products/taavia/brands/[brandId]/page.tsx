import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  getAdminAgentSetupState,
  getOrCreateAdminAgentConversation,
  getTaaviaBrandForTenant,
  getTenantForUser,
} from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { DeleteBrandButton } from '@/components/taavia/DeleteBrandButton';
import { TaaviaBrandWorkspaceClient } from '@/components/taavia/TaaviaBrandWorkspaceClient';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';

export default async function TaaviaBrandDetailPage({
  params,
}: {
  params: Promise<{ businessId: string; brandId: string }>;
}) {
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
        <AiLabPage eyebrow="عدم دسترسی" title="این کسب‌وکار برای شما در دسترس نیست" description="از فهرست کسب‌وکارها یکی از tenantهای خودتان را انتخاب کنید." />
      </AiLabShell>
    );
  }

  const brand = await getTaaviaBrandForTenant(session.userId, business.id, brandId);
  if (!brand) notFound();

  const setup = await getAdminAgentSetupState(session.userId, business.id, brandId);
  const conversation = await getOrCreateAdminAgentConversation(session.userId, business.id, brandId);

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/brands/${brand.id}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage eyebrow="تاویا · برند" title={brand.name}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Link href={`/businesses/${business.id}/products/taavia/brands`}>
            <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت به برندها
            </TaavButton>
          </Link>
          <DeleteBrandButton tenantId={business.id} brandId={brand.id} brandName={brand.name} />
          <TaavBadge tone="brand" variant="soft">
            ایجنت مدیریت برند
          </TaavBadge>
        </div>

        <TaaviaBrandWorkspaceClient
          tenantId={business.id}
          brand={brand}
          selectedUseCases={setup?.selectedUseCases ?? []}
          setupComplete={Boolean(setup?.isComplete)}
          initialConversationId={conversation?.id ?? null}
          initialMessages={conversation?.messages ?? []}
        />
      </AiLabPage>
    </AiLabShell>
  );
}
