import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessBlockDetail } from '../../../_components/BusinessProjectPanel';

export default function BusinessProjectBlockDetailPage({ params }: { params: { blockId: string } }) {
  return (
    <PanelLayout>
      <BusinessBlockDetail blockId={params.blockId} />
    </PanelLayout>
  );
}
