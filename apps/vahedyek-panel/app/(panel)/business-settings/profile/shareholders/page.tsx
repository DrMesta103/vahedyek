import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import { BusinessShareholdersPanel } from '../_components/BusinessShareholdersPanel';

export default function BusinessShareholdersPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessShareholdersPanel />
      </Suspense>
    </PanelLayout>
  );
}
