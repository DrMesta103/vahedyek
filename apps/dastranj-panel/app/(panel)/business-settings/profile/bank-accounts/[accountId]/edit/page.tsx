import BankAccountFormPanel from '../../../../../account/_components/BankAccountFormPanel';

export default function BusinessProfileBankAccountEditPage({ params }: { params: { accountId: string } }) {
  return (
    <div className="page-stack">
      <BankAccountFormPanel accountId={params.accountId} />
    </div>
  );
}
