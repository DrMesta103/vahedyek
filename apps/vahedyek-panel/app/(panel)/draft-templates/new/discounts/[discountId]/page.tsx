import PanelLayout from '../../../../../components/PanelLayout';
import { DiscountFlowStep } from '../../../../contracts/new/_components/DiscountFlowStep';

const DraftTemplateDiscountPage = async ({ params }: { params: Promise<{ discountId: string }> }) => {
  const { discountId } = await params;

  return (
    <PanelLayout>
      <DiscountFlowStep discountId={discountId} />
    </PanelLayout>
  );
};

export default DraftTemplateDiscountPage;
