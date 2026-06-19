'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getActiveNavigationItem } from '../lib/navigation';
import { OrbitMenu } from './OrbitMenu';
import PageDocsWidget from './PageDocsWidget';
import { DastRanjPanelContent, Sidebar } from './Sidebar';
import type { SetupHealthItem, SetupHealthReminder } from '../lib/setup-health';
import { SetupReminderDialog } from './setup-health/SetupReminderDialog';

type PanelShellProps = {
  children: ReactNode;
  tenantId?: string | null;
  setupReminder?: SetupHealthReminder | null;
  setupCriticalItems?: SetupHealthItem[];
};

export function PanelShell({ children, tenantId = null, setupReminder = null, setupCriticalItems = [] }: PanelShellProps) {
  return (
    <Suspense fallback={null}>
      <PanelShellContent tenantId={tenantId} setupReminder={setupReminder} setupCriticalItems={setupCriticalItems}>
        {children}
      </PanelShellContent>
    </Suspense>
  );
}

function PanelShellContent({
  children,
  tenantId,
  setupReminder,
  setupCriticalItems,
}: PanelShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeItem = getActiveNavigationItem(pathname);
  const showOrbitMenu = pathname === '/';
  const isPayrollAttendanceRecordPage = pathname === '/business-settings/payroll-attendance' && searchParams.has('year');
  const lockMainSidebar =
    isPayrollAttendanceRecordPage ||
    pathname === '/draft-templates/new' ||
    pathname.startsWith('/draft-templates/new/');

  return (
    <>
      <PageDocsWidget />
      {tenantId && setupReminder ? (
        <SetupReminderDialog tenantId={tenantId} reminder={setupReminder} criticalItems={setupCriticalItems} />
      ) : null}
      <Sidebar activeItem={activeItem.id} forceCollapsed={lockMainSidebar} lockCollapsed={lockMainSidebar}>
        {showOrbitMenu ? (
          <DastRanjPanelContent variant="home">
            <OrbitMenu activeItem={activeItem.id} />
            {children ? (
              <div className="main-stage">
                <div className="main-stage-content">
                  <div className="content-body dashboard-home-body">{children}</div>
                </div>
              </div>
            ) : null}
          </DastRanjPanelContent>
        ) : (
          <DastRanjPanelContent variant="panel">{children}</DastRanjPanelContent>
        )}
      </Sidebar>
    </>
  );
}
