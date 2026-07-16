'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { Building2, ChevronRight, Plus, Search } from 'lucide-react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { TaavTooltip } from '../../primitives/TaavTooltip';
import { TaavActivationSwitch } from '../TaavActivationSwitch';
import { TaavDetailsLink } from '../TaavDetailsLink';
import {
  businessHeaderCardAction,
  businessHeaderCardActionButton,
  businessHeaderCardActionButtonIcon,
  businessHeaderCardActionButtonLabel,
  businessHeaderCardArrow,
  businessHeaderCardArrowPlaceholder,
  businessHeaderCardBody,
  businessHeaderCardCopy,
  businessHeaderCardDescription,
  businessHeaderCardIconBox,
  businessHeaderCardLink,
  businessHeaderCardRoot,
  businessHeaderCardSearchContainer,
  businessHeaderCardSearchInput,
  businessHeaderCardSearchShell,
  businessHeaderCardTitle,
  businessHeaderCardToggle,
  businessHeaderCardTopRow,
} from './taav-business-header-card.variants';

export type TaavBusinessHeaderCardVariant = 'toggleWithLink' | 'toggle' | 'action' | 'actionWithSearch' | 'navigation';

export type TaavBusinessHeaderCardToggleLabels = {
  enabled?: ReactNode;
  disabled?: ReactNode;
};

export type TaavBusinessHeaderCardAction = {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export type TaavBusinessHeaderCardDetailLink = {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type TaavBusinessHeaderCardSearch = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export type TaavBusinessHeaderCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  variant?: TaavBusinessHeaderCardVariant;
  showArrow?: boolean;
  href?: string;
  onNavigate?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  themeMode?: 'auto' | 'light' | 'dark';
  enabled?: boolean;
  defaultEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  toggleLabels?: TaavBusinessHeaderCardToggleLabels;
  action?: TaavBusinessHeaderCardAction;
  detailLink?: TaavBusinessHeaderCardDetailLink;
  search?: TaavBusinessHeaderCardSearch;
  arrowTooltipDefaultOpen?: boolean;
  className?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  actionClassName?: string;
  searchClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick' | 'onToggle' | 'children'>;

function HeaderArrowIcon() {
  return <ChevronRight className="h-[26px] w-[26px]" strokeWidth={2.7} />;
}

function HeaderPlusIcon() {
  return <Plus className="h-5 w-5" strokeWidth={2.4} />;
}

function HeaderSearchIcon() {
  return <Search className="h-[19px] w-[19px]" strokeWidth={1.6} />;
}

function HeaderBuildingIcon() {
  return <Building2 className="h-[24px] w-[24px]" strokeWidth={2.2} />;
}

function resolveVariant({
  variant,
  action,
  detailLink,
  search,
  enabled,
  defaultEnabled,
  onToggle,
}: {
  variant?: TaavBusinessHeaderCardVariant;
  action?: TaavBusinessHeaderCardAction;
  detailLink?: TaavBusinessHeaderCardDetailLink;
  search?: TaavBusinessHeaderCardSearch;
  enabled?: boolean;
  defaultEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}): TaavBusinessHeaderCardVariant {
  if (variant) return variant;
  if (action && search) return 'actionWithSearch';
  if (action) return 'action';
  if (typeof enabled === 'boolean' || typeof defaultEnabled === 'boolean' || onToggle) {
    return detailLink ? 'toggleWithLink' : 'toggle';
  }
  return 'navigation';
}

export function TaavBusinessHeaderCard({
  title,
  description,
  icon,
  variant,
  showArrow = true,
  href,
  onNavigate,
  onClick,
  disabled = false,
  loading = false,
  themeMode = 'auto',
  enabled,
  defaultEnabled = false,
  onToggle,
  toggleLabels,
  action,
  detailLink,
  search,
  arrowTooltipDefaultOpen = false,
  className,
  wrapperClassName,
  contentClassName,
  actionClassName,
  searchClassName,
  ...rest
}: TaavBusinessHeaderCardProps) {
  const resolvedVariant = resolveVariant({ variant, action, detailLink, search, enabled, defaultEnabled, onToggle });
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled);
  const currentEnabled = enabled ?? internalEnabled;
  const switchDisabled = disabled || loading;
  const actionDisabled = disabled || loading || action?.disabled;
  const detailDisabled = disabled || loading || detailLink?.disabled;
  const searchDisabled = disabled || loading || search?.disabled;
  const toggleLabelsResolved = {
    enabled: toggleLabels?.enabled ?? 'فعال',
    disabled: toggleLabels?.disabled ?? 'غیرفعال',
  };
  const arrowHandler = onNavigate ?? onClick;
  const shouldShowArrow = showArrow;
  const showToggle = resolvedVariant === 'toggle' || resolvedVariant === 'toggleWithLink';
  const showAction = resolvedVariant === 'action' || resolvedVariant === 'actionWithSearch';
  const showSearch = resolvedVariant === 'actionWithSearch' || Boolean(search);
  const showDetailLink = Boolean(detailLink) && resolvedVariant === 'toggleWithLink';
  const detailLinkIsActive = showDetailLink && currentEnabled && !switchDisabled;

  const updateToggle = (nextValue: boolean) => {
    if (switchDisabled) return;
    if (enabled === undefined) {
      setInternalEnabled(nextValue);
    }
    onToggle?.(nextValue);
  };

  const arrowNode = shouldShowArrow ? (
    href && !disabled && !loading ? (
      <TaavTooltip
        content="بازگشت"
        side="bottom"
        align="center"
        sideOffset={1}
        collisionPadding={4}
        showArrow={false}
        contentClassName="border-0 rounded-[8px] bg-[#7b7b7b] px-[10px] py-[6px] text-[11px] font-medium leading-4 text-white shadow-[0_6px_14px_rgba(15,23,42,0.22)]"
      >
        <a
          href={href}
          aria-label="بازگشت"
          className={businessHeaderCardArrow()}
          onClick={(event) => {
            if (arrowHandler) {
              event.preventDefault();
              arrowHandler?.();
            }
          }}
        >
          <HeaderArrowIcon />
        </a>
      </TaavTooltip>
    ) : arrowHandler && !disabled && !loading ? (
      <TaavTooltip
        content="بازگشت"
        side="bottom"
        align="center"
        open={arrowTooltipDefaultOpen || undefined}
        sideOffset={1}
        collisionPadding={4}
        showArrow={false}
        contentClassName="border-0 rounded-[8px] bg-[#7b7b7b] px-[10px] py-[6px] text-[11px] font-medium leading-4 text-white shadow-[0_6px_14px_rgba(15,23,42,0.22)]"
      >
        <button type="button" aria-label="بازگشت" className={businessHeaderCardArrow()} onClick={arrowHandler}>
          <HeaderArrowIcon />
        </button>
      </TaavTooltip>
    ) : (
      <span className={businessHeaderCardArrowPlaceholder()} aria-hidden="true" />
    )
  ) : null;

  const iconNode = loading ? (
    <TaavSkeleton variant="custom" width={56} height={56} radius="lg" />
  ) : (
    <span className={businessHeaderCardIconBox()} aria-hidden={icon ? undefined : true}>
      {icon ?? <HeaderBuildingIcon />}
    </span>
  );

  const titleNode = loading ? (
    <TaavSkeleton variant="title" width="56%" contentClassName="h-6" />
  ) : (
    <h3 className={businessHeaderCardTitle({ variant: resolvedVariant })}>{title}</h3>
  );

  const descriptionNode = loading ? <TaavSkeleton lines={2} size="sm" /> : description ? <p className={businessHeaderCardDescription({ variant: resolvedVariant })}>{description}</p> : null;

  const detailLinkNode =
    showDetailLink && !loading && detailLink ? (
      <TaavDetailsLink
        href={detailLinkIsActive ? detailLink.href : undefined}
        onClick={detailLinkIsActive ? detailLink.onClick : undefined}
        disabled={detailDisabled || !detailLinkIsActive}
        size="sm"
        tone={detailLinkIsActive ? 'brand' : 'neutral'}
        underline="always"
        hoverEffect={false}
        wrapperClassName={cn(
          'text-[12.5px] font-normal leading-[22px]',
          detailLinkIsActive ? 'text-[#2563eb]' : 'text-[#5f6f80]',
          businessHeaderCardLink(),
        )}
      >
        {detailLink.label}
      </TaavDetailsLink>
    ) : null;

  const actionButtonNode =
    showAction && action ? (
      <button
        type="button"
        disabled={actionDisabled || !action.onClick}
        onClick={action.onClick}
        className={cn(
          businessHeaderCardActionButton({
            variant: resolvedVariant === 'action' ? 'action' : 'actionWithSearch',
            disabled: actionDisabled || !action.onClick,
          }),
          actionClassName,
        )}
      >
        <span className={businessHeaderCardActionButtonIcon()} aria-hidden="true">
          {action.icon ?? <HeaderPlusIcon />}
        </span>
        <span className={businessHeaderCardActionButtonLabel()}>{action.label}</span>
      </button>
    ) : null;

  const toggleNode =
    showToggle ? (
      <TaavActivationSwitch
        value={enabled !== undefined ? (currentEnabled ? 'active' : 'inactive') : undefined}
        defaultValue={currentEnabled ? 'active' : 'inactive'}
        onValueChange={(nextValue) => updateToggle(nextValue === 'active')}
        activeLabel={toggleLabelsResolved.enabled}
        inactiveLabel={toggleLabelsResolved.disabled}
        disabled={switchDisabled}
        size="md"
        wrapperClassName={cn(
          '!h-[36px] !w-[180px] !min-w-[180px] !gap-[4px] !border-0 !bg-[#a9b4c1] !p-[3px] !shadow-none',
          '[&_[role=radio]]:h-[30px] [&_[role=radio]]:min-w-[84px] [&_[role=radio]]:px-[12px] [&_[role=radio]]:py-0',
          '[&_[role=radio]]:text-[13px] [&_[role=radio]]:font-semibold',
        )}
      />
    ) : null;

  const searchNode =
    !loading && showSearch && search ? (
      <div className={cn(businessHeaderCardSearchContainer({ variant: resolvedVariant }), searchClassName)}>
        <div className="w-full max-w-[228px]">
          <div className={cn(businessHeaderCardSearchShell(), searchClassName)} dir="rtl">
            <span aria-hidden="true" className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center text-[#64748b]">
              <HeaderSearchIcon />
            </span>
            <input
              value={search.value}
              placeholder={search.placeholder}
              disabled={searchDisabled}
              readOnly={search.value !== undefined && !search.onChange}
              onChange={(event) => search.onChange?.(event.currentTarget.value)}
              aria-label={search.placeholder ?? (typeof title === 'string' ? title : undefined)}
              className={cn(businessHeaderCardSearchInput(), searchClassName)}
            />
          </div>
        </div>
      </div>
    ) : null;

  const topRow = loading ? (
    <div className={businessHeaderCardTopRow()}>
      <TaavSkeleton variant="custom" width={26} height={26} radius="sm" />
      <TaavSkeleton variant="custom" width={56} height={56} radius="lg" />
      <div className="grid min-w-0 flex-1 gap-[4px] justify-items-end">
        <TaavSkeleton variant="title" width="62%" contentClassName="h-6" />
        <TaavSkeleton variant="text" width="78%" />
      </div>
      {showToggle ? <TaavSkeleton variant="custom" width={180} height={36} radius="pill" /> : showAction ? <TaavSkeleton variant="custom" width={148} height={36} radius="md" /> : null}
    </div>
  ) : (
    <div className={cn(businessHeaderCardTopRow(), contentClassName)}>
      {arrowNode}
      {iconNode}
      <div className={businessHeaderCardCopy({ variant: resolvedVariant })}>
        {titleNode}
        {descriptionNode}
      </div>
      {toggleNode ? <div className={businessHeaderCardToggle()}>{toggleNode}</div> : actionButtonNode ? <div className={businessHeaderCardAction()}>{actionButtonNode}</div> : null}
    </div>
  );

  const loadingSearchNode = loading && showSearch ? (
    <div className={businessHeaderCardSearchContainer({ variant: resolvedVariant })}>
      <TaavSkeleton variant="custom" width={228} height={38} radius="pill" />
    </div>
  ) : null;

  return (
    <article
      {...rest}
      dir="rtl"
      data-taav-business-header-card
      data-variant={resolvedVariant}
      data-theme-mode={themeMode}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
      className={cn(businessHeaderCardRoot({ loading, themeMode, variant: resolvedVariant }), wrapperClassName, className)}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
    >
      <div className={businessHeaderCardBody({ variant: resolvedVariant })}>
        {topRow}
        {detailLinkNode ? <div className={businessHeaderCardLink()}>{detailLinkNode}</div> : null}
        {searchNode ?? loadingSearchNode}
      </div>
    </article>
  );
}
