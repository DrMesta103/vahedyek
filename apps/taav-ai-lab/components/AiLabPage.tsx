import { Beaker } from 'lucide-react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { TaavPageHeader } from '@repo/ui/taav/layout';
import type { AiLabTooltipDef } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';

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
              <span className="inline-flex items-center gap-2">
                {title}
                <AiLabTooltipIcon content={titleTooltip} label={`راهنمای ${title}`} />
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
        <div className="grid gap-1">
          <strong className="inline-flex items-center gap-1.5 text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
            {title}
            {titleTooltip ? <AiLabTooltipIcon content={titleTooltip} label={`راهنمای ${title}`} /> : null}
          </strong>
          {description ? <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{description}</span> : null}
        </div>
      }
    >
      {children}
    </TaavCard>
  );
}
