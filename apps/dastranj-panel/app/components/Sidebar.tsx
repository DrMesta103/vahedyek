'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { formatIdentityLabel } from '../lib/contact';
import { getSidebarMenuItems } from '../lib/navigation';
import { minimalScrollClass } from './MinimalScroll';
import { ThemeToggle } from './theme/ThemeToggle';

interface SidebarProps {
  activeItem?: string;
  forceCollapsed?: boolean;
  forceExpanded?: boolean;
  lockCollapsed?: boolean;
}

export function Sidebar({ activeItem = 'home', forceCollapsed = false, forceExpanded = false, lockCollapsed = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const toolbarMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (forceCollapsed) {
      setCollapsed(true);
      return;
    }

    if (forceExpanded) {
      setCollapsed(false);
      return;
    }

    const savedState = window.localStorage.getItem('app-sidebar-collapsed');
    setCollapsed(savedState === 'true');
  }, [forceCollapsed, forceExpanded]);

  useEffect(() => {
    if (forceCollapsed || forceExpanded) return;
    window.localStorage.setItem('app-sidebar-collapsed', String(collapsed));
  }, [collapsed, forceCollapsed, forceExpanded]);

  useEffect(() => {
    if (forceCollapsed) return;
    if (pathname === '/business-settings' || pathname.startsWith('/business-settings/')) {
      setCollapsed(false);
    }
  }, [forceCollapsed, pathname]);

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

  const effectiveCollapsed = forceCollapsed || (!forceExpanded && collapsed);
  const allowedMenuItemIds = data?.access?.allowedMenuItemIds;
  const canSeeSettings = !allowedMenuItemIds || allowedMenuItemIds.includes('settings');
  const visibleMenuItems = getSidebarMenuItems().filter((item) => !allowedMenuItemIds || allowedMenuItemIds.includes(item.id));
  const identityLabel = formatIdentityLabel(data?.user?.email, data?.user?.mobile);

  const settingsButton = (className?: string) =>
    canSeeSettings ? (
      <button type="button" onClick={() => router.push('/settings')} className={className} style={{ background: 'transparent', border: 'none' }} title="تنظیمات کلی">
        <i className={`fa fa-cog${activeItem === 'settings' ? ' active-toolbar-icon' : ''}`}></i>
      </button>
    ) : null;

  return (
    <aside className={`sidebar${effectiveCollapsed ? ' collapsed' : ''}${lockCollapsed ? ' locked-collapsed' : ''}`}>
      <div className="profile-item">
        <div className="avatar-small dastranj-user-avatar" style={{ background: '#fb923c' }}>
          <i className="fa fa-user"></i>
        </div>
        <div className="name">
          <div>{data?.user?.fullName ?? 'در حال بارگذاری...'}</div>
          <div className="sidebar-subtitle">{identityLabel}</div>
        </div>
        <div className="back-btn" style={{ visibility: 'hidden' }} aria-hidden="true">
          <i className="fa fa-chevron-left"></i>
        </div>
      </div>

      <div className="profile-item">
        <div className="avatar-small dastranj-tenant-avatar">
          {data?.tenant?.brandCode ?? 'TEN'}
        </div>
        <div className="name sidebar-tenant-copy">
          <div>{data?.tenant?.name ?? 'tenant'}</div>
          <div className="sidebar-subtitle">{data?.tenant?.slug ?? ''}</div>
        </div>
        <button
          type="button"
          onClick={handleSwitchTenant}
          title="تغییر کسب و کار"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          className="back-btn tenant-switch-btn"
        >
          <i className="fa fa-exchange-alt"></i>
        </button>
      </div>

      <div className="sidebar-toolbar">
        {effectiveCollapsed ? (
          <>
            {!lockCollapsed ? (
              <button
                type="button"
                className="toolbar-sidebar-expand"
                onClick={() => setCollapsed(false)}
                aria-label="باز کردن منو"
                title="باز کردن منو"
              >
                <i className="fa fa-angle-double-right" aria-hidden />
              </button>
            ) : null}
            <div className="toolbar-menu-wrap" ref={toolbarMenuRef}>
              <button
                type="button"
                className="toolbar-menu-trigger"
                onClick={() => setToolbarMenuOpen((current) => !current)}
                title="میانبر نوار ابزار (خروج، خانه، اعلان و …)"
                aria-label="میانبر نوار ابزار"
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
                  {settingsButton('toolbar-menu-item')}
                  <button type="button" onClick={() => router.push('/')} className="toolbar-menu-item">
                    <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
                  </button>
                  <ThemeToggle collapsed />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: 'none' }}>
              <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
            </button>
            <i className="fa fa-bell" style={{ position: 'relative' }}>
              <span className="badge">1</span>
            </i>
            {settingsButton()}
            <button type="button" onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none' }}>
              <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
            </button>
            <ThemeToggle />
          </>
        )}
      </div>

      <nav className={minimalScrollClass('vertical', 'menu-list')}>
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

      <div
        className="invite-section"
        onClick={handleOpenTenantDocs}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpenTenantDocs();
          }
        }}
      >
        <p>tenant فعال</p>
        <button className="invite-btn">{data?.tenant?.name ?? 'در حال بارگذاری...'}</button>
      </div>

      <div className="version-footer">
        {lockCollapsed ? null : (
          <button
            type="button"
            className="version-toggle"
            onClick={() => setCollapsed((current) => !current)}
            title={effectiveCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
          >
            <i className={`fa ${effectiveCollapsed ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
          </button>
        )}
        <span>0.8.0</span>
      </div>
    </aside>
  );
}
