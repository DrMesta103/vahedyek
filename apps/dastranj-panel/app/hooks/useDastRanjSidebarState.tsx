'use client';

import type { TaavBusinessSidebarQuickAction } from '@repo/ui/taav/business';
import type { TaavBusinessSidebarNavPathItem } from '@repo/ui/taav/business';
import { Moon, Sun } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import {
  appendDastRanjNavPathTail,
  replaceDastRanjNavPath,
  resolveDastRanjNavPath,
} from '../lib/sidebar/dastranj-nav-path';
import {
  createDastRanjQuickActionIcons,
  DASHRANJ_SIDEBAR_VERSION,
  mapDastRanjNavToTaavSidebarItems,
} from '../lib/sidebar/dastranj-sidebar-taav';
import { formatIdentityLabel } from '../lib/contact';
import { getSidebarMenuItems } from '../lib/navigation';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('dastranj-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-taav-theme', theme);
  window.localStorage.setItem('dastranj-theme', theme);
}

type SidebarStateOptions = {
  activeItem: string;
  forceCollapsed?: boolean;
  forceExpanded?: boolean;
  lockCollapsed?: boolean;
  navPathTail?: TaavBusinessSidebarNavPathItem[];
  navPathOverride?: TaavBusinessSidebarNavPathItem[] | null;
};

export function useDastRanjSidebarState({
  activeItem,
  forceCollapsed = false,
  forceExpanded = false,
  lockCollapsed = false,
  navPathTail = [],
  navPathOverride = null,
}: SidebarStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const current = getInitialTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  useEffect(() => {
    if (forceCollapsed) {
      setCollapsed(true);
      return;
    }
    if (forceExpanded) {
      setCollapsed(false);
      return;
    }
    const savedState = window.localStorage.getItem('app-sidebar-collapsed');
    setCollapsed(savedState === 'true');
  }, [forceCollapsed, forceExpanded]);

  useEffect(() => {
    if (forceCollapsed || forceExpanded) return;
    window.localStorage.setItem('app-sidebar-collapsed', String(collapsed));
  }, [collapsed, forceCollapsed, forceExpanded]);

  useEffect(() => {
    if (forceCollapsed) return;
    if (pathname === '/business-settings' || pathname.startsWith('/business-settings/')) {
      setCollapsed(false);
    }
  }, [forceCollapsed, pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleSwitchTenant = () => {
    router.push('/select-tenant?next=%2F');
    router.refresh();
  };

  const handleOpenTenantDocs = () => {
    router.push('/dev-doc-threads');
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  const effectiveCollapsed = forceCollapsed || (!forceExpanded && collapsed);
  const allowedMenuItemIds = data?.access?.allowedMenuItemIds;
  const canSeeSettings = !allowedMenuItemIds || allowedMenuItemIds.includes('settings');
  const visibleMenuItems = getSidebarMenuItems().filter(
    (item) => !allowedMenuItemIds || allowedMenuItemIds.includes(item.id),
  );
  const identityLabel = formatIdentityLabel(data?.user?.email, data?.user?.mobile);
  const quickActionIcons = useMemo(() => createDastRanjQuickActionIcons(), []);

  const quickActions = useMemo((): TaavBusinessSidebarQuickAction[] => {
    const actions: TaavBusinessSidebarQuickAction[] = [
      {
        id: 'logout',
        label: 'خروج',
        icon: quickActionIcons.logout,
        onClick: () => void handleLogout(),
      },
      {
        id: 'notifications',
        label: 'اعلان‌ها',
        icon: quickActionIcons.notifications,
        badge: 1,
      },
    ];

    if (canSeeSettings) {
      actions.push({
        id: 'settings',
        label: 'تنظیمات کلی',
        icon: quickActionIcons.settings,
        active: activeItem === 'settings',
        onClick: () => router.push('/settings'),
      });
    }

    actions.push(
      {
        id: 'home',
        label: 'داشبورد',
        icon: quickActionIcons.home,
        active: activeItem === 'home',
        onClick: () => router.push('/'),
      },
      {
        id: 'theme',
        label: theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره',
        icon: theme === 'dark' ? <Sun /> : <Moon />,
        onClick: toggleTheme,
      },
    );

    return actions;
  }, [activeItem, canSeeSettings, quickActionIcons, router, theme]);

  const sidebarItems = mapDastRanjNavToTaavSidebarItems(visibleMenuItems, activeItem);

  const navPath = useMemo(() => {
    const base =
      navPathOverride && navPathOverride.length > 0
        ? replaceDastRanjNavPath(navPathOverride)
        : resolveDastRanjNavPath(pathname);

    const merged = navPathTail.length > 0 ? appendDastRanjNavPathTail(base, navPathTail) : base;

    return merged.map((item, index) => {
      const isLast = index === merged.length - 1;
      if (isLast || !item.href) {
        return { ...item, href: undefined, onClick: undefined };
      }

      const href = item.href;
      return {
        ...item,
        href: undefined,
        onClick: () => router.push(href),
      };
    });
  }, [navPathOverride, navPathTail, pathname, router]);

  return {
    user: {
      name: data?.user?.fullName ?? 'در حال بارگذاری...',
      subtitle: identityLabel,
      avatarFallback: data?.user?.fullName?.slice(0, 1) ?? '؟',
    },
    tenant: {
      label: data?.tenant?.slug ?? '',
      name: data?.tenant?.name ?? 'tenant',
      avatarText: data?.tenant?.brandCode ?? 'TEN',
      status: loading ? ('loading' as const) : ('active' as const),
      statusLabel: 'tenant فعال',
    },
    quickActions,
    sidebarItems,
    navPath,
    version: DASHRANJ_SIDEBAR_VERSION,
    loading,
    collapsed: effectiveCollapsed,
    lockCollapsed,
    collapsible: !lockCollapsed,
    onNavigate: (item: { href?: string }) => {
      if (item.href) router.push(item.href);
    },
    onTenantSwitch: handleSwitchTenant,
    onTenantPanelClick: handleOpenTenantDocs,
    onCollapsedChange: setCollapsed,
  };
}
