import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { BusinessProfileOverviewPanel } from './_components/BusinessProfileOverviewPanel';

export default function BusinessProfilePage() {
  return (
    <PanelLayout>
      <Suspense fallback={<div className="module-loading-state" aria-busy="true">در حال بارگذاری پروفایل کسب‌وکار…</div>}>
        <BusinessProfileOverviewPanel />
      </Suspense>
    </PanelLayout>
  );
}
