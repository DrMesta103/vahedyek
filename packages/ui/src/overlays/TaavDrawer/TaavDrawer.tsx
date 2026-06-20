'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  taavDrawerContentVariants,
  taavOverlayBackdropClass,
  taavOverlayCloseButtonClass,
  TaavOverlayCloseIcon,
  taavOverlayDescriptionClass,
  taavOverlayFooterClass,
  taavOverlayHeaderClass,
  taavOverlayTitleClass,
  type TaavDrawerSide,
  type TaavDrawerSize,
  type TaavOverlayVariant,
} from '../shared/overlay.variants';

/** RTL default: `left` — drawer opens from the start edge (right side in RTL layout). */
export const TaavDrawer = DialogPrimitive.Root;
export const TaavDrawerTrigger = DialogPrimitive.Trigger;
export const TaavDrawerClose = DialogPrimitive.Close;
export const TaavDrawerPortal = DialogPrimitive.Portal;

export type TaavDrawerContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: TaavDrawerSide;
  size?: TaavDrawerSize;
  variant?: TaavOverlayVariant;
  showCloseButton?: boolean;
  contentClassName?: string;
};

export function TaavDrawerOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay className={cn(taavOverlayBackdropClass, className)} {...props} />;
}

export function TaavDrawerContent({
  side = 'left',
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  contentClassName,
  children,
  ...props
}: TaavDrawerContentProps) {
  return (
    <TaavDrawerPortal>
      <TaavDrawerOverlay />
      <DialogPrimitive.Content
        className={cn(
          taavDrawerContentVariants({ side, size, variant }),
          'overflow-y-auto p-[var(--taav-overlay-padding-md)]',
          contentClassName,
        )}
        style={{ direction: 'rtl' }}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close className={taavOverlayCloseButtonClass} aria-label="بستن">
            <TaavOverlayCloseIcon />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </TaavDrawerPortal>
  );
}

export function TaavDrawerHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(taavOverlayHeaderClass, className)}>{children}</div>;
}

export function TaavDrawerTitle({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn(taavOverlayTitleClass, className)} {...props}>
      {children}
    </DialogPrimitive.Title>
  );
}

export function TaavDrawerDescription({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn(taavOverlayDescriptionClass, className)} {...props}>
      {children}
    </DialogPrimitive.Description>
  );
}

export function TaavDrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(taavOverlayFooterClass, className)}>{children}</div>;
}
