'use client';

import { useEffect } from 'react';
import { removeClientStorageStateAction, upsertClientStorageStatesAction } from '../lib/client-storage-actions';

const BUSINESS_STORAGE_PREFIXES = [
  'dastranj-contract-draft-templates-v1',
  'dastranj-naming-patterns-v1',
  'dastranj-business-payroll-settings-v1',
  'dastranj-business-payroll-years-v1',
  'dastranj-business-payroll-stepper-progress-v1',
  'dastranj-employee-contract-drafts-v1',
  'dastranj-employee-supplemental-profile-v1',
] as const;

function shouldPersistStorageKey(key: string) {
  return BUSINESS_STORAGE_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(`${prefix}-`));
}

function listCurrentBusinessStorageEntries() {
  const entries: Array<{ storageKey: string; value: string }> = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey || !shouldPersistStorageKey(storageKey)) continue;
    const value = window.localStorage.getItem(storageKey);
    if (value !== null) entries.push({ storageKey, value });
  }
  return entries;
}

export function ClientStoragePersistenceBridge({ tenantId }: { tenantId: string | null }) {
  useEffect(() => {
    if (tenantId) {
      window.sessionStorage.setItem('active-tenant-id', tenantId);
    }

    let flushTimer: number | null = null;
    const pending = new Map<string, string>();
    const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
    const originalSetItem = storagePrototype.setItem;
    const originalRemoveItem = storagePrototype.removeItem;

    const flush = () => {
      if (flushTimer) {
        window.clearTimeout(flushTimer);
        flushTimer = null;
      }
      const entries = Array.from(pending, ([storageKey, value]) => ({ storageKey, value }));
      pending.clear();
      if (entries.length) {
        void upsertClientStorageStatesAction(entries);
      }
    };

    const queuePersist = (storageKey: string, value: string) => {
      pending.set(storageKey, value);
      if (flushTimer) window.clearTimeout(flushTimer);
      flushTimer = window.setTimeout(flush, 250);
    };

    storagePrototype.setItem = function patchedSetItem(key: string, value: string) {
      const result = originalSetItem.call(this, key, value);
      if (this === window.localStorage && shouldPersistStorageKey(String(key))) {
        const storageKey = String(key);
        const stringValue = String(value);
        queuePersist(storageKey, stringValue);
      }
      return result;
    };

    storagePrototype.removeItem = function patchedRemoveItem(key: string) {
      const result = originalRemoveItem.call(this, key);
      if (this === window.localStorage && shouldPersistStorageKey(String(key))) {
        const storageKey = String(key);
        pending.delete(storageKey);
        void removeClientStorageStateAction(storageKey);
      }
      return result;
    };

    const initialEntries = listCurrentBusinessStorageEntries();
    if (initialEntries.length) {
      void upsertClientStorageStatesAction(initialEntries).then(() => {
        for (const entry of initialEntries) {
          originalRemoveItem.call(window.localStorage, entry.storageKey);
        }
      });
    }

    const flushOnHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flushOnHidden);

    return () => {
      flush();
      storagePrototype.setItem = originalSetItem;
      storagePrototype.removeItem = originalRemoveItem;
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flushOnHidden);
    };
  }, [tenantId]);

  return null;
}
