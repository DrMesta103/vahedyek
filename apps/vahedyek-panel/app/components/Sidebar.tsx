'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { formatIdentityLabel } from '../lib/contact';
import { getSidebarMenuItems } from '../lib/navigation';
import { MenuIcon } from './MenuIcon';
import { ThemeToggle } from './theme/ThemeToggle';

interface SidebarProps {
  activeItem?: string;
  forceCollapsed?: boolean;
  lockCollapsed?: boolean;
}

export default function Sidebar({ activeItem = 'home', forceCollapsed = false, lockCollapsed = false }: SidebarProps) {
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

  const handleOpenTenantDocs = () => {
    router.push('/dev-doc-threads');
  };

  const effectiveCollapsed = forceCollapsed || collapsed;
  const allowedMenuItemIds = data?.access?.allowedMenuItemIds;
  const canSeeSettings = !allowedMenuItemIds || allowedMenuItemIds.includes('settings');
  const visibleMenuItems = getSidebarMenuItems().filter((item) => !allowedMenuItemIds || allowedMenuItemIds.includes(item.id));
  const identityLabel = formatIdentityLabel(data?.user?.email, data?.user?.mobile);

  const settingsButton = (className?: string) =>
    canSeeSettings ? (
      <button type="button" onClick={() => router.push('/settings')} className={className} style={{ background: 'transparent', border: 'none' }} title="تنظیمات کلی">
        <MenuIcon name="fa-cog" className={activeItem === 'settings' ? 'active-toolbar-icon' : undefined} />
      </button>
    ) : null;

  return (
    <aside className={`sidebar${effectiveCollapsed ? ' collapsed' : ''}${lockCollapsed ? ' locked-collapsed' : ''}`}>
      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#fb923c' }}>
          <MenuIcon name="fa-user" />
        </div>
        <div className="name">
          <div>{data?.user?.fullName ?? 'در حال بارگذاری...'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{identityLabel}</div>
        </div>
        <div className="back-btn" style={{ visibility: 'hidden' }} aria-hidden="true">
          <MenuIcon name="fa-chevron-left" />
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
          title="تغییر کسب و کار"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          className="back-btn tenant-switch-btn"
        >
          <MenuIcon name="fa-exchange-alt" />
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
              <MenuIcon name="fa-ellipsis-h" />
            </button>
            {toolbarMenuOpen ? (
              <div className="toolbar-menu-dropdown">
                <button type="button" onClick={handleLogout} className="toolbar-menu-item">
                  <MenuIcon name="fa-sign-out-alt" />
                </button>
                <button type="button" className="toolbar-menu-item">
                  <span className="toolbar-badge-wrap">
                    <MenuIcon name="fa-bell" />
                    <span className="badge">1</span>
                  </span>
                </button>
                {settingsButton('toolbar-menu-item')}
                <button type="button" onClick={() => router.push('/')} className="toolbar-menu-item">
                  <MenuIcon name="fa-home" className={activeItem === 'home' ? 'active-toolbar-icon' : undefined} />
                </button>
                <ThemeToggle collapsed />
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: 'none' }}>
              <MenuIcon name="fa-sign-out-alt" />
            </button>
            <span className="toolbar-badge-wrap">
              <MenuIcon name="fa-bell" />
              <span className="badge">1</span>
            </span>
            {settingsButton()}
            <button type="button" onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none' }}>
              <MenuIcon name="fa-home" className={activeItem === 'home' ? 'active-toolbar-icon' : undefined} />
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
              <MenuIcon name={item.icon} className="menu-link-icon" />
              <span>{item.label}</span>
              <MenuIcon name="fa-lock" className="menu-lock-icon" />
            </div>
          ) : (
            <Link key={item.id} href={item.href} title={item.label} className={`menu-link${activeItem === item.id ? ' active' : ''}`}>
              <MenuIcon name={item.icon} className="menu-link-icon" />
              <span>{item.label}</span>
            </Link>
          ),
        )}
      </nav>

      <div className="invite-section" onClick={handleOpenTenantDocs} role="button" tabIndex={0} onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenTenantDocs();
        }
      }}>
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
          <MenuIcon name={effectiveCollapsed ? 'fa-angle-double-left' : 'fa-angle-double-right'} />
        </button>
        <span>0.8.0</span>
      </div>
    </aside>
  );
}
