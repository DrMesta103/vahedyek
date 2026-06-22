'use client';

import { TaavModuleCard, TaavModuleCardGrid, TaavModuleCardGridItem } from '@repo/ui/taav/business';
import {
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ModuleCardMixedOwnershipDemo, ModuleCardTwoColumnGridDemo } from '@/components/lab/ModuleCardShowcase';
import { MODULE_CARD_GRID_ITEM_PROPS, MODULE_CARD_GRID_PROPS } from '@/lib/docs/component-props';

function StateNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
      {children}
    </p>
  );
}

export default function ModuleCardGridDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'گرید کارت ماژول' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavModuleCardGrid"
        description="چیدمان responsive برای کارت‌های ماژول ERP — دو ستونه در دسکتاپ، تک‌ستونه در موبایل، با پشتیبانی span برای عرض کامل."
        importCode={`import { TaavModuleCardGrid, TaavModuleCardGridItem } from "@repo/ui/taav/business";`}
      />

      <DocSection title="گرید دو ستونه">
        <StateNote>پیش‌فرض columns=2 مطابق اسکرین‌شات‌های setup ERP.</StateNote>
        <DocPreview label="columns=2 · gap=md · responsive">
          <ModuleCardTwoColumnGridDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="عرض ترکیبی (span)">
        <StateNote>
          برای کارت full-width از <code className="lab-code">TaavModuleCardGridItem span=&#123;2&#125;</code> در گرید
          دو ستونه استفاده کنید.
        </StateNote>
        <DocPreview label="mixed full-width + half-width">
          <ModuleCardMixedOwnershipDemo />
        </DocPreview>
      </DocSection>

      <DocSection title="ستون‌ها و تراکم">
        <DocPreview label="columns=3 · density=compact">
          <div dir="rtl">
            <TaavModuleCardGrid columns={3} gap="sm" density="compact">
              {['پروفایل', 'پروژه', 'مالی', 'قرارداد', 'تایید', 'گزارش'].map((title) => (
                <TaavModuleCardGridItem key={title}>
                  <TaavModuleCard title={title} description="نمونه کارت در گرید سه‌ستونه" onClick={() => undefined} />
                </TaavModuleCardGridItem>
              ))}
            </TaavModuleCardGrid>
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props — Grid">
        <DocPropsTable rows={MODULE_CARD_GRID_PROPS} />
      </DocSection>

      <DocSection title="Props — Grid Item">
        <DocPropsTable rows={MODULE_CARD_GRID_ITEM_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Default columns', value: '2' },
            { label: 'Gap token', value: '--taav-module-card-grid-gap-md' },
            { label: 'RTL', value: 'dir=rtl روی container — جریان طبیعی RTL' },
            { label: 'Full width', value: 'GridItem span برابر columns' },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <DocGuidelines
          items={[
            'گرید فقط layout است — accessibility روی هر TaavModuleCard جداگانه',
            'ترتیب DOM همان ترتیب keyboard در RTL',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'کارت‌ها را داخل TaavModuleCardGridItem بگذارید وقتی span لازم است',
            'برای صفحات setup از columns=2 و gap=md شروع کنید',
          ]}
          dontItems={[
            'منطق business یا fetch داخل گرید نگذارید',
            'grid محلی با CSS arbitrary در apps نسازید',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
