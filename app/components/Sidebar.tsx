'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { APP_MENU_ITEMS } from '../lib/navigation';
import { ThemeToggle } from './theme/ThemeToggle';

interface SidebarProps {
  activeItem?: string;
  forceCollapsed?: boolean;
  lockCollapsed?: boolean;
}

export default function Sidebar({
  activeItem = 'home',
  forceCollapsed = false,
  lockCollapsed = false,
}: SidebarProps) {
  const router = useRouter();
  const { data } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const toolbarMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedState = window.localStorage.getItem('app-sidebar-collapsed');
    if (forceCollapsed || savedState === 'true') {
      setCollapsed(true);
    }
  }, [forceCollapsed]);

  useEffect(() => {
    if (forceCollapsed) return;
    window.localStorage.setItem('app-sidebar-collapsed', String(collapsed));
  }, [collapsed, forceCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!toolbarMenuRef.current?.contains(event.target as Node)) {
        setToolbarMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleSwitchTenant = async () => {
    router.push('/select-tenant?next=%2F');
    router.refresh();
  };

  const effectiveCollapsed = forceCollapsed || collapsed;
  const allowedMenuItemIds = data?.access?.allowedMenuItemIds;
  const visibleMenuItems = APP_MENU_ITEMS.filter((item) => !allowedMenuItemIds || allowedMenuItemIds.includes(item.id));

  return (
    <aside className={`sidebar${effectiveCollapsed ? ' collapsed' : ''}${lockCollapsed ? ' locked-collapsed' : ''}`}>
      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#fb923c' }}>
          <i className="fa fa-user"></i>
        </div>
        <div className="name">
          <div>{data?.user?.fullName ?? 'در حال بارگذاری...'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{data?.user?.email ?? ''}</div>
        </div>
        <div className="back-btn" style={{ visibility: 'hidden' }} aria-hidden="true">
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
          className="back-btn tenant-switch-btn"
        >
          <i className="fa fa-exchange-alt"></i>
        </button>
      </div>

      <div className="sidebar-toolbar">
        {effectiveCollapsed ? (
          <div className="toolbar-menu-wrap" ref={toolbarMenuRef}>
            <button
              type="button"
              className="toolbar-menu-trigger"
              onClick={() => setToolbarMenuOpen((current) => !current)}
              title="گزینه‌های بیشتر"
            >
              <i className="fa fa-ellipsis-h"></i>
            </button>
            {toolbarMenuOpen ? (
              <div className="toolbar-menu-dropdown">
                <button type="button" onClick={handleLogout} className="toolbar-menu-item">
                  <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
                </button>
                <button type="button" className="toolbar-menu-item">
                  <span className="toolbar-badge-wrap">
                    <i className="fa fa-bell"></i>
                    <span className="badge">1</span>
                  </span>
                </button>
                <button type="button" onClick={() => router.push('/settings')} className="toolbar-menu-item" title="تنظیمات کلی">
                  <i className="fa fa-cog"></i>
                </button>
                <button type="button" onClick={() => router.push('/')} className="toolbar-menu-item">
                  <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
                </button>
                <ThemeToggle collapsed />
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: 'none' }}>
              <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
            </button>
            <i className="fa fa-bell" style={{ position: 'relative' }}>
              <span className="badge">1</span>
            </i>
            <button type="button" onClick={() => router.push('/settings')} style={{ background: 'transparent', border: 'none' }} title="تنظیمات کلی">
              <i className="fa fa-cog"></i>
            </button>
            <button type="button" onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none' }}>
              <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
            </button>
            <ThemeToggle />
          </>
        )}
      </div>

      <nav className="menu-list">
        {visibleMenuItems.map((item) =>
          item.disabled ? (
            <div
              key={item.id}
              className="menu-link"
              aria-disabled="true"
              title={item.label}
              style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}
            >
              <i className={`fa ${item.icon}`}></i>
              <span>{item.label}</span>
              <i className="fa fa-lock" style={{ marginRight: 'auto', fontSize: '12px' }}></i>
            </div>
          ) : (
            <Link key={item.id} href={item.href} title={item.label} className={`menu-link${activeItem === item.id ? ' active' : ''}`}>
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
        <button
          type="button"
          className="version-toggle"
          onClick={() => setCollapsed((current) => !current)}
          title={effectiveCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
          disabled={lockCollapsed}
        >
          <i className={`fa ${effectiveCollapsed ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>
        <span>0.8.0</span>
      </div>
    </aside>
  );
}
