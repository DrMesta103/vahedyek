import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessShareholderEditorPanel } from '../../_components/BusinessShareholderEditorPanel';

export default function BusinessShareholderNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessShareholderEditorPanel />
      </Suspense>
    </PanelLayout>
  );
}
