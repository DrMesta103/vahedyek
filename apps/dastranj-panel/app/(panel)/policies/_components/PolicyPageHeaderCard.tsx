'use client';

import type { ReactNode } from 'react';
import { ClipboardList } from 'lucide-react';
import { TaavBusinessHeaderCard } from '@repo/ui/taav/business';
import { TaavTooltipProvider } from '@repo/ui/taav/primitives';

export function PolicyPageHeaderCard({
  title,
  subtitle,
  titleHref,
  icon,
}: {
  title: string;
  subtitle?: string;
  titleHref?: string;
  icon?: ReactNode;
}) {
  return (
    <TaavTooltipProvider>
      <TaavBusinessHeaderCard
        title={title}
        description={subtitle}
        icon={icon ?? <ClipboardList className="h-6 w-6" strokeWidth={2.2} />}
        variant="navigation"
        href={titleHref ?? '/policies'}
        themeMode="light"
        wrapperClassName="policy-page-header-card"
      />
    </TaavTooltipProvider>
  );
}
