import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import { BusinessBankAccountsPanel } from '../_components/BusinessBankAccountsPanel';

function BankAccountsFallback() {
  return (
    <div
      className="rounded-[8px] border border-slate-200/80 bg-white/90 p-10 text-center text-sm font-bold text-slate-500 shadow-sm"
      dir="rtl"
      lang="fa"
    >
      در حال بارگذاری حساب‌های بانکی...
    </div>
  );
}

export default function BusinessBankAccountsPage() {
  return (
    <PanelLayout>
      <Suspense fallback={<BankAccountsFallback />}>
        <BusinessBankAccountsPanel />
      </Suspense>
    </PanelLayout>
  );
}

