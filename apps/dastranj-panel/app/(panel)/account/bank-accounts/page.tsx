import { redirect } from 'next/navigation';
import { BUSINESS_PROFILE_BANK_ACCOUNTS } from '../routes';

export default function AccountBankAccountsPage() {
  redirect(BUSINESS_PROFILE_BANK_ACCOUNTS);
}
