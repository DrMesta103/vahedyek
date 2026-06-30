import { Beaker } from 'lucide-react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { TaavPageHeader } from '@repo/ui/taav/layout';

export function AiLabPage({
  eyebrow,
  title,
  description,
  badge,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ai-lab-page-stack">
      {title ? (
        <TaavPageHeader
          variant="hero"
          icon={<Beaker className="h-5 w-5" />}
          eyebrow={eyebrow}
          title={title}
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
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <TaavCard
      variant="outlined"
      padding="md"
      radius="xl"
      header={
        <div className="grid gap-1">
          <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{title}</strong>
          {description ? <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{description}</span> : null}
        </div>
      }
    >
      {children}
    </TaavCard>
  );
}
