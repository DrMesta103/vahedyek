export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-NU-uTFUF.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, ButtonHTMLAttributes, TdHTMLAttributes, HTMLAttributes, ThHTMLAttributes } from 'react';
export { T as TaavStatus, a as TaavStatusBadge, b as TaavStatusBadgeProps, c as TaavStatusBadgeSize, d as TaavStatusBadgeVariant } from './TaavStatusBadge-Bkr6L0VQ.mjs';
import 'clsx';
import './taav-badge.variants-DM1buIc6.mjs';

type TaavChipTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
type TaavChipSize = 'xs' | 'sm' | 'md' | 'lg';
type TaavChipShape = 'pill' | 'rounded' | 'square';
type TaavChipWidth = 'auto' | 'fixed' | 'full';
type TaavChipVariant = 'soft' | 'outline' | 'solid' | 'ghost';
type TaavChipGap = 'xs' | 'sm' | 'md' | 'lg';
type TaavTableDensity = 'compact' | 'comfortable' | 'spacious';
type TaavTableVariant = 'default' | 'bordered' | 'striped' | 'card';
type TaavKeyValueSize = 'sm' | 'md' | 'lg';
type TaavKeyValueDensity = 'compact' | 'comfortable';
type TaavKeyValueLayout = 'vertical' | 'horizontal' | 'grid';

type TaavChipBehavior = 'static' | 'clickable' | 'selectable' | 'removable';
type TaavChipProps = {
    variant?: TaavChipVariant;
    tone?: TaavChipTone;
    size?: TaavChipSize;
    shape?: TaavChipShape;
    width?: TaavChipWidth;
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    behavior?: TaavChipBehavior;
    iconStart?: ReactNode;
    iconEnd?: ReactNode;
    removeLabel?: string;
    onRemove?: () => void;
    children?: ReactNode;
    itemClassName?: string;
    unsafeClassName?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;
declare function TaavChip({ variant, tone, size, shape, width, selected, disabled, loading, behavior, iconStart, iconEnd, removeLabel, onRemove, onClick, children, itemClassName, unsafeClassName, ...props }: TaavChipProps): react_jsx_runtime.JSX.Element;

type TaavEmptyStateVariant = 'default' | 'search' | 'error' | 'permission' | 'setup' | 'compact';
type TaavEmptyStateSize = 'sm' | 'md' | 'lg';
type TaavEmptyStateTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';
type TaavEmptyStateProps = {
    variant?: TaavEmptyStateVariant;
    size?: TaavEmptyStateSize;
    tone?: TaavEmptyStateTone;
    icon?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    primaryAction?: ReactNode;
    secondaryAction?: ReactNode;
    children?: ReactNode;
    contentClassName?: string;
    wrapperClassName?: string;
};
declare function TaavEmptyState({ variant, size, tone, icon, title, description, primaryAction, secondaryAction, children, contentClassName, wrapperClassName, }: TaavEmptyStateProps): react_jsx_runtime.JSX.Element;

type TaavSkeletonVariant = 'text' | 'title' | 'avatar' | 'button' | 'card' | 'row' | 'table' | 'custom';
type TaavSkeletonSize = 'sm' | 'md' | 'lg';
type TaavSkeletonRadius = 'sm' | 'md' | 'lg' | 'pill' | 'full';
type TaavSkeletonProps = {
    variant?: TaavSkeletonVariant;
    size?: TaavSkeletonSize;
    lines?: number;
    width?: string | number;
    height?: string | number;
    radius?: TaavSkeletonRadius;
    animated?: boolean;
    count?: number;
    contentClassName?: string;
    wrapperClassName?: string;
};
declare function TaavSkeleton({ variant, size, lines, width, height, radius, animated, count, contentClassName, wrapperClassName, }: TaavSkeletonProps): react_jsx_runtime.JSX.Element;

type TaavTableShellProps = {
    variant?: TaavTableVariant;
    density?: TaavTableDensity;
    loading?: boolean;
    empty?: boolean;
    emptyState?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    wrapperClassName?: string;
    contentClassName?: string;
};
declare function TaavTableShell({ variant, density, loading, empty, emptyState, footer, children, wrapperClassName, contentClassName, }: TaavTableShellProps): react_jsx_runtime.JSX.Element;
declare function TaavTableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>): react_jsx_runtime.JSX.Element;
declare function TaavTableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>): react_jsx_runtime.JSX.Element;
type TaavTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
    striped?: boolean;
};
declare function TaavTableRow({ className, striped, ...props }: TaavTableRowProps): react_jsx_runtime.JSX.Element;
declare function TaavTableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>): react_jsx_runtime.JSX.Element;
declare function TaavTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>): react_jsx_runtime.JSX.Element;
declare function TaavTableActions({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>): react_jsx_runtime.JSX.Element;

type TaavKeyValueItemTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TaavKeyValueItem = {
    label: string;
    value?: ReactNode;
    description?: string;
    icon?: ReactNode;
    tone?: TaavKeyValueItemTone;
};
type TaavKeyValueProps = {
    items?: TaavKeyValueItem[];
    layout?: TaavKeyValueLayout;
    size?: TaavKeyValueSize;
    density?: TaavKeyValueDensity;
    labelWidth?: string | number;
    emptyText?: string;
    separator?: boolean;
    children?: ReactNode;
    wrapperClassName?: string;
    contentClassName?: string;
};
declare function TaavKeyValue({ items, layout, size, density, labelWidth, emptyText, separator, children, wrapperClassName, contentClassName, }: TaavKeyValueProps): react_jsx_runtime.JSX.Element;

export { TaavChip, type TaavChipBehavior, type TaavChipGap, type TaavChipProps, type TaavChipShape, type TaavChipSize, type TaavChipTone, type TaavChipVariant, type TaavChipWidth, TaavEmptyState, type TaavEmptyStateProps, type TaavEmptyStateSize, type TaavEmptyStateTone, type TaavEmptyStateVariant, TaavKeyValue, type TaavKeyValueDensity, type TaavKeyValueItem, type TaavKeyValueItemTone, type TaavKeyValueLayout, type TaavKeyValueProps, type TaavKeyValueSize, TaavSkeleton, type TaavSkeletonProps, type TaavSkeletonRadius, type TaavSkeletonSize, type TaavSkeletonVariant, TaavTableActions, TaavTableBody, TaavTableCell, type TaavTableDensity, TaavTableHead, TaavTableHeader, TaavTableRow, TaavTableShell, type TaavTableShellProps, type TaavTableVariant };
