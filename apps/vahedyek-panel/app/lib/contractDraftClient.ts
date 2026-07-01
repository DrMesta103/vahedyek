'use client';

import type {
  AppendixTagKey,
  ContractAppendixDetailResponse,
  ContractAppendixListResponse,
  ContractStatus,
  CreateContractAppendixInput,
  ContractTerminationData,
} from '../types/contract';
import type { ContractRuleId, ContractRuleState, LoanSettingsState } from './businessContractRules';

const ACTIVE_DRAFT_KEY = 'active-contract-draft-id';
const FRONTEND_STEP_DRAFT_PREFIX = 'contract-flow:frontend-step-draft';
const BOOTSTRAP_SETTINGS_KEY = 'contract-flow:bootstrap-settings';

export type ContractFlowBootstrapSettings = {
  rules: Partial<Record<ContractRuleId, ContractRuleState>>;
  loanSettings: LoanSettingsState | null;
  termination: ContractTerminationData | null;
  loadedAt: number;
};
export type ReferenceUnit = {
  id: string;
  floorName: string;
  name: string;
  title: string;
  category: string;
  area: number | null;
  assignedToUnitId: string | null;
  areaPricingMode: string | null;
  isLocked: boolean;
  lockedByDraftId: string | null;
  lockedByContractNumber: string | null;
  lockedByStatus: 'draft' | 'pending_approval' | 'completed' | null;
};

export type ReferenceDataResponse = {
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  formerEmployees: Array<{ id: string; fullName: string }>;
  blocks: Array<{ id: string; name: string; units: ReferenceUnit[] }>;
  directory: {
    partner: {
      natural: Array<{ id: string; name: string }>;
      legal: Array<{ id: string; name: string }>;
    };
    buyer: {
      natural: Array<{ id: string; name: string }>;
      legal: Array<{ id: string; name: string }>;
    };
  };
};

export type ContractsListResponse = {
  items: any[];
  counts: Record<ContractStatus, number>;
};

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    redirect: 'manual',
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location') ?? '';
    if (location.startsWith('/login')) {
      throw new Error('کاربر برای این tenant یافت نشد.');
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message || 'پاسخی از سرور دریافت نشد.');
    }

    const message = await response.text();
    const normalizedMessage = message.trim();
    const isHtmlError =
      normalizedMessage.startsWith('<!DOCTYPE html') ||
      normalizedMessage.startsWith('<html') ||
      contentType.includes('text/html');

    if (isHtmlError) {
      throw new Error(response.status === 404 ? 'مورد درخواستی پیدا نشد.' : 'پاسخی از سرور دریافت نشد.');
    }
    throw new Error(normalizedMessage || 'پاسخی از سرور دریافت نشد.');
  }

  return response.json() as Promise<T>;
}

export function getActiveDraftId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_DRAFT_KEY);
}

export function setActiveDraftId(draftId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_DRAFT_KEY, draftId);
}

export function clearActiveDraftId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_DRAFT_KEY);
}

export type FrontendDraftStep =
  | 'subject'
  | 'parties'
  | 'financial'
  | 'penalties'
  | 'discounts'
  | 'interest'
  | 'forgiveness'
  | 'termination';

export function getFrontendStepDraft<T>(draftId: string, step: FrontendDraftStep) {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${FRONTEND_STEP_DRAFT_PREFIX}:${draftId}:${step}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setFrontendStepDraft<T>(draftId: string, step: FrontendDraftStep, payload: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${FRONTEND_STEP_DRAFT_PREFIX}:${draftId}:${step}`, JSON.stringify(payload));
}

export function clearFrontendStepDraft(draftId: string, step: FrontendDraftStep) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${FRONTEND_STEP_DRAFT_PREFIX}:${draftId}:${step}`);
}

export function getContractFlowBootstrapSettings() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOOTSTRAP_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContractFlowBootstrapSettings;
  } catch {
    return null;
  }
}

export function setContractFlowBootstrapSettings(payload: ContractFlowBootstrapSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOTSTRAP_SETTINGS_KEY, JSON.stringify(payload));
}

export function clearContractFlowBootstrapSettings() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BOOTSTRAP_SETTINGS_KEY);
}

export async function fetchContractFlowBootstrapSettings() {
  const [rulesResponse, loanResponse, terminationResponse] = await Promise.all([
    readJson<{ rules?: Partial<Record<ContractRuleId, ContractRuleState>> }>('/api/business-settings/contract-rules', {
      cache: 'no-store',
    }),
    readJson<LoanSettingsState>('/api/business-settings/contract-rules/loan-settings', {
      cache: 'no-store',
    }),
    readJson<ContractTerminationData>('/api/business-settings/contract-rules/termination-settings', {
      cache: 'no-store',
    }),
  ]);

  return {
    rules: rulesResponse.rules ?? {},
    loanSettings: loanResponse,
    termination: terminationResponse,
    loadedAt: Date.now(),
  } satisfies ContractFlowBootstrapSettings;
}

export async function ensureActiveDraftId() {
  const existingId = getActiveDraftId();
  if (existingId) return existingId;

  const result = await readJson<{ id: string }>('/api/contracts/drafts', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  localStorage.setItem(ACTIVE_DRAFT_KEY, result.id);
  return result.id;
}

export async function createDraftId() {
  const result = await readJson<{ id: string }>('/api/contracts/drafts', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  localStorage.setItem(ACTIVE_DRAFT_KEY, result.id);
  return result.id;
}

export async function getStepData<T>(draftId: string, step: 'subject' | 'parties' | 'financial' | 'penalties') {
  return readJson<T | null>(`/api/contracts/drafts/${draftId}/${step}`);
}

export async function saveStepData<T>(draftId: string, step: 'subject' | 'parties' | 'financial' | 'penalties', payload: T) {
  return readJson<{ success: true }>(`/api/contracts/drafts/${draftId}/${step}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getDraftRuleStepData<T>(draftId: string, step: 'forgiveness') {
  return readJson<T | null>(`/api/contracts/drafts/${draftId}/${step}`);
}

export async function saveDraftRuleStepData<T>(draftId: string, step: 'forgiveness', payload: T) {
  return readJson<{ success: true }>(`/api/contracts/drafts/${draftId}/${step}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** تنظیمات فسخ خریدار را از endpoint مربوط به buyerRules می‌گیرد. */
export async function fetchTerminationBuyerRules(draftId: string): Promise<{ buyerRules: unknown; payload?: unknown } | null> {
  try {
    return await readJson<{ buyerRules: unknown; payload?: unknown }>(`/api/contracts/drafts/${draftId}/termination`);
  } catch {
    return null;
  }
}

export async function saveTerminationStepData<T>(draftId: string, payload: T) {
  return readJson<{ success: true }>(`/api/contracts/drafts/${draftId}/termination`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getReferenceData(draftId?: string | null) {
  const query = draftId ? `?draftId=${encodeURIComponent(draftId)}` : '';
  return readJson<ReferenceDataResponse>(`/api/contracts/reference-data${query}`);
}

export async function createDirectoryPerson(payload: {
  role: 'partner' | 'buyer';
  personType: 'natural' | 'legal';
  name: string;
}) {
  return readJson<{ id: string; name: string; role: 'partner' | 'buyer'; personType: 'natural' | 'legal' }>(
    '/api/contracts/reference-data',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function getContractsList(status: ContractStatus) {
  return readJson<ContractsListResponse>(`/api/contracts?status=${status}`);
}

export async function getContractDetails(contractId: string, options?: { view?: 'buyer-safe' }) {
  const query = options?.view ? `?view=${encodeURIComponent(options.view)}` : '';
  return readJson<any>(`/api/contracts/${contractId}${query}`);
}

export async function getContractAppendices(contractId: string) {
  return readJson<ContractAppendixListResponse>(`/api/contracts/${encodeURIComponent(contractId)}/appendices`);
}

export async function createContractAppendix(contractId: string, payload: CreateContractAppendixInput) {
  return readJson<{ id: string }>(`/api/contracts/${encodeURIComponent(contractId)}/appendices`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAppendixDetails(appendixId: string) {
  return readJson<ContractAppendixDetailResponse>(`/api/appendices/${encodeURIComponent(appendixId)}`);
}

export async function updateContractAppendix(appendixId: string, payload: CreateContractAppendixInput) {
  return readJson<{ id: string }>(`/api/appendices/${encodeURIComponent(appendixId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteContractAppendix(appendixId: string) {
  return readJson<{ ok: boolean }>(`/api/appendices/${encodeURIComponent(appendixId)}`, {
    method: 'DELETE',
  });
}

export async function submitContractAppendix(appendixId: string) {
  return readJson<{ ok: boolean }>(`/api/appendices/${encodeURIComponent(appendixId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getAppendixCompare(appendixId: string) {
  return readJson<any>(`/api/appendices/${encodeURIComponent(appendixId)}/compare`);
}

export async function getContractHistory(contractId: string) {
  return readJson<any>(`/api/contracts/${encodeURIComponent(contractId)}/history`);
}

export async function getAppendixPreviousValues(appendixId: string, tag: AppendixTagKey) {
  return readJson<any>(`/api/appendices/${encodeURIComponent(appendixId)}/previous-values?tag=${encodeURIComponent(tag)}`);
}

export type ContractApprovalAction =
  | { action: 'returnForRevision'; reason: string }
  | { action: 'clearReturnPending' };

export async function postContractApprovalAction(contractId: string, body: ContractApprovalAction) {
  return readJson<{ ok: boolean }>(`/api/contracts/${encodeURIComponent(contractId)}/approval`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
