import type { TaavBusinessSidebarItem } from '@repo/ui/taav/business';
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
import type { NavigationItem } from '../navigation';

const icon = (node: ReactNode) => node;

const NAV_ICON_BY_ID: Record<string, ReactNode> = {
  home: icon(<Home />),
  'quick-setup': icon(<Zap />),
  'business-settings': icon(<Briefcase />),
  locations: icon(<MapPin />),
  calendars: icon(<CalendarDays />),
  policies: icon(<Shield />),
  employees: icon(<Users />),
  'work-groups': icon(<GitBranch />),
  'organization-units': icon(<Building2 />),
  'shift-templates': icon(<Building2 />),
  'draft-templates': icon(<Copy />),
  'request-reasons': icon(<FileText />),
  account: icon(<UserCircle />),
  'dev-doc-threads': icon(<MessageSquare />),
  'dev-doc-events': icon(<ClipboardList />),
  settings: icon(<Settings />),
};

export const DASHRANJ_SIDEBAR_VERSION = '0.8.0';

export function mapDastRanjNavToTaavSidebarItems(
  items: NavigationItem[],
  activeItemId: string,
): TaavBusinessSidebarItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: NAV_ICON_BY_ID[item.id] ?? icon(<Home />),
    href: item.href,
    disabled: item.disabled,
    active: activeItemId === item.id,
  }));
}

export function createDastRanjQuickActionIcons() {
  return {
    logout: icon(<LogOut className="scale-x-[-1]" />),
    notifications: icon(<Bell />),
    settings: icon(<Settings />),
    home: icon(<Home />),
  };
}
