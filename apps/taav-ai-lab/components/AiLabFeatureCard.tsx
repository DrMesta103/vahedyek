'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import type { AiLabTooltipDef } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';

type AiLabFeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  tooltip: AiLabTooltipDef | string;
  badge: { label: string; tone: 'brand' | 'neutral' };
  href?: string;
  buttonLabel?: string;
  buttonVariant?: 'primary' | 'secondary';
  variant?: 'outlined' | 'soft';
};

export function AiLabFeatureCard({
  icon,
  title,
  description,
  tooltip,
  badge,
  href,
  buttonLabel,
  buttonVariant = 'primary',
  variant = 'outlined',
}: AiLabFeatureCardProps) {
  return (
    <TaavCard variant={variant} padding="md" radius="xl">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          {icon}
          <TaavBadge tone={badge.tone} variant="soft">
            {badge.label}
          </TaavBadge>
        </div>
        <div>
          <h2 className="m-0 inline-flex items-center gap-1.5 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
            {title}
            <AiLabTooltipIcon content={tooltip} label={`راهنمای ${title}`} />
          </h2>
          <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{description}</p>
        </div>
        {href && buttonLabel ? (
          <Link href={href}>
            <TaavButton width="full" variant={buttonVariant === 'secondary' ? 'secondary' : undefined} iconStart={<ArrowLeft className="h-4 w-4" />}>
              {buttonLabel}
            </TaavButton>
          </Link>
        ) : null}
      </div>
    </TaavCard>
  );
}
