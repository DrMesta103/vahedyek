import { TrendingUp, Users } from 'lucide-react';
import { TaavStatsCard } from '@repo/ui/taav/layout';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection, DocSpecGrid } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { STATS_CARD_PROPS } from '@/lib/docs/component-props';

export default function StatsCardDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'کارت آمار' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavStatsCard" description="کارت metric برای dashboard، report summary و setup progress." importCode={`import { TaavStatsCard } from '@repo/ui/taav/layout';`} />
      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <div className="grid gap-4 md:grid-cols-2">
            <TaavStatsCard
              title="کارمندان فعال"
              value="۱۲۴"
              description="نسبت به ماه قبل"
              icon={<Users className="h-5 w-5" />}
              tone="brand"
              trend={{ value: '+۸٪', direction: 'up', tone: 'success', label: 'رشد' }}
            />
            <TaavStatsCard
              title="قراردادهای در انتظار"
              value="۶"
              tone="warning"
              variant="soft"
              trend={{ value: '۲ مورد', direction: 'flat', tone: 'warning' }}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Tones">
        <DocPreview>
          <div className="grid gap-3 md:grid-cols-3">
            {(['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
              <TaavStatsCard key={tone} title={tone} value="۴۲" variant="soft" tone={tone} size="sm" />
            ))}
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Loading"><DocPreview><TaavStatsCard loading /></DocPreview></DocSection>
      <DocSection title="Props"><DocPropsTable rows={STATS_CARD_PROPS} /></DocSection>
      <DocSection title="Design Specs">
        <DocSpecGrid items={[
          { label: 'Value md', value: 'var(--taav-stats-value-md)' },
          { label: 'Tone brand', value: 'var(--taav-stats-tone-brand)' },
        ]} />
      </DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['value و trend را از API محاسبه و pass کنید']} dontItems={['محاسبه metric داخل StatsCard نگذارید']} />
      </DocSection>
    </DocPageShell>
  );
}
