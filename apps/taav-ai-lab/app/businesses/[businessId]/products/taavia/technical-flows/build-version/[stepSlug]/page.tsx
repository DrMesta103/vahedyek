import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Beaker } from 'lucide-react';
import {
  BUILD_VERSION_FLOW_META,
  getBuildVersionSectionForStep,
  getBuildVersionStepBySlug,
} from '@/app/lib/taavia-build-version-flow';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';

export default async function BuildVersionStepDetailPage({
  params,
}: {
  params: Promise<{ businessId: string; stepSlug: string }>;
}) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, stepSlug } = await params;
  const step = getBuildVersionStepBySlug(stepSlug);
  const section = getBuildVersionSectionForStep(stepSlug);

  if (!step || !section) {
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

  const overviewHref = `/businesses/${business.id}/products/taavia/technical-flows/${BUILD_VERSION_FLOW_META.slug}`;

  return (
    <AiLabShell
      pathname={`${overviewHref}/${step.slug}`}
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
          eyebrow={BUILD_VERSION_FLOW_META.productLabel}
          title={step.title}
          description={`${section.title} · مرحله ${step.number} از فلو ${BUILD_VERSION_FLOW_META.title}`}
          badge={
            <TaavBadge tone="brand" variant="soft" size="sm">
              مرحله {step.number}
            </TaavBadge>
          }
          actions={
            <Link href={overviewHref}>
              <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                بازگشت به Build و Version
              </TaavButton>
            </Link>
          }
        />

        <TaavCard variant="outlined" padding="lg" radius="xl">
          <div className="grid gap-3">
            <h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">
              جزئیات مرحله
            </h2>
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              این صفحه به‌زودی با جزئیات فنی، قراردادها و دیاگرام این مرحله تکمیل می‌شود.
            </p>
          </div>
        </TaavCard>
      </div>
    </AiLabShell>
  );
}
