'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModuleListRow } from '../../../components/module-page/ModuleListRow';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
import { deleteOrganizationUnitAction } from '../../../lib/actions';
import { CreateOrganizationUnitDialog } from './CreateOrganizationUnitDialog';

export type OrganizationUnitListItem = {
  id: string;
  title: string;
  description: string | null;
};

type OrganizationUnitsPageClientProps = {
  items: OrganizationUnitListItem[];
};

export function OrganizationUnitsPageClient({ items }: OrganizationUnitsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const openCreateDialog = () => setCreateDialogOpen(true);

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    if (searchParams.get('create') === '1') {
      router.replace('/organization-units');
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
        breadcrumbs={panelBreadcrumbs('واحد سازمانی')}
        title="واحدهای سازمانی"
        subtitle="فهرست ساده‌ای واحدهای سازمانی برای مدیریت سریع‌تر."
        addLabel="افزودن واحد سازمانی"
        onAddClick={openCreateDialog}
      />

      <div className="module-page-list">
        {items.map((item) => (
          <ModuleListRow
            key={item.id}
            title={item.title}
            description={item.description?.trim() ? `توضیحات : ${item.description}` : undefined}
            editHref={`/organization-units/${item.id}/edit`}
            deleteAction={deleteOrganizationUnitAction}
            deleteId={item.id}
            deleteTitle="حذف واحد سازمانی"
            deleteDescription={`آیا از حذف واحد «${item.title}» مطمئن هستید؟`}
          />
        ))}
      </div>

      <CreateOrganizationUnitDialog open={createDialogOpen} onClose={closeCreateDialog} />
    </>
  );
}
