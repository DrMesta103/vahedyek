'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getActiveNavigationItem } from '../lib/navigation';
import { OrbitMenu } from './OrbitMenu';
import { Sidebar } from './Sidebar';

export function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeItem = getActiveNavigationItem(pathname);
  const showOrbitMenu = pathname === '/';

  const trail = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const matched = getActiveNavigationItem(href);
      const label =
        matched.href === href
          ? matched.label
          : segment === 'new'
            ? 'جدید'
            : decodeURIComponent(segment).replace(/-/g, ' ');

      return { href, label };
    });

  return (
    <div className="app-shell">
      <Sidebar />
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
        <main className="main-content">
          <div className="main-stage">
            <div className="main-stage-content">
              <div className="top-header">
                <div className="breadcrumb">
                  <Link href="/" className="breadcrumb-link">
                    خانه
                  </Link>
                  {trail.map((item, index) => (
                    <span key={`${item.href}-${index}`}>
                      {' '}
                      <ChevronLeft size={12} />{' '}
                      {index < trail.length - 1 ? (
                        <Link href={item.href} className="breadcrumb-link">
                          {item.label}
                        </Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="content-body">{children}</div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
