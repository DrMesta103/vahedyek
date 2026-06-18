import type { ReactNode } from 'react';
import { LabMobileNav, LabSidebar, LabTopbar } from './LabShell';

export function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lab-shell-bg min-h-screen">
      <div className="flex min-h-screen">
        <LabSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <LabTopbar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
      <LabMobileNav />
    </div>
  );
}
