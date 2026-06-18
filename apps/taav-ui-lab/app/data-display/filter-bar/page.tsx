'use client';

import { useState } from 'react';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavChip } from '@repo/ui/taav/data-display';
import { TaavFilterBar } from '@repo/ui/taav/data-display/interactive';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { FILTER_BAR_PROPS } from '@/lib/docs/component-props';

export default function FilterBarDocPage() {
  const [search, setSearch] = useState('');

  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'فیلتر' }]}>
      <DocPageHeader eyebrow="Filter Bar" title="TaavFilterBar" description="Shell جستجو + chip filters + actions." importCode={`import { TaavFilterBar } from "@repo/ui/taav/data-display";`} />
      <DocSection title="Responsive layout">
        <DocPreview label="RTL Preview">
          <TaavFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="جستجو در کارکنان..."
            resultCount={42}
            activeFilters={<TaavChip behavior="removable" tone="brand" onRemove={() => undefined}>فعال</TaavChip>}
            actions={<TaavButton size="sm">خروجی Excel</TaavButton>}
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={FILTER_BAR_PROPS} /></DocSection>
    </DocPageShell>
  );
}
