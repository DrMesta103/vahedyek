import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessBlockDetail } from '../../../_components/BusinessProjectPanel';

export default async function BusinessProjectBlockDetailPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;

  return (
    <PanelLayout>
      <BusinessBlockDetail blockId={blockId} />
    </PanelLayout>
  );
}
