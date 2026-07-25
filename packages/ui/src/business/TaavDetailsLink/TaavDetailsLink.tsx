'use client';

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { detailsLinkRoot, detailsLinkTone } from './taav-details-link.variants';

export type TaavDetailsLinkSize = 'sm' | 'md' | 'lg';
export type TaavDetailsLinkTone = 'neutral' | 'brand' | 'info';
export type TaavDetailsLinkUnderline = 'always' | 'hover' | 'none';

export type TaavDetailsLinkProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  tone?: TaavDetailsLinkTone;
  size?: TaavDetailsLinkSize;
  underline?: TaavDetailsLinkUnderline;
  hoverEffect?: boolean;
  ariaLabel?: string;
  wrapperClassName?: string;
  unsafeClassName?: string;
};

export function TaavDetailsLink({
  children,
  href,
  onClick,
  disabled = false,
  icon,
  tone = 'neutral',
  size = 'md',
  underline = 'always',
  hoverEffect = true,
  ariaLabel,
  wrapperClassName,
  unsafeClassName,
}: TaavDetailsLinkProps) {
  const className = cn(
    detailsLinkRoot({ size, underline, disabled, hoverEffect }),
    detailsLinkTone({ tone }),
    wrapperClassName,
    unsafeClassName,
  );
  const label = ariaLabel ?? (typeof children === 'string' ? children : undefined);

  const content = (
    <>
      {icon ? <span className="inline-flex shrink-0 [&_svg]:h-[1em] [&_svg]:w-[1em]">{icon}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={className}
        aria-label={label}
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

  if (onClick && !disabled) {
    return (
      <button type="button" className={className} aria-label={label} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <span className={className} aria-disabled={disabled || undefined} aria-label={label}>
      {content}
    </span>
  );
}
