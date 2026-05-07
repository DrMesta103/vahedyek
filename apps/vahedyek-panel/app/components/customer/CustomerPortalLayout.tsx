'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import CustomerSidebar from './CustomerSidebar';
import PageDocsWidget from '../PageDocsWidget';

interface CustomerPortalLayoutProps {
  children: ReactNode;
}

type Crumb = {
  label: string;
  href?: string;
};

function buildCustomerBreadcrumb(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const trail: Crumb[] = [];

  // customer-portal
  if (segments[0] === 'customer-portal') {
    trail.push({ label: 'پنل خریدار', href: '/customer-portal' });

    // contracts
    if (segments[1] === 'contracts') {
      trail.push({
        label: 'قراردادهای من',
        href: pathname === '/customer-portal/contracts' ? undefined : '/customer-portal/contracts',
      });

      if (segments[2] && segments[2] !== 'new') {
        const contractId = segments[2];
        trail.push({
          label: `قرارداد ${contractId}`,
          href: segments[3] ? `/customer-portal/contracts/${contractId}` : undefined,
        });

        if (segments[3] === 'text') trail.push({ label: 'متن قرارداد' });
        if (segments[3] === 'due-dates') trail.push({ label: 'سررسیدها' });
        if (segments[3] === 'receipts') trail.push({ label: 'فیش‌های پرداختی' });
        if (segments[3] === 'financial-report') trail.push({ label: 'گزارش مالی' });
        if (segments[3] === 'documents') trail.push({ label: 'مدارک قرارداد' });
        if (segments[3] === 'payment-offers') trail.push({ label: 'روش‌های پرداخت' });
      }
    }

    // financial
    if (segments[1] === 'financial') {
      trail.push({
        label: 'مدیریت مالی',
        href: pathname === '/customer-portal/financial' ? undefined : '/customer-portal/financial',
      });

      if (segments[2] === 'receipts') {
        trail.push({
          label: 'فیش‌های پرداختی',
          href: segments[3] === 'new' ? '/customer-portal/financial/receipts' : undefined,
        });
        if (segments[3] === 'new') trail.push({ label: 'ثبت فیش جدید' });
      }
      if (segments[2] === 'payment-methods') trail.push({ label: 'روش‌های پرداخت بدهی' });
      if (segments[2] === 'due-dates') trail.push({ label: 'سررسیدهای من' });
      if (segments[2] === 'overview') trail.push({ label: 'گزارش مالی کلی' });
    }

    // support
    if (segments[1] === 'support') {
      trail.push({
        label: 'پشتیبانی',
        href: pathname === '/customer-portal/support' ? undefined : '/customer-portal/support',
      });

      if (segments[2] === 'new') trail.push({ label: 'تیکت جدید' });
      if (segments[2] && segments[2] !== 'new') trail.push({ label: `تیکت ${segments[2]}` });
    }

    // account
    if (segments[1] === 'account') {
      trail.push({ label: 'حساب کاربری' });
    }
  }

  return trail;
}

export default function CustomerPortalLayout({ children }: CustomerPortalLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/customer-portal';

  const { activeItem, trail } = useMemo(() => {
    if (pathname === '/customer-portal') {
      return {
        activeItem: 'home',
        trail: [{ label: 'داشبورد' }],
      };
    }

    if (pathname.startsWith('/customer-portal/contracts')) {
      return {
        activeItem: 'contracts',
        trail: buildCustomerBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/customer-portal/financial')) {
      return {
        activeItem: 'financial',
        trail: buildCustomerBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/customer-portal/support')) {
      return {
        activeItem: 'support',
        trail: buildCustomerBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/customer-portal/account')) {
      return {
        activeItem: 'account',
        trail: buildCustomerBreadcrumb(pathname),
      };
    }

    return {
      activeItem: 'home',
      trail: [{ label: 'داشبورد' }],
    };
  }, [pathname]);

  return (
    <div className="app-shell customer-portal-shell">
      <PageDocsWidget />
      <CustomerSidebar activeItem={activeItem} />
      <main className="main-content">
        <div className="main-stage">
          <div className="main-stage-content">
            {!isHomePage && (
              <div className="top-header">
                <div className="breadcrumb">
                  {[{ label: 'خانه', href: '/customer-portal' }, ...trail].reverse().map((item, index, items) => (
                    <span key={`${item.label}-${index}`} className="breadcrumb-item">
                      {item.href && index < items.length - 1 ? (
                        <Link href={item.href} className="breadcrumb-link">
                          {item.label}
                        </Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                      {index < items.length - 1 ? <i className="fa fa-chevron-left"></i> : null}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="content-body">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
