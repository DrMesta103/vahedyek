'use client';

import Link from 'next/link';

interface SidebarProps {
  activeItem?: string;
}

const menuItems = [
  { id: 'business',   label: 'جزئیات کسب و کار',              icon: 'fa-briefcase',       href: '#' },
  { id: 'complex',    label: 'جزئیات مجتمع',                   icon: 'fa-building',        href: '#' },
  { id: 'units',      label: 'فهرست واحد ها',                  icon: 'fa-list-ul',         href: '#' },
  { id: 'contracts',  label: 'فهرست قرارداد ها',               icon: 'fa-file-invoice',    href: '/contracts' },
  { id: 'drafts',     label: 'پیش نویس های در انتظار بررسی',   icon: 'fa-file-edit',       href: '#' },
  { id: 'payments',   label: 'واریزی مشتریان',                 icon: 'fa-hand-holding-usd', href: '#' },
  { id: 'reports',    label: 'گزارش های مدیریت',               icon: 'fa-chart-line',      href: '#' },
  { id: 'employees',  label: 'کارمندان',                       icon: 'fa-users',           href: '#' },
  { id: 'account',    label: 'حساب کاربری',                    icon: 'fa-user-circle',     href: '#' },
];

export default function Sidebar({ activeItem = 'complex' }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* پروفایل کاربر */}
      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#fb923c' }}>
          <i className="fa fa-user"></i>
        </div>
        <div className="name">علی علینقی پور</div>
        <div className="back-btn">
          <i className="fa fa-chevron-left"></i>
        </div>
      </div>

      {/* پروفایل lind */}
      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#111', fontSize: '10px' }}>lind</div>
        <div className="name" style={{ color: '#6b7280' }}>lind</div>
        <div className="back-btn">
          <i className="fa fa-chevron-left"></i>
        </div>
      </div>

      {/* تولبار آیکون‌ها */}
      <div className="sidebar-toolbar">
        <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
        <i className="fa fa-bell" style={{ position: 'relative' }}>
          <span className="badge">1</span>
        </i>
        <i className="fa fa-home"></i>
        <i className="fa fa-cog"></i>
        <i className="fa fa-moon"></i>
      </div>

      {/* منو */}
      <nav className="menu-list">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`menu-link${activeItem === item.id ? ' active' : ''}`}
          >
            <i className={`fa ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* باکس دعوت */}
      <div className="invite-section">
        <p>دعوت از دوستان و کسب درآمد</p>
        <button className="invite-btn">شروع درآمدزایی</button>
      </div>

      {/* فوتر نسخه */}
      <div className="version-footer">
        <i className="fa fa-angle-double-left"></i>
        <span>0.6.98</span>
      </div>
    </aside>
  );
}
