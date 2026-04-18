import PanelLayout from '../../../../../components/PanelLayout';
import { PenaltyDetailStep } from '../../_components/PenaltyDetailStep';

const PenaltyDetailPage = async ({ params }: { params: Promise<{ penaltyId: string }> }) => {
  const { penaltyId } = await params;

  return (
    <PanelLayout>
      <PenaltyDetailStep penaltyId={penaltyId} />
    </PanelLayout>
  );
};

export default PenaltyDetailPage;
