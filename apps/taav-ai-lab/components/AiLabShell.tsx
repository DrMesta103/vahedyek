'use client';

import { useRouter } from 'next/navigation';
import { Beaker, Boxes, Building2, Cpu, Sparkles } from 'lucide-react';
import {
  TaavBusinessSidebar,
  type TaavBusinessSidebarItem,
  type TaavBusinessSidebarNavPathItem,
  type TaavBusinessSidebarQuickAction,
} from '@repo/ui/taav/business';

type AiLabShellProps = {
  children: React.ReactNode;
  pathname: string;
  fullName: string;
  email?: string | null;
  mobile?: string | null;
  currentTenantId?: string | null;
  currentTenantName?: string | null;
};

function getWorkspaceLabel(pathname: string): string {
  if (pathname === '/businesses') return 'مدیریت کسب‌وکارها';
  if (pathname === '/businesses/new') return 'ایجاد کسب‌وکار';
  if (pathname.endsWith('/ai-tools/ocr')) return 'OCR';
  if (pathname.endsWith('/ai-tools')) return 'ابزارهای هوش مصنوعی';
  if (pathname.endsWith('/products')) return 'محصولات';
  return 'نمای کلی';
}

function buildNavPath(
  pathname: string,
  currentTenantId?: string | null,
  currentTenantName?: string | null,
): TaavBusinessSidebarNavPathItem[] {
  const navPath: TaavBusinessSidebarNavPathItem[] = [{ label: 'خانه', id: 'home', href: '/businesses' }];

  if (pathname.startsWith('/businesses')) {
    navPath.push({ label: 'کسب‌وکارها', id: 'businesses', href: '/businesses' });
  }

  if (currentTenantId) {
    navPath.push({
      label: currentTenantName?.trim() || 'فضای کاری',
      id: currentTenantId,
      href: `/businesses/${currentTenantId}`,
    });
  }

  const workspaceLabel = getWorkspaceLabel(pathname);
  if (workspaceLabel !== 'نمای کلی' || !currentTenantId) {
    navPath.push({ label: workspaceLabel, id: `path:${pathname}` });
  }

  return navPath;
}

function buildSidebarItems(currentTenantId?: string | null): TaavBusinessSidebarItem[] {
  const items: TaavBusinessSidebarItem[] = [
    { id: 'businesses', label: 'کسب‌وکارها', href: '/businesses', icon: <Building2 className="h-4 w-4" /> },
    { id: 'businesses-new', label: 'ایجاد کسب‌وکار', href: '/businesses/new', icon: <Sparkles className="h-4 w-4" /> },
  ];

  if (currentTenantId) {
    items.push(
      { id: 'workspace-home', label: 'نمای کلی', href: `/businesses/${currentTenantId}`, icon: <Beaker className="h-4 w-4" /> },
      {
        id: 'workspace-ai',
        label: 'ابزارهای هوش مصنوعی',
        href: `/businesses/${currentTenantId}/ai-tools`,
        icon: <Cpu className="h-4 w-4" />,
      },
      { id: 'workspace-products', label: 'محصولات', href: `/businesses/${currentTenantId}/products`, icon: <Boxes className="h-4 w-4" /> },
    );
  }

  return items;
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
  const sidebarItems = buildSidebarItems(currentTenantId);
  const navPath = buildNavPath(pathname, currentTenantId, currentTenantName);
  const activeItemId =
    pathname === '/businesses'
      ? 'businesses'
      : pathname === '/businesses/new'
        ? 'businesses-new'
        : currentTenantId && pathname === `/businesses/${currentTenantId}`
          ? 'workspace-home'
          : currentTenantId && pathname.startsWith(`/businesses/${currentTenantId}/ai-tools`)
            ? 'workspace-ai'
            : currentTenantId && pathname.startsWith(`/businesses/${currentTenantId}/products`)
              ? 'workspace-products'
              : undefined;

  const quickActions: TaavBusinessSidebarQuickAction[] = [
    {
      id: 'lab',
      label: 'آزمایشگاه',
      icon: <Beaker className="h-4 w-4" />,
      active: pathname.startsWith('/businesses'),
      href: '/businesses',
    },
  ];

  return (
    <TaavBusinessSidebar
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
      }}
      quickActions={quickActions}
      items={sidebarItems}
      activeItemId={activeItemId}
      version="فاز ۱"
      variant="dastranj"
      placement="right"
      width="default"
      navPath={navPath}
      showNavPath
      onNavigate={(item) => {
        if (item.href) {
          router.push(item.href);
        }
      }}
      onLogout={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
        router.refresh();
      }}
      shellClassName="ai-lab-shell ai-lab-backdrop min-h-screen"
      contentClassName="ai-lab-main"
    >
      <div className="ai-lab-container min-h-screen overflow-y-auto">{children}</div>
    </TaavBusinessSidebar>
  );
}
