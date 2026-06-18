'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  taavDropdownContentClass,
  taavDropdownItemVariants,
  type TaavDropdownItemTone,
} from '../shared/overlay.variants';

export const TaavDropdown = DropdownMenuPrimitive.Root;
export const TaavDropdownTrigger = DropdownMenuPrimitive.Trigger;
export const TaavDropdownGroup = DropdownMenuPrimitive.Group;
export const TaavDropdownPortal = DropdownMenuPrimitive.Portal;

export type TaavDropdownContentProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  contentClassName?: string;
};

export function TaavDropdownContent({
  sideOffset = 6,
  align = 'start',
  collisionPadding = 8,
  contentClassName,
  children,
  ...props
}: TaavDropdownContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        className={cn(taavDropdownContentClass, contentClassName)}
        style={{ direction: 'rtl' }}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export type TaavDropdownItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  tone?: TaavDropdownItemTone;
  size?: 'sm' | 'md' | 'lg';
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  shortcut?: string;
  description?: ReactNode;
};

export function TaavDropdownItem({
  tone = 'neutral',
  size = 'md',
  iconStart,
  iconEnd,
  shortcut,
  description,
  children,
  className,
  ...props
}: TaavDropdownItemProps) {
  return (
    <DropdownMenuPrimitive.Item className={cn(taavDropdownItemVariants({ size, tone }), className)} {...props}>
      {iconStart ? <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">{iconStart}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block">{children}</span>
        {description ? (
          <span className="block text-[length:var(--taav-text-2xs)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]">
            {description}
          </span>
        ) : null}
      </span>
      {shortcut ? (
        <span className="ms-auto text-[length:var(--taav-text-2xs)] text-[var(--taav-text-subtle)]">{shortcut}</span>
      ) : null}
      {iconEnd ? <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">{iconEnd}</span> : null}
    </DropdownMenuPrimitive.Item>
  );
}

export function TaavDropdownLabel({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-[var(--taav-space-3)] py-[var(--taav-space-2)] text-[length:var(--taav-text-2xs)] font-black text-[var(--taav-text-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
}

export function TaavDropdownSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('my-[var(--taav-space-1)] h-px bg-[var(--taav-border-subtle)]', className)}
      {...props}
    />
  );
}
