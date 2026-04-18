'use client';

import { usePathname } from 'next/navigation';

export function useContractFlowBasePath() {
  const pathname = usePathname();

  if (pathname.startsWith('/draft-templates/new')) {
    return '/draft-templates/new';
  }

  return '/contracts/new';
}
