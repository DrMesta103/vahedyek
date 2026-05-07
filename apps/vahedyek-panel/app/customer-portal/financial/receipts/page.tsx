import { Suspense } from 'react';
import Link from 'next/link';
import ReceiptsList from '../../../components/customer/financial/ReceiptsList';

export default function ReceiptsPage() {
  return (
    <div className="customer-contracts-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>فیش‌های پرداختی</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>لیست تمام فیش‌های پرداختی ثبت شده</p>
        </div>
        <Link href="/customer-portal/financial/receipts/new" className="btn-primary">
          <i className="fa fa-plus"></i>
          ثبت فیش جدید
        </Link>
      </div>

      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <ReceiptsList />
      </Suspense>
    </div>
  );
}
