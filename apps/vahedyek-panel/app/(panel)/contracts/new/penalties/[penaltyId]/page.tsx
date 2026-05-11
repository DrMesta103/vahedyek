import PanelLayout from '../../../../../components/PanelLayout';
import { ContractFlowExitBackBar } from '../../_components/ContractFlowExitBackBar';
import { PenaltyDetailStep } from '../../_components/PenaltyDetailStep';

const PenaltyDetailPage = async ({ params }: { params: Promise<{ penaltyId: string }> }) => {
  const { penaltyId } = await params;

  return (
    <PanelLayout>
      <ContractFlowExitBackBar layout="page" />
      <PenaltyDetailStep penaltyId={penaltyId} />
    </PanelLayout>
  );
};

export default PenaltyDetailPage;
