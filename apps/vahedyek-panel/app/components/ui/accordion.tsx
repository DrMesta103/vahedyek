'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ children }: PropsWithChildren) {
  return <div className="space-y-3">{children}</div>;
}

export function AccordionItem({
  value,
  open,
  onOpenChange,
  children,
}: PropsWithChildren<{
  value: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>) {
  return (
    <details
      data-accordion-item={value}
      open={open}
      // If `open` is controlled, do NOT listen to native toggle events.
      // Otherwise, closing one item can race and override parent state.
      onToggle={
        open === undefined
          ? (e) => {
              const el = e.currentTarget;
              onOpenChange?.(el.open);
            }
          : undefined
      }
      className="group rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm open:shadow-sm"
    >
      {children}
    </details>
  );
}

export function AccordionTrigger({
  children,
  rightSlot,
  onToggle,
}: PropsWithChildren<{
  rightSlot?: ReactNode;
  onToggle?: () => void;
}>) {
  return (
    <summary
      className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-right"
      onClick={(e) => {
        if (!onToggle) return;
        // Prevent native <details> toggling; we control open state.
        e.preventDefault();
        onToggle();
      }}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          {rightSlot}
          <ChevronDown
            className="h-4 w-4 text-[var(--text-faint)] transition-transform group-open:rotate-180"
            aria-hidden
          />
        </div>
      </div>
    </summary>
  );
}

export function AccordionContent({ children }: PropsWithChildren) {
  return <div className="border-t border-[var(--border-color)] px-4 py-4">{children}</div>;
}

