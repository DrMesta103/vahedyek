import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessBlockForm } from '../../../_components/BusinessProjectPanel';

export default function NewBusinessProjectBlockPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessBlockForm />
      </Suspense>
    </PanelLayout>
  );
}
