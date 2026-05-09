import PanelLayout from '../../../../../components/PanelLayout';
import { ContractFlowExitBackBar } from '../../../../contracts/new/_components/ContractFlowExitBackBar';
import { PenaltyDetailStep } from '../../../../contracts/new/_components/PenaltyDetailStep';

const DraftTemplatePenaltyPage = async ({ params }: { params: Promise<{ penaltyId: string }> }) => {
  const { penaltyId } = await params;

  return (
    <PanelLayout>
      <ContractFlowExitBackBar layout="page" />
      <PenaltyDetailStep penaltyId={penaltyId} />
    </PanelLayout>
  );
};

export default DraftTemplatePenaltyPage;
