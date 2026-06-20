import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_DATA_DISPLAY_NAV } from '@/lib/navigation';

export default function DataDisplayOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display' }]}>
      <DocPageHeader
        eyebrow="Data Display"
        title="نمایش داده TaavUI"
        description="Chip system، status، empty/loading، pagination، filter bar، table shell و key-value."
        importCode={`import { TaavChip, TaavStatusBadge, TaavTableShell } from "@repo/ui/taav/data-display";`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {LAB_DATA_DISPLAY_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <TaavCard variant="outlined" padding="md" radius="lg" interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black">{item.label}</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مستندات + props table</p>
                </div>
                {item.badge ? <TaavBadge tone="brand" variant="soft" size="sm">{item.badge}</TaavBadge> : null}
              </div>
            </TaavCard>
          </Link>
        ))}
      </div>
    </DocPageShell>
  );
}
