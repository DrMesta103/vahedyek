'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CalendarDays, FileSpreadsheet, FileText, GitBranch, LayoutDashboard, MapPinned, Settings2, UserCircle2, Users, Workflow } from 'lucide-react';

const items = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/quick-setup', label: 'راه‌اندازی سریع', icon: Workflow },
  { href: '/business-settings', label: 'تنظیمات کسب و کار', icon: Settings2 },
  { href: '/locations', label: 'محل کار', icon: MapPinned },
  { href: '/calendars', label: 'تقویم‌ها', icon: CalendarDays },
  { href: '/policies', label: 'سیاست‌ها', icon: FileText },
  { href: '/employees', label: 'کارمندان', icon: Users },
  { href: '/work-groups', label: 'گروه‌های کاری', icon: GitBranch },
  { href: '/draft-templates', label: 'پیش‌نویس‌ها', icon: FileSpreadsheet },
  { href: '/account', label: 'حساب کسب و کار', icon: UserCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="panel-sidebar">
      <div className="brand-card">
        <div className="brand-icon">
          <Building2 size={22} />
        </div>
        <div>
          <strong>دسترنج</strong>
          <span>نسخه Next + Prisma</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link${active ? ' active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
