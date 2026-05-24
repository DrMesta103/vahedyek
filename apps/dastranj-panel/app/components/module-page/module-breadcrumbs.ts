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

export function policyBreadcrumbs(...trail: ModuleBreadcrumb[]): ModuleBreadcrumb[] {
  return [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: 'سیاست‌های کاری', href: '/policies' },
    ...trail,
  ];
}

export function calendarBreadcrumbs(...trail: ModuleBreadcrumb[]): ModuleBreadcrumb[] {
  return [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: 'تقویم', href: '/calendars' },
    ...trail,
  ];
}
