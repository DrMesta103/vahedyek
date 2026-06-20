'use client';

import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavPageHeader, TaavPageShell } from '@repo/ui/taav/layout';
import { TaavSection } from '@repo/ui/taav/layout/interactive';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection, DocSpecGrid } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { PAGE_SHELL_PROPS } from '@/lib/docs/component-props';

export default function PageShellDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'پوسته صفحه' }]}>
      <DocPageHeader
        eyebrow="Layout"
        title="TaavPageShell"
        description="پوسته استاندارد صفحات DastRanj و VahedYek با variant، width، padding و density کنترل‌شده."
        importCode={`import { TaavPageShell } from '@repo/ui/taav/layout';`}
      />
      <DocSection title="استفاده پایه">
        <DocPreview label="RTL Preview">
          <TaavPageShell
            variant="settings"
            width="normal"
            padding="md"
            header={
              <TaavPageHeader
                title="تنظیمات کسب‌وکار"
                description="مدیریت اطلاعات پایه، برندینگ و حساب‌های بانکی."
                actions={<TaavButton size="sm">ذخیره</TaavButton>}
              />
            }
          >
            <TaavSection title="اطلاعات عمومی" variant="card">
              <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">محتوای section</p>
            </TaavSection>
          </TaavPageShell>
        </DocPreview>
      </DocSection>
      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-4">
            {(['default', 'dashboard', 'settings', 'detail', 'form', 'report'] as const).map((variant) => (
              <TaavPageShell key={variant} variant={variant} padding="sm" density="compact">
                <p className="m-0 text-[length:var(--taav-text-sm)] font-bold">{variant}</p>
              </TaavPageShell>
            ))}
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Width">
        <DocPreview>
          <div className="grid gap-4">
            {(['narrow', 'normal', 'wide'] as const).map((width) => (
              <TaavPageShell key={width} width={width} padding="sm" withBackground={false}>
                <div className="rounded-[var(--taav-radius-md)] border border-dashed border-[color:var(--taav-border)] p-3 text-center text-[length:var(--taav-text-xs)]">
                  {width}
                </div>
              </TaavPageShell>
            ))}
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={PAGE_SHELL_PROPS} /></DocSection>
      <DocSection title="Design Specs">
        <DocSpecGrid items={[
          { label: 'Container normal', value: 'var(--taav-page-container-normal)' },
          { label: 'Padding md', value: 'var(--taav-page-padding-md)' },
          { label: 'Gap comfortable', value: 'var(--taav-layout-gap-comfortable)' },
        ]} />
      </DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['برای صفحات جدید از TaavPageShell به‌عنوان wrapper استفاده کنید', 'header/sidebar/footer را از props رسمی بدهید']}
          dontItems={['max-width و padding دلخواه Tailwind روی wrapper صفحه نگذارید', 'منطق app shell/sidebar را داخل PageShell قرار ندهید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
