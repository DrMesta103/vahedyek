import type { ReactNode } from 'react';
import { PanelShell } from '../components/PanelShell';
import { ClientStorageHydrationScript } from '../components/ClientStorageHydrationScript';
import { ClientStoragePersistenceBridge } from '../components/ClientStoragePersistenceBridge';
import { getSessionContext } from '../lib/auth';
import { listClientStorageStates } from '../lib/client-storage-persistence';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getSessionContext();
  const tenantId = session?.tenantId ?? null;
  const states = await listClientStorageStates(tenantId);

  return (
    <>
      <ClientStorageHydrationScript tenantId={tenantId} states={states} />
      <ClientStoragePersistenceBridge tenantId={tenantId} />
      <PanelShell>{children}</PanelShell>
    </>
  );
}
