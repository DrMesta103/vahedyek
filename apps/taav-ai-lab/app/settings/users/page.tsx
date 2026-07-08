import { listAllBusinessesForAdmin, listAllUsersForAdmin } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { SettingsClientShell } from '@/components/settings/SettingsClientShell';
import { UsersSettingsClient } from '@/components/settings/UsersSettingsClient';

export default async function UsersSettingsPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const [businesses, users] = await Promise.all([listAllBusinessesForAdmin(), listAllUsersForAdmin()]);

  return (
    <AiLabShell
      pathname="/settings/users"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <SettingsClientShell>
        <UsersSettingsClient businesses={businesses} initialUsers={users} />
      </SettingsClientShell>
    </AiLabShell>
  );
}
