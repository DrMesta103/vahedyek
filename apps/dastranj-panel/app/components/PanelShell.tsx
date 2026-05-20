'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getActiveNavigationItem } from '../lib/navigation';
import { OrbitMenu } from './OrbitMenu';
import { Sidebar } from './Sidebar';

export function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeItem = getActiveNavigationItem(pathname);
  const showOrbitMenu = pathname === '/';

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeItem.id} />
      {showOrbitMenu ? (
        <main className="main-content home-main-content">
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
        <main className="main-content panel-route-main">
          <div className="content-body panel-route-body">{children}</div>
        </main>
      )}
    </div>
  );
}
