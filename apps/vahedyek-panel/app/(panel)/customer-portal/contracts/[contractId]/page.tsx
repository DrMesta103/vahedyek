import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import ContractDashboard from '../../../../components/customer/contracts/ContractDashboard';
import '../../customer-portal.css';

export default async function ContractDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;

  return (
    <PanelLayout>
      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <ContractDashboard contractId={contractId} />
      </Suspense>
    </PanelLayout>
  );
}
