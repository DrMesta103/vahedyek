import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { BusinessShareholderEditorPanel } from '../../business-settings/profile/_components/BusinessShareholderEditorPanel';

export default function CustomerNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessShareholderEditorPanel entity="customer" />
      </Suspense>
    </PanelLayout>
  );
}
