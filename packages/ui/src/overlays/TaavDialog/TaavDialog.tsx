'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavOverlayToneClass,
  taavDialogContentVariants,
  taavDialogPositionClass,
  taavOverlayBackdropClass,
  taavOverlayCloseButtonClass,
  TaavOverlayCloseIcon,
  taavOverlayDescriptionClass,
  taavOverlayFooterClass,
  taavOverlayHeaderClass,
  taavOverlayTitleClass,
  type TaavDialogSize,
  type TaavOverlayTone,
  type TaavOverlayVariant,
} from '../shared/overlay.variants';

export const TaavDialog = DialogPrimitive.Root;
export const TaavDialogTrigger = DialogPrimitive.Trigger;
export const TaavDialogClose = DialogPrimitive.Close;
export const TaavDialogPortal = DialogPrimitive.Portal;

export type TaavDialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: TaavDialogSize;
  variant?: TaavOverlayVariant;
  tone?: TaavOverlayTone;
  showCloseButton?: boolean;
  contentClassName?: string;
};

export function TaavDialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay className={cn(taavOverlayBackdropClass, className)} {...props} />;
}

export function TaavDialogContent({
  size = 'md',
  variant = 'default',
  tone = 'neutral',
  showCloseButton = true,
  contentClassName,
  children,
  ...props
}: TaavDialogContentProps) {
  const isFullscreen = size === 'fullscreen';

  return (
    <TaavDialogPortal>
      <TaavDialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          taavDialogContentVariants({ size, variant }),
          getTaavOverlayToneClass(tone),
          !isFullscreen && taavDialogPositionClass,
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
    </TaavDialogPortal>
  );
}

export function TaavDialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(taavOverlayHeaderClass, className)}>{children}</div>;
}

export function TaavDialogTitle({
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

export function TaavDialogDescription({
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

export function TaavDialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(taavOverlayFooterClass, className)}>{children}</div>;
}
