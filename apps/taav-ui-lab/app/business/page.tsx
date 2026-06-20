import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_BUSINESS_NAV } from '@/lib/navigation';

export default function BusinessOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Business' }]}>
      <DocPageHeader
        eyebrow="Business Components"
        title="کامپوننت‌های کسب‌وکار"
        description="اجزای presentation تخصصی DastRanj و VahedYek — data-driven، بدون business logic داخلی."
        importCode={`import {
  TaavBusinessSidebar,
  TaavBusinessIntroCard,
  TaavBusinessRecommendationCard,
  TaavModuleCard,
  TaavModuleCardGrid,
} from '@repo/ui/taav/business';`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {LAB_BUSINESS_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <TaavCard variant="outlined" padding="md" radius="lg" interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    {item.label}
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                    {item.description ?? 'مستندات، variants، props table و RTL preview'}
                  </p>
                </div>
                {item.badge ? (
                  <TaavBadge tone="brand" variant="soft" size="sm">
                    {item.badge}
                  </TaavBadge>
                ) : null}
              </div>
            </TaavCard>
          </Link>
        ))}
      </div>
    </DocPageShell>
  );
}
