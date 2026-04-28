import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessShareholderEditorPanel } from '../../_components/BusinessShareholderEditorPanel';

export default async function BusinessShareholderEditPage({ params }: { params: Promise<{ shareholderId: string }> }) {
  const { shareholderId } = await params;

  return (
    <PanelLayout>
      <BusinessShareholderEditorPanel shareholderId={shareholderId} />
    </PanelLayout>
  );
}
