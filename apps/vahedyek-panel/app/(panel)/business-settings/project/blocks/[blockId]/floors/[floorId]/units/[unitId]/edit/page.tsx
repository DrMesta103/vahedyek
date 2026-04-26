import PanelLayout from '../../../../../../../../../../components/PanelLayout';
import { BusinessUnitForm } from '../../../../../../../../_components/BusinessProjectPanel';

export default function BusinessProjectUnitEditPage({ params }: { params: { blockId: string; floorId: string; unitId: string } }) {
  return (
    <PanelLayout>
      <BusinessUnitForm blockId={params.blockId} floorId={params.floorId} unitId={params.unitId} />
    </PanelLayout>
  );
}
