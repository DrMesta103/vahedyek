import PanelLayout from '../../../../../../../components/PanelLayout';
import { BusinessFloorDetail } from '../../../../../_components/BusinessProjectPanel';

export default function BusinessProjectFloorDetailPage({ params }: { params: { blockId: string; floorId: string } }) {
  return (
    <PanelLayout>
      <BusinessFloorDetail blockId={params.blockId} floorId={params.floorId} />
    </PanelLayout>
  );
}
