import PanelLayout from '../../../../../../../components/PanelLayout';
import { BusinessFloorForm } from '../../../../../_components/BusinessProjectPanel';

export default function NewBusinessProjectFloorPage({ params }: { params: { blockId: string } }) {
  return (
    <PanelLayout>
      <BusinessFloorForm blockId={params.blockId} />
    </PanelLayout>
  );
}
