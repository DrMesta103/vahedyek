export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  disabled?: boolean;
  toolbarOnly?: boolean;
};

export const APP_MENU_ITEMS: NavigationItem[] = [
  { id: 'job-classifications', href: '/job-classifications', label: 'طبقه‌بندی مشاغل', icon: 'fa-briefcase' },
  { id: 'home', href: '/', label: 'داشبورد', icon: 'fa-home', toolbarOnly: true },
  { id: 'quick-setup', href: '/quick-setup', label: 'راه‌اندازی سریع', icon: 'fa-bolt' },
  { id: 'business-settings', href: '/business-settings', label: 'تنظیمات کسب و کار', icon: 'fa-briefcase' },
  { id: 'locations', href: '/locations', label: 'محل کار', icon: 'fa-map-marker-alt' },
  { id: 'calendars', href: '/calendars', label: 'تقویم‌ها', icon: 'fa-calendar-alt' },
  { id: 'policies', href: '/policies', label: 'سیاست‌ها', icon: 'fa-shield-alt' },
  { id: 'employees', href: '/employees', label: 'کارمندان', icon: 'fa-users' },
  { id: 'work-groups', href: '/work-groups', label: 'گروه‌های کاری', icon: 'fa-code-branch' },
  { id: 'organization-units', href: '/organization-units', label: 'واحدهای سازمانی', icon: 'fa-sitemap' },
  { id: 'shift-templates', href: '/shift-templates', label: 'قالب‌های شیفت', icon: 'fa-building' },
  { id: 'draft-templates', href: '/draft-templates', label: 'قالب پیش‌نویس', icon: 'fa-copy' },
  { id: 'request-reasons', href: '/request-reasons', label: 'دلایل درخواست', icon: 'fa-file-alt' },
  { id: 'account', href: '/business-settings/profile', label: 'پروفایل کسب و کار', icon: 'fa-user-circle' },
  { id: 'dev-doc-threads', href: '/dev-doc-threads', label: 'گفتگوی مستندات توسعه', icon: 'fa-comments' },
  { id: 'dev-doc-events', href: '/dev-doc-events', label: 'لاگ مستندات توسعه', icon: 'fa-clipboard-list' },
  { id: 'settings', href: '/settings', label: 'تنظیمات کلی', icon: 'fa-cog', toolbarOnly: true, disabled: true },
];

export function getActiveNavigationItem(pathname: string) {
  return (
    APP_MENU_ITEMS.find((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))) ??
    APP_MENU_ITEMS[0]
  );
}

export function getSidebarMenuItems() {
  return APP_MENU_ITEMS.filter((item) => !item.toolbarOnly);
}

export function getToolbarMenuItems() {
  return APP_MENU_ITEMS.filter((item) => item.toolbarOnly);
}
