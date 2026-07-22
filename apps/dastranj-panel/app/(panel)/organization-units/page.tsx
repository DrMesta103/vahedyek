import { Suspense } from 'react';
import { ShieldX } from 'lucide-react';
import { getOrganizationStructureOverview, getOrganizationUnitCreateOptions } from '../../lib/data';
import { getOrganizationUnitAccess } from '../../lib/organization-unit-access';
import { OrganizationUnitsPageClient } from './_components/OrganizationUnitsPageClient';

export default async function OrganizationUnitsPage() {
  const access = await getOrganizationUnitAccess();
  if (!access.canView) {
    return <section className="org-empty-state" dir="rtl" lang="fa"><ShieldX/><h1>شما دسترسی مشاهده واحدهای سازمانی را ندارید.</h1><p>برای دریافت دسترسی با مدیر کسب‌وکار خود تماس بگیرید.</p></section>;
  }
  const [overview, createOptions] = await Promise.all([
    getOrganizationStructureOverview(),
    access.canCreate ? getOrganizationUnitCreateOptions() : Promise.resolve({ units: [], employees: [], templates: [], autoCode: { available: false as const, patternName: null, preview: null } }),
  ]);

  return (
    <div className="page-stack module-page organization-structure-page" dir="rtl" lang="fa">
      <Suspense fallback={null}>
        <OrganizationUnitsPageClient
          items={JSON.parse(JSON.stringify(overview.items))}
          access={overview.access}
          createOptions={createOptions}
        />
      </Suspense>
    </div>
  );
}
