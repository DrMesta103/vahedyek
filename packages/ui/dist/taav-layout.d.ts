export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, HTMLAttributes } from 'react';
import { a as TaavLayoutPadding, T as TaavLayoutDensity, b as TaavLayoutTone } from './layout.variants-CvMtAmDy.js';
import { T as TaavStatus } from './TaavStatusBadge-D6Hiep5s.js';
import 'clsx';
import './taav-badge.variants-DM1buIc6.js';

type TaavPageShellVariant = 'default' | 'dashboard' | 'settings' | 'detail' | 'form' | 'report';
type TaavPageShellWidth = 'narrow' | 'normal' | 'wide' | 'full';
type TaavPageShellProps = {
    variant?: TaavPageShellVariant;
    width?: TaavPageShellWidth;
    padding?: TaavLayoutPadding;
    density?: TaavLayoutDensity;
    withBackground?: boolean;
    withContainer?: boolean;
    header?: ReactNode;
    sidebar?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    wrapperClassName?: string;
    contentClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;
declare function TaavPageShell({ variant, width, padding, density, withBackground, withContainer, header, sidebar, footer, children, wrapperClassName, contentClassName, ...props }: TaavPageShellProps): react_jsx_runtime.JSX.Element;

type TaavPageHeaderVariant = 'default' | 'compact' | 'hero' | 'plain';
type TaavPageHeaderSize = 'sm' | 'md' | 'lg';
type TaavPageHeaderProps = {
    title?: ReactNode;
    eyebrow?: ReactNode;
    description?: ReactNode;
    badge?: ReactNode;
    status?: TaavStatus;
    meta?: ReactNode;
    breadcrumbs?: ReactNode;
    actions?: ReactNode;
    secondaryActions?: ReactNode;
    backAction?: ReactNode;
    icon?: ReactNode;
    variant?: TaavPageHeaderVariant;
    size?: TaavPageHeaderSize;
    sticky?: boolean;
    bordered?: boolean;
    loading?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    wrapperClassName?: string;
};
declare function TaavPageHeader({ title, eyebrow, description, badge, status, meta, breadcrumbs, actions, secondaryActions, backAction, icon, variant, size, sticky, bordered, loading, headerClassName, contentClassName, wrapperClassName, }: TaavPageHeaderProps): react_jsx_runtime.JSX.Element;

type TaavSettingsSectionVariant = 'default' | 'card' | 'split' | 'compact';
type TaavSettingsSectionProps = {
    title?: ReactNode;
    description?: ReactNode;
    status?: TaavStatus;
    completion?: ReactNode;
    required?: boolean;
    optional?: boolean;
    warning?: ReactNode;
    actions?: ReactNode;
    aside?: ReactNode;
    children?: ReactNode;
    variant?: TaavSettingsSectionVariant;
    density?: TaavLayoutDensity;
    loading?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'>;
declare function TaavSettingsSection({ title, description, status, completion, required, optional, warning, actions, aside, children, variant, density, loading, headerClassName, contentClassName, wrapperClassName, ...props }: TaavSettingsSectionProps): react_jsx_runtime.JSX.Element;

type TaavDetailHeaderVariant = 'default' | 'card' | 'compact' | 'hero';
type TaavDetailHeaderProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    avatar?: ReactNode;
    icon?: ReactNode;
    status?: TaavStatus;
    meta?: ReactNode;
    tags?: ReactNode;
    actions?: ReactNode;
    backAction?: ReactNode;
    tabs?: ReactNode;
    summary?: ReactNode;
    variant?: TaavDetailHeaderVariant;
    loading?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    wrapperClassName?: string;
};
declare function TaavDetailHeader({ title, subtitle, avatar, icon, status, meta, tags, actions, backAction, tabs, summary, variant, loading, headerClassName, contentClassName, wrapperClassName, }: TaavDetailHeaderProps): react_jsx_runtime.JSX.Element;

type TaavStickyActionBarPosition = 'bottom' | 'top';
type TaavStickyActionBarVariant = 'default' | 'elevated' | 'soft' | 'transparent';
type TaavStickyActionBarAlign = 'start' | 'end' | 'between' | 'center';
type TaavStickyActionBarProps = {
    position?: TaavStickyActionBarPosition;
    variant?: TaavStickyActionBarVariant;
    align?: TaavStickyActionBarAlign;
    primaryAction?: ReactNode;
    secondaryAction?: ReactNode;
    tertiaryAction?: ReactNode;
    actions?: ReactNode;
    summary?: ReactNode;
    dirty?: boolean;
    loading?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    contentClassName?: string;
    wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;
declare function TaavStickyActionBar({ position, variant, align, primaryAction, secondaryAction, tertiaryAction, actions, summary, dirty, loading, disabled, children, contentClassName, wrapperClassName, ...props }: TaavStickyActionBarProps): react_jsx_runtime.JSX.Element;

type TaavStatsTrend = {
    value: string;
    direction?: 'up' | 'down' | 'flat';
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
    label?: string;
};
type TaavStatsCardVariant = 'card' | 'soft' | 'outline' | 'ghost';
type TaavStatsCardSize = 'sm' | 'md' | 'lg';
type TaavStatsCardProps = {
    title?: ReactNode;
    value?: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    trend?: TaavStatsTrend;
    tone?: TaavLayoutTone;
    size?: TaavStatsCardSize;
    variant?: TaavStatsCardVariant;
    loading?: boolean;
    footer?: ReactNode;
    action?: ReactNode;
    contentClassName?: string;
    wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'title'>;
declare function TaavStatsCard({ title, value, description, icon, trend, tone, size, variant, loading, footer, action, contentClassName, wrapperClassName, ...props }: TaavStatsCardProps): react_jsx_runtime.JSX.Element;

type TaavProgressSummaryItem = {
    id: string;
    label: string;
    status: 'done' | 'current' | 'pending' | 'warning' | 'error';
    description?: string;
};
type TaavProgressSummaryVariant = 'bar' | 'ring' | 'list' | 'compact';
type TaavProgressSummarySize = 'sm' | 'md' | 'lg';
type TaavProgressSummaryProps = {
    value?: number;
    max?: number;
    percent?: number;
    label?: ReactNode;
    description?: ReactNode;
    status?: TaavStatus;
    items?: TaavProgressSummaryItem[];
    tone?: TaavLayoutTone;
    size?: TaavProgressSummarySize;
    variant?: TaavProgressSummaryVariant;
    showPercent?: boolean;
    loading?: boolean;
    contentClassName?: string;
    wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;
declare function TaavProgressSummary({ value, max, percent, label, description, status, items, tone, size, variant, showPercent, loading, contentClassName, wrapperClassName, ...props }: TaavProgressSummaryProps): react_jsx_runtime.JSX.Element;

export { TaavDetailHeader, type TaavDetailHeaderProps, type TaavDetailHeaderVariant, TaavLayoutDensity, TaavLayoutPadding, TaavLayoutTone, TaavPageHeader, type TaavPageHeaderProps, type TaavPageHeaderSize, type TaavPageHeaderVariant, TaavPageShell, type TaavPageShellProps, type TaavPageShellVariant, type TaavPageShellWidth, TaavProgressSummary, type TaavProgressSummaryItem, type TaavProgressSummaryProps, type TaavProgressSummarySize, type TaavProgressSummaryVariant, TaavSettingsSection, type TaavSettingsSectionProps, type TaavSettingsSectionVariant, TaavStatsCard, type TaavStatsCardProps, type TaavStatsCardSize, type TaavStatsCardVariant, type TaavStatsTrend, TaavStickyActionBar, type TaavStickyActionBarAlign, type TaavStickyActionBarPosition, type TaavStickyActionBarProps, type TaavStickyActionBarVariant };
