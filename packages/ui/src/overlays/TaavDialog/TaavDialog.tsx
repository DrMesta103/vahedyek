'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  taavDialogShellActionClass,
  taavDialogShellBackdropClass,
  taavDialogShellContentClass,
  taavDialogShellDescriptionClass,
  taavDialogShellFooterVariants,
  taavDialogShellHeaderClass,
  taavDialogShellTitleClass,
  taavDialogShellVariants,
  type TaavDialogFooterVariant,
  type TaavDialogShellSize,
  type TaavDialogShellVariant,
} from './taav-dialog-shell.variants';
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

type TaavDialogRootProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;

export type TaavDialogProps = Omit<TaavDialogRootProps, 'children'> & {
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

function TaavDialogLoadingIcon() {
  return (
    <span
      aria-hidden="true"
      className="h-[14px] w-[14px] animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export function TaavDialog({
  title,
  description,
  children,
  confirmLabel = 'تایید',
  cancelLabel = 'لغو',
  onConfirm,
  onCancel,
  onOpenChange,
  showFooter = true,
  showCancel = true,
  showConfirm = true,
  confirmDisabled = false,
  cancelDisabled = false,
  loading = false,
  size,
  variant,
  footerVariant,
  className,
  contentClassName,
  footerClassName,
  ...rootProps
}: TaavDialogProps) {
  const usesComposedShell =
    title !== undefined ||
    description !== undefined ||
    size !== undefined ||
    variant !== undefined ||
    footerVariant !== undefined ||
    onConfirm !== undefined ||
    onCancel !== undefined ||
    showFooter === false ||
    showCancel === false ||
    showConfirm === false ||
    confirmDisabled ||
    cancelDisabled ||
    loading ||
    className !== undefined ||
    contentClassName !== undefined ||
    footerClassName !== undefined;

  if (!usesComposedShell) {
    return (
      <DialogPrimitive.Root onOpenChange={onOpenChange} {...rootProps}>
        {children}
      </DialogPrimitive.Root>
    );
  }

  const closeDialog = () => {
    if (loading || cancelDisabled) return;
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} {...rootProps}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={taavDialogShellBackdropClass} />
        <DialogPrimitive.Content
          dir="rtl"
          aria-busy={loading || undefined}
          className={cn(taavDialogShellVariants({ size, variant }), className)}
          onEscapeKeyDown={(event) => {
            if (loading) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (loading) event.preventDefault();
          }}
        >
          {title || description ? (
            <header className={taavDialogShellHeaderClass}>
              {title ? (
                <DialogPrimitive.Title className={taavDialogShellTitleClass}>
                  {title}
                </DialogPrimitive.Title>
              ) : null}
              {description ? (
                <DialogPrimitive.Description className={taavDialogShellDescriptionClass}>
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </header>
          ) : null}
          {!title ? <DialogPrimitive.Title className="sr-only">دیالوگ</DialogPrimitive.Title> : null}
          {!description ? (
            <DialogPrimitive.Description className="sr-only">
              محتوای پنجره محاوره‌ای
            </DialogPrimitive.Description>
          ) : null}

          <div className={cn(taavDialogShellContentClass, contentClassName)}>{children}</div>

          {showFooter ? (
            <footer className={cn(taavDialogShellFooterVariants({ variant: footerVariant }), footerClassName)}>
              {showConfirm ? (
                <button
                  type="button"
                  className={cn(taavDialogShellActionClass, 'gap-[7px]')}
                  disabled={confirmDisabled || loading}
                  onClick={onConfirm}
                >
                  {loading ? <TaavDialogLoadingIcon /> : null}
                  <span>{confirmLabel}</span>
                </button>
              ) : null}
              {showCancel ? (
                <button
                  type="button"
                  className={taavDialogShellActionClass}
                  disabled={cancelDisabled || loading}
                  onClick={closeDialog}
                >
                  {cancelLabel}
                </button>
              ) : null}
            </footer>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

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
