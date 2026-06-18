'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../shared/interaction';
import {
  getTaavButtonToneClasses,
  taavButtonVariants,
  type TaavButtonSize,
  type TaavButtonTone,
  type TaavButtonVariant,
  type TaavButtonWidth,
} from './taav-button.variants';

export type TaavButtonProps = {
  variant?: TaavButtonVariant;
  size?: TaavButtonSize;
  width?: TaavButtonWidth;
  tone?: TaavButtonTone;
  loading?: boolean;
  disabled?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children?: ReactNode;
  /** Required when width="icon" and children is not text */
  'aria-label'?: string;
  unsafeClassName?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

function LoadingSpinner({ size }: { size: TaavButtonSize }) {
  const iconSize =
    size === 'xs' || size === 'sm' ? 'h-3.5 w-3.5' : size === 'xl' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', iconSize)}
      aria-hidden
    />
  );
}

export function TaavButton({
  variant = 'primary',
  size = 'md',
  width = 'auto',
  tone = 'brand',
  loading = false,
  disabled = false,
  iconStart,
  iconEnd,
  children,
  type = 'button',
  unsafeClassName,
  'aria-label': ariaLabel,
  ...props
}: TaavButtonProps) {
  const isIconOnly = width === 'icon' || (!children && (iconStart || iconEnd));
  const isDisabled = disabled || loading;

  const iconOnlySizeClass =
    size === 'xs'
      ? 'w-[var(--taav-btn-height-xs)]'
      : size === 'sm'
        ? 'w-[var(--taav-btn-height-sm)]'
        : size === 'lg'
          ? 'w-[var(--taav-btn-height-lg)]'
          : size === 'xl'
            ? 'w-[var(--taav-btn-height-xl)]'
            : 'w-[var(--taav-btn-height-md)]';

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={isIconOnly ? ariaLabel : ariaLabel}
      className={cn(
        taavButtonVariants({ size, width: isIconOnly ? 'icon' : width }),
        getTaavButtonToneClasses(variant, tone),
        isIconOnly && iconOnlySizeClass,
        loading && 'relative',
        unsafeClassName,
      )}
      {...props}
    >
      {loading ? <LoadingSpinner size={size} /> : null}
      {!loading && iconStart ? <span className={TAAV_INTERACTION.iconSlot}>{iconStart}</span> : null}
      {!loading && children ? <span className="inline-flex items-center leading-none">{children}</span> : null}
      {!loading && iconEnd ? <span className={TAAV_INTERACTION.iconSlot}>{iconEnd}</span> : null}
    </button>
  );
}
