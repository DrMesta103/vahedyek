import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_NAVIGATION_NAV } from '@/lib/navigation';

export default function NavigationOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Navigation' }]}>
      <DocPageHeader
        eyebrow="Navigation"
        title="ناوبری TaavUI"
        description="Tabs برای بخش‌های صفحه و Stepper برای جریان‌های چندمرحله‌ای."
        importCode={`import { TaavTabs, TaavStepper } from "@repo/ui/taav/navigation";`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {LAB_NAVIGATION_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <TaavCard variant="outlined" padding="md" radius="lg" interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black">{item.label}</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مستندات + props table</p>
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
