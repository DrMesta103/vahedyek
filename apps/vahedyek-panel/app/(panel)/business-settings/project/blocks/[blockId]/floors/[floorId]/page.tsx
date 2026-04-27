import PanelLayout from '../../../../../../../components/PanelLayout';
import { BusinessFloorDetail } from '../../../../../_components/BusinessProjectPanel';

export default async function BusinessProjectFloorDetailPage({ params }: { params: Promise<{ blockId: string; floorId: string }> }) {
  const { blockId, floorId } = await params;

  return (
    <PanelLayout>
      <BusinessFloorDetail blockId={blockId} floorId={floorId} />
    </PanelLayout>
  );
}
