import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import DueDatesList from '../../../components/customer/financial/DueDatesList';
import '../customer-portal.css';

export default function DueDatesPage() {
  return (
    <PanelLayout>
      <div className="customer-contracts-page">
        <div className="page-header">
          <h1>سررسیدهای من</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>لیست تمام اقساط و سررسیدهای پرداخت</p>
        </div>

        <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <DueDatesList />
        </Suspense>
      </div>
    </PanelLayout>
  );
}
