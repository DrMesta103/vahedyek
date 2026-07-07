import { getCurrentTenant, getCurrentUser, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { CreateBusinessDialog } from '@/components/CreateBusinessDialog';

export default async function NewBusinessPage() {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const currentUser = await getCurrentUser();

  return (
    <AiLabShell
      pathname="/businesses/new"
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
      currentTenantName={currentTenant?.name ?? null}
    >
      <CreateBusinessDialog
        open
        defaultFirstName={currentUser?.firstName ?? ''}
        defaultLastName={currentUser?.lastName ?? ''}
      />
    </AiLabShell>
  );
}
