'use client';

import { TaavInput } from '@repo/ui/taav/forms';
import { TaavProgressSummary, TaavSettingsSection } from '@repo/ui/taav/layout';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { SETTINGS_SECTION_PROPS } from '@/lib/docs/component-props';

export default function SettingsSectionDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Layout', href: '/layout' }, { label: 'بخش تنظیمات' }]}>
      <DocPageHeader eyebrow="Layout" title="TaavSettingsSection" description="الگوی split برای settings، payroll، branding و workspace." importCode={`import { TaavSettingsSection } from '@repo/ui/taav/layout';`} />
      <DocSection title="Split layout">
        <DocPreview label="RTL Preview">
          <TaavSettingsSection
            variant="split"
            title="نام کسب‌وکار"
            description="نام رسمی که در فاکتورها و قراردادها نمایش داده می‌شود."
            required
            status="active"
            completion={<TaavProgressSummary variant="compact" percent={80} showPercent tone="success" />}
          >
            <TaavInput placeholder="مثلاً شرکت نمونه" />
          </TaavSettingsSection>
        </DocPreview>
      </DocSection>
      <DocSection title="Variants">
        <DocPreview>
          <div className="grid gap-6">
            <TaavSettingsSection variant="default" title="Default" description="border-bottom pattern" optional>
              <TaavInput />
            </TaavSettingsSection>
            <TaavSettingsSection variant="card" title="Card" description="داخل کارت">
              <TaavInput />
            </TaavSettingsSection>
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={SETTINGS_SECTION_PROPS} /></DocSection>
      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای settings VahedYek از variant=split استفاده کنید', 'completion را از بیرون محاسبه و pass کنید']} dontItems={['قوانین business validation داخل SettingsSection نگذارید']} />
      </DocSection>
    </DocPageShell>
  );
}
