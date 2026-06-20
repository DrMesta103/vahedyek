export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, HTMLAttributes } from 'react';
import 'clsx';

type TaavActivationSwitchValue = 'active' | 'inactive';
type TaavActivationSwitchSize = 'sm' | 'md' | 'lg';
type TaavActivationSwitchTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
type TaavActivationSwitchProps = {
    value?: TaavActivationSwitchValue;
    defaultValue?: TaavActivationSwitchValue;
    onValueChange?: (value: TaavActivationSwitchValue) => void;
    activeLabel?: ReactNode;
    inactiveLabel?: ReactNode;
    disabled?: boolean;
    loading?: boolean;
    size?: TaavActivationSwitchSize;
    tone?: TaavActivationSwitchTone;
    ariaLabel?: string;
    wrapperClassName?: string;
    unsafeClassName?: string;
};
declare function TaavActivationSwitch({ value, defaultValue, onValueChange, activeLabel, inactiveLabel, disabled, loading, size, tone, ariaLabel, wrapperClassName, unsafeClassName, }: TaavActivationSwitchProps): react_jsx_runtime.JSX.Element;

type TaavBusinessIntroCardSize = 'sm' | 'md' | 'lg';
type TaavBusinessIntroCardWidth = 'normal' | 'wide' | 'full';
type TaavBusinessIntroCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TaavBusinessIntroCardVariant = 'default' | 'soft' | 'outlined';
type TaavBusinessIntroCardThemeMode = 'auto' | 'light' | 'dark';
type TaavBusinessIntroCardLayout = 'standard' | 'hub';
type TaavBusinessIntroCardHeadingLevel = 'h1' | 'h2';
type TaavBusinessIntroCardProps = {
    title: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    badge?: ReactNode;
    footnote?: ReactNode;
    icon?: ReactNode;
    actionIcon?: ReactNode;
    actionLabel?: string;
    href?: string;
    onAction?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: TaavBusinessIntroCardSize;
    width?: TaavBusinessIntroCardWidth;
    tone?: TaavBusinessIntroCardTone;
    variant?: TaavBusinessIntroCardVariant;
    themeMode?: TaavBusinessIntroCardThemeMode;
    layout?: TaavBusinessIntroCardLayout;
    headingLevel?: TaavBusinessIntroCardHeadingLevel;
    showPattern?: boolean;
    children?: ReactNode;
    wrapperClassName?: string;
    contentClassName?: string;
    actionClassName?: string;
    unsafeClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBusinessIntroCard({ title, description, eyebrow, badge, footnote, icon, actionIcon, actionLabel, href, onAction, disabled, loading, size, width, tone, variant, themeMode, layout, headingLevel, showPattern, children, wrapperClassName, contentClassName, actionClassName, unsafeClassName, ...rest }: TaavBusinessIntroCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessRecommendationCardSize = 'sm' | 'md' | 'lg';
type TaavBusinessRecommendationCardWidth = 'normal' | 'wide' | 'full';
type TaavBusinessRecommendationCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TaavBusinessRecommendationCardVariant = 'default' | 'soft' | 'outlined';
type TaavBusinessRecommendationCardThemeMode = 'auto' | 'light' | 'dark';
type TaavBusinessRecommendationCardActivationValue = TaavActivationSwitchValue;
type TaavBusinessRecommendationCardProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    actionIcon?: ReactNode;
    actionLabel?: string;
    href?: string;
    onAction?: () => void;
    activationValue?: TaavBusinessRecommendationCardActivationValue;
    defaultActivationValue?: TaavBusinessRecommendationCardActivationValue;
    onActivationChange?: (value: TaavBusinessRecommendationCardActivationValue) => void;
    activeLabel?: ReactNode;
    inactiveLabel?: ReactNode;
    activationDisabled?: boolean;
    detailsLabel?: ReactNode;
    detailsHref?: string;
    onDetailsClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: TaavBusinessRecommendationCardSize;
    width?: TaavBusinessRecommendationCardWidth;
    tone?: TaavBusinessRecommendationCardTone;
    variant?: TaavBusinessRecommendationCardVariant;
    themeMode?: TaavBusinessRecommendationCardThemeMode;
    wrapperClassName?: string;
    contentClassName?: string;
    actionClassName?: string;
    unsafeClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;
declare function TaavBusinessRecommendationCard({ title, description, icon, actionIcon, actionLabel, href, onAction, activationValue, defaultActivationValue, onActivationChange, activeLabel, inactiveLabel, activationDisabled, detailsLabel, detailsHref, onDetailsClick, disabled, loading, size, width, tone, variant, themeMode, wrapperClassName, contentClassName, actionClassName, unsafeClassName, ...rest }: TaavBusinessRecommendationCardProps): react_jsx_runtime.JSX.Element;

type TaavBusinessSidebarNavPathItem = {
    label: string;
    id?: string;
    href?: string;
    onClick?: () => void;
};
declare const DEFAULT_BUSINESS_SIDEBAR_NAV_PATH: TaavBusinessSidebarNavPathItem[];
/** @deprecated Use `TaavBusinessSidebarNavPathItem` */
type TaavBusinessNavPathItem = TaavBusinessSidebarNavPathItem;
/** @deprecated Use `DEFAULT_BUSINESS_SIDEBAR_NAV_PATH` */
declare const DEFAULT_BUSINESS_NAV_PATH: TaavBusinessSidebarNavPathItem[];

type TaavBusinessSidebarUser = {
    name: string;
    subtitle?: string;
    avatarUrl?: string;
    avatarFallback?: string;
};
type TaavBusinessSidebarTenantStatus = 'active' | 'loading' | 'inactive' | 'error';
type TaavBusinessSidebarTenant = {
    label: string;
    name: string;
    avatarText?: string;
    status?: TaavBusinessSidebarTenantStatus;
    statusLabel?: string;
};
type TaavBusinessSidebarQuickAction = {
    id: string;
    label: string;
    icon: ReactNode;
    active?: boolean;
    badge?: string | number;
    onClick?: () => void;
    href?: string;
};
type TaavBusinessSidebarItem = {
    id: string;
    label: string;
    icon: ReactNode;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    badge?: string | number;
    children?: TaavBusinessSidebarItem[];
};
type TaavBusinessSidebarVariant = 'dastranj' | 'default';
type TaavBusinessSidebarWidth = 'compact' | 'default' | 'wide';
type TaavBusinessSidebarPlacement = 'left' | 'right';
type TaavBusinessSidebarProps = {
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
declare function TaavBusinessSidebar({ user, tenant, quickActions, items, activeItemId, version, width, variant, placement: placementProp, collapsed: collapsedProp, defaultCollapsed, collapsible, lockCollapsed, loading, navPath, showNavPath, children, shellClassName, contentClassName, navPathClassName, onNavigate, onTenantSwitch, onTenantPanelClick, onLogout, onCollapsedChange, className, ...props }: TaavBusinessSidebarProps): react_jsx_runtime.JSX.Element;

type TaavDetailsLinkSize = 'sm' | 'md' | 'lg';
type TaavDetailsLinkTone = 'neutral' | 'brand' | 'info';
type TaavDetailsLinkUnderline = 'always' | 'hover' | 'none';
type TaavDetailsLinkProps = {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    tone?: TaavDetailsLinkTone;
    size?: TaavDetailsLinkSize;
    underline?: TaavDetailsLinkUnderline;
    ariaLabel?: string;
    wrapperClassName?: string;
    unsafeClassName?: string;
};
declare function TaavDetailsLink({ children, href, onClick, disabled, icon, tone, size, underline, ariaLabel, wrapperClassName, unsafeClassName, }: TaavDetailsLinkProps): react_jsx_runtime.JSX.Element;

type TaavModuleCardStatus = 'default' | 'active' | 'complete' | 'incomplete' | 'locked' | 'disabled' | 'warning' | 'error';
type TaavModuleCardVariant = 'default' | 'setup' | 'imageHeader' | 'compact' | 'flat';
type TaavModuleCardTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type TaavModuleCardThemeMode = 'auto' | 'light' | 'dark';
type TaavModuleCardSize = 'sm' | 'md' | 'lg';
type TaavModuleCardWidth = 'auto' | 'full';
type TaavModuleCardHeaderPattern = 'geometric' | 'subtle' | 'none';
type TaavModuleCardAlign = 'start' | 'center' | 'end';
type TaavModuleCardDirection = 'enter' | 'back';
type TaavModuleCardProps = {
    title: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    status?: TaavModuleCardStatus;
    statusLabel?: ReactNode;
    icon?: ReactNode;
    arrowIcon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    selected?: boolean;
    variant?: TaavModuleCardVariant;
    tone?: TaavModuleCardTone;
    themeMode?: TaavModuleCardThemeMode;
    size?: TaavModuleCardSize;
    width?: TaavModuleCardWidth;
    headerPattern?: TaavModuleCardHeaderPattern;
    align?: TaavModuleCardAlign;
    direction?: TaavModuleCardDirection;
    ariaLabel?: string;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'title' | 'onClick'>;
declare function TaavModuleCard({ title, description, eyebrow, status, statusLabel, icon, arrowIcon, href, onClick, disabled: disabledProp, loading, selected, variant, tone, themeMode, size, width, headerPattern, align, direction, ariaLabel, className, headerClassName, bodyClassName, ...rest }: TaavModuleCardProps): react_jsx_runtime.JSX.Element;

type TaavModuleCardGridColumns = 1 | 2 | 3 | 4;
type TaavModuleCardGridGap = 'sm' | 'md' | 'lg' | 'xl';
type TaavModuleCardGridDensity = 'compact' | 'comfortable' | 'spacious';
type TaavModuleCardGridSpan = 1 | 2 | 3 | 4;
type TaavModuleCardGridProps = {
    columns?: TaavModuleCardGridColumns;
    gap?: TaavModuleCardGridGap;
    density?: TaavModuleCardGridDensity;
    responsive?: boolean;
    children: ReactNode;
    className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;
type TaavModuleCardGridItemProps = {
    span?: TaavModuleCardGridSpan;
    responsive?: boolean;
    children: ReactNode;
    className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;
declare function TaavModuleCardGrid({ columns, gap, density, responsive, children, className, ...rest }: TaavModuleCardGridProps): react_jsx_runtime.JSX.Element;
declare function TaavModuleCardGridItem({ span, responsive, children, className, ...rest }: TaavModuleCardGridItemProps): react_jsx_runtime.JSX.Element;

export { DEFAULT_BUSINESS_NAV_PATH, DEFAULT_BUSINESS_SIDEBAR_NAV_PATH, TaavActivationSwitch, type TaavActivationSwitchProps, type TaavActivationSwitchSize, type TaavActivationSwitchTone, type TaavActivationSwitchValue, TaavBusinessIntroCard, type TaavBusinessIntroCardHeadingLevel, type TaavBusinessIntroCardLayout, type TaavBusinessIntroCardProps, type TaavBusinessIntroCardSize, type TaavBusinessIntroCardThemeMode, type TaavBusinessIntroCardTone, type TaavBusinessIntroCardVariant, type TaavBusinessIntroCardWidth, type TaavBusinessNavPathItem, TaavBusinessRecommendationCard, type TaavBusinessRecommendationCardActivationValue, type TaavBusinessRecommendationCardProps, type TaavBusinessRecommendationCardSize, type TaavBusinessRecommendationCardThemeMode, type TaavBusinessRecommendationCardTone, type TaavBusinessRecommendationCardVariant, type TaavBusinessRecommendationCardWidth, TaavBusinessSidebar, type TaavBusinessSidebarItem, type TaavBusinessSidebarNavPathItem, type TaavBusinessSidebarPlacement, type TaavBusinessSidebarProps, type TaavBusinessSidebarQuickAction, type TaavBusinessSidebarTenant, type TaavBusinessSidebarTenantStatus, type TaavBusinessSidebarUser, type TaavBusinessSidebarVariant, type TaavBusinessSidebarWidth, TaavDetailsLink, type TaavDetailsLinkProps, type TaavDetailsLinkSize, type TaavDetailsLinkTone, type TaavDetailsLinkUnderline, TaavModuleCard, type TaavModuleCardAlign, type TaavModuleCardDirection, TaavModuleCardGrid, type TaavModuleCardGridColumns, type TaavModuleCardGridDensity, type TaavModuleCardGridGap, TaavModuleCardGridItem, type TaavModuleCardGridItemProps, type TaavModuleCardGridProps, type TaavModuleCardGridSpan, type TaavModuleCardHeaderPattern, type TaavModuleCardProps, type TaavModuleCardSize, type TaavModuleCardStatus, type TaavModuleCardThemeMode, type TaavModuleCardTone, type TaavModuleCardVariant, type TaavModuleCardWidth };
