'use client';

import { useState } from 'react';
import { TaavCurrencyInput, TaavFieldBlock, TaavFieldGrid } from '@repo/ui/taav/forms';
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
import { CURRENCY_INPUT_PROPS } from '@/lib/docs/component-props';

export default function CurrencyInputDocPage() {
  const [amount, setAmount] = useState<number | null>(2_500_000);

  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Forms', href: '/forms' },
        { label: 'ورودی مبلغ' },
      ]}
    >
      <DocPageHeader
        eyebrow="Form Primitive"
        title="TaavCurrencyInput"
        description="این کامپوننت برای ورود مبلغ استفاده می‌شود. عدد به‌صورت سه‌رقمی جدا می‌شود و واحد پول داخل فیلد در سمت راست نمایش داده می‌شود."
        importCode={`import { TaavCurrencyInput } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="نمای مرجع (RTL)">
        <DocPreview label="Screenshot-like demo">
          <div dir="rtl" className="w-full max-w-xl">
            <TaavFieldGrid columns={2} gap="lg" density="spacious">
              <TaavFieldBlock label="مبلغ ثابت" tooltip="مبلغ ثابت قرارداد به ریال" htmlFor="fixed-amount">
                <TaavCurrencyInput id="fixed-amount" size="lg" defaultValue={2_500_000} currency="rial" />
              </TaavFieldBlock>
              <TaavFieldBlock label="پیش‌پرداخت" tooltip="مبلغ پیش‌پرداخت به تومان" htmlFor="prepayment">
                <TaavCurrencyInput id="prepayment" size="lg" defaultValue={250_000} currency="toman" />
              </TaavFieldBlock>
            </TaavFieldGrid>
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="استفاده پایه">
        <DocPreview>
          <TaavCurrencyInput defaultValue={2_500_000} currency="rial" size="lg" />
        </DocPreview>
        <DocCodeBlock>{`<TaavCurrencyInput defaultValue={2500000} currency="rial" />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Controlled">
        <DocPreview meta={`value: ${amount ?? 'null'}`}>
          <TaavCurrencyInput
            size="lg"
            value={amount ?? undefined}
            onValueChange={setAmount}
            currency="rial"
          />
        </DocPreview>
      </DocSection>

      <DocSection title="Min / Max">
        <DocPreview>
          <TaavCurrencyInput size="lg" defaultValue={500_000} min={100_000} max={10_000_000} currency="rial" />
        </DocPreview>
        <DocGuidelines
          items={[
            'در حین تایپ، مقادیر خارج از بازه با border خطا مشخص می‌شوند',
            'در blur مقدار به min/max محدود می‌شود',
          ]}
        />
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div dir="rtl" className="grid max-w-xl gap-3">
            <TaavCurrencyInput size="lg" defaultValue={1_000_000} disabled currency="rial" />
            <TaavCurrencyInput size="lg" defaultValue={1_000_000} readOnly currency="rial" />
            <TaavCurrencyInput size="lg" defaultValue={1_000_000} invalid currency="rial" />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Light / Dark">
        <div className="grid gap-4 xl:grid-cols-2">
          <div data-taav-theme="light">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <TaavCurrencyInput size="lg" defaultValue={2_500_000} currency="rial" />
            </TaavCard>
          </div>
          <div data-taav-theme="dark">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <TaavCurrencyInput size="lg" defaultValue={2_500_000} currency="rial" />
            </TaavCard>
          </div>
        </div>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={CURRENCY_INPUT_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Affix color', value: 'var(--taav-input-affix-color)' },
            { label: 'Radius', value: 'var(--taav-input-radius-xl)' },
            { label: 'Height lg', value: 'var(--taav-input-height-lg)' },
            { label: 'Invalid', value: 'var(--taav-input-focus-ring-danger)' },
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['با TaavFieldBlock برای label و tooltip استفاده کنید', 'onValueChange عدد خام بدون جداکننده برمی‌گرداند']}
          dontItems={['مبلغ را با suffix دستی روی TaavInput نسازید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
