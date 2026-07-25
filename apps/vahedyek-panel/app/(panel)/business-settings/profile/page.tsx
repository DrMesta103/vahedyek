import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { BusinessProfileOverviewPanel } from './_components/BusinessProfileOverviewPanel';

export const dynamic = 'force-dynamic';

export default function BusinessProfilePage() {
  return (
    <Suspense fallback={<div className="module-loading-state" aria-busy="true">در حال بارگذاری پروفایل کسب‌وکار…</div>}>
      <PanelLayout>
        <BusinessProfileOverviewPanel />
      </PanelLayout>
    </Suspense>
  );
}
