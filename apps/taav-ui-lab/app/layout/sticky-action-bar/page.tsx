import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavStickyActionBar } from '@repo/ui/taav/layout';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { STICKY_ACTION_BAR_PROPS } from '@/lib/docs/component-props';

export default function StickyActionBarDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'نوار اقدام' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavStickyActionBar" description="نوار save/cancel برای فرم‌ها، wizard و edit pages." importCode={`import { TaavStickyActionBar } from '@repo/ui/taav/layout';`} />
      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <div className="relative min-h-[160px] overflow-hidden rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-border)]">
            <TaavStickyActionBar
              variant="elevated"
              summary="۳ فیلد تغییر کرده"
              dirty
              secondaryAction={<TaavButton variant="outline" tone="neutral">انصراف</TaavButton>}
              primaryAction={<TaavButton>ذخیره</TaavButton>}
            />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-4">
            {(['default', 'elevated', 'soft', 'transparent'] as const).map((variant) => (
              <TaavStickyActionBar key={variant} variant={variant} align="between" summary={variant} primaryAction={<TaavButton size="sm">تأیید</TaavButton>} />
            ))}
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Loading"><DocPreview><TaavStickyActionBar loading /></DocPreview></DocSection>
      <DocSection title="Props"><DocPropsTable rows={STICKY_ACTION_BAR_PROPS} /></DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای فرم‌های create/edit در DastRanj از position=bottom استفاده کنید']} dontItems={['submit handler داخل action bar تعریف نکنید — از TaavButton در parent استفاده کنید']} />
      </DocSection>
    </DocPageShell>
  );
}
