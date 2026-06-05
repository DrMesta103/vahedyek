'use client';

import { useServerInsertedHTML } from 'next/navigation';
import type { HydratedClientStorageState } from '../lib/client-storage-persistence';

const NON_HYDRATED_PREFIXES = [
  'dastranj-contract-draft-templates-v1',
  'dastranj-business-payroll-settings-v1',
  'dastranj-business-payroll-years-v1',
  'dastranj-business-payroll-stepper-progress-v1',
  'dastranj-employee-contract-drafts-v1',
  'dastranj-employee-supplemental-profile-v1',
] as const;

function shouldHydrateToLocalStorage(storageKey: string) {
  return !NON_HYDRATED_PREFIXES.some((prefix) => storageKey === prefix || storageKey.startsWith(`${prefix}:`) || storageKey.startsWith(`${prefix}-`));
}

function escapeJsonForScript(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function ClientStorageHydrationScript({
  tenantId,
  states,
}: {
  tenantId: string | null;
  states: HydratedClientStorageState[];
}) {
  const payload = escapeJsonForScript({ tenantId, states });

  useServerInsertedHTML(() => (
    <script
      id="client-storage-hydration"
      dangerouslySetInnerHTML={{
        __html: `
(() => {
  try {
    const payload = ${payload};
    if (payload.tenantId) {
      window.sessionStorage.setItem('active-tenant-id', payload.tenantId);
    }
    for (const item of payload.states || []) {
      if (typeof item.storageKey === 'string' && typeof item.value === 'string') {
        if (shouldHydrateToLocalStorage(item.storageKey)) {
          window.localStorage.setItem(item.storageKey, item.value);
        }
      }
    }
  } catch {}
})();
        `,
      }}
    />
  ));

  return null;
}
