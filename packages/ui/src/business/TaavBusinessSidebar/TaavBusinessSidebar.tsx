'use client';

import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { TaavTooltip, TaavTooltipProvider } from '../../primitives/TaavTooltip';
import { cn } from '../../utils/cn';
import {
  businessSidebarCollapsedTenantStrip,
  businessSidebarCollapsedToolbar,
  businessSidebarContentBody,
  businessSidebarContentColumn,
  businessSidebarMenuItem,
  businessSidebarNavScroll,
  businessSidebarProfileRow,
  businessSidebarQuickAction,
  businessSidebarRailWrap,
  businessSidebarRoot,
  businessSidebarShell,
} from './taav-business-sidebar.variants';
import {
  BusinessSidebarNavPath,
  DEFAULT_BUSINESS_SIDEBAR_NAV_PATH,
  type TaavBusinessSidebarNavPathItem,
} from './BusinessSidebarNavPath';

export type TaavBusinessSidebarUser = {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarFallback?: string;
};

export type TaavBusinessSidebarTenantStatus = 'active' | 'loading' | 'inactive' | 'error';

export type TaavBusinessSidebarTenant = {
  label: string;
  name: string;
  avatarText?: string;
  status?: TaavBusinessSidebarTenantStatus;
  statusLabel?: string;
};

export type TaavBusinessSidebarQuickAction = {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  href?: string;
};

export type TaavBusinessSidebarItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
  children?: TaavBusinessSidebarItem[];
};

export type TaavBusinessSidebarVariant = 'dastranj' | 'default';
export type TaavBusinessSidebarWidth = 'compact' | 'default' | 'wide';
export type TaavBusinessSidebarPlacement = 'left' | 'right';

export type TaavBusinessSidebarProps = {
  user: TaavBusinessSidebarUser;
  tenant: TaavBusinessSidebarTenant;
  quickActions?: TaavBusinessSidebarQuickAction[];
  items: TaavBusinessSidebarItem[];
  activeItemId?: string;
  version?: string;
  width?: TaavBusinessSidebarWidth;
  variant?: TaavBusinessSidebarVariant;
  placement?: TaavBusinessSidebarPlacement;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  lockCollapsed?: boolean;
  loading?: boolean;
  /** Breadcrumb above main content, top-aligned with the sidebar rail. Defaults to خانه. */
  navPath?: TaavBusinessSidebarNavPathItem[];
  /** When false, the nav path bar is hidden. */
  showNavPath?: boolean;
  children?: ReactNode;
  shellClassName?: string;
  contentClassName?: string;
  navPathClassName?: string;
  onNavigate?: (item: TaavBusinessSidebarItem) => void;
  onTenantSwitch?: () => void;
  onTenantPanelClick?: () => void;
  onLogout?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className'>;

function SidebarBadge({ value }: { value: string | number }) {
  return (
    <span className="absolute -left-2 -top-1.5 min-w-[16px] rounded-[10px] bg-[var(--taav-business-sidebar-badge-bg)] px-[5px] py-0.5 text-center text-[10px] font-bold leading-none text-white">
      {value}
    </span>
  );
}

function SidebarIconButton({
  label,
  icon,
  active,
  badge,
  href,
  onClick,
  className,
  collapsed = false,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: string | number;
  href?: string;
  onClick?: () => void;
  className?: string;
  collapsed?: boolean;
}) {
  const classes = cn(businessSidebarQuickAction({ active, collapsed }), className);

  const content = (
    <>
      <span className="inline-flex">{icon}</span>
      {badge !== undefined ? <SidebarBadge value={badge} /> : null}
    </>
  );

  const wrapped = collapsed ? (
    <TaavTooltip content={label} side="left">
      <span className="inline-flex">{content}</span>
    </TaavTooltip>
  ) : (
    content
  );

  if (href) {
    return (
      <a href={href} title={label} aria-label={label} className={classes} onClick={onClick}>
        {wrapped}
      </a>
    );
  }

  return (
    <button type="button" title={label} aria-label={label} className={classes} onClick={onClick}>
      {wrapped}
    </button>
  );
}

function SidebarNavItem({
  item,
  active,
  collapsed,
  placement,
  onNavigate,
}: {
  item: TaavBusinessSidebarItem;
  active: boolean;
  collapsed: boolean;
  placement: TaavBusinessSidebarPlacement;
  onNavigate?: (item: TaavBusinessSidebarItem) => void;
}) {
  const classes = businessSidebarMenuItem({
    active,
    disabled: item.disabled,
    collapsed,
    placement,
  });

  const content = (
    <>
      <span className="inline-flex shrink-0 [&_svg]:h-[14px] [&_svg]:w-[14px]">{item.icon}</span>
      {!collapsed ? <span className="min-w-0 flex-1 truncate whitespace-nowrap">{item.label}</span> : null}
      {!collapsed && item.badge !== undefined ? (
        <span className="mr-auto rounded-[10px] bg-[var(--taav-business-sidebar-badge-bg)] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  const wrapped = collapsed ? (
    <TaavTooltip content={item.label} side="left">
      <span className="inline-flex w-full">{content}</span>
    </TaavTooltip>
  ) : (
    content
  );

  if (item.disabled) {
    return (
      <div className={classes} aria-disabled="true" title={item.label} aria-label={item.label}>
        {wrapped}
      </div>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className={classes}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        onClick={(event) => {
          if (onNavigate) {
            event.preventDefault();
            onNavigate(item);
          }
        }}
      >
        {wrapped}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={() => onNavigate?.(item)}
    >
      {wrapped}
    </button>
  );
}

function tenantStatusLabel(tenant: TaavBusinessSidebarTenant): string {
  if (tenant.statusLabel) return tenant.statusLabel;
  switch (tenant.status) {
    case 'loading':
      return 'در حال بارگذاری...';
    case 'inactive':
      return 'tenant غیرفعال';
    case 'error':
      return 'خطا در tenant';
    case 'active':
    default:
      return tenant.label || 'tenant فعال';
  }
}

export function TaavBusinessSidebar({
  user,
  tenant,
  quickActions,
  items,
  activeItemId,
  version,
  width = 'default',
  variant = 'dastranj',
  placement: placementProp,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  collapsible = true,
  lockCollapsed = false,
  loading = false,
  navPath = DEFAULT_BUSINESS_SIDEBAR_NAV_PATH,
  showNavPath = true,
  children,
  shellClassName,
  contentClassName,
  navPathClassName,
  onNavigate,
  onTenantSwitch,
  onTenantPanelClick,
  onLogout,
  onCollapsedChange,
  className,
  ...props
}: TaavBusinessSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const placement = placementProp ?? 'right';

  const setCollapsed = (value: boolean) => {
    if (!collapsible || lockCollapsed) return;
    if (collapsedProp === undefined) {
      setInternalCollapsed(value);
    }
    onCollapsedChange?.(value);
  };

  const canToggleCollapse = collapsible && !lockCollapsed;

  const tenantPanelBackground =
    tenant.status === 'loading'
      ? 'var(--taav-business-sidebar-tenant-loading-bg)'
      : tenant.status === 'inactive'
        ? 'var(--taav-business-sidebar-tenant-inactive-bg)'
        : tenant.status === 'error'
          ? 'var(--taav-business-sidebar-tenant-error-bg)'
          : 'var(--taav-business-sidebar-tenant-active-bg)';

  const isItemActive = (item: TaavBusinessSidebarItem) =>
    item.active ?? (activeItemId !== undefined && item.id === activeItemId);

  const userInitial = user.avatarFallback ?? user.name.slice(0, 1);
  const tenantInitial = tenant.avatarText ?? tenant.name.slice(0, 3).toUpperCase();

  const sidebarRail = (
    <TaavTooltipProvider>
      <div className={businessSidebarRailWrap()}>
        <aside
          dir="rtl"
          data-taav-business-sidebar
          data-variant={variant}
          data-placement={placement}
          data-collapsed={collapsed ? 'true' : 'false'}
          className={cn(
            businessSidebarRoot({
              variant,
              placement,
              width: collapsed ? undefined : width,
              collapsed,
            }),
            className,
          )}
          {...props}
        >
        {/* User profile */}
        <div className={businessSidebarProfileRow({ collapsed })}>
          {(() => {
            const avatar = (
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-black',
                  collapsed
                    ? 'h-[var(--taav-business-sidebar-collapsed-avatar-size)] w-[var(--taav-business-sidebar-collapsed-avatar-size)] text-[9px]'
                    : 'ml-2 h-8 w-8 text-[10px]',
                  variant === 'dastranj'
                    ? 'bg-[var(--taav-business-sidebar-user-avatar-bg)] text-[#03121c]'
                    : 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]',
                )}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
            );

            if (collapsed) {
              return (
                <TaavTooltip content={user.name} side="left">
                  <span className="inline-flex">{avatar}</span>
                </TaavTooltip>
              );
            }

            return (
              <>
                {avatar}
                <div className="min-w-0 flex-1 text-[11px] leading-tight">
                  <div className="truncate">{loading ? 'در حال بارگذاری...' : user.name}</div>
                  {user.subtitle ? (
                    <div className="mt-0.5 truncate text-[9px] text-[var(--taav-business-sidebar-text-muted)]">
                      {user.subtitle}
                    </div>
                  ) : null}
                </div>
              </>
            );
          })()}
        </div>

        {/* Tenant profile */}
        <div className={businessSidebarProfileRow({ collapsed })}>
          {(() => {
            const avatar = (
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-extrabold',
                  collapsed
                    ? 'h-[var(--taav-business-sidebar-collapsed-avatar-size)] w-[var(--taav-business-sidebar-collapsed-avatar-size)] text-[8px]'
                    : 'ml-2 h-8 w-8 text-[10px]',
                  variant === 'dastranj'
                    ? 'bg-[var(--taav-business-sidebar-tenant-avatar-bg)] text-[var(--taav-business-sidebar-tenant-avatar-text)]'
                    : 'bg-[var(--taav-surface-muted)] text-[var(--taav-text-muted)]',
                )}
              >
                {tenantInitial}
              </div>
            );

            if (collapsed) {
              return (
                <TaavTooltip content={tenant.name} side="left">
                  <span className="inline-flex">{avatar}</span>
                </TaavTooltip>
              );
            }

            return (
              <>
                {avatar}
                <div className="min-w-0 flex-1 text-[11px] leading-tight text-[var(--taav-business-sidebar-tenant-name)]">
                  <div className="truncate">{loading ? 'tenant' : tenant.name}</div>
                  {tenant.label ? (
                    <div className="mt-0.5 truncate text-[9px] text-[var(--taav-business-sidebar-text-muted)]">
                      {tenant.label}
                    </div>
                  ) : null}
                </div>
                {onTenantSwitch ? (
                  <button
                    type="button"
                    title="تغییر کسب و کار"
                    aria-label="تغییر کسب و کار"
                    onClick={onTenantSwitch}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-[var(--taav-business-sidebar-switch-bg)] text-[var(--taav-business-sidebar-switch-text)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
                    </svg>
                  </button>
                ) : null}
              </>
            );
          })()}
        </div>

        {/* Quick actions */}
        {quickActions && quickActions.length > 0 ? (
          <div
            className={cn(
              collapsed
                ? businessSidebarCollapsedToolbar()
                : 'flex shrink-0 items-center justify-around bg-[var(--taav-business-sidebar-toolbar-bg)] px-1.5 py-2',
            )}
          >
            {collapsed && canToggleCollapse ? (
              <TaavTooltip content="باز کردن منو" side="left">
                <button
                  type="button"
                  className="inline-flex h-[var(--taav-business-sidebar-collapsed-footer-btn-size)] w-[var(--taav-business-sidebar-collapsed-footer-btn-size)] items-center justify-center rounded-[10px] border border-[color:var(--taav-business-sidebar-collapse-border)] bg-[var(--taav-business-sidebar-collapse-bg)] text-[var(--taav-business-sidebar-collapse-text)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
                  aria-label="باز کردن منو"
                  title="باز کردن منو"
                  onClick={() => setCollapsed(false)}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
                  </svg>
                </button>
              </TaavTooltip>
            ) : null}
            {quickActions.map(({ id, ...action }) => (
              <SidebarIconButton key={id} {...action} collapsed={collapsed} />
            ))}
            {onLogout && !quickActions.some((action) => action.id === 'logout') ? (
              <SidebarIconButton
                label="خروج"
                collapsed={collapsed}
                icon={
                  <svg viewBox="0 0 24 24" className="scale-x-[-1]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                }
                onClick={onLogout}
              />
            ) : null}
          </div>
        ) : null}

        {/* Navigation */}
        <nav className={businessSidebarNavScroll(collapsed)} aria-label="منوی اصلی">
          {items.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={isItemActive(item)}
              collapsed={collapsed}
              placement={placement}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Tenant status panel */}
        {collapsed ? (
          <div className="shrink-0" style={variant === 'dastranj' ? { background: tenantPanelBackground } : undefined}>
            <TaavTooltip content={`${tenantStatusLabel(tenant)} — ${tenant.name}`} side="left">
              <button
                type="button"
                className={cn(
                  businessSidebarCollapsedTenantStrip(),
                  'w-full border-0 focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
                  onTenantPanelClick ? 'cursor-pointer' : 'cursor-default',
                )}
                style={{ minHeight: 'var(--taav-business-sidebar-collapsed-tenant-strip-height)' }}
                aria-label={`${tenantStatusLabel(tenant)}: ${tenant.name}`}
                onClick={onTenantPanelClick}
              >
                <span
                  className={cn(
                    'inline-flex h-2 w-2 rounded-full',
                    tenant.status === 'error'
                      ? 'bg-[var(--taav-danger)]'
                      : tenant.status === 'loading'
                        ? 'animate-pulse bg-[var(--taav-brand)]'
                        : 'bg-[var(--taav-brand)]',
                  )}
                  aria-hidden
                />
              </button>
            </TaavTooltip>
          </div>
        ) : (
          <div
            className={cn(
              'shrink-0 px-3 py-3.5 text-center',
              variant === 'default' && 'bg-[var(--taav-surface-soft)]',
              onTenantPanelClick && 'cursor-pointer',
            )}
            style={variant === 'dastranj' ? { background: tenantPanelBackground } : undefined}
            role={onTenantPanelClick ? 'button' : undefined}
            tabIndex={onTenantPanelClick ? 0 : undefined}
            onClick={onTenantPanelClick}
            onKeyDown={(event) => {
              if (onTenantPanelClick && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onTenantPanelClick();
              }
            }}
          >
            <p
              className={cn(
                'm-0 mb-2.5 text-[10px]',
                variant === 'dastranj'
                  ? 'text-[var(--taav-business-sidebar-tenant-text)]'
                  : 'text-[var(--taav-text-muted)]',
                tenant.status === 'loading' && 'animate-pulse',
              )}
            >
              {tenantStatusLabel(tenant)}
            </p>
            <button
              type="button"
              className={cn(
                'w-full rounded-[10px] border-0 px-3 text-[11px] font-bold',
                'min-h-[var(--taav-business-sidebar-menu-item-height)]',
                'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
                variant === 'dastranj'
                  ? 'text-[var(--taav-business-sidebar-tenant-btn-text)]'
                  : 'bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)]',
              )}
              style={
                variant === 'dastranj' ? { background: 'var(--taav-business-sidebar-tenant-btn-bg)' } : undefined
              }
              onClick={(event) => {
                event.stopPropagation();
                onTenantPanelClick?.();
              }}
            >
              {loading ? 'در حال بارگذاری...' : tenant.name}
            </button>
          </div>
        )}

        {/* Version footer */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-between px-3 py-2 text-[10px]',
            variant === 'dastranj'
              ? 'bg-[var(--taav-business-sidebar-footer-bg)] text-[var(--taav-business-sidebar-footer-text)]'
              : 'border-t border-[color:var(--taav-border-subtle)] text-[var(--taav-text-muted)]',
            collapsed && 'justify-center px-2',
          )}
        >
          {canToggleCollapse ? (
            <TaavTooltip content={collapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'} side="left">
              <button
                type="button"
                className={cn(
                  'inline-flex items-center justify-center border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
                  collapsed &&
                    'h-[var(--taav-business-sidebar-collapsed-footer-btn-size)] w-[var(--taav-business-sidebar-collapsed-footer-btn-size)] rounded-[10px] border border-[color:var(--taav-business-sidebar-collapse-border)] bg-[var(--taav-business-sidebar-collapse-bg)] text-[var(--taav-business-sidebar-collapse-text)]',
                )}
                title={collapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
                aria-label={collapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed(!collapsed)}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  {collapsed ? (
                    <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
                  ) : (
                    <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
                  )}
                </svg>
              </button>
            </TaavTooltip>
          ) : null}
          {!collapsed && version ? <span>{version}</span> : null}
        </div>
        </aside>
      </div>
    </TaavTooltipProvider>
  );

  const contentColumn = (
    <div className={cn(businessSidebarContentColumn(), contentClassName)} dir="rtl">
      {showNavPath ? (
        <div className="relative z-[1] shrink-0">
          <BusinessSidebarNavPath items={navPath} className={navPathClassName} />
        </div>
      ) : null}
      <div className={businessSidebarContentBody()}>{children}</div>
    </div>
  );

  return (
    <div className={cn(businessSidebarShell({ placement }), shellClassName)} dir="ltr">
      {placement === 'left' ? sidebarRail : null}
      {contentColumn}
      {placement === 'right' ? sidebarRail : null}
    </div>
  );
}
