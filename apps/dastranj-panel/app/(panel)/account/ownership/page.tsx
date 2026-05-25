import { redirect } from 'next/navigation';
import { BUSINESS_PROFILE_OWNERSHIP } from '../routes';

export default function AccountOwnershipPage() {
  redirect(BUSINESS_PROFILE_OWNERSHIP);
}
