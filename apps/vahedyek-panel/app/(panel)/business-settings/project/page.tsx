import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { BusinessProjectPanel } from '../_components/BusinessProjectPanel';

export default function BusinessProjectPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessProjectPanel />
      </Suspense>
    </PanelLayout>
  );
}
