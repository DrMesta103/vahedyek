import Link from 'next/link';
import { ArrowLeft, Beaker } from 'lucide-react';
import {
  START_WORKER_POOL_AND_ATTEMPT_CARDS,
  START_WORKER_POOL_AND_ATTEMPT_META,
  START_WORKER_POOL_AND_ATTEMPT_OVERVIEW_NOTE,
  START_WORKER_POOL_AND_ATTEMPT_OVERVIEW_STEPS,
} from '@/app/lib/taavia-build-version-start-worker-pool-and-attempt';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { BuildVersionStepDocClient } from '@/components/taavia/BuildVersionStepDocClient';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import { TaavButton } from '@repo/ui/taav/primitives';

export default async function StartWorkerPoolAndAttemptPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
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
          description="از فهرست کسب‌وکارها یکی از tenantهای خودتان را انتخاب کنید."
        />
      </AiLabShell>
    );
  }

  const overviewHref = `/businesses/${business.id}/products/taavia/technical-flows/build-version`;
  const currentHref = `${overviewHref}/${START_WORKER_POOL_AND_ATTEMPT_META.slug}`;

  return (
    <AiLabShell
      pathname={currentHref}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <div className="ai-lab-page-stack">
        <TaavPageHeader
          variant="hero"
          icon={<Beaker className="h-5 w-5" />}
          eyebrow="محصول تاویا"
          title={START_WORKER_POOL_AND_ATTEMPT_META.title}
          description={START_WORKER_POOL_AND_ATTEMPT_META.description}
          status="active"
          meta={
            <div className="flex flex-wrap items-center gap-2">
              {START_WORKER_POOL_AND_ATTEMPT_META.pills.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-1.5 text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-strong)]"
                >
                  {pill}
                </span>
              ))}
            </div>
          }
          actions={
            <Link href={overviewHref}>
              <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                بازگشت به Build و Version
              </TaavButton>
            </Link>
          }
        />

        <BuildVersionStepDocClient
          cards={START_WORKER_POOL_AND_ATTEMPT_CARDS}
          overviewSteps={START_WORKER_POOL_AND_ATTEMPT_OVERVIEW_STEPS}
          overviewNote={START_WORKER_POOL_AND_ATTEMPT_OVERVIEW_NOTE}
        />
      </div>
    </AiLabShell>
  );
}
