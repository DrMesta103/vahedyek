'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/cn';
import {
  taavPopoverContentVariants,
  type TaavOverlayTone,
  type TaavOverlayVariant,
  type TaavPopoverAlign,
  type TaavPopoverSide,
  type TaavPopoverSize,
} from '../shared/overlay.variants';

export const TaavPopover = PopoverPrimitive.Root;
export const TaavPopoverTrigger = PopoverPrimitive.Trigger;
export const TaavPopoverAnchor = PopoverPrimitive.Anchor;
export const TaavPopoverClose = PopoverPrimitive.Close;

export type TaavPopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  size?: TaavPopoverSize;
  variant?: TaavOverlayVariant;
  tone?: TaavOverlayTone;
  side?: TaavPopoverSide;
  align?: TaavPopoverAlign;
  contentClassName?: string;
};

export function TaavPopoverContent({
  size = 'md',
  variant = 'default',
  tone = 'neutral',
  side = 'bottom',
  align = 'center',
  collisionPadding = 8,
  contentClassName,
  children,
  ...props
}: TaavPopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        side={side}
        align={align}
        collisionPadding={collisionPadding}
        className={cn(taavPopoverContentVariants({ size, variant, tone }), contentClassName)}
        style={{ direction: 'rtl' }}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
