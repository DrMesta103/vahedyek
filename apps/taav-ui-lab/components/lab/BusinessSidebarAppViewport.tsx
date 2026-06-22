'use client';

import type { ReactNode } from 'react';
import { cn } from '@repo/ui/taav/primitives';

type BusinessSidebarAppViewportProps = {
  children: ReactNode;
  height?: number;
  className?: string;
  /** Bleed to lab preview panel edges for a full-width mock viewport */
  fullBleed?: boolean;
};

/**
 * Lab preview chrome around `TaavBusinessSidebar` (shell + nav path + rail).
 */
export function BusinessSidebarAppViewport({
  children,
  height = 720,
  className,
  fullBleed = true,
}: BusinessSidebarAppViewportProps) {
  return (
    <div
      className={cn(
        fullBleed && '-mx-[var(--taav-space-6)] -mb-[var(--taav-space-6)]',
        className,
      )}
    >
      <div
        className="overflow-hidden border-y border-[color:var(--taav-business-sidebar-preview-border)] bg-[var(--taav-business-sidebar-preview-bg)]"
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </div>
  );
}
