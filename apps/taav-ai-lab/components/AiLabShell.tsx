'use client';

import { useRouter } from 'next/navigation';
import { Beaker, Boxes, Building2, Cpu, Home, LogOut, ScanText, Settings, Sparkles } from 'lucide-react';
import {
  TaavBusinessSidebar,
  type TaavBusinessSidebarItem,
  type TaavBusinessSidebarNavPathItem,
  type TaavBusinessSidebarQuickAction,
} from '@repo/ui/taav/business';
import {
  getActiveNavItem,
  getOrbitNavItems,
  getSidebarNavItems,
  isWorkspaceHomePath,
  resolveNavHref,
} from '@/app/lib/navigation';
import { OrbitMenu } from '@/components/OrbitMenu';

type AiLabShellProps = {
  children?: React.ReactNode;
  pathname: string;
  fullName: string;
  email?: string | null;
  mobile?: string | null;
  currentTenantId?: string | null;
  currentTenantName?: string | null;
};

const SIDEBAR_ICONS = {
  home: <Home className="h-4 w-4" />,
  beaker: <Beaker className="h-4 w-4" />,
  cpu: <Cpu className="h-4 w-4" />,
  boxes: <Boxes className="h-4 w-4" />,
  scan: <ScanText className="h-4 w-4" />,
  building: <Building2 className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
} as const;

function buildNavPath(
  pathname: string,
  currentTenantId?: string | null,
  currentTenantName?: string | null,
): TaavBusinessSidebarNavPathItem[] {
  const navPath: TaavBusinessSidebarNavPathItem[] = [{ label: 'خانه', id: 'home', href: '/businesses' }];

  if (pathname.startsWith('/businesses')) {
    navPath.push({ label: 'کسب‌وکارها', id: 'businesses', href: '/businesses' });
  }

  if (pathname.startsWith('/settings')) {
    navPath.push({ label: 'پنل تاو ادمین', id: 'settings', href: '/settings' });
  }

  if (currentTenantId) {
    navPath.push({
      label: currentTenantName?.trim() || 'فضای کاری',
      id: currentTenantId,
      href: `/businesses/${currentTenantId}`,
    });
  }

  const activeItem = getActiveNavItem(pathname, currentTenantId);
  if (activeItem.id !== 'home' || !isWorkspaceHomePath(pathname, currentTenantId)) {
    if (pathname.startsWith('/settings/')) {
      if (pathname.includes('/ai-accounts')) {
        navPath.push({ label: 'اکانت‌های هوش مصنوعی', id: 'ai-accounts', href: '/settings/ai-accounts' });
      } else if (pathname.includes('/token-pricing')) {
        navPath.push({ label: 'قیمت‌گذاری توکن‌ها', id: 'token-pricing' });
      } else if (pathname.includes('/usd-rate')) {
        navPath.push({ label: 'تنظیمات قیمت دلار', id: 'usd-rate' });
      }
    } else if (!(pathname.startsWith('/settings') && activeItem.id === 'settings')) {
      navPath.push({ label: activeItem.label, id: activeItem.id });
    }
  }

  return navPath;
}

function buildSidebarItems(currentTenantId?: string | null): TaavBusinessSidebarItem[] {
  return getSidebarNavItems().map((item) => ({
    id: item.id,
    label: item.label,
    href: resolveNavHref(item, currentTenantId),
    icon: SIDEBAR_ICONS[item.iconKey],
    disabled: !item.href && !currentTenantId,
  }));
}

export function AiLabShell({
  children,
  pathname,
  fullName,
  email,
  mobile,
  currentTenantId,
  currentTenantName,
}: AiLabShellProps) {
  const router = useRouter();
  const activeItem = getActiveNavItem(pathname, currentTenantId);
  const showOrbitMenu = isWorkspaceHomePath(pathname, currentTenantId);
  const sidebarItems = buildSidebarItems(currentTenantId);
  const navPath = buildNavPath(pathname, currentTenantId, currentTenantName);
  const workspaceHomeHref = currentTenantId ? `/businesses/${currentTenantId}` : '/businesses';
  const workspaceAiHref = currentTenantId ? `/businesses/${currentTenantId}/ai-tools` : '/businesses';
  const workspaceProductsHref = currentTenantId ? `/businesses/${currentTenantId}/products` : '/businesses';

  const quickActions: TaavBusinessSidebarQuickAction[] = [
    {
      id: 'logout',
      label: 'خروج',
      icon: <LogOut className="h-4 w-4" />,
      onClick: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
        router.refresh();
      },
    },
    {
      id: 'home',
      label: 'داشبورد',
      icon: <Home className="h-4 w-4" />,
      active: activeItem.id === 'home',
      href: workspaceHomeHref,
    },
    {
      id: 'lab',
      label: 'کسب‌وکارها',
      icon: <Building2 className="h-4 w-4" />,
      active: pathname === '/businesses' || pathname === '/businesses/new',
      href: '/businesses',
    },
    {
      id: 'ai-tools',
      label: 'ابزارهای هوش مصنوعی',
      icon: <Cpu className="h-4 w-4" />,
      active: pathname.includes('/ai-tools'),
      href: workspaceAiHref,
    },
    {
      id: 'products',
      label: 'محصولات',
      icon: <Boxes className="h-4 w-4" />,
      active: pathname.includes('/products'),
      href: workspaceProductsHref,
    },
  ];

  const mainContent = showOrbitMenu && currentTenantId ? (
    <div className="ai-lab-home-main">
      <OrbitMenu items={getOrbitNavItems(currentTenantId)} activeItem={activeItem.id} />
      {children ? (
        <div className="ai-lab-main-stage">
          <div className="ai-lab-main-stage-content">
            <div className="ai-lab-dashboard-home-body">{children}</div>
          </div>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="ai-lab-panel-scroll taav-scrollarea taav-scrollarea--minimal">
      <div className="ai-lab-container">{children}</div>
    </div>
  );

  return (
    <TaavBusinessSidebar
      className="h-full"
      user={{
        name: fullName,
        subtitle: email || mobile || undefined,
        avatarFallback: fullName.slice(0, 1),
      }}
      tenant={{
        label: 'آزمایشگاه هوش مصنوعی تاو',
        name: currentTenantName?.trim() || 'آزمایشگاه',
        avatarText: 'TAAV',
        status: currentTenantId ? 'active' : 'inactive',
        statusLabel: currentTenantId ? 'tenant فعال' : undefined,
      }}
      quickActions={quickActions}
      items={sidebarItems}
      activeItemId={activeItem.id}
      version="فاز ۱"
      variant="dastranj"
      placement="right"
      width="wide"
      navPath={navPath}
      showNavPath
      onNavigate={(item) => {
        if (item.href) {
          router.push(item.href);
        }
      }}
      onTenantSwitch={() => {
        router.push('/businesses');
        router.refresh();
      }}
      onTenantPanelClick={() => {
        router.push(workspaceHomeHref);
      }}
      onLogout={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
        router.refresh();
      }}
      shellClassName="ai-lab-shell ai-lab-backdrop h-screen overflow-hidden"
      contentClassName="ai-lab-main"
    >
      {mainContent}
    </TaavBusinessSidebar>
  );
}
