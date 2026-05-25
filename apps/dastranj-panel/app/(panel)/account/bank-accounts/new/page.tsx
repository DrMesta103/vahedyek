import { redirect } from 'next/navigation';
import { getBusinessProfileBankAccountNewPath } from '../../routes';

export default function AccountBankAccountNewPage() {
  redirect(getBusinessProfileBankAccountNewPath());
}
