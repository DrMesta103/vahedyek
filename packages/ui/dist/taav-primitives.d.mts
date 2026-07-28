export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.mjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, ButtonHTMLAttributes, HTMLAttributes, ComponentPropsWithoutRef } from 'react';
import { b as TaavBadgeTone, a as TaavBadgeSize, T as TaavBadgeShape, d as TaavBadgeWidth, c as TaavBadgeVariant } from './taav-badge.variants-DM1buIc6.mjs';
import 'clsx';

type TaavButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'success' | 'warning' | 'link';
type TaavButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type TaavButtonWidth = 'auto' | 'full' | 'fit' | 'icon';
type TaavButtonTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type TaavButtonProps = {
    variant?: TaavButtonVariant;
    size?: TaavButtonSize;
    width?: TaavButtonWidth;
    tone?: TaavButtonTone;
    loading?: boolean;
    disabled?: boolean;
    iconStart?: ReactNode;
    iconEnd?: ReactNode;
    children?: ReactNode;
    /** Required when width="icon" and children is not text */
    'aria-label'?: string;
    unsafeClassName?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;
declare function TaavButton({ variant, size, width, tone, loading, disabled, iconStart, iconEnd, children, type, unsafeClassName, 'aria-label': ariaLabel, ...props }: TaavButtonProps): react_jsx_runtime.JSX.Element;

type TaavBadgeProps = {
    tone?: TaavBadgeTone;
    size?: TaavBadgeSize;
    shape?: TaavBadgeShape;
    width?: TaavBadgeWidth;
    variant?: TaavBadgeVariant;
    iconStart?: ReactNode;
    iconEnd?: ReactNode;
    children?: ReactNode;
    unsafeClassName?: string;
};
declare function TaavBadge({ tone, size, shape, width, variant, iconStart, iconEnd, children, unsafeClassName, }: TaavBadgeProps): react_jsx_runtime.JSX.Element;

type TaavCardVariant = 'elevated' | 'outlined' | 'soft' | 'ghost';
type TaavCardPadding = 'none' | 'sm' | 'md' | 'lg';
type TaavCardRadius = 'md' | 'lg' | 'xl' | 'xxl';

type TaavCardProps = {
    variant?: TaavCardVariant;
    padding?: TaavCardPadding;
    radius?: TaavCardRadius;
    interactive?: boolean;
    selected?: boolean;
    header?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    wrapperClassName?: string;
    contentClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;
declare function TaavCard({ variant, padding, radius, interactive, selected, header, footer, children, wrapperClassName, contentClassName, ...props }: TaavCardProps): react_jsx_runtime.JSX.Element;

type TaavTooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TaavTooltipAlign = 'start' | 'center' | 'end';
type TaavTooltipProps = {
    content: ReactNode;
    side?: TaavTooltipSide;
    align?: TaavTooltipAlign;
    delayDuration?: number;
    sideOffset?: number;
    collisionPadding?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    showArrow?: boolean;
    children: ReactNode;
    contentClassName?: string;
    arrowClassName?: string;
};
declare function TaavTooltipProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function TaavTooltip({ content, side, align, delayDuration, sideOffset, collisionPadding, open, defaultOpen, onOpenChange, showArrow, children, contentClassName, arrowClassName, }: TaavTooltipProps): react_jsx_runtime.JSX.Element;

type TaavFieldHintTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
type TaavFieldHintSize = 'sm' | 'md';

type TaavFieldHintProps = {
    tone?: TaavFieldHintTone;
    size?: TaavFieldHintSize;
    icon?: ReactNode;
    title?: string;
    children?: ReactNode;
    unsafeClassName?: string;
};
declare function TaavFieldHint({ tone, size, icon, title, children, unsafeClassName, }: TaavFieldHintProps): react_jsx_runtime.JSX.Element;

type TaavDividerProps = Omit<ComponentPropsWithoutRef<'hr'>, 'color'> & {
    unsafeClassName?: string;
};
declare function TaavDivider({ unsafeClassName, ...props }: TaavDividerProps): react_jsx_runtime.JSX.Element;

export { TaavBadge, type TaavBadgeProps, TaavBadgeShape, TaavBadgeSize, TaavBadgeTone, TaavBadgeVariant, TaavBadgeWidth, TaavButton, type TaavButtonProps, type TaavButtonSize, type TaavButtonTone, type TaavButtonVariant, type TaavButtonWidth, TaavCard, type TaavCardPadding, type TaavCardProps, type TaavCardRadius, type TaavCardVariant, TaavDivider, type TaavDividerProps, TaavFieldHint, type TaavFieldHintProps, type TaavFieldHintSize, type TaavFieldHintTone, TaavTooltip, type TaavTooltipAlign, type TaavTooltipProps, TaavTooltipProvider, type TaavTooltipSide };
