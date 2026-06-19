'use client';

import { TaavCard } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavFieldGrid, TaavInput } from '@repo/ui/taav/forms';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ScreenshotLikeBusinessForm } from '@/components/lab/FieldBlockShowcase';
import { FIELD_GRID_PROPS } from '@/lib/docs/component-props';

function GridExample({ columns }: { columns: 1 | 2 | 3 }) {
  return (
    <div dir="rtl">
      <TaavFieldGrid columns={columns} gap="lg" density="comfortable">
        <TaavFieldBlock label="نام قانونی" required tooltip="فیلد اصلی برای ثبت رسمی" htmlFor={`legal-${columns}`}>
          <TaavInput id={`legal-${columns}`} radius="xl" />
        </TaavFieldBlock>
        <TaavFieldBlock label="نام تجاری" tooltip="برای نمایش در سامانه" htmlFor={`brand-${columns}`}>
          <TaavInput id={`brand-${columns}`} radius="xl" />
        </TaavFieldBlock>
        <TaavFieldBlock label="شناسه ملی" required tooltip="برای اشخاص حقوقی اجباری است" htmlFor={`national-${columns}`}>
          <TaavInput id={`national-${columns}`} radius="xl" />
        </TaavFieldBlock>
      </TaavFieldGrid>
    </div>
  );
}

export default function FieldGridDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Forms', href: '/forms' },
        { label: 'Field Grid' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Form Layout"
        title="TaavFieldGrid"
        description="گرید ریسپانسیو مخصوص فرم‌های کسب‌وکاری که به‌صورت پیش‌فرض روی دسکتاپ دو ستونه و روی موبایل تک‌ستونه رفتار می‌کند."
        importCode={`import { TaavFieldBlock, TaavFieldGrid } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="Screenshot-like business layout">
        <DocPreview label="2-column responsive RTL" meta="default">
          <ScreenshotLikeBusinessForm />
        </DocPreview>
        <DocCodeBlock>{`<TaavFieldGrid columns={2} gap="lg" density="spacious">
  <TaavFieldBlock ... />
  <TaavFieldBlock ... />
</TaavFieldGrid>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Column examples">
        <div className="grid gap-4">
          <DocPreview label="1 column">
            <GridExample columns={1} />
          </DocPreview>
          <DocPreview label="2 columns">
            <GridExample columns={2} />
          </DocPreview>
          <DocPreview label="3 columns">
            <GridExample columns={3} />
          </DocPreview>
        </div>
      </DocSection>

      <DocSection title="Responsive behavior">
        <TaavCard variant="soft" padding="md" radius="lg">
          <p className="m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
            رفتار پیش‌فرض <code className="lab-code">responsive=true</code> است؛ یعنی فرم روی نمایشگر کوچک از یک ستون شروع می‌کند و
            از breakpoint دسکتاپ به چیدمان چندستونه برمی‌گردد. برای grid ثابت، <code className="lab-code">responsive=false</code>{' '}
            بدهید.
          </p>
        </TaavCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={FIELD_GRID_PROPS} />
      </DocSection>

      <DocSection title="Usage notes">
        <DocGuidelines
          items={[
            'در فرم‌های RTL ترتیب grid طبیعی است؛ فیلد اول در ستون راست دیده می‌شود.',
            'برای الگوی تصویری واحد، TaavFieldGrid را با TaavFieldBlock جفت کنید.',
            'gap و density را از props تغییر دهید؛ CSS صفحه‌ای برای فاصله‌ها نسازید.',
            'اگر فرم در موبایل باید یک‌ستونه بماند، responsive پیش‌فرض همان رفتار را فراهم می‌کند.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای فرم‌های دو ستونه کسب‌وکاری از TaavFieldGrid استفاده کنید.',
            'برای spacing از gap و density بهره بگیرید تا فرم در TaavUI Lab و اپ‌ها یکدست بماند.',
          ]}
          dontItems={[
            'فاصله بین فیلدها را با marginهای محلی هر صفحه کنترل نکنید.',
            'برای فرم‌های جدید business layout جداگانه با CSS سفارشی نسازید.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
