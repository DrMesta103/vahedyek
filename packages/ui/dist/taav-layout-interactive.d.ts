export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.js';
import * as react from 'react';
import { ReactNode, HTMLAttributes } from 'react';
import { a as TaavLayoutPadding, T as TaavLayoutDensity } from './layout.variants-CvMtAmDy.js';
import { T as TaavStatus } from './TaavStatusBadge-DIgz50nH.js';
import 'clsx';
import './taav-badge.variants-DM1buIc6.js';

type TaavSectionVariant = 'card' | 'plain' | 'outlined' | 'soft';
type TaavSectionProps = {
    title?: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    variant?: TaavSectionVariant;
    padding?: TaavLayoutPadding;
    density?: TaavLayoutDensity;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    disabled?: boolean;
    loading?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'>;
declare function TaavSection({ title, description, eyebrow, icon, badge, actions, footer, children, variant, padding, density, collapsible, defaultCollapsed, disabled, loading, headerClassName, contentClassName, wrapperClassName, ...props }: TaavSectionProps): react.JSX.Element;

type TaavSidebarPanelVariant = 'card' | 'soft' | 'outlined' | 'plain';
type TaavSidebarPanelWidth = 'sm' | 'md' | 'lg';
type TaavSidebarPanelProps = {
    title?: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    status?: TaavStatus;
    actions?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    variant?: TaavSidebarPanelVariant;
    width?: TaavSidebarPanelWidth;
    sticky?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    density?: TaavLayoutDensity;
    loading?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    wrapperClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'>;
declare function TaavSidebarPanel({ title, description, icon, status, actions, footer, children, variant, width, sticky, collapsible, defaultCollapsed, density, loading, headerClassName, contentClassName, wrapperClassName, ...props }: TaavSidebarPanelProps): react.JSX.Element;

export { TaavSection, type TaavSectionProps, type TaavSectionVariant, TaavSidebarPanel, type TaavSidebarPanelProps, type TaavSidebarPanelVariant, type TaavSidebarPanelWidth };
