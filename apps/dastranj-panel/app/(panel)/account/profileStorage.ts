'use client';

import { DEFAULT_PROFILE_META, createDefaultProfileStore, normalizeProfileStore, PROFILE_STORAGE_KEY, type ProfileMeta, type ProfileStore } from './profile.types';
import type { BankAccountRecord } from './profile.types';

const PROFILE_API_ENDPOINT = '/api/account/profile';

function safeParse(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function loadProfileStore(): ProfileStore {
  if (typeof window === 'undefined') {
    return createDefaultProfileStore();
  }

  const tenantId = window.sessionStorage.getItem('active-tenant-id');
  const key = tenantId ? `${PROFILE_STORAGE_KEY}:${tenantId}` : `${PROFILE_STORAGE_KEY}:unscoped`;
  const parsed = safeParse(window.localStorage.getItem(key));
  return normalizeProfileStore(parsed);
}

function saveProfileStore(store: ProfileStore, tenantId?: string | null) {
  if (typeof window === 'undefined') return;

  const effectiveTenantId = tenantId || window.sessionStorage.getItem('active-tenant-id');
  const key = effectiveTenantId ? `${PROFILE_STORAGE_KEY}:${effectiveTenantId}` : `${PROFILE_STORAGE_KEY}:unscoped`;
  window.localStorage.setItem(key, JSON.stringify(store));
}

export async function fetchProfilePayload() {
  const response = await fetch(PROFILE_API_ENDPOINT, {
    cache: 'no-store',
    credentials: 'same-origin',
  });

  if (response.status === 401) {
    throw new Error('unauthorized');
  }

  if (!response.ok) {
    return {
      store: loadProfileStore(),
      meta: DEFAULT_PROFILE_META,
    };
  }

  const payload = (await response.json()) as { store?: unknown; meta?: Partial<ProfileMeta> & { tenantId?: string } };
  const store = normalizeProfileStore(payload.store ?? {});
  const meta: ProfileMeta = {
    businessName: typeof payload.meta?.businessName === 'string' ? payload.meta.businessName : DEFAULT_PROFILE_META.businessName,
    slug: typeof payload.meta?.slug === 'string' ? payload.meta.slug : DEFAULT_PROFILE_META.slug,
    brandCode: typeof payload.meta?.brandCode === 'string' ? payload.meta.brandCode : DEFAULT_PROFILE_META.brandCode,
    packageKey: typeof payload.meta?.packageKey === 'string' ? payload.meta.packageKey : DEFAULT_PROFILE_META.packageKey,
    billingCycle: typeof payload.meta?.billingCycle === 'string' ? payload.meta.billingCycle : DEFAULT_PROFILE_META.billingCycle,
    createdAt: typeof payload.meta?.createdAt === 'string' ? payload.meta.createdAt : DEFAULT_PROFILE_META.createdAt,
    owner: {
      fullName: typeof payload.meta?.owner?.fullName === 'string' ? payload.meta.owner.fullName : DEFAULT_PROFILE_META.owner.fullName,
      mobile: typeof payload.meta?.owner?.mobile === 'string' ? payload.meta.owner.mobile : DEFAULT_PROFILE_META.owner.mobile,
      email: typeof payload.meta?.owner?.email === 'string' ? payload.meta.owner.email : DEFAULT_PROFILE_META.owner.email,
    },
    tenantId: typeof payload.meta?.tenantId === 'string' ? payload.meta.tenantId : undefined,
  };

  if (typeof window !== 'undefined' && meta.tenantId) {
    window.sessionStorage.setItem('active-tenant-id', meta.tenantId);
  }

  saveProfileStore(store, meta.tenantId);
  return { store, meta };
}

export async function fetchProfileStore() {
  return (await fetchProfilePayload()).store;
}

export async function persistProfileStore(store: ProfileStore, owner?: Partial<ProfileMeta['owner']>) {
  const saved = await persistProfilePayload(store, owner);
  return saved.store;
}

export async function persistProfilePayload(store: ProfileStore, owner?: Partial<ProfileMeta['owner']>) {
  const response = await fetch(PROFILE_API_ENDPOINT, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      store,
      ...(owner ? { owner } : {}),
    }),
  });

  if (response.status === 401) {
    throw new Error('unauthorized');
  }

  if (!response.ok) {
    throw new Error(`profile_save_failed:${response.status}`);
  }

  const payload = (await response.json()) as {
    store?: unknown;
    meta?: Partial<ProfileMeta> & { tenantId?: string };
  };
  const merged = normalizeProfileStore(payload.store ?? store);
  const meta: ProfileMeta = {
    businessName: typeof payload.meta?.businessName === 'string' ? payload.meta.businessName : DEFAULT_PROFILE_META.businessName,
    slug: typeof payload.meta?.slug === 'string' ? payload.meta.slug : DEFAULT_PROFILE_META.slug,
    brandCode: typeof payload.meta?.brandCode === 'string' ? payload.meta.brandCode : DEFAULT_PROFILE_META.brandCode,
    packageKey: typeof payload.meta?.packageKey === 'string' ? payload.meta.packageKey : DEFAULT_PROFILE_META.packageKey,
    billingCycle: typeof payload.meta?.billingCycle === 'string' ? payload.meta.billingCycle : DEFAULT_PROFILE_META.billingCycle,
    createdAt: typeof payload.meta?.createdAt === 'string' ? payload.meta.createdAt : DEFAULT_PROFILE_META.createdAt,
    owner: {
      fullName: typeof payload.meta?.owner?.fullName === 'string' ? payload.meta.owner.fullName : DEFAULT_PROFILE_META.owner.fullName,
      mobile: typeof payload.meta?.owner?.mobile === 'string' ? payload.meta.owner.mobile : DEFAULT_PROFILE_META.owner.mobile,
      email: typeof payload.meta?.owner?.email === 'string' ? payload.meta.owner.email : DEFAULT_PROFILE_META.owner.email,
    },
    tenantId: typeof payload.meta?.tenantId === 'string' ? payload.meta.tenantId : undefined,
  };

  saveProfileStore(merged, meta.tenantId);
  return { store: merged, meta };
}

export function addBankAccount(store: ProfileStore, account: BankAccountRecord) {
  return {
    ...store,
    bankAccounts: [account, ...store.bankAccounts],
  };
}

export function updateBankAccount(store: ProfileStore, accountId: string, account: BankAccountRecord) {
  return {
    ...store,
    bankAccounts: store.bankAccounts.map((item) => (item.id === accountId ? account : item)),
  };
}

export function removeBankAccount(store: ProfileStore, accountId: string) {
  return {
    ...store,
    bankAccounts: store.bankAccounts.filter((item) => item.id !== accountId),
  };
}
