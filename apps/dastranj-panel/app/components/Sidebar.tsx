import Link from 'next/link';
import { Home, Settings, ClipboardList, CreditCard, BarChart3 } from 'lucide-react';

const menuItems = [
  { label: 'داشبورد', href: '/', icon: Home, active: true },
  { label: 'درخواست‌ها', href: '#', icon: ClipboardList },
  { label: 'پرداخت‌ها', href: '#', icon: CreditCard },
  { label: 'گزارش‌ها', href: '#', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">د</div>
        <div>
          <strong>دسترنج</strong>
          <span>اپ مستقل</span>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className={`menu-link${item.active ? ' active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link href="#" className="settings-link">
        <Settings size={18} />
        <span>تنظیمات</span>
      </Link>
    </aside>
  );
}
