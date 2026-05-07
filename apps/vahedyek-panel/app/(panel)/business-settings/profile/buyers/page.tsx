import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import { BusinessBuyersPanel } from '../_components/BusinessBuyersPanel';

export default function BusinessBuyersPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessBuyersPanel />
      </Suspense>
    </PanelLayout>
  );
}
