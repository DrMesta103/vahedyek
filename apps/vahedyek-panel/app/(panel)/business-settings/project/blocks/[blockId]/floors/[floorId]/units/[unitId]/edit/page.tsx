import PanelLayout from '../../../../../../../../../../components/PanelLayout';
import { BusinessUnitForm } from '../../../../../../../../_components/BusinessProjectPanel';

export default async function BusinessProjectUnitEditPage({ params }: { params: Promise<{ blockId: string; floorId: string; unitId: string }> }) {
  const { blockId, floorId, unitId } = await params;

  return (
    <PanelLayout>
      <BusinessUnitForm blockId={blockId} floorId={floorId} unitId={unitId} />
    </PanelLayout>
  );
}
