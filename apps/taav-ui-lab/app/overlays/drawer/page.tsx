'use client';

import { TaavButton } from '@repo/ui/taav/primitives';
import {
  TaavDrawer,
  TaavDrawerContent,
  TaavDrawerDescription,
  TaavDrawerFooter,
  TaavDrawerHeader,
  TaavDrawerTitle,
  TaavDrawerTrigger,
} from '@repo/ui/taav/overlays';
import {
  DocApiNote,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { DRAWER_PROPS } from '@/lib/docs/component-props';

export default function DrawerDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Overlays', href: '/overlays' }, { label: 'دراور' }]}>
      <DocPageHeader
        eyebrow="Overlay Primitive"
        title="TaavDrawer"
        description="پنل کناری RTL — default side=`left` (لبه شروع در RTL). مناسب فیلتر و جزئیات."
        importCode={`import { TaavDrawer, TaavDrawerContent } from "@repo/ui/taav/overlays";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه (RTL default: left)">
        <DocPreview label="RTL Preview">
          <TaavDrawer>
            <TaavDrawerTrigger asChild>
              <TaavButton variant="outline" tone="neutral">
                باز کردن فیلترها
              </TaavButton>
            </TaavDrawerTrigger>
            <TaavDrawerContent side="left" size="md">
              <TaavDrawerHeader>
                <TaavDrawerTitle>فیلترها</TaavDrawerTitle>
                <TaavDrawerDescription>فیلترهای لیست کارکنان</TaavDrawerDescription>
              </TaavDrawerHeader>
              <p className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">محتوای فیلتر...</p>
              <TaavDrawerFooter>
                <TaavButton width="full">اعمال</TaavButton>
              </TaavDrawerFooter>
            </TaavDrawerContent>
          </TaavDrawer>
        </DocPreview>
      </DocSection>

      <DocSection title="Sizes">
        <DocPreview>
          <TaavDrawer>
            <TaavDrawerTrigger asChild>
              <TaavButton size="sm">Drawer lg</TaavButton>
            </TaavDrawerTrigger>
            <TaavDrawerContent side="left" size="lg" variant="soft">
              <TaavDrawerHeader>
                <TaavDrawerTitle>جزئیات قرارداد</TaavDrawerTitle>
              </TaavDrawerHeader>
            </TaavDrawerContent>
          </TaavDrawer>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={DRAWER_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Width md', value: 'var(--taav-drawer-width-md)' },
            { label: 'Default side', value: 'left (RTL start edge)' },
            { label: 'Shadow', value: 'var(--taav-overlay-shadow)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['focus trap و Escape مثل Dialog', 'برای quick edit/detail در VahedYek مناسب است']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont doItems={['برای filter panel از TaavDrawer استفاده کنید']} dontItems={['sidebar ثابت app را با drawer اشتباه نگیرید']} />
      </DocSection>
    </DocPageShell>
  );
}
