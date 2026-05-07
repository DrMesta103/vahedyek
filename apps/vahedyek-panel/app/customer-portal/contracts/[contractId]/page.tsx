import { Suspense } from 'react';
import ContractDashboard from '../../../components/customer/contracts/ContractDashboard';

export default async function ContractDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;

  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <ContractDashboard contractId={contractId} />
    </Suspense>
  );
}
