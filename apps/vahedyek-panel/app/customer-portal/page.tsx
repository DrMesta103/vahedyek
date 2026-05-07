import { Suspense } from 'react';
import CustomerDashboard from '../components/customer/CustomerDashboard';

export default function CustomerPortalHomePage() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <CustomerDashboard />
    </Suspense>
  );
}
