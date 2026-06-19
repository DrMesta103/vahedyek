import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_COMPONENT_NAV } from '@/lib/navigation';

export default function ComponentsOverviewPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کامپوننت‌ها' }]}>
      <DocPageHeader
        eyebrow="Primitives"
        title="کامپوننت‌های پایه"
        description="API کنترل‌شده با variant، size، tone و state. هر primitive فقط از props رسمی پشتیبانی می‌کند."
        importCode={`import { TaavButton, TaavBadge, TaavCard } from '@repo/ui';`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {LAB_COMPONENT_NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            <TaavCard variant="outlined" padding="md" radius="lg" interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    {item.label}
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    مستندات، props table، design specs و RTL preview
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
      <TaavCard variant="soft" padding="md" radius="lg">
        <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
          تفاوت مهم: <code className="lab-code">TaavTooltip</code> برای راهنمای شناور است، اما field tooltip در TaavUI داخل{' '}
          <code className="lab-code">TaavFieldBlock</code> به‌صورت متن ثابت زیر فیلد پیاده‌سازی می‌شود. مستندات آن در{' '}
          <code className="lab-code">/forms/field-block</code> قرار دارد.
        </p>
      </TaavCard>
    </DocPageShell>
  );
}
