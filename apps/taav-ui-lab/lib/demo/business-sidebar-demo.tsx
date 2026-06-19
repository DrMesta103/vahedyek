import type { TaavBusinessSidebarNavPathItem } from '@repo/ui/taav/business';
import type { TaavBusinessSidebarItem, TaavBusinessSidebarQuickAction } from '@repo/ui/taav/business';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  Copy,
  FileText,
  GitBranch,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  Shield,
  UserCircle,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';

const icon = (node: ReactNode) => node;

export const DASHRANJ_DEMO_USER = {
  name: 'علی محمدی',
  subtitle: 'ali@example.com',
  avatarFallback: 'ع',
};

export const DASHRANJ_DEMO_TENANT = {
  label: 'dastranj-demo',
  name: 'دست‌رنج نمونه',
  avatarText: 'DRJ',
  status: 'active' as const,
  statusLabel: 'tenant فعال',
};

export const DASHRANJ_DEMO_QUICK_ACTIONS: TaavBusinessSidebarQuickAction[] = [
  {
    id: 'logout',
    label: 'خروج',
    icon: icon(<LogOut className="scale-x-[-1]" />),
    onClick: () => undefined,
  },
  {
    id: 'notifications',
    label: 'اعلان‌ها',
    icon: icon(<Bell />),
    badge: 1,
  },
  {
    id: 'settings',
    label: 'تنظیمات کلی',
    icon: icon(<Settings />),
  },
  {
    id: 'home',
    label: 'داشبورد',
    icon: icon(<Home />),
    active: true,
  },
];

export const DASHRANJ_DEMO_NAV_ITEMS: TaavBusinessSidebarItem[] = [
  { id: 'quick-setup', label: 'راه‌اندازی سریع', icon: icon(<Zap />) },
  { id: 'business-settings', label: 'تنظیمات کسب و کار', icon: icon(<Briefcase />) },
  { id: 'locations', label: 'محل کار', icon: icon(<MapPin />) },
  { id: 'calendars', label: 'تقویم‌ها', icon: icon(<CalendarDays />) },
  { id: 'policies', label: 'سیاست‌ها', icon: icon(<Shield />) },
  { id: 'employees', label: 'کارمندان', icon: icon(<Users />) },
  { id: 'work-groups', label: 'گروه‌های کاری', icon: icon(<GitBranch />) },
  { id: 'organization-units', label: 'واحدهای سازمانی', icon: icon(<Building2 />) },
  { id: 'shift-templates', label: 'قالب‌های شیفت', icon: icon(<Building2 />) },
  { id: 'draft-templates', label: 'قالب پیش‌نویس', icon: icon(<Copy />) },
  { id: 'request-reasons', label: 'دلایل درخواست', icon: icon(<FileText />) },
  { id: 'account', label: 'پروفایل کسب و کار', icon: icon(<UserCircle />) },
  { id: 'dev-doc-threads', label: 'گفتگوی مستندات توسعه', icon: icon(<MessageSquare />) },
  { id: 'dev-doc-events', label: 'لاگ مستندات توسعه', icon: icon(<ClipboardList />) },
];

export const DASHRANJ_DEMO_VERSION = '0.8.0';

export const DASHRANJ_DEMO_NAV_PATH: TaavBusinessSidebarNavPathItem[] = [{ label: 'خانه', id: 'home' }];

/** نمونه مسیر breadcrumb شبیه VahedYek */
export const VAHEDYEK_DEMO_NAV_PATH: TaavBusinessSidebarNavPathItem[] = [
  { label: 'خانه', id: 'home' },
  { label: 'جزئیات مجتمع', id: 'complex' },
  { label: 'مشخصات فنی پروژه', id: 'technical-specs' },
];
