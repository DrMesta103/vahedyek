'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface PanelLayoutProps {
  children: React.ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  const pathname = usePathname();

  let activeItem = 'complex';
  let breadcrumb = 'جزئیات مجتمع';

  if (pathname.startsWith('/draft-templates')) {
    activeItem = 'draft-templates';
    breadcrumb = 'فهرست قالب‌های پیش‌نویس';
    if (pathname.includes('/new')) {
      breadcrumb = 'قالب پیش‌نویس جدید';
    }
  } else if (pathname.startsWith('/contracts')) {
    activeItem = 'contracts';
    breadcrumb = 'فهرست قراردادها';
    if (pathname.includes('/new')) {
      breadcrumb = 'قرارداد جدید';
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeItem={activeItem} />
      <main className="main-content">
        <div className="top-header">
          <div></div>
          <div className="breadcrumb">
            خانه <i className="fa fa-chevron-left"></i> {breadcrumb}
          </div>
        </div>
        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}
