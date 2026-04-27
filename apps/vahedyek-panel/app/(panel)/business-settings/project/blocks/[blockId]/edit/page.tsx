import PanelLayout from '../../../../../../components/PanelLayout';
import { BusinessBlockForm } from '../../../../_components/BusinessProjectPanel';

export default async function EditBusinessProjectBlockPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;

  return (
    <PanelLayout>
      <BusinessBlockForm blockId={blockId} />
    </PanelLayout>
  );
}
