import PanelLayout from '../../../../../components/PanelLayout';
import { PenaltyDetailStep } from '../../../../contracts/new/_components/PenaltyDetailStep';

const DraftTemplatePenaltyPage = async ({ params }: { params: Promise<{ penaltyId: string }> }) => {
  const { penaltyId } = await params;

  return (
    <PanelLayout>
      <PenaltyDetailStep penaltyId={penaltyId} />
    </PanelLayout>
  );
};

export default DraftTemplatePenaltyPage;
