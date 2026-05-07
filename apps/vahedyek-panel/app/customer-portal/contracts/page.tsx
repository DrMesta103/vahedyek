import { Suspense } from 'react';
import ContractsList from '../../components/customer/contracts/ContractsList';

export default function CustomerContractsPage() {
  return (
    <div className="customer-contracts-page">
      <div className="page-header">
        <h1>قراردادهای من</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>لیست تمام قراردادها و دارایی‌های شما</p>
      </div>

      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <ContractsList />
      </Suspense>
    </div>
  );
}
