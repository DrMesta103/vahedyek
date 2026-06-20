export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-NU-uTFUF.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import 'clsx';

type TaavTabsVariant = 'underline' | 'pill' | 'soft' | 'boxed';
type TaavTabsSize = 'sm' | 'md' | 'lg';
type TaavTabsTone = 'brand' | 'neutral';
type TaavTabsOrientation = 'horizontal' | 'vertical';
type TaavStepperSize = 'sm' | 'md' | 'lg';
type TaavStepperVariant = 'numbered' | 'icon' | 'compact';
type TaavStepperTone = 'brand' | 'neutral';
type TaavStepperOrientation = 'horizontal' | 'vertical';
type TaavStepStatus = 'complete' | 'current' | 'upcoming' | 'error' | 'warning';

declare const TaavTabs: react.ForwardRefExoticComponent<TabsPrimitive.TabsProps & react.RefAttributes<HTMLDivElement>>;
type TaavTabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TaavTabsVariant;
    size?: TaavTabsSize;
    tone?: TaavTabsTone;
    orientation?: TaavTabsOrientation;
};
declare function TaavTabsList({ variant, size, tone, orientation, className, ...props }: TaavTabsListProps): react_jsx_runtime.JSX.Element;
type TaavTabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TaavTabsVariant;
    size?: TaavTabsSize;
    tone?: TaavTabsTone;
};
declare function TaavTabsTrigger({ variant, size, tone, className, ...props }: TaavTabsTriggerProps): react_jsx_runtime.JSX.Element;
declare function TaavTabsContent({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>): react_jsx_runtime.JSX.Element;

type TaavStep = {
    id: string;
    title: string;
    description?: string;
    status?: TaavStepStatus;
    icon?: ReactNode;
    disabled?: boolean;
};
type TaavStepperProps = {
    steps: TaavStep[];
    currentStep?: string;
    orientation?: TaavStepperOrientation;
    size?: TaavStepperSize;
    variant?: TaavStepperVariant;
    tone?: 'brand' | 'neutral';
    showProgress?: boolean;
    allowClick?: boolean;
    onStepClick?: (stepId: string) => void;
    wrapperClassName?: string;
    contentClassName?: string;
};
declare function TaavStepper({ steps, currentStep, orientation, size, variant, showProgress, allowClick, onStepClick, wrapperClassName, contentClassName, }: TaavStepperProps): react_jsx_runtime.JSX.Element;

export { type TaavStep, type TaavStepStatus, TaavStepper, type TaavStepperOrientation, type TaavStepperProps, type TaavStepperSize, type TaavStepperTone, type TaavStepperVariant, TaavTabs, TaavTabsContent, TaavTabsList, type TaavTabsListProps, type TaavTabsOrientation, type TaavTabsSize, type TaavTabsTone, TaavTabsTrigger, type TaavTabsTriggerProps, type TaavTabsVariant };
