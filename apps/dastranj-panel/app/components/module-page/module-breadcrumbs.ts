import type { ModuleBreadcrumb } from './ModulePageHeader';

export function panelBreadcrumbs(current: string): ModuleBreadcrumb[] {
  return [{ label: 'دسترنج', href: '/' }, { label: current }];
}

export function businessSettingsBreadcrumbs(current: string): ModuleBreadcrumb[] {
  return [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: current },
  ];
}
