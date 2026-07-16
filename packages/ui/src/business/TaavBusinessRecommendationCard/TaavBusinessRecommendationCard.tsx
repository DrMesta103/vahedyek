'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import {
  TaavActivationSwitch,
  type TaavActivationSwitchSize,
  type TaavActivationSwitchValue,
} from '../TaavActivationSwitch';
import { TaavDetailsLink } from '../TaavDetailsLink';
import { RecommendationCardActionIcon } from './RecommendationCardActionIcon';
import { RecommendationCardDefaultIcon } from './RecommendationCardDefaultIcon';
import {
  recommendationCardAction,
  recommendationCardCopy,
  recommendationCardDescription,
  recommendationCardIconBox,
  recommendationCardLayout,
  recommendationCardLeading,
  recommendationCardRoot,
  recommendationCardTitle,
  recommendationCardTone,
  recommendationCardTrailing,
} from './taav-business-recommendation-card.variants';

export type TaavBusinessRecommendationCardSize = 'sm' | 'md' | 'lg';
export type TaavBusinessRecommendationCardWidth = 'normal' | 'wide' | 'full';
export type TaavBusinessRecommendationCardTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type TaavBusinessRecommendationCardVariant = 'default' | 'soft' | 'outlined';
export type TaavBusinessRecommendationCardThemeMode = 'auto' | 'light' | 'dark';
export type TaavBusinessRecommendationCardActivationValue = TaavActivationSwitchValue;

export type TaavBusinessRecommendationCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actionIcon?: ReactNode;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
  activationValue?: TaavBusinessRecommendationCardActivationValue;
  defaultActivationValue?: TaavBusinessRecommendationCardActivationValue;
  onActivationChange?: (value: TaavBusinessRecommendationCardActivationValue) => void;
  activeLabel?: ReactNode;
  inactiveLabel?: ReactNode;
  activationDisabled?: boolean;
  detailsLabel?: ReactNode;
  detailsHref?: string;
  onDetailsClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: TaavBusinessRecommendationCardSize;
  width?: TaavBusinessRecommendationCardWidth;
  tone?: TaavBusinessRecommendationCardTone;
  variant?: TaavBusinessRecommendationCardVariant;
  themeMode?: TaavBusinessRecommendationCardThemeMode;
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

function mapSwitchSize(size: TaavBusinessRecommendationCardSize): TaavActivationSwitchSize {
  return size;
}

export function TaavBusinessRecommendationCard({
  title,
  description,
  icon,
  actionIcon,
  actionLabel,
  href,
  onAction,
  activationValue,
  defaultActivationValue = 'inactive',
  onActivationChange,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
  activationDisabled = false,
  detailsLabel,
  detailsHref,
  onDetailsClick,
  disabled = false,
  loading = false,
  size = 'md',
  width = 'wide',
  tone = 'brand',
  variant = 'default',
  themeMode = 'auto',
  wrapperClassName,
  contentClassName,
  actionClassName,
  unsafeClassName,
  ...rest
}: TaavBusinessRecommendationCardProps) {
  const hasAction = resolveHasAction({ href, onAction, disabled, loading });
  const resolvedActionLabel = actionLabel ?? (hasAction ? 'مشاهده جزئیات' : undefined);
  const showDefaultIcon = icon === undefined;
  const switchDisabled = disabled || activationDisabled || loading;
  const detailsDisabled = disabled || loading;
  const hasDetails = Boolean(detailsLabel && (detailsHref || onDetailsClick));

  const actionContent = actionIcon ?? <RecommendationCardActionIcon />;

  const actionNode = hasAction ? (
    href ? (
      <a
        href={href}
        className={cn(recommendationCardAction({ disabled: false }), actionClassName)}
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
        className={cn(recommendationCardAction({ disabled: false }), actionClassName)}
        aria-label={resolvedActionLabel}
        onClick={onAction}
      >
        {actionContent}
      </button>
    )
  ) : null;

  const body = loading ? (
    <div className={recommendationCardLayout()}>
      <div className={recommendationCardLeading()}>
        <TaavSkeleton variant="custom" width={16} height={16} radius="sm" />
        <TaavSkeleton variant="custom" width={48} height={48} radius="lg" />
        <div className={cn(recommendationCardCopy(), 'flex-1')}>
          <TaavSkeleton variant="title" width="70%" contentClassName="h-5" />
          <TaavSkeleton lines={2} size="sm" />
          <TaavSkeleton variant="text" width="34%" />
        </div>
      </div>
      <TaavSkeleton variant="custom" width={144} height={36} radius="pill" />
    </div>
  ) : (
    <div className={recommendationCardLayout()}>
      <div className={cn(recommendationCardLeading(), contentClassName)}>
        {actionNode}
        <span className={recommendationCardIconBox({ size })} aria-hidden={showDefaultIcon}>
          {icon ?? <RecommendationCardDefaultIcon />}
        </span>
        <div className={recommendationCardCopy()}>
          <h2 className={recommendationCardTitle({ size })}>{title}</h2>
          {description ? <p className={recommendationCardDescription({ size })}>{description}</p> : null}
          {hasDetails ? (
            <TaavDetailsLink
              href={detailsHref}
              onClick={onDetailsClick}
              disabled={detailsDisabled}
              size={size === 'lg' ? 'md' : size === 'sm' ? 'sm' : 'md'}
              wrapperClassName="mt-[6px] justify-self-start text-[12.5px] leading-[22px] text-[#7a8a9c]"
            >
              {detailsLabel}
            </TaavDetailsLink>
          ) : null}
        </div>
      </div>

      <div className={recommendationCardTrailing()}>
        <TaavActivationSwitch
          value={activationValue}
          defaultValue={defaultActivationValue}
          onValueChange={onActivationChange}
          activeLabel={activeLabel}
          inactiveLabel={inactiveLabel}
          disabled={switchDisabled}
          size={mapSwitchSize(size)}
          tone={tone === 'info' ? 'brand' : tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : tone === 'success' ? 'success' : tone === 'neutral' ? 'neutral' : 'brand'}
          ariaLabel="وضعیت فعال‌سازی تنظیم"
          wrapperClassName={cn(
            '!h-[40px] !w-[180px] !min-w-[180px] !gap-[4px] !border-0 !bg-[var(--taav-activation-switch-track-bg)] !p-[3px]',
            '[&_[role=radio]]:h-[32px] [&_[role=radio]]:min-w-[88px] [&_[role=radio]]:px-[14px] [&_[role=radio]]:py-0',
            '[&_[role=radio]]:text-[13px] [&_[role=radio]]:font-semibold',
          )}
        />
      </div>
    </div>
  );

  return (
    <article
      {...rest}
      dir="rtl"
      data-taav-business-recommendation-card
      data-size={size}
      data-width={width}
      data-tone={tone}
      data-variant={variant}
      data-loading={loading || undefined}
      data-disabled={disabled || undefined}
      {...(themeMode !== 'auto' ? { 'data-taav-business-recommendation-card-theme': themeMode } : {})}
      className={cn(
        recommendationCardRoot({ size, width, variant, loading }),
        recommendationCardTone({ tone }),
        wrapperClassName,
        unsafeClassName,
      )}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
    >
      {body}
    </article>
  );
}
