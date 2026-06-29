import { redirect } from 'next/navigation';
import { requireSession } from '@/app/lib/session';

export default async function NewBusinessPage() {
  await requireSession();
  redirect('/select-tenant?next=/businesses');
}
