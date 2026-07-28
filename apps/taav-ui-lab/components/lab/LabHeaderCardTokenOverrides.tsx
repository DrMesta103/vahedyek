'use client';

import { useEffect } from 'react';
import { applyHeaderCardTokens, readStoredHeaderCardTokens } from '@/lib/header-card-tokens';

/** Re-applies saved header-card token overrides on every Lab page. */
export function LabHeaderCardTokenOverrides() {
  useEffect(() => {
    const stored = readStoredHeaderCardTokens();
    if (stored) {
      applyHeaderCardTokens(stored);
    }
  }, []);

  return null;
}
