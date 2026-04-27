'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Building2, ChevronLeft, ChevronsLeft, ChevronsRight, Ellipsis, Home, LogOut, MoonStar, Settings, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { APP_MENU_ITEMS, getActiveNavigationItem } from '../lib/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const toolbarMenuRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = window.localStorage.getItem('dastranj-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem('dastranj-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    const savedState = window.localStorage.getItem('dastranj-sidebar-collapsed');
    if (savedState === 'true') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('dastranj-sidebar-collapsed', String(collapsed));
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

  const activeItem = getActiveNavigationItem(pathname);

  const toolbarActions = (
    <>
      <button type="button" title="خروج">
        <LogOut size={18} className="toolbar-icon mirrored-icon" />
      </button>
      <button type="button" title="اعلان‌ها">
        <span className="toolbar-badge-wrap">
          <Bell size={18} className="toolbar-icon" />
          <span className="badge">1</span>
        </span>
      </button>
      <button type="button" onClick={() => router.push('/business-settings')} title="تنظیمات کسب و کار">
        <Settings size={18} className={`toolbar-icon${activeItem.id === 'business-settings' ? ' active-toolbar-icon' : ''}`} />
      </button>
      <button type="button" onClick={() => router.push('/')} title="خانه">
        <Home size={18} className={`toolbar-icon${activeItem.id === 'home' ? ' active-toolbar-icon' : ''}`} />
      </button>
      <button type="button" title="تم دسترنج" onClick={toggleTheme}>
        {theme === 'dark' ? <MoonStar size={18} className="toolbar-icon" /> : <Sun size={18} className="toolbar-icon" />}
      </button>
    </>
  );

  return (
    <aside className={`sidebar dastranj-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="profile-item">
        <div className="avatar-small dastranj-user-avatar">
          <Building2 size={18} />
        </div>
        <div className="name">
          <div>دسترنج</div>
          <div className="sidebar-subtitle">پنل مدیریت منابع انسانی</div>
        </div>
        <div className="back-btn" style={{ visibility: 'hidden' }} aria-hidden="true">
          <ChevronLeft size={14} />
        </div>
      </div>

      <div className="profile-item">
        <div className="avatar-small dastranj-tenant-avatar">HR</div>
        <div className="name">
          <div>دسترنج پنل</div>
          <div className="sidebar-subtitle">Next.js + Prisma</div>
        </div>
        <button type="button" onClick={() => router.push('/account')} title="حساب کسب و کار" className="back-btn tenant-switch-btn">
          <ChevronLeft size={14} />
        </button>
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
              <Ellipsis size={18} />
            </button>
            {toolbarMenuOpen ? <div className="toolbar-menu-dropdown">{toolbarActions}</div> : null}
          </div>
        ) : (
          toolbarActions
        )}
      </div>

      <nav className="menu-list">
        {APP_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

          return (
            <Link key={item.href} href={item.href} className={`menu-link${active ? ' active' : ''}`} title={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="invite-section dastranj-invite-section">
        <p>سیستم فعال</p>
        <button type="button" className="invite-btn" onClick={() => router.push('/quick-setup')}>
          راه‌اندازی و پیکربندی
        </button>
      </div>

      <div className="version-footer">
        <button
          type="button"
          className="version-toggle"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
        >
          {collapsed ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </button>
        <span>0.1.0</span>
      </div>
    </aside>
  );
}
