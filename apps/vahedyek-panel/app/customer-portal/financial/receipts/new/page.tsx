import { Suspense } from 'react';
import ReceiptForm from '../../../../components/customer/financial/ReceiptForm';

export default function NewReceiptPage() {
  return (
    <div className="customer-contracts-page">
      <div className="page-header">
        <h1>ثبت فیش پرداختی جدید</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>اطلاعات فیش پرداختی خود را وارد کنید</p>
      </div>

      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <ReceiptForm />
      </Suspense>
    </div>
  );
}
