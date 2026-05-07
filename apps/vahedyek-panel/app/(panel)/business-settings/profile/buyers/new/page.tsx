import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessBuyerEditorPanel } from '../../_components/BusinessBuyerEditorPanel';

export default function BusinessBuyerNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessBuyerEditorPanel />
      </Suspense>
    </PanelLayout>
  );
}
