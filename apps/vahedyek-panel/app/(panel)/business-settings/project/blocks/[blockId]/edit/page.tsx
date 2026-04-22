import PanelLayout from '../../../../../../components/PanelLayout';
import { BusinessBlockForm } from '../../../../_components/BusinessProjectPanel';

export default function EditBusinessProjectBlockPage({ params }: { params: { blockId: string } }) {
  return (
    <PanelLayout>
      <BusinessBlockForm blockId={params.blockId} />
    </PanelLayout>
  );
}
