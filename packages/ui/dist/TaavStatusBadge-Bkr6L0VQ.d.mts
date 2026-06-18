import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { c as TaavBadgeVariant } from './taav-badge.variants-DM1buIc6.mjs';

type TaavStatus = 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'warning' | 'archived' | 'locked' | 'unknown';
type TaavStatusBadgeSize = 'sm' | 'md' | 'lg';
type TaavStatusBadgeVariant = TaavBadgeVariant;
type TaavStatusBadgeProps = {
    status: TaavStatus;
    size?: TaavStatusBadgeSize;
    variant?: TaavStatusBadgeVariant;
    withDot?: boolean;
    icon?: ReactNode;
    label?: string;
    children?: ReactNode;
    wrapperClassName?: string;
};
declare function TaavStatusBadge({ status, size, variant, withDot, icon, label, children, wrapperClassName, }: TaavStatusBadgeProps): react_jsx_runtime.JSX.Element;

export { type TaavStatus as T, TaavStatusBadge as a, type TaavStatusBadgeProps as b, type TaavStatusBadgeSize as c, type TaavStatusBadgeVariant as d };
