import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessBlockDetail } from '../../../_components/BusinessProjectPanel';

export default async function BusinessProjectBlockDetailPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;

  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessBlockDetail blockId={blockId} />
      </Suspense>
    </PanelLayout>
  );
}
