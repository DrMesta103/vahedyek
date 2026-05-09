import PanelLayout from '../../../../../components/PanelLayout';
import { ContractFlowExitBackBar } from '../../_components/ContractFlowExitBackBar';
import { DiscountFlowStep } from '../../_components/DiscountFlowStep';

const DiscountFlowPage = async ({ params }: { params: Promise<{ discountId: string }> }) => {
  const { discountId } = await params;

  return (
    <PanelLayout>
      <ContractFlowExitBackBar layout="page" />
      <DiscountFlowStep discountId={discountId} />
    </PanelLayout>
  );
};

export default DiscountFlowPage;
