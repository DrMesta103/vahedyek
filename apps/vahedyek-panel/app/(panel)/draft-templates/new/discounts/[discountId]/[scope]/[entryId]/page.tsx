import PanelLayout from '../../../../../../../components/PanelLayout';
import { DiscountEntryDetailStep } from '../../../../../../contracts/new/_components/DiscountEntryDetailStep';

const DraftTemplateDiscountEntryPage = async ({
  params,
}: {
  params: Promise<{ discountId: string; scope: 'whole' | 'itemized'; entryId: string }>;
}) => {
  const { discountId, scope, entryId } = await params;

  return (
    <PanelLayout>
      <DiscountEntryDetailStep discountId={discountId} scope={scope} entryId={entryId} />
    </PanelLayout>
  );
};

export default DraftTemplateDiscountEntryPage;
