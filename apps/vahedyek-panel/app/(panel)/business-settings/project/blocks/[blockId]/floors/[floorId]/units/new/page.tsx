import PanelLayout from '../../../../../../../../../components/PanelLayout';
import { BusinessUnitForm } from '../../../../../../../_components/BusinessProjectPanel';

export default function BusinessProjectUnitNewPage({ params, searchParams }: { params: { blockId: string; floorId: string }; searchParams?: { category?: string } }) {
  return (
    <PanelLayout>
      <BusinessUnitForm blockId={params.blockId} floorId={params.floorId} category={searchParams?.category} />
    </PanelLayout>
  );
}
