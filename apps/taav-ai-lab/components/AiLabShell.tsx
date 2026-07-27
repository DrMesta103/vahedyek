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
  getTaaviaTechnicalFlowsNavPathSuffix,
  isWorkspaceHomePath,
  resolveNavHref,
} from '@/app/lib/navigation';
import { OrbitMenu } from '@/components/OrbitMenu';
import { UserNotificationListener } from '@/components/UserNotificationListener';

type AiLabShellProps = {
  children?: React.ReactNode;
  pathname: string;
  fullName: string;
  email?: string | null;
  mobile?: string | null;
  currentTenantId?: string | null;
  currentTenantName?: string | null;
  currentBrandName?: string | null;
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
  currentBrandName?: string | null,
): TaavBusinessSidebarNavPathItem[] {
  const navPath: TaavBusinessSidebarNavPathItem[] = [{ label: 'خانه', id: 'home', href: '/businesses' }];

  if (pathname.startsWith('/businesses')) {
    navPath.push({ label: 'کسب‌وکارها', id: 'businesses', href: '/businesses' });
  }

  if (pathname.startsWith('/settings')) {
    navPath.push({ label: 'پنل تاو ادمین', id: 'settings', href: '/settings' });
  }

  if (currentTenantId) {
    const tenantHref = `/businesses/${currentTenantId}`;

    navPath.push({
      label: currentTenantName?.trim() || 'فضای کاری',
      id: currentTenantId,
      href: tenantHref,
    });
  }

  if (currentTenantId) {
    const workspaceBase = `/businesses/${currentTenantId}`;
    const brandsBase = `${workspaceBase}/products/taavia/brands`;
    if (pathname === `${workspaceBase}/products/taavia`) {
      navPath.push(
        { label: '\u0645\u062d\u0635\u0648\u0644\u0627\u062a', id: 'products', href: `${workspaceBase}/products` },
        { label: '\u0628\u0631\u0646\u062f\u0647\u0627', id: 'taavia-brands', href: brandsBase },
      );
      return navPath;
    }
    if (pathname === brandsBase) {
      navPath.push(
        { label: '\u0645\u062d\u0635\u0648\u0644\u0627\u062a', id: 'products', href: `${workspaceBase}/products` },
        { label: '\u062a\u0627\u0648\u06cc\u0627', id: 'taavia', href: `${workspaceBase}/products/taavia` },
        { label: '\u0628\u0631\u0646\u062f\u0647\u0627', id: 'taavia-brands' },
      );
      return navPath;
    }
    const brandMatch = pathname.match(
      new RegExp(`^${workspaceBase}/products/taavia/brands/([^/]+)(?:/(.*))?$`),
    );

    if (brandMatch) {
      const brandBase = `${workspaceBase}/products/taavia/brands/${brandMatch[1]}`;
      const remainder = brandMatch[2];
      navPath.push(
        { label: '\u0645\u062d\u0635\u0648\u0644\u0627\u062a', id: 'products', href: `${workspaceBase}/products` },
        { label: '\u062a\u0627\u0648\u06cc\u0627', id: 'taavia', href: `${workspaceBase}/products/taavia` },
        { label: '\u0628\u0631\u0646\u062f\u0647\u0627', id: 'taavia-brands', href: `${workspaceBase}/products/taavia/brands` },
        { label: currentBrandName?.trim() || '\u0628\u0631\u0646\u062f', id: `brand-${brandMatch[1]}`, href: brandBase },
      );

      if (remainder) {
        const parts = remainder.split('/');
        const section = parts[0];
        const sectionLabels: Record<string, string> = {
          sources: '\u0645\u0646\u0627\u0628\u0639',
          'knowledge-base': 'Knowledge Base',
          'model-settings': '\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0645\u062f\u0644',
          manual: '\u062a\u0646\u0638\u06cc\u0645 \u062f\u0633\u062a\u06cc',
          test: '\u0622\u0632\u0645\u0627\u06cc\u0634',
        };
        navPath.push({
          label: sectionLabels[section] || section,
          id: `brand-section-${section}`,
          href: section === 'knowledge-base' && parts.length > 1 ? `${brandBase}/knowledge-base` : undefined,
        });

        if (section === 'knowledge-base') {
          if (parts[1] === 'versions') {
            navPath.push({ label: '\u0646\u0633\u062e\u0647\u200c\u0647\u0627', id: 'kb-versions' });
          } else if (parts[1] === 'builds') {
            navPath.push({ label: '\u0633\u0627\u062e\u062a\u200c\u0647\u0627', id: 'kb-builds' });
          } else if (parts[1]) {
            const knowledgeBaseHref = `${brandBase}/knowledge-base/${parts[1]}`;
            navPath.push({
              label: '\u062c\u0632\u0626\u06cc\u0627\u062a \u0646\u0633\u062e\u0647',
              id: `kb-${parts[1]}`,
              href: parts[2] ? knowledgeBaseHref : undefined,
            });
            if (parts[2] === 'sources') {
              navPath.push({ label: '\u0645\u0646\u0627\u0628\u0639 \u0646\u0633\u062e\u0647', id: 'kb-version-sources' });
            } else if (parts[2] === 'categories') {
              navPath.push({ label: '\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627', id: 'kb-version-categories' });
            }
          }
        }
      }

      return navPath;
    }
  }

  if (currentTenantId) {
    const technicalFlowsSuffix = getTaaviaTechnicalFlowsNavPathSuffix(pathname, currentTenantId);
    if (technicalFlowsSuffix) {
      navPath.push(...technicalFlowsSuffix);
      return navPath;
    }
  }

  const activeItem = getActiveNavItem(pathname, currentTenantId);
  if (activeItem.id !== 'home' || !isWorkspaceHomePath(pathname, currentTenantId)) {
    if (pathname.startsWith('/settings/')) {
      if (pathname.includes('/ai-accounts')) {
        navPath.push({ label: 'اکانت‌های هوش مصنوعی', id: 'ai-accounts', href: '/settings/ai-accounts' });
        const accountModelsMatch = pathname.match(/^\/settings\/ai-accounts\/([^/]+)$/);
        if (accountModelsMatch?.[1]) {
          navPath.push({ label: 'مدل‌ها', id: 'ai-account-models' });
        }
      } else if (pathname.includes('/token-pricing')) {
        navPath.push({ label: 'قیمت‌گذاری توکن‌ها', id: 'token-pricing' });
      } else if (pathname.includes('/usd-rate')) {
        navPath.push({ label: 'تنظیمات قیمت دلار', id: 'usd-rate' });
      } else if (pathname.includes('/settings/businesses')) {
        navPath.push({ label: 'فهرست کسب‌وکارها', id: 'settings-businesses' });
      } else if (pathname.includes('/settings/users')) {
        navPath.push({ label: 'مدیریت کاربران', id: 'settings-users' });
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
  currentBrandName,
}: AiLabShellProps) {
  const router = useRouter();
  const activeItem = getActiveNavItem(pathname, currentTenantId);
  const showOrbitMenu = isWorkspaceHomePath(pathname, currentTenantId);
  const sidebarItems = buildSidebarItems(currentTenantId);
  const navPath = buildNavPath(pathname, currentTenantId, currentTenantName, currentBrandName);
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

  const isTaaviaBrandsArea = pathname.includes('/products/taavia/brands');

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
      <div className={`ai-lab-container${isTaaviaBrandsArea ? ' taavia-density-compact' : ''}`}>{children}</div>
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
      <UserNotificationListener />
      {mainContent}
    </TaavBusinessSidebar>
  );
}
