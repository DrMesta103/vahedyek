'use client';

import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavSection } from '@repo/ui/taav/layout/interactive';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { SECTION_PROPS } from '@/lib/docs/component-props';

export default function SectionDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'بخش' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavSection" description="گروه‌بندی فرم، settings، detail و dashboard." importCode={`import { TaavSection } from '@repo/ui/taav/layout';`} />
      <DocSection title="استفاده پایه">
        <DocPreview>
          <TaavSection title="اطلاعات تماس" description="ایمیل و تلفن کارمند" actions={<TaavButton size="sm" variant="outline" tone="neutral">ویرایش</TaavButton>}>
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">محتوای section</p>
          </TaavSection>
        </DocPreview>
      </DocSection>
      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-4">
            {(['card', 'plain', 'outlined', 'soft'] as const).map((variant) => (
              <TaavSection key={variant} variant={variant} title={variant} padding="md">
                <p className="m-0 text-[length:var(--taav-text-sm)]">نمونه {variant}</p>
              </TaavSection>
            ))}
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Collapsible">
        <DocPreview>
          <TaavSection title="بخش تاشو" collapsible defaultCollapsed={false}>
            <p className="m-0 text-[length:var(--taav-text-sm)]">محتوای قابل جمع‌شدن</p>
          </TaavSection>
        </DocPreview>
      </DocSection>
      <DocSection title="Loading"><DocPreview><TaavSection loading title="Loading section" /></DocPreview></DocSection>
      <DocSection title="Props"><DocPropsTable rows={SECTION_PROPS} /></DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای گروه فیلدهای فرم از variant=card استفاده کنید']} dontItems={['border/padding دلخواه روی section نگذارید']} />
      </DocSection>
    </DocPageShell>
  );
}
