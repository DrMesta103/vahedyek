import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import AccountProfile from '../../../components/customer/account/AccountProfile';
import '../customer-portal.css';

export default function AccountPage() {
  return (
    <PanelLayout>
      <div className="customer-contracts-page">
        <div className="page-header">
          <h1>حساب کاربری</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>مدیریت اطلاعات شخصی و تنظیمات حساب</p>
        </div>

        <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <AccountProfile />
        </Suspense>
      </div>
    </PanelLayout>
  );
}
