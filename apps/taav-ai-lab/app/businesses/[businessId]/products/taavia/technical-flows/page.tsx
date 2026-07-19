import Link from 'next/link';
import { ArrowLeft, Beaker, Code2, Network, Users } from 'lucide-react';
import { TAAVIA_TECHNICAL_FLOW_GROUPS } from '@/app/lib/taavia-technical-flows';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TechnicalFlowGroupCard } from '@/components/taavia/TechnicalFlowGroupCard';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';

const SUMMARY_ITEMS = [
  { label: '۶ گروه فلو', icon: Network },
  { label: 'مناسب PO و Developer', icon: Users },
  { label: 'قابل توسعه', icon: Code2 },
] as const;

export default async function TaaviaTechnicalFlowsPage({
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

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia/technical-flows`}
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
          title="فلوهای ارتباطی فنی"
          description="مرور گرافیکی فلوهای اصلی بین Frontend، .NET، Python، RabbitMQ، gRPC و زیرساخت‌ها"
          badge={
            <TaavBadge tone="brand" variant="soft">
              فعال
            </TaavBadge>
          }
          actions={
            <Link href={`/businesses/${business.id}/products/taavia`}>
              <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                بازگشت به محصولات
              </TaavButton>
            </Link>
          }
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {SUMMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3.5 py-2 text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-strong)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--taav-text-muted)]" strokeWidth={1.8} />
                {item.label}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TAAVIA_TECHNICAL_FLOW_GROUPS.map((flow) => (
            <TechnicalFlowGroupCard
              key={flow.slug}
              href={`/businesses/${business.id}/products/taavia/technical-flows/${flow.slug}`}
              title={flow.title}
              description={flow.description}
              icon={flow.icon}
            />
          ))}
        </div>
      </div>
    </AiLabShell>
  );
}
