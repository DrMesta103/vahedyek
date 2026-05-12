'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  ChartColumn,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Ellipsis,
  Home,
  Lock,
  LogOut,
  ReceiptText,
  Settings,
  User,
  UserCircle2,
  Users,
  Wallet,
  Bell,
  List,
  ArrowRightLeft,
  ClipboardList,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'fa-briefcase': Briefcase,
  'fa-building': Building2,
  'fa-list-ul': List,
  'fa-file-invoice': ReceiptText,
  'fa-copy': Copy,
  'fa-wallet': Wallet,
  'fa-chart-line': ChartColumn,
  'fa-users': Users,
  'fa-user-circle': UserCircle2,
  'fa-cog': Settings,
  'fa-home': Home,
  'fa-user': User,
  'fa-chevron-left': ChevronLeft,
  'fa-exchange-alt': ArrowRightLeft,
  'fa-ellipsis-h': Ellipsis,
  'fa-sign-out-alt': LogOut,
  'fa-bell': Bell,
  'fa-lock': Lock,
  'fa-angle-double-left': ChevronsLeft,
  'fa-angle-double-right': ChevronsRight,
  'fa-clipboard-list': ClipboardList,
};

type MenuIconProps = {
  name: string;
  className?: string;
};

export function MenuIcon({ name, className }: MenuIconProps) {
  const Icon = iconMap[name] ?? Briefcase;
  return <Icon className={className} aria-hidden="true" />;
}
