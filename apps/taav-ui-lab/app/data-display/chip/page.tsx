'use client';

import { useState } from 'react';
import { TaavChip } from '@repo/ui/taav/data-display';
import { TaavChipGroup } from '@repo/ui/taav/data-display/interactive';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection, DocSpecGrid } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { CHIP_PROPS } from '@/lib/docs/component-props';

export default function ChipDocPage() {
  const [selected, setSelected] = useState<string[]>(['tehran']);

  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'چیپ' }]}>
      <DocPageHeader
        eyebrow="Chip System"
        title="TaavChip & TaavChipGroup"
        description="فیلتر، tag، انتخاب removable و interactive chip. برای انتخاب گزینه‌های فرم فقط از TaavChoiceChipGroup استفاده کنید."
        importCode={`import { TaavChip, TaavChipGroup } from "@repo/ui/taav/data-display";`}
      />
      <DocSection title="Variants & behaviors">
        <DocPreview label="RTL Preview">
          <div className="flex flex-wrap gap-2">
            <TaavChip>static</TaavChip>
            <TaavChip behavior="selectable" selected tone="brand">
              selected
            </TaavChip>
            <TaavChip behavior="removable" onRemove={() => undefined}>
              removable
            </TaavChip>
            <TaavChip loading>loading</TaavChip>
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="TaavChipGroup">
        <DocPreview>
          <TaavChipGroup
            selectionMode="multiple"
            value={selected}
            onValueChange={(v) => setSelected(Array.isArray(v) ? v : [v])}
            options={[
              { label: 'تهران', value: 'tehran', tone: 'brand' },
              { label: 'اصفهان', value: 'isfahan' },
              { label: 'شیراز', value: 'shiraz' },
            ]}
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Props">
        <DocPropsTable rows={CHIP_PROPS} />
      </DocSection>
      <DocSection title="Design Specs">
        <DocSpecGrid items={[{ label: 'Height md', value: 'var(--taav-chip-height-md)' }, { label: 'Selected ring', value: 'var(--taav-chip-selected-ring)' }]} />
      </DocSection>
      <DocSection title="Do / Don’t">
        <DocDoDont
          doItems={['برای filter/tag interactive از TaavChip استفاده کنید']}
          dontItems={[
            'برای انتخاب گزینه‌های فرم، TaavChip را به‌جای TaavChoiceChipGroup استفاده نکنید',
            'TaavBadge را به‌جای chip clickable استفاده نکنید',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
