'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getActiveNavigationItem } from '../lib/navigation';
import { OrbitMenu } from './OrbitMenu';
import PageDocsWidget from './PageDocsWidget';
import { minimalScrollClass } from './MinimalScroll';
import { Sidebar } from './Sidebar';

export function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeItem = getActiveNavigationItem(pathname);
  const showOrbitMenu = pathname === '/';
  const isDevDocThreadsPage = pathname.startsWith('/dev-doc-threads');
  const lockMainSidebar =
    pathname === '/draft-templates/new' ||
    pathname.startsWith('/draft-templates/new/') ||
    pathname === '/business-settings/payroll-attendance';

  return (
    <div className="app-shell">
      <PageDocsWidget />
      <Sidebar
        activeItem={activeItem.id}
        forceCollapsed={lockMainSidebar}
        lockCollapsed={lockMainSidebar}
      />
      {showOrbitMenu ? (
        <main className={minimalScrollClass('vertical', 'main-content home-main-content')}>
          <OrbitMenu activeItem={activeItem.id} />
          {children ? (
            <div className="main-stage">
              <div className="main-stage-content">
                <div className="content-body dashboard-home-body">{children}</div>
              </div>
            </div>
          ) : null}
        </main>
      ) : (
        <main className={minimalScrollClass('vertical', `main-content${isDevDocThreadsPage ? '' : ' panel-route-main'}`)}>
          {isDevDocThreadsPage ? (
            <div className="main-stage">
              <div className="main-stage-content">
                <div className="top-header">
                  <div className="breadcrumb">
                    <span className="breadcrumb-item">
                      <Link href="/" className="breadcrumb-link">
                        خانه
                      </Link>
                      <ChevronLeft className="breadcrumb-separator h-3.5 w-3.5" />
                    </span>
                    <span className="breadcrumb-item">برد گفت‌وگوهای مستندات</span>
                  </div>
                </div>
                <div className="content-body">{children}</div>
              </div>
            </div>
          ) : (
            <div className="content-body panel-route-body" dir="rtl" lang="fa">
              {children}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
