import { Suspense } from 'react';
import PanelLayout from '../../../../../../../components/PanelLayout';
import { BusinessFloorForm } from '../../../../../_components/BusinessProjectPanel';

export default async function NewBusinessProjectFloorPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;

  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessFloorForm blockId={blockId} />
      </Suspense>
    </PanelLayout>
  );
}
