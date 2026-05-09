import { ReactNode } from 'react';
import CustomerPortalLayout from '../components/customer/CustomerPortalLayout';
import './customer-portal.css';

export const metadata = {
  title: 'پنل خریدار',
  description: 'پنل مدیریت قراردادها و پرداخت‌های خریدار',
};

export default function CustomerPortalRootLayout({ children }: { children: ReactNode }) {
  return <CustomerPortalLayout>{children}</CustomerPortalLayout>;
}
