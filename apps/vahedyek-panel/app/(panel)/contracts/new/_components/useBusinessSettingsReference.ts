'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchContractFlowBootstrapSettings,
  getBusinessSettingsReference,
  setBusinessSettingsReference,
} from '../../../../lib/contractDraftClient';
import type { BusinessSettingsSnapshot } from '../../../../lib/contractSettingsReference';

export function useBusinessSettingsReference() {
  const [snapshot, setSnapshot] = useState<BusinessSettingsSnapshot | null>(() => getBusinessSettingsReference());

  const refresh = useCallback(async () => {
    try {
      const next = await fetchContractFlowBootstrapSettings();
      setBusinessSettingsReference(next);
      setSnapshot(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!snapshot) void refresh();
    const handleFocus = () => void refresh();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refresh, snapshot]);

  return { snapshot, refresh };
}
