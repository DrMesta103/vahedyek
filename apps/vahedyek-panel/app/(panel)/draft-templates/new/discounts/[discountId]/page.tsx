import PanelLayout from '../../../../../components/PanelLayout';
import { ContractFlowExitBackBar } from '../../../../contracts/new/_components/ContractFlowExitBackBar';
import { DiscountFlowStep } from '../../../../contracts/new/_components/DiscountFlowStep';

const DraftTemplateDiscountPage = async ({ params }: { params: Promise<{ discountId: string }> }) => {
  const { discountId } = await params;

  return (
    <PanelLayout>
      <ContractFlowExitBackBar layout="page" />
      <DiscountFlowStep discountId={discountId} />
    </PanelLayout>
  );
};

export default DraftTemplateDiscountPage;
