'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { BusinessIntroCardActionIcon } from './BusinessIntroCardActionIcon';
import { BusinessIntroCardBuildingIcon } from './BusinessIntroCardBuildingIcon';
import {
  businessIntroCardAction,
  businessIntroCardBadge,
  businessIntroCardCopy,
  businessIntroCardDescription,
  businessIntroCardEyebrow,
  businessIntroCardFootnote,
  businessIntroCardHubContent,
  businessIntroCardHubPattern,
  businessIntroCardHubRoot,
  businessIntroCardHubTitleRow,
  businessIntroCardHubTop,
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
export type TaavBusinessIntroCardLayout = 'standard' | 'hub';
export type TaavBusinessIntroCardHeadingLevel = 'h1' | 'h2';

export type TaavBusinessIntroCardProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  badge?: ReactNode;
  footnote?: ReactNode;
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
  layout?: TaavBusinessIntroCardLayout;
  headingLevel?: TaavBusinessIntroCardHeadingLevel;
  showPattern?: boolean;
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
  eyebrow,
  badge,
  footnote,
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
  layout = 'standard',
  headingLevel,
  showPattern = true,
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
  const resolvedHeadingLevel = headingLevel ?? (layout === 'hub' ? 'h1' : 'h2');
  const HeadingTag = resolvedHeadingLevel;
  const resolvedWidth = layout === 'hub' && width === 'normal' ? 'full' : width;

  const rootClass = cn(
    businessIntroCardRoot({ size, width: resolvedWidth, variant, loading }),
    layout === 'hub' ? businessIntroCardHubRoot({ size }) : null,
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

  const titleBlock = loading ? (
    <TaavSkeleton variant="title" width="55%" contentClassName="h-6" />
  ) : (
    <HeadingTag className={businessIntroCardTitle({ size })}>{title}</HeadingTag>
  );

  const descriptionBlock =
    description && !loading ? <p className={businessIntroCardDescription({ size })}>{description}</p> : null;

  const descriptionSkeleton = loading ? <TaavSkeleton lines={2} size="sm" /> : null;

  const iconBlock = loading ? (
    <TaavSkeleton variant="custom" width={48} height={48} radius="lg" />
  ) : (
    <span className={businessIntroCardIconBox({ size })} aria-hidden={showDefaultIcon}>
      {icon ?? <BusinessIntroCardBuildingIcon />}
    </span>
  );

  const standardBody = loading ? (
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
      {actionNode}
      <div className={cn(businessIntroCardLeading(), contentClassName)}>
        {iconBlock}
        <div className={businessIntroCardCopy()}>
          {titleBlock}
          {descriptionBlock}
          {children}
        </div>
      </div>
    </div>
  );

  const hubBody = loading ? (
    <div className={businessIntroCardHubContent()}>
      <TaavSkeleton variant="custom" width={140} height={28} radius="pill" />
      <div className={businessIntroCardHubTitleRow()}>
        <TaavSkeleton variant="custom" width={52} height={52} radius="lg" />
        <div className={cn(businessIntroCardCopy(), 'flex-1')}>
          <TaavSkeleton variant="title" width="48%" contentClassName="h-6" />
          <TaavSkeleton lines={2} size="sm" />
        </div>
      </div>
      <TaavSkeleton variant="custom" width="100%" height={52} radius="lg" />
    </div>
  ) : (
    <div className={businessIntroCardHubContent()}>
      {eyebrow || badge ? (
        <div className={businessIntroCardHubTop()}>
          {eyebrow ? <span className={businessIntroCardEyebrow({ tone: 'brand' })}>{eyebrow}</span> : <span />}
          {badge ? <span className={businessIntroCardBadge()}>{badge}</span> : null}
        </div>
      ) : null}

      <div className={businessIntroCardLayout()}>
        <div className={cn(businessIntroCardHubTitleRow(), 'min-w-0 flex-1', contentClassName)}>
          {iconBlock}
          <div className={businessIntroCardCopy()}>
            {titleBlock}
            {descriptionBlock}
            {children}
          </div>
        </div>
        {actionNode}
      </div>

      {footnote ? <p className={businessIntroCardFootnote()}>{footnote}</p> : null}
    </div>
  );

  return (
    <article
      {...rest}
      data-taav-business-intro-card
      data-layout={layout}
      data-size={size}
      data-width={resolvedWidth}
      data-tone={tone}
      data-variant={variant}
      data-loading={loading || undefined}
      data-disabled={disabled || undefined}
      {...(themeMode !== 'auto' ? { 'data-taav-business-intro-card-theme': themeMode } : {})}
      className={rootClass}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
    >
      {layout === 'hub' && showPattern ? <div className={businessIntroCardHubPattern()} aria-hidden /> : null}
      {layout === 'hub' ? hubBody : standardBody}
    </article>
  );
}
