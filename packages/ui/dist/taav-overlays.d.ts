export { T as TAAV_BUTTON_HEIGHT, a as TAAV_DURATION, b as TAAV_RADIUS, c as TAAV_SHADOW, d as TAAV_SPACING, e as TAAV_TOKEN_CATALOG, f as TAAV_TOKEN_SECTIONS, g as TAAV_TONE_LABELS, h as TaavTone, i as TokenCategory, j as TokenEntry, k as cn } from './index-DNbuF2UL.js';
import * as react from 'react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import 'clsx';

type TaavDialogShellSize = 'sm' | 'md' | 'lg';
type TaavDialogShellVariant = 'default' | 'form' | 'selection';
type TaavDialogFooterVariant = 'default' | 'sticky' | 'separated';

type TaavOverlayVariant = 'default' | 'elevated' | 'soft';
type TaavOverlayTone = 'neutral' | 'danger' | 'success' | 'warning' | 'info';
type TaavDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
type TaavDrawerSide = 'right' | 'left' | 'top' | 'bottom';
type TaavDrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type TaavPopoverSize = 'sm' | 'md' | 'lg';
type TaavPopoverSide = 'top' | 'right' | 'bottom' | 'left';
type TaavPopoverAlign = 'start' | 'center' | 'end';
type TaavDropdownItemTone = 'neutral' | 'danger' | 'success' | 'warning' | 'info';

type TaavDialogRootProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
type TaavDialogProps = Omit<TaavDialogRootProps, 'children'> & {
    title?: string;
    description?: string;
    children?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showFooter?: boolean;
    showCancel?: boolean;
    showConfirm?: boolean;
    confirmDisabled?: boolean;
    cancelDisabled?: boolean;
    loading?: boolean;
    size?: TaavDialogShellSize;
    variant?: TaavDialogShellVariant;
    footerVariant?: TaavDialogFooterVariant;
    className?: string;
    contentClassName?: string;
    footerClassName?: string;
};
declare function TaavDialog({ title, description, children, confirmLabel, cancelLabel, onConfirm, onCancel, onOpenChange, showFooter, showCancel, showConfirm, confirmDisabled, cancelDisabled, loading, size, variant, footerVariant, className, contentClassName, footerClassName, ...rootProps }: TaavDialogProps): react.JSX.Element;
declare const TaavDialogTrigger: react.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const TaavDialogClose: react.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;
declare const TaavDialogPortal: react.FC<DialogPrimitive.DialogPortalProps>;
type TaavDialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: TaavDialogSize;
    variant?: TaavOverlayVariant;
    tone?: TaavOverlayTone;
    showCloseButton?: boolean;
    contentClassName?: string;
};
declare function TaavDialogOverlay({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>): react.JSX.Element;
declare function TaavDialogContent({ size, variant, tone, showCloseButton, contentClassName, children, ...props }: TaavDialogContentProps): react.JSX.Element;
declare function TaavDialogHeader({ children, className }: {
    children: ReactNode;
    className?: string;
}): react.JSX.Element;
declare function TaavDialogTitle({ children, className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>): react.JSX.Element;
declare function TaavDialogDescription({ children, className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>): react.JSX.Element;
declare function TaavDialogFooter({ children, className }: {
    children: ReactNode;
    className?: string;
}): react.JSX.Element;

/** RTL default: `left` — drawer opens from the start edge (right side in RTL layout). */
declare const TaavDrawer: react.FC<DialogPrimitive.DialogProps>;
declare const TaavDrawerTrigger: react.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const TaavDrawerClose: react.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;
declare const TaavDrawerPortal: react.FC<DialogPrimitive.DialogPortalProps>;
type TaavDrawerContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: TaavDrawerSide;
    size?: TaavDrawerSize;
    variant?: TaavOverlayVariant;
    showCloseButton?: boolean;
    contentClassName?: string;
};
declare function TaavDrawerOverlay({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>): react.JSX.Element;
declare function TaavDrawerContent({ side, size, variant, showCloseButton, contentClassName, children, ...props }: TaavDrawerContentProps): react.JSX.Element;
declare function TaavDrawerHeader({ children, className }: {
    children: ReactNode;
    className?: string;
}): react.JSX.Element;
declare function TaavDrawerTitle({ children, className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>): react.JSX.Element;
declare function TaavDrawerDescription({ children, className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>): react.JSX.Element;
declare function TaavDrawerFooter({ children, className }: {
    children: ReactNode;
    className?: string;
}): react.JSX.Element;

declare const TaavPopover: react.FC<PopoverPrimitive.PopoverProps>;
declare const TaavPopoverTrigger: react.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const TaavPopoverAnchor: react.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & react.RefAttributes<HTMLDivElement>>;
declare const TaavPopoverClose: react.ForwardRefExoticComponent<PopoverPrimitive.PopoverCloseProps & react.RefAttributes<HTMLButtonElement>>;
type TaavPopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    size?: TaavPopoverSize;
    variant?: TaavOverlayVariant;
    tone?: TaavOverlayTone;
    side?: TaavPopoverSide;
    align?: TaavPopoverAlign;
    contentClassName?: string;
};
declare function TaavPopoverContent({ size, variant, tone, side, align, collisionPadding, contentClassName, children, ...props }: TaavPopoverContentProps): react.JSX.Element;

declare const TaavDropdown: react.FC<DropdownMenuPrimitive.DropdownMenuProps>;
declare const TaavDropdownTrigger: react.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const TaavDropdownGroup: react.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuGroupProps & react.RefAttributes<HTMLDivElement>>;
declare const TaavDropdownPortal: react.FC<DropdownMenuPrimitive.DropdownMenuPortalProps>;
type TaavDropdownContentProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    contentClassName?: string;
};
declare function TaavDropdownContent({ sideOffset, align, collisionPadding, contentClassName, children, ...props }: TaavDropdownContentProps): react.JSX.Element;
type TaavDropdownItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    tone?: TaavDropdownItemTone;
    size?: 'sm' | 'md' | 'lg';
    iconStart?: ReactNode;
    iconEnd?: ReactNode;
    shortcut?: string;
    description?: ReactNode;
};
declare function TaavDropdownItem({ tone, size, iconStart, iconEnd, shortcut, description, children, className, ...props }: TaavDropdownItemProps): react.JSX.Element;
declare function TaavDropdownLabel({ children, className, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>): react.JSX.Element;
declare function TaavDropdownSeparator({ className, ...props }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>): react.JSX.Element;

export { TaavDialog, TaavDialogClose, TaavDialogContent, type TaavDialogContentProps, TaavDialogDescription, TaavDialogFooter, type TaavDialogFooterVariant, TaavDialogHeader, TaavDialogOverlay, TaavDialogPortal, type TaavDialogProps, type TaavDialogShellSize, type TaavDialogShellVariant, type TaavDialogSize, TaavDialogTitle, TaavDialogTrigger, TaavDrawer, TaavDrawerClose, TaavDrawerContent, type TaavDrawerContentProps, TaavDrawerDescription, TaavDrawerFooter, TaavDrawerHeader, TaavDrawerOverlay, TaavDrawerPortal, type TaavDrawerSide, type TaavDrawerSize, TaavDrawerTitle, TaavDrawerTrigger, TaavDropdown, TaavDropdownContent, type TaavDropdownContentProps, TaavDropdownGroup, TaavDropdownItem, type TaavDropdownItemProps, type TaavDropdownItemTone, TaavDropdownLabel, TaavDropdownPortal, TaavDropdownSeparator, TaavDropdownTrigger, type TaavOverlayTone, type TaavOverlayVariant, TaavPopover, type TaavPopoverAlign, TaavPopoverAnchor, TaavPopoverClose, TaavPopoverContent, type TaavPopoverContentProps, type TaavPopoverSide, type TaavPopoverSize, TaavPopoverTrigger };
