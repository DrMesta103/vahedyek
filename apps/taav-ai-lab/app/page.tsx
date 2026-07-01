import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/app/lib/session';

export default async function HomePage() {
  const session = await getOptionalSession();
  if (!session) {
    redirect('/login');
  }

  redirect(session.activeTenantId ? `/businesses/${session.activeTenantId}` : '/businesses');
}
