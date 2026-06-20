import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_LAYOUT_NAV } from '@/lib/navigation';

export default function LayoutOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout' }]}>
      <DocPageHeader
        eyebrow="Layout Patterns"
        title="الگوهای چیدمان"
        description="Page shell، header، section، settings، detail، sticky actions، sidebar، stats و progress — آماده برای مهاجرت صفحات DastRanj و VahedYek."
        importCode={`import { TaavPageShell, TaavPageHeader } from '@repo/ui/taav/layout';`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {LAB_LAYOUT_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <TaavCard variant="outlined" padding="md" radius="lg" interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    {item.label}
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    مستندات، variants، props table و RTL preview
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
