import { redirect } from 'next/navigation';
import { getBusinessProfileBankAccountEditPath } from '../../../routes';

export default function AccountBankAccountEditPage({ params }: { params: { accountId: string } }) {
  redirect(getBusinessProfileBankAccountEditPath(params.accountId));
}
