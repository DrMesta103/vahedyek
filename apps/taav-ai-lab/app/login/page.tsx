import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/app/lib/session';
import { LoginForm } from '@/components/LoginForm';

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect('/businesses');
  }

  return <LoginForm />;
}
