'use client';

import { TaavBusinessSidebar } from '@repo/ui/taav/business';
import type { ReactNode } from 'react';
import { useDastRanjSidebarState } from '../../hooks/useDastRanjSidebarState';
import { useDastRanjNavPathContext } from './DastRanjNavPathProvider';

type DastRanjBusinessSidebarProps = {
  activeItem: string;
  forceCollapsed?: boolean;
  forceExpanded?: boolean;
  lockCollapsed?: boolean;
  children: ReactNode;
};

export function DastRanjBusinessSidebar({
  activeItem,
  forceCollapsed = false,
  forceExpanded = false,
  lockCollapsed = false,
  children,
}: DastRanjBusinessSidebarProps) {
  const navPathContext = useDastRanjNavPathContext();
  const sidebar = useDastRanjSidebarState({
    activeItem,
    forceCollapsed,
    forceExpanded,
    lockCollapsed,
    navPathTail: navPathContext?.tail ?? [],
    navPathOverride: navPathContext?.override ?? null,
  });

  return (
    <TaavBusinessSidebar
      user={sidebar.user}
      tenant={sidebar.tenant}
      quickActions={sidebar.quickActions}
      items={sidebar.sidebarItems}
      activeItemId={activeItem}
      version={sidebar.version}
      variant="dastranj"
      placement="right"
      collapsed={sidebar.collapsed}
      collapsible={sidebar.collapsible}
      lockCollapsed={sidebar.lockCollapsed}
      loading={sidebar.loading}
      navPath={sidebar.navPath}
      showNavPath
      onNavigate={sidebar.onNavigate}
      onTenantSwitch={sidebar.onTenantSwitch}
      onTenantPanelClick={sidebar.onTenantPanelClick}
      onCollapsedChange={sidebar.onCollapsedChange}
      shellClassName="app-shell h-screen overflow-hidden"
      className="h-full"
    >
      {children}
    </TaavBusinessSidebar>
  );
}
