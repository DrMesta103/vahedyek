'use client';

import type { ReactNode } from 'react';
import { TaavTooltipProvider } from '@repo/ui/taav/primitives';

export function TaavProviders({ children }: { children: ReactNode }) {
  return <TaavTooltipProvider>{children}</TaavTooltipProvider>;
}
