'use client';

import { createContext, useContext } from 'react';
import type {
  AppendixIssuerType,
  Contract,
  ContractAppendixReferenceData,
  SupportedAppendixTagKey,
} from '../../../types/contract';
import type { SupportedAppendixPayload } from '../../../lib/appendixPayloads';

export type AppendixBaselineData = {
  sourceLabel: string;
  payload: SupportedAppendixPayload;
};

export type AppendixEditorContextValue = {
  contractId: string;
  appendixId: string;
  loading: boolean;
  error: string;
  contract: Contract | null;
  reference: ContractAppendixReferenceData | null;
  appendixNumber: number | null;
  selectedTags: SupportedAppendixTagKey[];
  payloads: Partial<Record<SupportedAppendixTagKey, SupportedAppendixPayload>>;
  baselineByTag: Partial<Record<SupportedAppendixTagKey, AppendixBaselineData>>;
  effectiveDate: string;
  issuerType: AppendixIssuerType;
  issuerEmployeeId: string;
  issuerFormerEmployeeId: string;
  notes: string;
  dialogSignal: { side: 'first-party' | 'second-party'; nonce: number } | null;
  setDialogSignal: (value: { side: 'first-party' | 'second-party'; nonce: number } | null) => void;
  setEffectiveDate: (value: string) => void;
  setIssuerType: (value: AppendixIssuerType) => void;
  setIssuerEmployeeId: (value: string) => void;
  setIssuerFormerEmployeeId: (value: string) => void;
  setNotes: (value: string) => void;
  updateTagPayload: (tag: SupportedAppendixTagKey, payload: SupportedAppendixPayload) => void;
  buildTagHref: (tag: SupportedAppendixTagKey) => string;
  buildPartyReturnTo: (side: 'first-party' | 'second-party') => string;
  openPreviousDialog: (tag: SupportedAppendixTagKey) => void;
  saveAppendix: (submitMode: 'draft' | 'pending_approval') => Promise<void>;
};

const AppendixEditorContext = createContext<AppendixEditorContextValue | null>(null);

export function AppendixEditorContextProvider({
  value,
  children,
}: {
  value: AppendixEditorContextValue;
  children: React.ReactNode;
}) {
  return <AppendixEditorContext.Provider value={value}>{children}</AppendixEditorContext.Provider>;
}

export function useAppendixEditor() {
  const context = useContext(AppendixEditorContext);
  if (!context) {
    throw new Error('useAppendixEditor must be used inside AppendixEditorContextProvider.');
  }
  return context;
}
