'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
import { requestReasonCategories, requestReasonLabels } from '../../../lib/constants';
import { CreateRequestReasonDialog } from './CreateRequestReasonDialog';
import { RequestReasonsClient, type RequestReasonListItem } from './RequestReasonsClient';

type RequestReasonCategory = keyof typeof requestReasonLabels;

type RequestReasonsPageClientProps = {
  items: RequestReasonListItem[];
  activeCategory: RequestReasonCategory;
};

function RequestReasonsPageClientInner({ items, activeCategory }: RequestReasonsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const openCreateDialog = () => setCreateDialogOpen(true);

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('create') === '1') {
      params.delete('create');
      const query = params.toString();
      router.replace(query ? `/request-reasons?${query}` : '/request-reasons');
    }
  };

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setCreateDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('دلایل درخواست')}
        title="دلایل درخواست"
        subtitle="مدیریت علت‌ها با ترتیب‌دهی، فعال‌سازی و ویرایش سریع."
        addLabel="افزودن علت درخواست"
        onAddClick={openCreateDialog}
      />

      <RequestReasonsClient items={items} activeCategory={activeCategory} onAddClick={openCreateDialog} />

      <CreateRequestReasonDialog open={createDialogOpen} category={activeCategory} onClose={closeCreateDialog} />
    </>
  );
}

export function RequestReasonsPageClient(props: RequestReasonsPageClientProps) {
  return (
    <Suspense fallback={null}>
      <RequestReasonsPageClientInner {...props} />
    </Suspense>
  );
}
