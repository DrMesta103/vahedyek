import { Beaker } from 'lucide-react';
import type { ReactNode } from 'react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import type { AiLabTooltipDef } from '@/app/lib/tooltips';

function renderPageTooltipContent(content: AiLabTooltipDef | string): ReactNode {
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

export function AiLabPage({
  eyebrow,
  title,
  description,
  badge,
  titleTooltip,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  badge?: string;
  titleTooltip?: AiLabTooltipDef | string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ai-lab-page-stack">
      {title ? (
        <TaavPageHeader
          variant="hero"
          icon={<Beaker className="h-5 w-5" />}
          eyebrow={eyebrow}
          title={
            titleTooltip ? (
              <span className="grid gap-2">
                <span>{title}</span>
                <span className="ai-lab-helper-text ai-lab-helper-text--header">
                  {renderPageTooltipContent(titleTooltip)}
                </span>
              </span>
            ) : (
              title
            )
          }
          description={description}
          badge={badge ? <TaavBadge tone="brand" variant="soft">{badge}</TaavBadge> : undefined}
        />
      ) : null}
      {children}
    </div>
  );
}

export function AiLabSectionCard({
  title,
  description,
  titleTooltip,
  children,
}: {
  title: string;
  description?: string;
  titleTooltip?: AiLabTooltipDef | string;
  children: React.ReactNode;
}) {
  return (
    <TaavCard
      variant="outlined"
      padding="md"
      radius="xl"
      header={
        <div className="grid gap-2">
          <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{title}</strong>
          {titleTooltip ? (
            <span className="ai-lab-helper-text ai-lab-helper-text--section">
              {renderPageTooltipContent(titleTooltip)}
            </span>
          ) : null}
          {description ? <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{description}</span> : null}
        </div>
      }
    >
      {children}
    </TaavCard>
  );
}
