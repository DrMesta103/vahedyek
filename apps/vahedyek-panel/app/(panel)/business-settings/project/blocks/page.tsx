import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import { BusinessBlocksPanel } from '../../_components/BusinessProjectPanel';

export default function BusinessProjectBlocksPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessBlocksPanel />
      </Suspense>
    </PanelLayout>
  );
}
