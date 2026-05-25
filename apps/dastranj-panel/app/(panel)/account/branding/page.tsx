import { redirect } from 'next/navigation';
import { BUSINESS_PROFILE_BRANDING } from '../routes';

export default function AccountBrandingPage() {
  redirect(BUSINESS_PROFILE_BRANDING);
}
