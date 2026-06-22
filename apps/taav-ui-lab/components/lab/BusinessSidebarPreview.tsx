'use client';

import { TaavBusinessSidebar, type TaavBusinessSidebarNavPathItem, type TaavBusinessSidebarVariant } from '@repo/ui/taav/business';
import { BusinessSidebarAppViewport } from '@/components/lab/BusinessSidebarAppViewport';
import {
  DASHRANJ_DEMO_NAV_ITEMS,
  DASHRANJ_DEMO_NAV_PATH,
  DASHRANJ_DEMO_QUICK_ACTIONS,
  DASHRANJ_DEMO_TENANT,
  DASHRANJ_DEMO_USER,
  DASHRANJ_DEMO_VERSION,
  VAHEDYEK_DEMO_NAV_PATH,
} from '@/lib/demo/business-sidebar-demo';

function DefaultContentHint() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(20,184,166,0.07),transparent_58%)]" />
      <div className="flex h-full flex-col gap-3 p-6 opacity-[0.32]">
        <div className="h-7 w-40 rounded-md bg-[var(--taav-business-sidebar-section-border)]" />
        <div className="h-3.5 w-56 max-w-[70%] rounded bg-[var(--taav-business-sidebar-section-border)]" />
        <div className="mt-2 h-3 w-44 max-w-[55%] rounded bg-[var(--taav-business-sidebar-section-border)]" />
        <div className="mt-auto mb-4 flex-1 rounded-xl border border-dashed border-[color:var(--taav-business-sidebar-border)]" />
      </div>
    </>
  );
}

type SidebarPreviewProps = {
  navPathItems?: TaavBusinessSidebarNavPathItem[];
  activeItemId?: string;
  collapsed?: boolean;
  tenantStatus?: 'active' | 'loading' | 'inactive' | 'error';
  loading?: boolean;
  showDisabled?: boolean;
  height?: number;
  variant?: TaavBusinessSidebarVariant;
  contentHint?: React.ReactNode;
  showNavPath?: boolean;
};

export function BusinessSidebarPreview({
  navPathItems = VAHEDYEK_DEMO_NAV_PATH,
  activeItemId = 'employees',
  collapsed = false,
  tenantStatus = 'active',
  loading = false,
  showDisabled = false,
  height = 720,
  variant = 'dastranj',
  contentHint,
  showNavPath = true,
}: SidebarPreviewProps) {
  const items = showDisabled
    ? [...DASHRANJ_DEMO_NAV_ITEMS, { id: 'settings', label: 'تنظیمات کلی', icon: DASHRANJ_DEMO_QUICK_ACTIONS[2].icon, disabled: true }]
    : DASHRANJ_DEMO_NAV_ITEMS;

  return (
    <BusinessSidebarAppViewport height={height}>
      <TaavBusinessSidebar
        user={DASHRANJ_DEMO_USER}
        tenant={{
          ...DASHRANJ_DEMO_TENANT,
          status: tenantStatus,
          statusLabel:
            tenantStatus === 'active'
              ? 'tenant فعال'
              : tenantStatus === 'loading'
                ? 'در حال بارگذاری tenant...'
                : undefined,
        }}
        quickActions={DASHRANJ_DEMO_QUICK_ACTIONS}
        items={items}
        activeItemId={activeItemId}
        version={DASHRANJ_DEMO_VERSION}
        variant={variant}
        placement="right"
        collapsed={collapsed}
        loading={loading}
        navPath={navPathItems}
        showNavPath={showNavPath}
        onTenantSwitch={() => undefined}
        onTenantPanelClick={() => undefined}
        shellClassName="h-full"
        className="h-full"
      >
        {contentHint ?? <DefaultContentHint />}
      </TaavBusinessSidebar>
    </BusinessSidebarAppViewport>
  );
}

type BusinessSidebarThemePreviewProps = {
  navPathItems?: TaavBusinessSidebarNavPathItem[];
  collapsed?: boolean;
};

export function BusinessSidebarThemePreview({
  navPathItems = VAHEDYEK_DEMO_NAV_PATH,
  collapsed = false,
}: BusinessSidebarThemePreviewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div data-taav-theme="light" className="rounded-[var(--taav-radius-xl)] bg-[var(--taav-bg)] p-2">
        <BusinessSidebarPreview navPathItems={navPathItems} variant="default" collapsed={collapsed} height={640} />
      </div>
      <div data-taav-theme="dark" className="rounded-[var(--taav-radius-xl)] bg-[#0a1018] p-2">
        <BusinessSidebarPreview navPathItems={navPathItems} variant="dastranj" collapsed={collapsed} height={640} />
      </div>
    </div>
  );
}

export { DASHRANJ_DEMO_NAV_PATH, VAHEDYEK_DEMO_NAV_PATH };
