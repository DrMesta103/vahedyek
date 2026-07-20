'use client';

import { useEffect, useRef } from 'react';
import { scheduleDraftAutosave, scheduleDraftStepAutosave } from '../../../../lib/contractDraftClient';

export function useContractDraftAutosave<T>({
  draftId,
  step,
  payload,
  enabled,
  onError,
  save,
}: {
  draftId: string | null;
  step: string;
  payload: T;
  enabled: boolean;
  onError?: (error: unknown) => void;
  save?: (payload: T) => Promise<unknown>;
}) {
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !draftId) return;
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }
    if (save) {
      scheduleDraftAutosave(`${draftId}:${step}`, payload, save, onError);
    } else {
      scheduleDraftStepAutosave(draftId, step as 'subject' | 'parties' | 'financial' | 'penalties', payload, onError);
    }
  }, [draftId, enabled, onError, payload, save, step]);
}
