'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { BusinessIntroCardActionIcon } from './BusinessIntroCardActionIcon';
import { BusinessIntroCardBuildingIcon } from './BusinessIntroCardBuildingIcon';
import {
  businessIntroCardAction,
  businessIntroCardCopy,
  businessIntroCardDescription,
  businessIntroCardIconBox,
  businessIntroCardLayout,
  businessIntroCardLeading,
  businessIntroCardRoot,
  businessIntroCardTitle,
  businessIntroCardTone,
} from './taav-business-intro-card.variants';

export type TaavBusinessIntroCardSize = 'sm' | 'md' | 'lg';
export type TaavBusinessIntroCardWidth = 'normal' | 'wide' | 'full';
export type TaavBusinessIntroCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type TaavBusinessIntroCardVariant = 'default' | 'soft' | 'outlined';
export type TaavBusinessIntroCardThemeMode = 'auto' | 'light' | 'dark';

export type TaavBusinessIntroCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actionIcon?: ReactNode;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: TaavBusinessIntroCardSize;
  width?: TaavBusinessIntroCardWidth;
  tone?: TaavBusinessIntroCardTone;
  variant?: TaavBusinessIntroCardVariant;
  themeMode?: TaavBusinessIntroCardThemeMode;
  children?: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
  actionClassName?: string;
  unsafeClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;

function resolveHasAction({
  href,
  onAction,
  disabled,
  loading,
}: {
  href?: string;
  onAction?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return !disabled && !loading && Boolean(href || onAction);
}

export function TaavBusinessIntroCard({
  title,
  description,
  icon,
  actionIcon,
  actionLabel,
  href,
  onAction,
  disabled = false,
  loading = false,
  size = 'md',
  width = 'normal',
  tone = 'brand',
  variant = 'default',
  themeMode = 'auto',
  children,
  wrapperClassName,
  contentClassName,
  actionClassName,
  unsafeClassName,
  ...rest
}: TaavBusinessIntroCardProps) {
  const hasAction = resolveHasAction({ href, onAction, disabled, loading });
  const showDefaultIcon = icon === undefined;
  const resolvedActionLabel = actionLabel ?? (hasAction ? 'بازگشت' : undefined);

  const rootClass = cn(
    businessIntroCardRoot({ size, width, variant, loading }),
    businessIntroCardTone({ tone }),
    wrapperClassName,
    unsafeClassName,
  );

  const actionContent = actionIcon ?? <BusinessIntroCardActionIcon />;

  const actionNode = hasAction ? (
    href ? (
      <a
        href={href}
        className={cn(businessIntroCardAction({ disabled: false }), actionClassName)}
        aria-label={resolvedActionLabel}
        onClick={(event) => {
          if (onAction) {
            event.preventDefault();
            onAction();
          }
        }}
      >
        {actionContent}
      </a>
    ) : (
      <button
        type="button"
        className={cn(businessIntroCardAction({ disabled: false }), actionClassName)}
        aria-label={resolvedActionLabel}
        onClick={onAction}
      >
        {actionContent}
      </button>
    )
  ) : null;

  const body = loading ? (
    <div className={businessIntroCardLayout()}>
      <div className={businessIntroCardLeading()}>
        <TaavSkeleton variant="custom" width={48} height={48} radius="lg" />
        <div className={cn(businessIntroCardCopy(), 'flex-1')}>
          <TaavSkeleton variant="title" width="42%" contentClassName="h-5" />
          <TaavSkeleton lines={2} size="sm" />
        </div>
      </div>
      <TaavSkeleton variant="custom" width={36} height={36} radius="md" />
    </div>
  ) : (
    <div className={businessIntroCardLayout()}>
      <div className={cn(businessIntroCardLeading(), contentClassName)}>
        <span className={businessIntroCardIconBox({ size })} aria-hidden={showDefaultIcon}>
          {icon ?? <BusinessIntroCardBuildingIcon />}
        </span>
        <div className={businessIntroCardCopy()}>
          <h2 className={businessIntroCardTitle({ size })}>{title}</h2>
          {description ? <p className={businessIntroCardDescription({ size })}>{description}</p> : null}
          {children}
        </div>
      </div>
      {actionNode}
    </div>
  );

  return (
    <article
      {...rest}
      data-taav-business-intro-card
      data-size={size}
      data-width={width}
      data-tone={tone}
      data-variant={variant}
      data-loading={loading || undefined}
      data-disabled={disabled || undefined}
      {...(themeMode !== 'auto' ? { 'data-taav-business-intro-card-theme': themeMode } : {})}
      className={rootClass}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
    >
      {body}
    </article>
  );
}
