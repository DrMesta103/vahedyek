'use client';

import { useState } from 'react';
import { TaavFieldBlock, TaavPercentageInput } from '@repo/ui/taav/forms';
import { TaavCard } from '@repo/ui/taav/primitives';
import {
  DocApiNote,
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { PERCENTAGE_INPUT_PROPS } from '@/lib/docs/component-props';

export default function BusinessPercentageInputDocPage() {
  const [percent, setPercent] = useState<number | null>(4);

  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'ورودی درصد' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavPercentageInput"
        description="ورودی درصد برای فرم‌های کسب‌وکار — علامت % داخل فیلد و محدوده min/max قابل تنظیم. برای پیش‌پرداخت قرارداد، جریمه، تخفیف و نرخ‌های حقوقی."
        importCode={`import { TaavPercentageInput } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="نمای مرجع (RTL)">
        <DocPreview label="Screenshot-like demo — قرارداد">
          <div dir="rtl" className="w-full max-w-xl">
            <TaavFieldBlock
              label="درصدی از مبلغ کل قرارداد"
              tooltip="درصد پیش‌پرداخت از کل مبلغ"
              htmlFor="contract-percent"
            >
              <TaavPercentageInput id="contract-percent" size="lg" defaultValue={4} min={0} max={100} />
            </TaavFieldBlock>
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="استفاده پایه">
        <DocPreview>
          <TaavPercentageInput defaultValue={4} size="lg" />
        </DocPreview>
        <DocCodeBlock>{`<TaavPercentageInput defaultValue={4} min={0} max={100} />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Controlled">
        <DocPreview meta={`value: ${percent ?? 'null'}`}>
          <TaavPercentageInput size="lg" value={percent ?? undefined} onValueChange={setPercent} />
        </DocPreview>
      </DocSection>

      <DocSection title="Min / Max">
        <DocPreview>
          <div dir="rtl" className="grid max-w-xl gap-3">
            <TaavFieldBlock label="درصد جریمه" htmlFor="penalty-percent">
              <TaavPercentageInput id="penalty-percent" size="lg" defaultValue={15} min={0} max={30} />
            </TaavFieldBlock>
            <TaavFieldBlock label="درصد تخفیف" htmlFor="discount-percent">
              <TaavPercentageInput id="discount-percent" size="lg" defaultValue={10} min={0} max={50} />
            </TaavFieldBlock>
          </div>
        </DocPreview>
        <DocGuidelines
          items={[
            'پیش‌فرض min=0 و max=100 است',
            'مقادیر خارج از بازه در blur محدود می‌شوند',
          ]}
        />
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid max-w-xl gap-3">
            <TaavPercentageInput size="lg" defaultValue={25} disabled />
            <TaavPercentageInput size="lg" defaultValue={25} readOnly />
            <TaavPercentageInput size="lg" defaultValue={25} invalid />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Light / Dark">
        <div className="grid gap-4 xl:grid-cols-2">
          <div data-taav-theme="light">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <TaavPercentageInput size="lg" defaultValue={4} />
            </TaavCard>
          </div>
          <div data-taav-theme="dark">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <TaavPercentageInput size="lg" defaultValue={4} />
            </TaavCard>
          </div>
        </div>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={PERCENTAGE_INPUT_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Affix', value: '% (start, LTR shell)' },
            { label: 'Radius', value: 'var(--taav-input-radius-xl)' },
            { label: 'Default range', value: '0 – 100' },
            { label: 'Invalid', value: 'var(--taav-input-focus-ring-danger)' },
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای درصدهای قرارداد از min/max صریح استفاده کنید',
            'داخل TaavFieldBlock برای label و tooltip ثابت قرار دهید',
          ]}
          dontItems={[
            'علامت % را به صورت دستی به TaavInput اضافه نکنید',
            'validation یا business logic داخل کامپوننت ننویسید',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
