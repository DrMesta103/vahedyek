'use client';

import type { ContractStatus } from '../types/contract';

const ACTIVE_DRAFT_KEY = 'active-contract-draft-id';
const FRONTEND_STEP_DRAFT_PREFIX = 'contract-flow:frontend-step-draft';
export type ReferenceUnit = {
  id: string;
  floorName: string;
  name: string;
  title: string;
  category: string;
  area: number | null;
  assignedToUnitId: string | null;
  areaPricingMode: string | null;
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
      throw new Error('برای استفاده از سامانه باید وارد شوید.');
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message || 'خطا در ارتباط با سرور');
    }

    const message = await response.text();
    throw new Error(message || 'خطا در ارتباط با سرور');
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

export function getFrontendStepDraft<T>(draftId: string, step: 'subject' | 'parties' | 'financial' | 'penalties' | 'discounts' | 'termination') {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${FRONTEND_STEP_DRAFT_PREFIX}:${draftId}:${step}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setFrontendStepDraft<T>(draftId: string, step: 'subject' | 'parties' | 'financial' | 'penalties' | 'discounts' | 'termination', payload: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${FRONTEND_STEP_DRAFT_PREFIX}:${draftId}:${step}`, JSON.stringify(payload));
}

export function clearFrontendStepDraft(draftId: string, step: 'subject' | 'parties' | 'financial' | 'penalties' | 'discounts' | 'termination') {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${FRONTEND_STEP_DRAFT_PREFIX}:${draftId}:${step}`);
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

/** بارگذاری قواعد فسخ خریدار از ستون buyerRules در پایگاه. */
export async function fetchTerminationBuyerRules(draftId: string): Promise<{ buyerRules: unknown } | null> {
  try {
    return await readJson<{ buyerRules: unknown }>(`/api/contracts/drafts/${draftId}/termination`);
  } catch {
    return null;
  }
}

export async function getReferenceData() {
  return readJson<ReferenceDataResponse>('/api/contracts/reference-data');
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

export async function getContractDetails(contractId: string) {
  return readJson<any>(`/api/contracts/${contractId}`);
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
