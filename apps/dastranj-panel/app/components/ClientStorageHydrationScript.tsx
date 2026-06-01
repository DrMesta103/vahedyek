'use client';

import { useServerInsertedHTML } from 'next/navigation';
import type { HydratedClientStorageState } from '../lib/client-storage-persistence';

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
        window.localStorage.setItem(item.storageKey, item.value);
      }
    }
    if (payload.tenantId) {
      const scopedTemplatesKey = 'dastranj-contract-draft-templates-v1:' + payload.tenantId;
      const legacyTemplates = window.localStorage.getItem(scopedTemplatesKey);
      if (legacyTemplates) {
        window.localStorage.setItem('dastranj-contract-draft-templates-v1', legacyTemplates);
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
