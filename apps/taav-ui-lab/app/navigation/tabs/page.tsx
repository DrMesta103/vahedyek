'use client';

import { TaavCard } from '@repo/ui/taav/primitives';
import { TaavTabs, TaavTabsContent, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import {
  DocApiNote,
  DocDoDont,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { TABS_PROPS } from '@/lib/docs/component-props';

export default function TabsDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Navigation', href: '/navigation' }, { label: 'تب‌ها' }]}>
      <DocPageHeader
        eyebrow="Navigation Primitive"
        title="TaavTabs"
        description="ناوبری بخش‌های داخل صفحه — settings، details، profile."
        importCode={`import { TaavTabs, TaavTabsList, TaavTabsTrigger, TaavTabsContent } from "@repo/ui/taav/navigation";`}
      />
      <DocApiNote />

      <DocSection title="Underline (default)">
        <DocPreview label="RTL Preview">
          <TaavTabs defaultValue="general">
            <TaavTabsList variant="underline" size="md" tone="brand">
              <TaavTabsTrigger value="general" variant="underline">
                عمومی
              </TaavTabsTrigger>
              <TaavTabsTrigger value="security" variant="underline">
                امنیت
              </TaavTabsTrigger>
              <TaavTabsTrigger value="billing" variant="underline">
                صورتحساب
              </TaavTabsTrigger>
            </TaavTabsList>
            <TaavTabsContent value="general">
              <TaavCard variant="soft" padding="md" radius="lg">
                تنظیمات عمومی سازمان
              </TaavCard>
            </TaavTabsContent>
            <TaavTabsContent value="security">
              <TaavCard variant="soft" padding="md" radius="lg">
                سیاست‌های امنیتی
              </TaavCard>
            </TaavTabsContent>
            <TaavTabsContent value="billing">
              <TaavCard variant="soft" padding="md" radius="lg">
                اطلاعات صورتحساب
              </TaavCard>
            </TaavTabsContent>
          </TaavTabs>
        </DocPreview>
      </DocSection>

      <DocSection title="Pill variant">
        <DocPreview>
          <TaavTabs defaultValue="a">
            <TaavTabsList variant="pill">
              <TaavTabsTrigger value="a" variant="pill">
                روزانه
              </TaavTabsTrigger>
              <TaavTabsTrigger value="b" variant="pill">
                هفتگی
              </TaavTabsTrigger>
            </TaavTabsList>
            <TaavTabsContent value="a">نمای روزانه</TaavTabsContent>
            <TaavTabsContent value="b">نمای هفتگی</TaavTabsContent>
          </TaavTabs>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={TABS_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Height md', value: 'var(--taav-tabs-height-md)' },
            { label: 'Indicator', value: 'var(--taav-tabs-indicator)' },
            { label: 'Selected bg', value: 'var(--taav-tabs-selected-bg)' },
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای section navigation در settings از Tabs استفاده کنید']} dontItems={['tab row سفارشی در VahedYek نسازید']} />
      </DocSection>
    </DocPageShell>
  );
}
