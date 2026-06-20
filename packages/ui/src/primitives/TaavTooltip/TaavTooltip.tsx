'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type TaavTooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TaavTooltipAlign = 'start' | 'center' | 'end';

export type TaavTooltipProps = {
  content: ReactNode;
  side?: TaavTooltipSide;
  align?: TaavTooltipAlign;
  delayDuration?: number;
  children: ReactNode;
  contentClassName?: string;
};

export function TaavTooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={100}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function TaavTooltip({
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  children,
  contentClassName,
}: TaavTooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        <span className="inline-flex rounded-[var(--taav-radius-sm)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]">
          {children}
        </span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            'z-[var(--taav-z-tooltip)] max-w-[var(--taav-tooltip-max-width)]',
            'rounded-[var(--taav-tooltip-radius)] border border-[color:var(--taav-border)]',
            'bg-[var(--taav-surface-elevated)] px-[var(--taav-tooltip-padding-x)] py-[var(--taav-tooltip-padding-y)]',
            'text-right text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)]',
            'text-[var(--taav-text-body)] shadow-[var(--taav-tooltip-shadow)]',
            contentClassName,
          )}
          style={{ direction: 'rtl' }}
        >
          {content}
          <TooltipPrimitive.Arrow
            width={10}
            height={5}
            className="fill-[var(--taav-surface-elevated)]"
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
