'use client';

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type MinimalScrollVariant = 'vertical' | 'horizontal' | 'both' | 'hidden' | 'horizontalHidden';

const VARIANT_CLASS: Record<MinimalScrollVariant, string> = {
  vertical: '',
  horizontal: 'is-horizontal',
  both: 'is-both',
  hidden: 'is-hidden',
  horizontalHidden: 'is-horizontal is-hidden',
};

export function minimalScrollClass(variant: MinimalScrollVariant = 'vertical', className?: string) {
  return ['panel-minimal-scroll', VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
}

export type MinimalScrollProps = ComponentPropsWithoutRef<'div'> & {
  variant?: MinimalScrollVariant;
  children?: ReactNode;
};

export const MinimalScroll = forwardRef<HTMLDivElement, MinimalScrollProps>(function MinimalScroll(
  { variant = 'vertical', className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={minimalScrollClass(variant, className)} {...props}>
      {children}
    </div>
  );
});
