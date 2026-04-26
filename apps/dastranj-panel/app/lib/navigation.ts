import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  CircleUserRound,
  FileSpreadsheet,
  FileText,
  GitBranch,
  LayoutDashboard,
  MapPinned,
  Settings2,
  ShieldCheck,
  Users,
  Waypoints,
  Workflow,
} from 'lucide-react';

export type NavigationItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

export const APP_MENU_ITEMS: NavigationItem[] = [
  { id: 'home', href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'quick-setup', href: '/quick-setup', label: 'راه‌اندازی سریع', icon: Workflow },
  { id: 'business-settings', href: '/business-settings', label: 'تنظیمات کسب و کار', icon: Settings2 },
  { id: 'locations', href: '/locations', label: 'محل کار', icon: MapPinned },
  { id: 'calendars', href: '/calendars', label: 'تقویم‌ها', icon: CalendarDays },
  { id: 'policies', href: '/policies', label: 'سیاست‌ها', icon: ShieldCheck },
  { id: 'employees', href: '/employees', label: 'کارمندان', icon: Users },
  { id: 'work-groups', href: '/work-groups', label: 'گروه‌های کاری', icon: GitBranch },
  { id: 'organization-units', href: '/organization-units', label: 'واحدهای سازمانی', icon: Waypoints },
  { id: 'shift-templates', href: '/shift-templates', label: 'قالب‌های شیفت', icon: Building2 },
  { id: 'draft-templates', href: '/draft-templates', label: 'پیش‌نویس‌ها', icon: FileSpreadsheet },
  { id: 'request-reasons', href: '/request-reasons', label: 'دلایل درخواست', icon: FileText },
  { id: 'account', href: '/account', label: 'حساب کسب و کار', icon: CircleUserRound },
];

export function getActiveNavigationItem(pathname: string) {
  return (
    APP_MENU_ITEMS.find((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))) ??
    APP_MENU_ITEMS[0]
  );
}
