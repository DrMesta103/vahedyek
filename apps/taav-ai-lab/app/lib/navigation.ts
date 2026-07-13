export type AiLabNavItem = {
  id: string;
  label: string;
  iconKey: 'home' | 'beaker' | 'cpu' | 'boxes' | 'scan' | 'building' | 'sparkles' | 'settings';
  href?: string;
  segment?: string;
  toolbarOnly?: boolean;
  disabled?: boolean;
};

export const AI_LAB_NAV_ITEMS: AiLabNavItem[] = [
  { id: 'home', label: 'داشبورد', iconKey: 'home', segment: '', toolbarOnly: true },
  { id: 'ai-tools', label: 'ابزارهای هوش مصنوعی', iconKey: 'cpu', segment: '/ai-tools' },
  { id: 'ocr', label: 'OCR', iconKey: 'scan', segment: '/ai-tools/ocr' },
  { id: 'products', label: 'محصولات', iconKey: 'boxes', segment: '/products' },
  { id: 'businesses', label: 'کسب‌وکارها', iconKey: 'building', href: '/businesses' },
  { id: 'businesses-new', label: 'ایجاد کسب‌وکار', iconKey: 'sparkles', href: '/businesses/new' },
  { id: 'settings', label: 'پنل تاو ادمین', iconKey: 'settings', href: '/settings' },
];

export function resolveNavHref(item: AiLabNavItem, businessId?: string | null): string {
  if (item.href) return item.href;
  if (!businessId) return '/businesses';
  if (!item.segment || item.segment === '') return `/businesses/${businessId}`;
  return `/businesses/${businessId}${item.segment}`;
}

export function getSidebarNavItems() {
  return AI_LAB_NAV_ITEMS.filter(
    (item) => !item.toolbarOnly && item.id !== 'ocr' && item.id !== 'businesses-new',
  );
}

export function getOrbitNavItems(businessId: string) {
  return AI_LAB_NAV_ITEMS.map((item) => ({
    ...item,
    href: resolveNavHref(item, businessId),
    disabled: item.disabled || (!item.href && !businessId),
  }));
}

export function getActiveNavItem(pathname: string, businessId?: string | null) {
  const workspaceBase = businessId ? `/businesses/${businessId}` : null;

  if (workspaceBase && pathname === workspaceBase) {
    return AI_LAB_NAV_ITEMS.find((item) => item.id === 'home') ?? AI_LAB_NAV_ITEMS[0];
  }

  const ranked = [...AI_LAB_NAV_ITEMS].sort((a, b) => {
    const aLen = a.segment?.length ?? a.href?.length ?? 0;
    const bLen = b.segment?.length ?? b.href?.length ?? 0;
    return bLen - aLen;
  });

  for (const item of ranked) {
    if (item.href) {
      if (pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))) {
        return item;
      }
      continue;
    }

    if (!workspaceBase) continue;
    const href = resolveNavHref(item, businessId);
    if (pathname === href || (href !== workspaceBase && pathname.startsWith(`${href}/`))) {
      return item;
    }
  }

  if (pathname === '/businesses') {
    return AI_LAB_NAV_ITEMS.find((item) => item.id === 'businesses') ?? AI_LAB_NAV_ITEMS[0];
  }

  if (pathname === '/businesses/new') {
    return AI_LAB_NAV_ITEMS.find((item) => item.id === 'businesses') ?? AI_LAB_NAV_ITEMS[0];
  }

  return AI_LAB_NAV_ITEMS[0];
}

export function isWorkspaceHomePath(pathname: string, businessId?: string | null) {
  return Boolean(businessId && pathname === `/businesses/${businessId}`);
}
