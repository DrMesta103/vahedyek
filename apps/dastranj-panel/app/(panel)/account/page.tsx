import { redirect } from 'next/navigation';
import { BUSINESS_PROFILE_ROOT } from './routes';

export default function AccountPage() {
  redirect(BUSINESS_PROFILE_ROOT);
}
