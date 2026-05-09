'use client';

import type { HTMLAttributes } from 'react';

type Variant = 'default' | 'muted' | 'success' | 'warning';

export function Badge({
  variant = 'default',
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black';
  const v =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : variant === 'warning'
        ? 'bg-amber-50 text-amber-800'
        : variant === 'muted'
          ? 'bg-slate-100 text-slate-600'
          : 'bg-[var(--surface-soft)] text-[var(--text-muted)]';

  return <span {...props} className={`${base} ${v} ${className}`.trim()} />;
}

