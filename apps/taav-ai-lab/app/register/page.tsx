import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/app/lib/session';
import { RegisterForm } from '@/components/RegisterForm';

export default async function RegisterPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect(session.activeTenantId ? '/businesses' : '/select-tenant');
  }

  return <RegisterForm />;
}
