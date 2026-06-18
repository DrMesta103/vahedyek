'use client';

import { Briefcase, Building2 } from 'lucide-react';
import { useState } from 'react';
import { TaavBadge } from '@repo/ui/taav/primitives';
import { TaavOptionCard } from '@repo/ui/taav/forms';
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
import { OPTION_CARD_PROPS } from '@/lib/docs/component-props';

export default function OptionCardDocPage() {
  const [selected, setSelected] = useState('contract');

  return (
    <DocPageShell
      breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Forms', href: '/forms' }, { label: 'کارت گزینه' }]}
    >
      <DocPageHeader
        eyebrow="Form Control"
        title="TaavOptionCard"
        description="گزینه selectable کارت‌مانند — پایه business forms مثل نوع قرارداد یا policy setup."
        importCode={`import { TaavOptionCard } from "@repo/ui/taav/forms";`}
      />
      <DocApiNote />

      <DocSection title="استفاده پایه">
        <DocPreview label="RTL grid example">
          <div className="grid gap-3 md:grid-cols-2">
            <TaavOptionCard
              title="قرارداد رسمی"
              description="برای کارکنان با بیمه و مزایا"
              meta="پیشنهاد برای سازمان‌های بزرگ"
              icon={<Briefcase />}
              badge={<TaavBadge tone="brand" variant="soft" size="sm">پیشنهادی</TaavBadge>}
              selected={selected === 'contract'}
              onClick={() => setSelected('contract')}
            />
            <TaavOptionCard
              title="قرارداد پروژه‌ای"
              description="پرداخت مرحله‌ای بر اساس deliverable"
              icon={<Building2 />}
              tone="neutral"
              selected={selected === 'project'}
              onClick={() => setSelected('project')}
            />
          </div>
        </DocPreview>
        <DocCodeBlock>{`<TaavOptionCard title="قرارداد رسمی" selected={selected} onClick={...} />`}</DocCodeBlock>
      </DocSection>

      <DocSection title="inputType radio">
        <DocPreview>
          <div className="grid gap-3">
            <TaavOptionCard
              inputType="radio"
              name="base"
              value="a"
              title="پایه حقوق ثابت"
              description="مبلغ ماهانه ثابت"
              checked={selected === 'a'}
              onClick={() => setSelected('a')}
            />
            <TaavOptionCard
              inputType="radio"
              name="base"
              value="b"
              title="پایه ساعتی"
              description="محاسبه بر اساس ساعت"
              checked={selected === 'b'}
              onClick={() => setSelected('b')}
            />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="States">
        <DocPreview>
          <div className="grid gap-3 md:grid-cols-2">
            <TaavOptionCard title="invalid" description="needs attention" invalid />
            <TaavOptionCard title="disabled" description="not available" disabled />
          </div>
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={OPTION_CARD_PROPS} />
      </DocSection>

      <DocSection title="Design Specs">
        <DocSpecGrid
          items={[
            { label: 'Selected bg', value: 'var(--taav-option-card-selected-bg)' },
            { label: 'Selected border', value: 'var(--taav-option-card-selected-border)' },
            { label: 'Invalid border', value: 'var(--taav-option-card-invalid-border)' },
          ]}
        />
      </DocSection>

      <DocSection title="دسترس‌پذیری">
        <DocGuidelines items={['با inputType=radio/checkbox label/selection native حفظ می‌شود', 'title باید واضح و کوتاه باشد']} />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={['برای setup type / policy mode از option card استفاده کنید']}
          dontItems={['logic کسب‌وکار یا API call داخل TaavOptionCard نگذارید']}
        />
      </DocSection>
    </DocPageShell>
  );
}
