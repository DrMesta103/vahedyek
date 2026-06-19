'use client';

import type { ReactNode } from 'react';
import {
  CalendarNavPath,
  DastRanjBusinessSidebar,
  DastRanjNavPath,
  DastRanjNavPathOverride,
  DastRanjNavPathProvider,
  DastRanjNavPathTail,
  DastRanjPanelContent,
  EmployeeNavPath,
} from './business-sidebar';

interface SidebarProps {
  activeItem?: string;
  forceCollapsed?: boolean;
  forceExpanded?: boolean;
  lockCollapsed?: boolean;
  children: ReactNode;
}

export function Sidebar({
  activeItem = 'home',
  forceCollapsed = false,
  forceExpanded = false,
  lockCollapsed = false,
  children,
}: SidebarProps) {
  return (
    <DastRanjNavPathProvider>
      <DastRanjBusinessSidebar
        activeItem={activeItem}
        forceCollapsed={forceCollapsed}
        forceExpanded={forceExpanded}
        lockCollapsed={lockCollapsed}
      >
        {children}
      </DastRanjBusinessSidebar>
    </DastRanjNavPathProvider>
  );
}

export {
  CalendarNavPath,
  DastRanjNavPath,
  DastRanjNavPathOverride,
  DastRanjNavPathTail,
  DastRanjPanelContent,
  EmployeeNavPath,
};
