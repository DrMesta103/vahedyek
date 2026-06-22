'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Badge,
  BookOpen,
  Box,
  CircleDot,
  CreditCard,
  FileText,
  FormInput,
  Home,
  Layers,
  LayoutGrid,
  Map,
  MessageSquareText,
  MousePointerClick,
  PanelRight,
  Percent,
  Search,
  SquareStack,
  Table2,
  Tags,
  Workflow,
} from 'lucide-react';
import {
  LAB_BUSINESS_NAV,
  LAB_COMPONENT_NAV,
  LAB_DATA_DISPLAY_NAV,
  LAB_FOUNDATION_NAV,
  LAB_FORM_NAV,
  LAB_LAYOUT_NAV,
  LAB_MAIN_NAV,
  LAB_NAVIGATION_NAV,
  LAB_OVERLAY_NAV,
} from '@/lib/navigation';
import { cn } from '@repo/ui/taav/primitives';
import { LabThemeToggle } from './LabThemeToggle';
import { LabTopbarSearch } from './LabTopbarSearch';

const MAIN_ICONS: Record<string, typeof Home> = {
  '/': Home,
  '/components': LayoutGrid,
  '/forms': FormInput,
  '/overlays': SquareStack,
  '/navigation': Workflow,
  '/data-display': Table2,
  '/layout': PanelRight,
  '/business': PanelRight,
};

const FOUNDATION_ICONS: Record<string, typeof FileText> = {
  '/getting-started': FileText,
  '/foundation/principles': BookOpen,
  '/tokens': Layers,
  '/roadmap': Map,
};

const BUSINESS_ICONS: Record<string, typeof PanelRight> = {
  '/business/sidebar': PanelRight,
  '/business/intro-card': FileText,
  '/business/recommendation-card': CreditCard,
  '/business/module-card': SquareStack,
  '/business/module-card-grid': LayoutGrid,
  '/business/currency-input': CreditCard,
  '/business/percentage-input': Percent,
  '/business/field-block': FormInput,
  '/business/choice-chip': Tags,
};

const FORM_ICONS: Record<string, typeof FormInput> = {
  '/forms/input': FormInput,
  '/forms/textarea': FileText,
  '/forms/select': Box,
  '/forms/checkbox': CircleDot,
  '/forms/radio': CircleDot,
  '/forms/switch': CircleDot,
  '/forms/segmented-control': LayoutGrid,
  '/forms/option-card': CreditCard,
  '/forms/form-field': CircleDot,
  '/forms/field-block': FormInput,
  '/forms/field-grid': LayoutGrid,
  '/forms/choice-chip': Tags,
};

const OVERLAY_ICONS: Record<string, typeof SquareStack> = {
  '/overlays/dialog': MessageSquareText,
  '/overlays/drawer': PanelRight,
  '/overlays/popover': SquareStack,
  '/overlays/dropdown': LayoutGrid,
};

const DATA_DISPLAY_ICONS: Record<string, typeof Table2> = {
  '/data-display/chip': Tags,
  '/data-display/status-badge': Badge,
  '/data-display/empty-state': FileText,
  '/data-display/skeleton': Layers,
  '/data-display/pagination': LayoutGrid,
  '/data-display/filter-bar': Search,
  '/data-display/table-shell': Table2,
  '/data-display/key-value': CircleDot,
};

const NAVIGATION_ICONS: Record<string, typeof Workflow> = {
  '/navigation/tabs': LayoutGrid,
  '/navigation/stepper': Workflow,
};

const LAYOUT_ICONS: Record<string, typeof PanelRight> = {
  '/layout/page-shell': LayoutGrid,
  '/layout/page-header': FileText,
  '/layout/section': SquareStack,
  '/layout/settings-section': CircleDot,
  '/layout/detail-header': Badge,
  '/layout/sticky-action-bar': MousePointerClick,
  '/layout/sidebar-panel': PanelRight,
  '/layout/stats-card': CreditCard,
  '/layout/progress-summary': Workflow,
};

const COMPONENT_ICONS: Record<string, typeof MousePointerClick> = {
  '/components/button': MousePointerClick,
  '/components/badge': Badge,
  '/components/card': CreditCard,
  '/components/tooltip': MessageSquareText,
  '/components/field-hint': CircleDot,
};

function NavLink({
  href,
  label,
  badge,
  icon: Icon,
}: {
  href: string;
  label: string;
  badge?: string;
  icon?: typeof Home;
}) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={cn('lab-sidebar-link', isActive && 'is-active')}>
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 self-start opacity-80" /> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate leading-5">{label}</span>
        {badge ? (
          <span className="mt-1 block max-w-full truncate rounded-[var(--taav-radius-sm)] bg-[var(--taav-surface-muted)] px-1.5 py-0.5 text-[length:var(--taav-text-2xs)] font-bold leading-4 text-[var(--taav-text-subtle)]">
            {badge}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function LabSidebar() {
  return (
    <aside className="lab-sidebar hidden shrink-0 lg:flex lg:flex-col">
      <div className="lab-sidebar-brand">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-brand-border)] bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)]">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
              TaavUI
            </strong>
            <span className="text-[length:var(--taav-text-2xs)] font-semibold text-[var(--taav-text-subtle)]">
              Design System · v0.3
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="lab-sidebar-section-label">اصلی</p>
        <div className="grid gap-1">
          {LAB_MAIN_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={MAIN_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Foundation</p>
        <div className="grid gap-1">
          {LAB_FOUNDATION_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={FOUNDATION_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Forms</p>
        <div className="grid gap-1">
          {LAB_FORM_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={FORM_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Overlays</p>
        <div className="grid gap-1">
          {LAB_OVERLAY_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={OVERLAY_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Navigation</p>
        <div className="grid gap-1">
          {LAB_NAVIGATION_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={NAVIGATION_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Data Display</p>
        <div className="grid gap-1">
          {LAB_DATA_DISPLAY_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={DATA_DISPLAY_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Business</p>
        <div className="grid gap-1">
          {LAB_BUSINESS_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={BUSINESS_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Layout</p>
        <div className="grid gap-1">
          {LAB_LAYOUT_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={LAYOUT_ICONS[item.href]} />
          ))}
        </div>

        <p className="lab-sidebar-section-label mt-6">Primitives</p>
        <div className="grid gap-1">
          {LAB_COMPONENT_NAV.map((item) => (
            <NavLink key={item.href} {...item} icon={COMPONENT_ICONS[item.href]} />
          ))}
        </div>
      </nav>

      <div className="border-t border-[color:var(--taav-border-subtle)] px-4 py-4 text-[length:var(--taav-text-2xs)] leading-6 text-[var(--taav-text-subtle)]">
        <div className="flex items-center gap-2">
          <Box className="h-3.5 w-3.5" />
          <span>@repo/ui · TaavUI</span>
        </div>
      </div>
    </aside>
  );
}

export function LabMobileNav() {
  const pathname = usePathname();
  const items = [
    { href: '/', label: 'خانه', icon: Home },
    { href: '/foundation/principles', label: 'اصول', icon: BookOpen },
    { href: '/tokens', label: 'توکن', icon: Layers },
    { href: '/components', label: 'کامپوننت', icon: LayoutGrid },
  ];

  return (
    <nav className="lab-mobile-nav">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[length:var(--taav-text-2xs)] font-bold',
              active ? 'text-[var(--taav-brand-strong)]' : 'text-[var(--taav-text-subtle)]',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function LabTopbar() {
  return (
    <header className="lab-topbar">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:px-6">
        <LabTopbarSearch />
        <div className="flex items-center justify-between gap-3 lg:shrink-0 lg:justify-end">
          <strong className="text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)] lg:hidden">
            TaavUI Lab
          </strong>
          <LabThemeToggle />
        </div>
      </div>
    </header>
  );
}
