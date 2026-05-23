import { Suspense } from 'react';
import { listOrganizationUnits } from '../../lib/data';
import { OrganizationUnitsPageClient } from './_components/OrganizationUnitsPageClient';

export default async function OrganizationUnitsPage() {
  const items = await listOrganizationUnits();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <Suspense fallback={null}>
        <OrganizationUnitsPageClient
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
          }))}
        />
      </Suspense>
    </div>
  );
}
