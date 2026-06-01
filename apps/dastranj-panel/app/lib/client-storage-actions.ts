'use server';

import { getSessionContext } from './auth';
import {
  removeClientStorageState,
  upsertClientStorageState,
  upsertClientStorageStates,
  type HydratedClientStorageState,
} from './client-storage-persistence';

async function getActiveTenantId() {
  const session = await getSessionContext();
  return session?.tenantId ?? null;
}

export async function upsertClientStorageStateAction(storageKey: string, value: string) {
  await upsertClientStorageState(storageKey, value, await getActiveTenantId());
}

export async function upsertClientStorageStatesAction(entries: HydratedClientStorageState[]) {
  if (!entries.length) return;
  await upsertClientStorageStates(entries, await getActiveTenantId());
}

export async function removeClientStorageStateAction(storageKey: string) {
  await removeClientStorageState(storageKey, await getActiveTenantId());
}
