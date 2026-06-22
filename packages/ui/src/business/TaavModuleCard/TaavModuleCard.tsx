'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';
import { ModuleCardArrowIcon } from './ModuleCardArrowIcon';
import {
  moduleCardArrow,
  moduleCardBody,
  moduleCardDescription,
  moduleCardHeader,
  moduleCardRoot,
  moduleCardStatusTone,
  moduleCardTitle,
} from './taav-module-card.variants';

export type TaavModuleCardStatus =
  | 'default'
  | 'active'
  | 'complete'
  | 'incomplete'
  | 'locked'
  | 'disabled'
  | 'warning'
  | 'error';

export type TaavModuleCardVariant = 'default' | 'setup' | 'imageHeader' | 'compact' | 'flat';
export type TaavModuleCardTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type TaavModuleCardThemeMode = 'auto' | 'light' | 'dark';
export type TaavModuleCardSize = 'sm' | 'md' | 'lg';
export type TaavModuleCardWidth = 'auto' | 'full';
export type TaavModuleCardHeaderPattern = 'geometric' | 'subtle' | 'none';
export type TaavModuleCardAlign = 'start' | 'center' | 'end';
export type TaavModuleCardDirection = 'enter' | 'back';

export type TaavModuleCardProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  status?: TaavModuleCardStatus;
  statusLabel?: ReactNode;
  icon?: ReactNode;
  arrowIcon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  variant?: TaavModuleCardVariant;
  tone?: TaavModuleCardTone;
  themeMode?: TaavModuleCardThemeMode;
  size?: TaavModuleCardSize;
  width?: TaavModuleCardWidth;
  headerPattern?: TaavModuleCardHeaderPattern;
  align?: TaavModuleCardAlign;
  direction?: TaavModuleCardDirection;
  ariaLabel?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'title' | 'onClick'>;

function resolveDisabled(status: TaavModuleCardStatus, disabled?: boolean) {
  return Boolean(disabled || status === 'disabled' || status === 'locked');
}

function resolveInteractive({
  href,
  onClick,
  disabled,
  loading,
}: {
  href?: string;
  onClick?: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  return !disabled && !loading && Boolean(href || onClick);
}

export function TaavModuleCard({
  title,
  description,
  eyebrow,
  status = 'default',
  statusLabel,
  icon,
  arrowIcon,
  href,
  onClick,
  disabled: disabledProp,
  loading = false,
  selected = false,
  variant = 'setup',
  tone = 'neutral',
  themeMode = 'auto',
  size = 'md',
  width = 'auto',
  headerPattern = 'geometric',
  align = 'start',
  direction = 'enter',
  ariaLabel,
  className,
  headerClassName,
  bodyClassName,
  ...rest
}: TaavModuleCardProps) {
  const disabled = resolveDisabled(status, disabledProp);
  const interactive = resolveInteractive({ href, onClick, disabled, loading });
  const isSelected = selected || status === 'active';

  const rootClass = cn(
    moduleCardRoot({
      size,
      width,
      variant,
      interactive,
      selected: isSelected,
      disabled,
      loading,
    }),
    moduleCardStatusTone({ status, tone }),
    className,
  );

  const content = loading ? (
    <>
      <div className={cn(moduleCardHeader({ pattern: 'none' }), headerClassName)}>
        <TaavSkeleton variant="title" width="55%" contentClassName="h-5" />
        <TaavSkeleton variant="custom" width={16} height={16} radius="sm" />
      </div>
      <div className={cn(moduleCardBody({ size, align }), bodyClassName)}>
        <TaavSkeleton lines={2} size="sm" />
      </div>
    </>
  ) : (
    <>
      <div className={cn(moduleCardHeader({ pattern: headerPattern }), headerClassName)}>
        <h3 className={moduleCardTitle({ size })}>{title}</h3>
        <span className={moduleCardArrow({ disabled })} aria-hidden>
          {arrowIcon ?? <ModuleCardArrowIcon direction={direction} />}
        </span>
      </div>
      <div className={cn(moduleCardBody({ size, align }), bodyClassName)}>
        {eyebrow ? (
          <p className="m-0 mb-1 w-full text-[length:var(--taav-text-xs)] text-[var(--taav-module-card-eyebrow)]">{eyebrow}</p>
        ) : null}
        {statusLabel ? (
          <p className="m-0 mb-1 w-full text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-module-card-status-label)]">
            {statusLabel}
          </p>
        ) : null}
        {icon ? <span className="mb-2 inline-flex text-[var(--taav-module-card-icon)]">{icon}</span> : null}
        {description ? <p className={cn(moduleCardDescription({ size }), align === 'center' ? 'text-center' : 'text-right')}>{description}</p> : null}
      </div>
    </>
  );

  const sharedProps = {
    'data-taav-module-card': true,
    'data-variant': variant,
    'data-status': status,
    'data-tone': tone,
    'data-size': size,
    'data-theme-mode': themeMode,
    'data-selected': isSelected || undefined,
    'data-loading': loading || undefined,
    ...(themeMode !== 'auto' ? { 'data-taav-module-card-theme': themeMode } : {}),
    className: rootClass,
    'aria-label': ariaLabel,
    'aria-disabled': disabled || undefined,
    'aria-busy': loading || undefined,
    ...rest,
  };

  if (href && !disabled) {
    return (
      <a
        {...sharedProps}
        href={href}
        onClick={(event) => {
          if (onClick) {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </a>
    );
  }

  if (interactive) {
    return (
      <button type="button" {...sharedProps} disabled={disabled} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article {...sharedProps}>{content}</article>;
}
