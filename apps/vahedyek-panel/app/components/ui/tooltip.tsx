'use client';

import type { HTMLAttributes, PropsWithChildren } from 'react';

export function TooltipProvider({ children }: PropsWithChildren) {
  return children;
}

export function Tooltip({ children }: PropsWithChildren) {
  return <span className="group relative inline-flex">{children}</span>;
}

export function TooltipTrigger({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <span className={`inline-flex ${className}`.trim()}>{children}</span>;
}

export function TooltipContent({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return (
    <div
      {...props}
      className={`pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-[260px] rounded-[8px] border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-right text-[12px] font-normal leading-6 text-[var(--text-body)] shadow-sm group-hover:block ${className}`.trim()}
    >
      {children}
    </div>
  );
}


