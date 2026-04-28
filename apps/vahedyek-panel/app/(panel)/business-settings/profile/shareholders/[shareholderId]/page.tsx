import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessShareholderEditorPanel } from '../../_components/BusinessShareholderEditorPanel';

export default async function BusinessShareholderEditPage({ params }: { params: Promise<{ shareholderId: string }> }) {
  const { shareholderId } = await params;

  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessShareholderEditorPanel shareholderId={shareholderId} />
      </Suspense>
    </PanelLayout>
  );
}
