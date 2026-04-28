import PanelLayout from '../../../../../../components/PanelLayout';
import { BusinessBankAccountFormPanel } from '../../../_components/BusinessBankAccountFormPanel';

export default async function BusinessBankAccountEditPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return (
    <PanelLayout>
      <BusinessBankAccountFormPanel accountId={accountId} />
    </PanelLayout>
  );
}
