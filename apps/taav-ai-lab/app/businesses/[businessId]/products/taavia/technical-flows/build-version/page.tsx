import Link from 'next/link';
import { ArrowLeft, Beaker, LayoutGrid, ListOrdered, Users, type LucideIcon } from 'lucide-react';
import {
  BUILD_VERSION_FLOW_META,
  BUILD_VERSION_SECTIONS,
  BUILD_VERSION_SUMMARY_CHIPS,
  type BuildVersionSummaryChipIcon,
} from '@/app/lib/taavia-build-version-flow';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { BuildVersionArchitectureStrip } from '@/components/taavia/BuildVersionArchitectureStrip';
import { BuildVersionSectionCard } from '@/components/taavia/BuildVersionSectionCard';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import { TaavButton } from '@repo/ui/taav/primitives';

const SUMMARY_ICONS: Record<BuildVersionSummaryChipIcon, LucideIcon> = {
  list: ListOrdered,
  grid: LayoutGrid,
  users: Users,
};

export default async function BuildVersionFlowPage({
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

  const pathname = `/businesses/${business.id}/products/taavia/technical-flows/${BUILD_VERSION_FLOW_META.slug}`;

  return (
    <AiLabShell
      pathname={pathname}
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
          title={BUILD_VERSION_FLOW_META.title}
          description={BUILD_VERSION_FLOW_META.description}
          status="active"
          actions={
            <Link href={`/businesses/${business.id}/products/taavia/technical-flows`}>
              <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                بازگشت به فلوهای ارتباطی فنی
              </TaavButton>
            </Link>
          }
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {BUILD_VERSION_SUMMARY_CHIPS.map((chip) => {
            const Icon = SUMMARY_ICONS[chip.icon];
            return (
              <span
                key={chip.id}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3.5 py-2 text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-strong)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--taav-text-muted)]" strokeWidth={1.8} />
                {chip.label}
              </span>
            );
          })}
        </div>

        <BuildVersionArchitectureStrip />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-stretch">
          {BUILD_VERSION_SECTIONS.map((section) => (
            <BuildVersionSectionCard key={section.id} businessId={business.id} section={section} />
          ))}
        </div>
      </div>
    </AiLabShell>
  );
}
