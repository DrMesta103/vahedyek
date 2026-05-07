'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { formatIdentityLabel } from '../../lib/contact';
import { ThemeToggle } from '../theme/ThemeToggle';

interface CustomerSidebarProps {
  activeItem?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  children?: MenuItem[];
}

const CUSTOMER_MENU_ITEMS: MenuItem[] = [
  {
    id: 'contracts',
    label: 'قراردادهای من',
    icon: 'fa-file-contract',
    href: '/customer-portal/contracts',
  },
  {
    id: 'financial',
    label: 'مدیریت مالی',
    icon: 'fa-money-bill-wave',
    href: '/customer-portal/financial',
    children: [
      {
        id: 'receipts',
        label: 'فیش‌های پرداختی',
        icon: 'fa-receipt',
        href: '/customer-portal/financial/receipts',
      },
      {
        id: 'payment-methods',
        label: 'روش‌های پرداخت',
        icon: 'fa-credit-card',
        href: '/customer-portal/financial/payment-methods',
      },
      {
        id: 'due-dates',
        label: 'سررسیدهای من',
        icon: 'fa-calendar-check',
        href: '/customer-portal/financial/due-dates',
      },
    ],
  },
  {
    id: 'support',
    label: 'پشتیبانی',
    icon: 'fa-headset',
    href: '/customer-portal/support',
  },
  {
    id: 'account',
    label: 'حساب کاربری',
    icon: 'fa-user-circle',
    href: '/customer-portal/account',
  },
];

export default function CustomerSidebar({ activeItem = 'home' }: CustomerSidebarProps) {
  const router = useRouter();
  const { data } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['financial']));
  const toolbarMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedState = window.localStorage.getItem('customer-sidebar-collapsed');
    if (savedState === 'true') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('customer-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

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

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const identityLabel = formatIdentityLabel(data?.user?.email, data?.user?.mobile);

  return (
    <aside className={`sidebar customer-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="profile-item">
        <div className="avatar-small" style={{ background: '#008080' }}>
          <i className="fa fa-user"></i>
        </div>
        <div className="name">
          <div>{data?.user?.fullName ?? 'در حال بارگذاری...'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{identityLabel}</div>
        </div>
      </div>

      <div className="sidebar-toolbar">
        {collapsed ? (
          <div className="toolbar-menu-wrap" ref={toolbarMenuRef}>
            <button
              type="button"
              className="toolbar-menu-trigger"
              onClick={() => setToolbarMenuOpen((current) => !current)}
              title="گزینه‌های بیشتر"
            >
              <i className="fa fa-ellipsis-h"></i>
            </button>
            {toolbarMenuOpen && (
              <div className="toolbar-menu-dropdown">
                <button type="button" onClick={handleLogout} className="toolbar-menu-item">
                  <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
                </button>
                <button type="button" className="toolbar-menu-item">
                  <span className="toolbar-badge-wrap">
                    <i className="fa fa-bell"></i>
                    <span className="badge">3</span>
                  </span>
                </button>
                <button type="button" onClick={() => router.push('/customer-portal')} className="toolbar-menu-item">
                  <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
                </button>
                <ThemeToggle collapsed />
              </div>
            )}
          </div>
        ) : (
          <>
            <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: 'none' }}>
              <i className="fa fa-sign-out-alt" style={{ transform: 'scaleX(-1)' }}></i>
            </button>
            <i className="fa fa-bell" style={{ position: 'relative' }}>
              <span className="badge">3</span>
            </i>
            <button type="button" onClick={() => router.push('/customer-portal')} style={{ background: 'transparent', border: 'none' }}>
              <i className={`fa fa-home${activeItem === 'home' ? ' active-toolbar-icon' : ''}`}></i>
            </button>
            <ThemeToggle />
          </>
        )}
      </div>

      <nav className="menu-list">
        {CUSTOMER_MENU_ITEMS.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <>
                <div
                  className={`menu-link menu-link-expandable${activeItem === item.id ? ' active' : ''}`}
                  onClick={() => toggleMenu(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleMenu(item.id);
                    }
                  }}
                >
                  <i className={`fa ${item.icon}`}></i>
                  <span>{item.label}</span>
                  <i className={`fa fa-chevron-${expandedMenus.has(item.id) ? 'down' : 'left'}`} style={{ marginRight: 'auto', fontSize: '12px' }}></i>
                </div>
                {expandedMenus.has(item.id) && (
                  <div className="submenu">
                    {item.children.map((child) => (
                      <Link key={child.id} href={child.href} className={`menu-link submenu-link${activeItem === child.id ? ' active' : ''}`}>
                        <i className={`fa ${child.icon}`}></i>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={item.href} className={`menu-link${activeItem === item.id ? ' active' : ''}`}>
                <i className={`fa ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="version-footer">
        <button
          type="button"
          className="version-toggle"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
        >
          <i className={`fa ${collapsed ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>
        <span>پنل خریدار</span>
      </div>
    </aside>
  );
}
