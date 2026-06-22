import type { TaavBusinessSidebarNavPathItem } from '@repo/ui/taav/business';
import { getActiveNavigationItem } from '../navigation';
import {
  DASHRANJ_ROUTE_PATH_OVERRIDES,
  DASHRANJ_ROUTE_SEGMENT_LABELS,
  isDynamicRouteSegment,
} from './dastranj-route-labels';

export const DASHRANJ_HOME_NAV_ITEM: TaavBusinessSidebarNavPathItem = {
  label: 'خانه',
  id: 'home',
  href: '/',
};

export function resolveDastRanjNavPath(pathname: string): TaavBusinessSidebarNavPathItem[] {
  const normalized = pathname.split('?')[0] || '/';
  const items: TaavBusinessSidebarNavPathItem[] = [DASHRANJ_HOME_NAV_ITEM];

  if (normalized === '/') return items;

  const overrideLabels = DASHRANJ_ROUTE_PATH_OVERRIDES[normalized];
  if (overrideLabels) {
    overrideLabels.forEach((label, index) => {
      items.push({
        label,
        id: `${normalized}-${index}`,
      });
    });
    return items;
  }

  const activeItem = getActiveNavigationItem(normalized);
  if (activeItem.id !== 'home') {
    items.push({
      label: activeItem.label,
      id: activeItem.id,
      href: activeItem.href,
    });
  }

  const modulePrefix = activeItem.href === '/' ? '' : activeItem.href;
  const remainder =
    modulePrefix && normalized.startsWith(`${modulePrefix}/`)
      ? normalized.slice(modulePrefix.length + 1)
      : normalized.startsWith('/')
        ? normalized.slice(1)
        : normalized;

  if (!remainder || remainder === activeItem.id) return items;

  const segments = remainder.split('/').filter(Boolean);
  let cumulative = modulePrefix || '';

  for (const segment of segments) {
    if (isDynamicRouteSegment(segment)) continue;

    cumulative = `${cumulative}/${segment}`;
    const label = DASHRANJ_ROUTE_SEGMENT_LABELS[segment] ?? segment;
    const isLast = segment === segments[segments.length - 1];

    items.push({
      label,
      id: cumulative,
      href: isLast ? undefined : cumulative,
    });
  }

  return items;
}

export function appendDastRanjNavPathTail(
  base: TaavBusinessSidebarNavPathItem[],
  tail: TaavBusinessSidebarNavPathItem[],
): TaavBusinessSidebarNavPathItem[] {
  if (tail.length === 0) return base;

  const trimmedBase =
    base.length > 0 && base[base.length - 1]?.href === undefined ? base.slice(0, -1) : base;
  const merged = [...trimmedBase, ...tail];

  return merged.map((item, index) => ({
    ...item,
    href: index === merged.length - 1 ? undefined : item.href,
  }));
}

export function replaceDastRanjNavPath(
  items: TaavBusinessSidebarNavPathItem[],
): TaavBusinessSidebarNavPathItem[] {
  return items.map((item, index, list) => ({
    ...item,
    href: index === list.length - 1 ? undefined : item.href,
  }));
}
