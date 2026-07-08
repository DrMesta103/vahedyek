'use client';

import type { ReactNode } from 'react';
import type { TaavTooltipAlign, TaavTooltipSide } from '@repo/ui/taav/primitives';
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
  return <>{children}</>;
}

function AiLabVisibleTooltip({
  content,
  className,
}: {
  content: AiLabTooltipDef | string;
  className?: string;
}) {
  return (
    <div className={['ai-lab-helper-text', className].filter(Boolean).join(' ')}>
      {renderTooltipContent(content)}
    </div>
  );
}

export function AiLabTooltipIcon({
  content,
  className,
}: AiLabTooltipContentProps) {
  return <AiLabVisibleTooltip content={content} className={className} />;
}

export function AiLabTooltipWrap({
  content,
  children,
}: {
  content: AiLabTooltipDef | string;
  side?: TaavTooltipSide;
  align?: TaavTooltipAlign;
  children: ReactNode;
}) {
  return (
    <span className="ai-lab-tooltip-wrap">
      {children}
      <AiLabVisibleTooltip content={content} />
    </span>
  );
}

export function AiLabLabelWithTooltip({
  label,
  tooltip,
  required,
}: {
  label: string;
  tooltip: AiLabTooltipDef | string;
  tooltipLabel?: string;
  required?: boolean;
}) {
  return (
    <span className="ai-lab-label-with-tooltip">
      <span className="inline-flex items-center gap-1">
        <span>{label}</span>
        {required ? <span className="text-[var(--taav-danger-strong)]">*</span> : null}
      </span>
      <AiLabVisibleTooltip content={tooltip} />
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
    <span className="ai-lab-label-with-tooltip">
      <span>{label}</span>
      <AiLabVisibleTooltip content={tooltip} />
    </span>
  );
}
