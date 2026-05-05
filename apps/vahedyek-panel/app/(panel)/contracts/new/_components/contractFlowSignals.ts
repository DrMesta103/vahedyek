'use client';

export type ContractFlowSectionId =
  | 'subject'
  | 'parties'
  | 'financial'
  | 'penalties'
  | 'discounts'
  | 'termination'
  | 'extraCosts'
  | 'technicalSpecs'
  | 'contractAttachments';

type DirtyDetail = {
  sectionId: ContractFlowSectionId;
  dirty: boolean;
};

type SavedDetail = {
  sectionId: ContractFlowSectionId;
  savedAt: number;
  /** When set (e.g. right after a successful PUT), the hub can update state synchronously before any follow-up navigation/refresh. */
  payload?: unknown;
};

type FinancialSnapshotDetail<T> = {
  payload: T | null;
};

export const CONTRACT_FLOW_DIRTY_EVENT = 'contract-flow:dirty-change';
export const CONTRACT_FLOW_SAVED_EVENT = 'contract-flow:save-complete';
export const CONTRACT_FLOW_FINANCIAL_SNAPSHOT_EVENT = 'contract-flow:financial-snapshot';

const LAST_UPDATED_KEY = 'contract-flow:last-updated';

export function dispatchContractFlowDirty(sectionId: ContractFlowSectionId, dirty: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DirtyDetail>(CONTRACT_FLOW_DIRTY_EVENT, { detail: { sectionId, dirty } }));
}

export function dispatchContractFlowSaved(sectionId: ContractFlowSectionId, savedAt = Date.now(), payload?: unknown) {
  if (typeof window === 'undefined') return;

  const current = getStoredLastUpdated();
  current[sectionId] = savedAt;
  window.localStorage.setItem(LAST_UPDATED_KEY, JSON.stringify(current));

  window.dispatchEvent(
    new CustomEvent<SavedDetail>(CONTRACT_FLOW_SAVED_EVENT, { detail: { sectionId, savedAt, payload } }),
  );
}

export function getStoredLastUpdated(): Partial<Record<ContractFlowSectionId, number>> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(LAST_UPDATED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<ContractFlowSectionId, number>>;
  } catch {
    return {};
  }
}

export function dispatchContractFlowFinancialSnapshot<T>(payload: T | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<FinancialSnapshotDetail<T>>(CONTRACT_FLOW_FINANCIAL_SNAPSHOT_EVENT, {
      detail: { payload },
    }),
  );
}
