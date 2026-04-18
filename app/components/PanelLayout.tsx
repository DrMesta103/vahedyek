
'use client';

import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

interface PanelLayoutProps {
  children: React.ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  const pathname = usePathname();
  
  let activeItem = 'complex'; // Default
  let breadcrumb = 'جزئیات مجتمع'; // Default

  if (pathname.startsWith('/contracts')) {
    activeItem = 'contracts';
    breadcrumb = 'فهرست قراردادها';
    if (pathname.includes('/new')) {
      breadcrumb = 'قرارداد جدید';
    }
  }
  // You can add more conditions for other routes here

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
        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  );
}
