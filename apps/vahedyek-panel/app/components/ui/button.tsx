'use client';

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[8px] font-extrabold transition disabled:opacity-55 disabled:cursor-not-allowed';
  const sizes = size === 'sm' ? 'h-9 px-3 text-[12px]' : 'h-11 px-5 text-[13px]';
  const v =
    variant === 'primary'
      ? 'bg-[var(--dark-teal)] text-white hover:brightness-[1.06]'
      : variant === 'danger'
        ? 'bg-rose-600 text-white hover:bg-rose-700'
        : variant === 'outline'
          ? 'border border-[var(--border-color)] bg-transparent text-[var(--text-body)] hover:bg-[var(--surface-soft)]'
          : variant === 'ghost'
            ? 'bg-transparent text-[var(--text-body)] hover:bg-[var(--surface-soft)]'
            : 'bg-[var(--surface-soft)] text-[var(--text-body)] hover:brightness-[0.98]';

  return <button {...props} className={`${base} ${sizes} ${v} ${className}`.trim()} />;
}


