import PanelLayout from '../../../../../components/PanelLayout';
import { DiscountFlowStep } from '../../_components/DiscountFlowStep';

const DiscountFlowPage = async ({ params }: { params: Promise<{ discountId: string }> }) => {
  const { discountId } = await params;

  return (
    <PanelLayout>
      <DiscountFlowStep discountId={discountId} />
    </PanelLayout>
  );
};

export default DiscountFlowPage;
