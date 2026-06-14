import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import BuyerFinancialReport from '../../../../../components/customer/contracts/BuyerFinancialReport';
import '../../../customer-portal.css';

export default async function BuyerFinancialReportPage({ params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;

  return (
    <PanelLayout>
      <div className="customer-contracts-page">
        <div className="page-header">
          <h1>گزارش مالی قرارداد</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            نسخه امن خریدار برای مشاهده وضعیت مالی همان قرارداد
          </p>
        </div>

        <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <BuyerFinancialReport contractId={contractId} />
        </Suspense>
      </div>
    </PanelLayout>
  );
}
