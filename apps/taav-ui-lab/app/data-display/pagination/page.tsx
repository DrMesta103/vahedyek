'use client';

import { useState } from 'react';
import { TaavPagination } from '@repo/ui/taav/data-display/interactive';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { PAGINATION_PROPS } from '@/lib/docs/component-props';

export default function PaginationDocPage() {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(20);

  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'صفحه‌بندی' }]}>
      <DocPageHeader eyebrow="Pagination" title="TaavPagination" description="صفحه‌بندی controlled — RTL prev/next." importCode={`import { TaavPagination } from "@repo/ui/taav/data-display";`} />
      <DocSection title="Controlled">
        <DocPreview label="RTL Preview">
          <TaavPagination page={page} totalPages={8} totalItems={156} pageSize={pageSize} showPageSize showTotal onPageChange={setPage} onPageSizeChange={setPageSize} />
        </DocPreview>
      </DocSection>
      <DocSection title="Minimal">
        <DocPreview>
          <TaavPagination variant="minimal" page={1} totalPages={5} onPageChange={() => undefined} showTotal={false} />
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={PAGINATION_PROPS} /></DocSection>
    </DocPageShell>
  );
}
