'use client';

import { CircleHelp } from 'lucide-react';
import type { ReactNode } from 'react';
import { TaavTooltip, TaavTooltipProvider, type TaavTooltipAlign, type TaavTooltipSide } from '@repo/ui/taav/primitives';
import type { AiLabTooltipDef } from '@/app/lib/tooltips';

export function renderTooltipContent(content: AiLabTooltipDef | string): ReactNode {
  if (typeof content === 'string') return content;

  return (
    <span className="grid gap-1">
      <span>{content.text}</span>
      {content.example ? (
        <span className="block text-[color:var(--taav-text-muted)]">مثال: {content.example}</span>
      ) : null}
    </span>
  );
}

type AiLabTooltipContentProps = {
  content: AiLabTooltipDef | string;
  side?: TaavTooltipSide;
  align?: TaavTooltipAlign;
  label?: string;
  className?: string;
  triggerElement?: 'button' | 'span';
};

export function AiLabTooltipProvider({ children }: { children: ReactNode }) {
  return <TaavTooltipProvider>{children}</TaavTooltipProvider>;
}

export function AiLabTooltipIcon({
  content,
  side = 'top',
  align = 'start',
  label = 'راهنما',
  className,
  triggerElement = 'button',
}: AiLabTooltipContentProps) {
  const triggerClassName = ['ai-lab-tooltip-trigger', className].filter(Boolean).join(' ');

  return (
    <TaavTooltip
      content={renderTooltipContent(content)}
      side={side}
      align={align}
      contentClassName="ai-lab-tooltip-content"
    >
      {triggerElement === 'span' ? (
        <span className={triggerClassName} aria-label={label}>
          <CircleHelp className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : (
        <button type="button" className={triggerClassName} aria-label={label}>
          <CircleHelp className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </TaavTooltip>
  );
}

export function AiLabTooltipWrap({
  content,
  side = 'top',
  align = 'center',
  children,
}: {
  content: AiLabTooltipDef | string;
  side?: TaavTooltipSide;
  align?: TaavTooltipAlign;
  children: ReactNode;
}) {
  return (
    <TaavTooltip content={renderTooltipContent(content)} side={side} align={align} contentClassName="ai-lab-tooltip-content">
      {children}
    </TaavTooltip>
  );
}

export function AiLabLabelWithTooltip({
  label,
  tooltip,
  tooltipLabel,
  required,
}: {
  label: string;
  tooltip: AiLabTooltipDef | string;
  tooltipLabel?: string;
  required?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      {required ? <span className="text-[var(--taav-danger-strong)]">*</span> : null}
      <AiLabTooltipIcon content={tooltip} label={tooltipLabel ?? `راهنمای ${label}`} />
    </span>
  );
}

export function AiLabSectionLabel({
  label,
  tooltip,
}: {
  label: string;
  tooltip: AiLabTooltipDef | string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <AiLabTooltipIcon content={tooltip} label={`راهنمای ${label}`} />
    </span>
  );
}
