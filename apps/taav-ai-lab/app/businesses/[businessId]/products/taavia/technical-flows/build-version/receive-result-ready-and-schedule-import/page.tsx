import Link from 'next/link';
import { ArrowLeft, Beaker } from 'lucide-react';
import {
  RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_CARDS,
  RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META,
  RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_OVERVIEW_NOTE,
  RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_OVERVIEW_STEPS,
} from '@/app/lib/taavia-build-version-receive-result-ready-and-schedule-import';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { BuildVersionStepDocClient } from '@/components/taavia/BuildVersionStepDocClient';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import { TaavButton } from '@repo/ui/taav/primitives';

export default async function ReceiveResultReadyAndScheduleImportPage({
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
  const currentHref = `${overviewHref}/${RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META.slug}`;

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
          title={RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META.title}
          description={RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META.description}
          status="active"
          meta={
            <div className="flex flex-wrap items-center gap-2">
              {RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META.pills.map((pill) => (
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
          cards={RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_CARDS}
          overviewSteps={RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_OVERVIEW_STEPS}
          overviewNote={RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_OVERVIEW_NOTE}
        />
      </div>
    </AiLabShell>
  );
}
