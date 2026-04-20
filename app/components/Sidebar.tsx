'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../hooks/useAuthContext';
import { APP_MENU_ITEMS } from '../lib/navigation';

interface SidebarProps {
  activeItem?: string;
}

export default function Sidebar({ activeItem = 'home' }: SidebarProps) {
  const router = useRouter();
  const { data } = useAuthContext();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleSwitchTenant = async () => {
    router.push('/select-tenant?next=%2F');
    router.refresh();
  };

  return (
    <aside className="sidebar">
      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#fb923c' }}>
          <i className="fa fa-user"></i>
        </div>
        <div className="name">
          <div>{data?.user.fullName ?? 'در حال بارگذاری...'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{data?.user.email ?? ''}</div>
        </div>
        <div className="back-btn">
          <i className="fa fa-chevron-left"></i>
        </div>
      </div>

      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#111', fontSize: '10px' }}>
          {data?.tenant?.brandCode ?? 'TEN'}
        </div>
        <div className="name" style={{ color: '#6b7280' }}>
          <div>{data?.tenant?.name ?? 'tenant'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{data?.tenant?.slug ?? ''}</div>
        </div>
        <button
          type="button"
          onClick={handleSwitchTenant}
          title="تغییر کسب‌وکار"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          className="back-btn"
        >
          <i className="fa fa-exchange-alt"></i>
        </button>
      </div>

      <div className="sidebar-toolbar">
        <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: 'none' }}>
          <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
        </button>
        <i className="fa fa-bell" style={{ position: 'relative' }}>
          <span className="badge">1</span>
        </i>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none' }}>
          <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
        </button>
        <i className="fa fa-moon"></i>
      </div>

      <nav className="menu-list">
        {APP_MENU_ITEMS.map((item) =>
          item.disabled ? (
            <div
              key={item.id}
              className="menu-link"
              aria-disabled="true"
              style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}
            >
              <i className={`fa ${item.icon}`}></i>
              <span>{item.label}</span>
              <i className="fa fa-lock" style={{ marginRight: 'auto', fontSize: '12px' }}></i>
            </div>
          ) : (
            <Link key={item.id} href={item.href} className={`menu-link${activeItem === item.id ? ' active' : ''}`}>
              <i className={`fa ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ),
        )}
      </nav>

      <div className="invite-section">
        <p>tenant فعال</p>
        <button className="invite-btn">{data?.tenant?.name ?? 'در حال بارگذاری...'}</button>
      </div>

      <div className="version-footer">
        <i className="fa fa-angle-double-left"></i>
        <span>0.8.0</span>
      </div>
    </aside>
  );
}
