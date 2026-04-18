import PanelLayout from '../../../../../../../components/PanelLayout';
import { DiscountEntryDetailStep } from '../../../../_components/DiscountEntryDetailStep';

const DiscountEntryDetailPage = async ({
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

export default DiscountEntryDetailPage;
