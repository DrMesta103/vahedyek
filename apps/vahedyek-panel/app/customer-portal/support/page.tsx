import { Suspense } from 'react';
import Link from 'next/link';
import SupportTicketsList from '../../components/customer/support/SupportTicketsList';

export default function SupportPage() {
  return (
    <div className="customer-contracts-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>پشتیبانی و تیکت‌ها</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>ارتباط با کارشناسان و مشاهده تیکت‌های پشتیبانی</p>
        </div>
        <Link href="/customer-portal/support/new" className="btn-primary">
          <i className="fa fa-plus"></i>
          تیکت جدید
        </Link>
      </div>

      <Suspense fallback={<div>در حال بارگذاری...</div>}>
        <SupportTicketsList />
      </Suspense>
    </div>
  );
}
