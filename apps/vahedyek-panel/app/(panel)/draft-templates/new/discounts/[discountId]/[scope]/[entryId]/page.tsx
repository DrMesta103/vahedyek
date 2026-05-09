import PanelLayout from '../../../../../../../components/PanelLayout';
import { ContractFlowExitBackBar } from '../../../../../../contracts/new/_components/ContractFlowExitBackBar';
import { DiscountEntryDetailStep } from '../../../../../../contracts/new/_components/DiscountEntryDetailStep';

const DraftTemplateDiscountEntryPage = async ({
  params,
}: {
  params: Promise<{ discountId: string; scope: 'whole' | 'itemized'; entryId: string }>;
}) => {
  const { discountId, scope, entryId } = await params;

  return (
    <PanelLayout>
      <ContractFlowExitBackBar layout="page" />
      <DiscountEntryDetailStep discountId={discountId} scope={scope} entryId={entryId} />
    </PanelLayout>
  );
};

export default DraftTemplateDiscountEntryPage;
